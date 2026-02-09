"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MotionButton from "@/components/MotionButton";

type Props = {
  open: boolean;
  title: string;
  symbol: string;
  onClose: () => void;
  onConfirm: (amount: string) => void;
};

export default function AmountModal({
  open,
  title,
  symbol,
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const canConfirm = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0;
  }, [value]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Enter amount in {symbol}
                  </div>
                </div>

                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5">
                <label className="text-xs text-gray-500">Amount</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3">
                  <input
                    inputMode="decimal"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-transparent outline-none text-lg font-medium"
                  />
                  <div className="text-sm text-gray-600 font-medium">
                    {symbol}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <MotionButton
                  type="button"
                  className="h-12 rounded-xl bg-gray-100 text-gray-900 font-medium"
                  onClick={onClose}
                >
                  Cancel
                </MotionButton>

                <MotionButton
                  type="button"
                  className={`h-12 rounded-xl font-medium ${
                    canConfirm
                      ? "bg-orange-500 text-white"
                      : "bg-orange-200 text-white cursor-not-allowed"
                  }`}
                  onClick={() => canConfirm && onConfirm(value)}
                  disabled={!canConfirm}
                >
                  Confirm
                </MotionButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}