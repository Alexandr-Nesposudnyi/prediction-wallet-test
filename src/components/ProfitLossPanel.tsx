"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import TimeRangeTabs from "@/components/TimeRangeTabs";
import PnlChart from "@/components/PnlChart";
import NumberFlow from "@/components/NumberFlow";
import { getChart, type TimeRange, type ChartPoint } from "@/app/actions/chart";

const DEFAULT_BASELINE = 223.43;

function isFlatZero(points: ChartPoint[]) {
  return points.length > 0 && points.every((p) => p.value === 0);
}

function buildDemoCurve(points: ChartPoint[], baseline: number): ChartPoint[] {
  if (!points.length) return [];

  return points.map((p, i) => {
    const wave1 = Math.sin(i / 4) * 6.5;
    const wave2 = Math.sin(i / 9) * 3.2;
    const drift = (i / Math.max(points.length - 1, 1)) * 2.2;
    const v = baseline + wave1 + wave2 + drift;
    return { ...p, value: Number(v.toFixed(2)) };
  });
}

export default function ProfitLossPanel() {
  const [range, setRange] = useState<TimeRange>("6H");
  const [rawPoints, setRawPoints] = useState<ChartPoint[]>([]);
  const [value, setValue] = useState(DEFAULT_BASELINE);
  const [label, setLabel] = useState("Past 6H");
  const [isPending, startTransition] = useTransition();

  const noData = useMemo(() => isFlatZero(rawPoints), [rawPoints]);

  const points = useMemo(() => {
    if (!rawPoints.length) return [];
    if (!noData) return rawPoints;
    return buildDemoCurve(rawPoints, DEFAULT_BASELINE);
  }, [rawPoints, noData]);

  useEffect(() => {
    startTransition(async () => {
      const res = await getChart(range);

      setRawPoints(res.points);

      const empty = isFlatZero(res.points);
      setValue(empty ? DEFAULT_BASELINE : res.summary.change);

      setLabel(range === "All" ? "All Time" : `Past ${range}`);
    });
  }, [range, startTransition]);

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className="text-green-600">⯅</span>
            <span>Profit/Loss</span>
          </div>

          <div className="mt-2 text-4xl font-medium tracking-tight">
            <NumberFlow value={value} prefix="+$" decimals={2} />
          </div>

          <div className="mt-1 text-sm text-gray-400">{label}</div>
        </div>

        <TimeRangeTabs defaultValue="6H" onChange={(t) => setRange(t as TimeRange)} />
      </div>

      <div className={isPending ? "opacity-60 transition-opacity" : "opacity-100 transition-opacity"}>
        <PnlChart
          data={points}
          onHover={(v, ts) => {
            setValue(v);
            if (ts) setLabel(new Date(ts).toLocaleString());
          }}
        />
      </div>
    </section>
  );
}