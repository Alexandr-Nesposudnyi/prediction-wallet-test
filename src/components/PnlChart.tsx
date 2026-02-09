"use client";

import { useMemo, useRef } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type Point = {
  ts: number;
  value: number;
};

type Props = {
  data: Point[];
  onHover?: (value: number, ts: number | null) => void;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PnlChart({ data, onHover }: Props) {
  const lastTsRef = useRef<number | null>(null);

  const displayData = useMemo(() => {
    return data && data.length ? data : [];
  }, [data]);

  return (
    <div className="mt-6 h-36">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          onMouseMove={(state: any) => {
            const p: Point | undefined = state?.activePayload?.[0]?.payload;
            if (!p) return;

            if (lastTsRef.current !== p.ts) {
              lastTsRef.current = p.ts;
              onHover?.(p.value, p.ts);
            }
          }}
          onMouseLeave={() => {
            lastTsRef.current = null;
            if (displayData.length) {
              const last = displayData[displayData.length - 1];
              onHover?.(last.value, null);
            }
          }}
        >
          <XAxis hide />
          <YAxis hide domain={["auto", "auto"]} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;

              return (
                <div className="rounded-xl bg-white shadow-sm px-3 py-2 text-xs text-gray-700">
                  <div className="font-medium">{p.value.toFixed(2)}</div>
                  <div className="text-gray-500">{formatTime(p.ts)}</div>
                </div>
              );
            }}
          />

       
          <defs>
            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDBA74" stopOpacity={0.55} />
              <stop offset="55%" stopColor="#FDBA74" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#FDBA74" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="value"
            stroke="#F97316"    
            strokeWidth={2}
            fill="url(#pnlFill)" 
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}