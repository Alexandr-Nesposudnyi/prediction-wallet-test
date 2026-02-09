"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function MotionButton({ className = "", ...props }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 0.98 }}
      drag
      dragElastic={0.12}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      className={className}
      {...props}
    />
  );
}