"use server";

import { unstable_cache } from "next/cache";

export type TimeRange = "1H" | "6H" | "1D" | "1W" | "1M" | "All";

export type ChartPoint = {
  ts: number; 
  value: number;
};

type TokenTx = {
  timeStamp: string;
  from: string;
  to: string;
  value: string;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getEtherscanBaseUrl(): string {
  const chainId = Number(process.env.CHAIN_ID ?? "1");
 
  if (chainId === 11155111) return "https://api-sepolia.etherscan.io";
  return "https://api.etherscan.io";
}

function rangeToMs(range: TimeRange): number {
  switch (range) {
    case "1H":
      return 1 * 60 * 60 * 1000;
    case "6H":
      return 6 * 60 * 60 * 1000;
    case "1D":
      return 24 * 60 * 60 * 1000;
    case "1W":
      return 7 * 24 * 60 * 60 * 1000;
    case "1M":
      return 30 * 24 * 60 * 60 * 1000;
    case "All":
      return 365 * 24 * 60 * 60 * 1000;
  }
}

function bucketsCount(range: TimeRange): number {
  switch (range) {
    case "1H":
      return 24;
    case "6H":
      return 36;
    case "1D":
      return 36;
    case "1W":
      return 42;
    case "1M":
      return 60;
    case "All":
      return 80;
  }
}

function safeParseBigInt(value: string): bigint {
  if (!value) return 0n;
  if (!/^\d+$/.test(value)) return 0n;
  return BigInt(value);
}

function formatUnitsToNumber(value: bigint, decimals: number): number {
  const s = value.toString();
  if (decimals <= 0) return Number(s);

  const pad = decimals + 1;
  const full = s.length >= pad ? s : s.padStart(pad, "0");
  const intPart = full.slice(0, -decimals);
  const fracPart = full.slice(-decimals).slice(0, 6);

  return Number(`${intPart}.${fracPart}`);
}

async function fetchTokenTransfers(address: string, token: string): Promise<TokenTx[]> {
  const apiKey = requireEnv("ETHERSCAN_API_KEY");
  const base = getEtherscanBaseUrl();

  const url =
    `${base}/api?module=account&action=tokentx` +
    `&address=${address}` +
    `&contractaddress=${token}` +
    `&sort=asc` +
    `&apikey=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Etherscan HTTP error: ${res.status}`);

  const data = (await res.json()) as {
    status: string;
    message: string;
    result: TokenTx[] | string;
  };

  if (typeof data.result === "string") return [];
  return Array.isArray(data.result) ? data.result : [];
}

function buildBuckets(range: TimeRange): { start: number; step: number; count: number } {
  const now = Date.now();
  const windowMs = rangeToMs(range);
  const count = bucketsCount(range);
  const start = now - windowMs;
  const step = Math.floor(windowMs / count);
  return { start, step, count };
}

function clampToBuckets(ts: number, start: number, step: number, count: number): number {
  const idx = Math.floor((ts - start) / step);
  if (idx < 0) return 0;
  if (idx >= count) return count - 1;
  return idx;
}

function toLower(a: string) {
  return a.toLowerCase();
}


function buildSeriesFromTransfers(
  transfers: TokenTx[],
  address: string,
  decimals: number,
  range: TimeRange
): ChartPoint[] {
  const { start, step, count } = buildBuckets(range);
  const addr = toLower(address);

  const deltas: bigint[] = Array.from({ length: count }, () => 0n);

  for (const tx of transfers) {
    const tsMs = Number(tx.timeStamp) * 1000;
    if (!Number.isFinite(tsMs) || tsMs < start) continue;

    const v = safeParseBigInt(tx.value);
    if (v === 0n) continue;

    const from = toLower(tx.from);
    const to = toLower(tx.to);

    let signed = 0n;
    if (from === addr) signed -= v;
    if (to === addr) signed += v;

    if (signed === 0n) continue;

    const idx = clampToBuckets(tsMs, start, step, count);
    deltas[idx] += signed;
  }

  const points: ChartPoint[] = [];
  let acc = 0n;

  for (let i = 0; i < count; i++) {
    acc += deltas[i];
    const ts = start + i * step;
    points.push({
      ts,
      value: Number(formatUnitsToNumber(acc, decimals).toFixed(2)),
    });
  }

  return points;
}

export async function getChart(
  range: TimeRange
): Promise<{
  range: TimeRange;
  points: ChartPoint[];
  summary: {
    start: number;
    end: number;
    change: number;
    percent: number;
  };
}> {
  const publicKey = requireEnv("WALLET_PUBLIC_KEY");
  const token = requireEnv("TOKEN_ADDRESS");
  const decimals = Number(process.env.TOKEN_DECIMALS ?? "18");

  const cached = unstable_cache(
    async () => {
      const transfers = await fetchTokenTransfers(publicKey, token);
      const points = buildSeriesFromTransfers(transfers, publicKey, decimals, range);

      const start = points[0]?.value ?? 0;
      const end = points[points.length - 1]?.value ?? 0;
      const change = Number((end - start).toFixed(2));
      const percent =
        start !== 0 ? Number(((change / Math.abs(start)) * 100).toFixed(2)) : 0;

      return {
        range,
        points,
        summary: { start, end, change, percent },
      };
    },
    [`chart:${publicKey}:${range}`],
    { revalidate: 60 }
  );

  return cached();
}