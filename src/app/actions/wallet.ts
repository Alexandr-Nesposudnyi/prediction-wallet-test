"use server";

import { unstable_cache } from "next/cache";

type WalletSnapshot = {
  publicKey: string;
  tokenSymbol: string;
  balance: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

type EtherscanResponse = {
  status: string;
  message: string;
  result: string;
};

function safeParseBigInt(value: string): bigint {
  // Etherscan may return "", "0", or even error text in `result`
  if (!value) return 0n;
  if (!/^\d+$/.test(value)) return 0n;
  return BigInt(value);
}

async function fetchEtherscan(url: string): Promise<EtherscanResponse> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Etherscan HTTP error: ${res.status}`);
  return res.json();
}

async function fetchNativeBalanceWei(address: string): Promise<bigint> {
  const apiKey = requireEnv("ETHERSCAN_API_KEY");

  const url =
    `https://api.etherscan.io/api?module=account&action=balance` +
    `&address=${address}&tag=latest&apikey=${apiKey}`;

  const data = await fetchEtherscan(url);
  return safeParseBigInt(data.result);
}

async function fetchTokenBalanceRaw(
  address: string,
  token: string
): Promise<bigint> {
  const apiKey = requireEnv("ETHERSCAN_API_KEY");

  const url =
    `https://api.etherscan.io/api?module=account&action=tokenbalance` +
    `&contractaddress=${token}&address=${address}&tag=latest&apikey=${apiKey}`;

  const data = await fetchEtherscan(url);
  return safeParseBigInt(data.result);
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

async function buildWalletSnapshot(): Promise<WalletSnapshot> {
  const publicKey = requireEnv("WALLET_PUBLIC_KEY");
  const tokenAddress = process.env.TOKEN_ADDRESS?.trim();

  if (tokenAddress) {
    const decimals = Number(process.env.TOKEN_DECIMALS ?? "18");
    const raw = await fetchTokenBalanceRaw(publicKey, tokenAddress);

    return {
      publicKey,
       tokenSymbol: process.env.TOKEN_SYMBOL?.trim() || "TOKEN",
      balance: formatUnitsToNumber(raw, decimals),
    };
  }

  const wei = await fetchNativeBalanceWei(publicKey);

  return {
    publicKey,
    tokenSymbol: "ETH",
    balance: formatUnitsToNumber(wei, 18),
  };
}

export const getWalletSnapshot = unstable_cache(
  async () => buildWalletSnapshot(),
  ["walletSnapshot"],
  { revalidate: 60 }
);