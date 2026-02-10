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
      return 60 * 60 * 1000;
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

function parseTokenValue(value: string, decimals: number): number {
  if (!value || !/^\d+$/.test(value)) return 0;
  const num = Number(value);
  return num / Math.pow(10, decimals);
}

async function fetchTokenTransfers(
  address: string,
  token: string
): Promise<TokenTx[]> {
  const apiKey = requireEnv("ETHERSCAN_API_KEY");
  const base = getEtherscanBaseUrl();

  const url =
    `${base}/api?module=account&action=tokentx` +
    `&address=${address}` +
    `&contractaddress=${token}` +
    `&sort=asc` +
    `&apikey=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (typeof data.result === "string") return [];
  return Array.isArray(data.result) ? data.result : [];
}

function buildSeries(
  transfers: TokenTx[],
  address: string,
  decimals: number,
  range: TimeRange
): ChartPoint[] {
  const now = Date.now();
  const windowMs = rangeToMs(range);
  const count = bucketsCount(range);
  const start = now - windowMs;
  const step = Math.floor(windowMs / count);

  const deltas = Array.from({ length: count }, () => 0);

  for (const tx of transfers) {
    const ts = Number(tx.timeStamp) * 1000;
    if (!Number.isFinite(ts) || ts < start) continue;

    const value = parseTokenValue(tx.value, decimals);
    if (!value) continue;

    let signed = 0;
    if (tx.from.toLowerCase() === address.toLowerCase()) signed -= value;
    if (tx.to.toLowerCase() === address.toLowerCase()) signed += value;

    if (!signed) continue;

    const idx = Math.min(
      count - 1,
      Math.max(0, Math.floor((ts - start) / step))
    );
    deltas[idx] += signed;
  }

  const points: ChartPoint[] = [];
  let acc = 0;

  for (let i = 0; i < count; i++) {
    acc += deltas[i];
    points.push({
      ts: start + i * step,
      value: Number(acc.toFixed(2)),
    });
  }

  return points;
}

export async function getChart(range: TimeRange) {
  const publicKey = requireEnv("WALLET_PUBLIC_KEY");
  const token = requireEnv("TOKEN_ADDRESS");
  const decimals = Number(process.env.TOKEN_DECIMALS ?? "18");

  const cached = unstable_cache(
    async () => {
      const transfers = await fetchTokenTransfers(publicKey, token);
      const points = buildSeries(transfers, publicKey, decimals, range);

      const start = points[0]?.value ?? 0;
      const end = points[points.length - 1]?.value ?? 0;
      const change = Number((end - start).toFixed(2));
      const percent =
        start !== 0 ? Number(((change / Math.abs(start)) * 100).toFixed(2)) : 0;

      return { points, summary: { change, percent } };
    },
    [`chart:${publicKey}:${range}`],
    { revalidate: 60 }
  );

  return cached();
}