"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type Props = HTMLMotionProps<"button"> & {
  className?: string;
};

export default function MotionButton({ className = "", ...props }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 0.98 }}
      className={className}
      {...props}
    />
  );
}