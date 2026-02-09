"use server";

import { getChart } from "@/app/actions/chart";

export async function getWalletTodaySummary(): Promise<{
  change: number;
  percent: number;
}> {
  const res = await getChart("1D");

  return {
    change: res.summary.change,
    percent: res.summary.percent,
  };
}