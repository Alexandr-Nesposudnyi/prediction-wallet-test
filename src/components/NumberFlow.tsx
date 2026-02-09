"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

function formatNumber(n: number, decimals: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function NumberFlow({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
}: Props) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 220, damping: 28, mass: 0.6 });

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    mv.set(value);
  }, [mv, value]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => setDisplay(latest));
    return () => unsub();
  }, [spring]);

  const text = useMemo(() => {
    return `${prefix}${formatNumber(display, decimals)}${suffix}`;
  }, [display, decimals, prefix, suffix]);

  return <motion.span>{text}</motion.span>;
}