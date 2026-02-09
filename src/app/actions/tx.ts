"use server";

import { createHash, randomUUID } from "crypto";

type TxResult = {
  hash: `0x${string}`;
};

function fakeHash(): `0x${string}` {
  const seed = `${randomUUID()}-${Date.now()}-${Math.random()}`;
  const hex = createHash("sha256").update(seed).digest("hex"); // 64 hex chars
  return (`0x${hex}`) as `0x${string}`;
}

export async function deposit(amount: string): Promise<TxResult> {
  await new Promise((r) => setTimeout(r, 700));
  console.log("[mock deposit]", amount);
  return { hash: fakeHash() };
}

export async function withdraw(amount: string): Promise<TxResult> {
  await new Promise((r) => setTimeout(r, 700));
  console.log("[mock withdraw]", amount);
  return { hash: fakeHash() };
}