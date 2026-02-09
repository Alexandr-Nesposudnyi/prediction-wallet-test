"use client";

import { useState } from "react";
import MotionButton from "@/components/MotionButton";

const ranges = ["1H", "6H", "1D", "1W", "1M", "All"] as const;
export type TimeRange = (typeof ranges)[number];

type Props = {
  defaultValue?: TimeRange;
  onChange?: (value: TimeRange) => void;
};

export default function TimeRangeTabs({ defaultValue = "6H", onChange }: Props) {
  const [value, setValue] = useState<TimeRange>(defaultValue);

  function select(next: TimeRange) {
    setValue(next);
    onChange?.(next);
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
      {ranges.map((t) => {
        const active = t === value;

        return (
          <MotionButton
            key={t}
            type="button"
            onClick={() => select(t)}
            className={
              active
                ? "px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium"
                : "px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            }
          >
            {t}
          </MotionButton>
        );
      })}
    </div>
  );
}