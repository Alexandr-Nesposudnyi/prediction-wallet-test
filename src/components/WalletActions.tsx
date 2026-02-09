"use client";

import { useMemo, useState, useTransition } from "react";
import MotionButton from "@/components/MotionButton";
import AmountModal from "@/components/AmountModal";
import { deposit, withdraw } from "@/app/actions/tx";

type Mode = "deposit" | "withdraw";

type Props = {
  symbol?: string;
};

export default function WalletActions({ symbol = "TOKEN" }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "deposit") return "Deposit";
    if (mode === "withdraw") return "Withdraw";
    return "";
  }, [mode]);

  function close() {
    if (isPending) return; 
    setMode(null);
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <MotionButton
          type="button"
          className="h-12 rounded-xl bg-orange-500 text-white font-medium disabled:opacity-60"
          disabled={isPending}
          onClick={() => {
            setError(null);
            setLastHash(null);
            setMode("deposit");
          }}
        >
          {isPending && mode === "deposit" ? "Sending..." : "Deposit"}
        </MotionButton>

        <MotionButton
          type="button"
          className="h-12 rounded-xl bg-gray-100 text-gray-900 font-medium disabled:opacity-60"
          disabled={isPending}
          onClick={() => {
            setError(null);
            setLastHash(null);
            setMode("withdraw");
          }}
        >
          {isPending && mode === "withdraw" ? "Sending..." : "Withdraw"}
        </MotionButton>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {lastHash && (
        <div className="mt-3 text-sm text-gray-700 break-all">
          Tx: <span className="font-medium">{lastHash}</span>
        </div>
      )}

      <AmountModal
        open={mode !== null}
        title={title}
        symbol={symbol}
        onClose={close}
        onConfirm={(amount) => {
          if (!mode) return;

          setError(null);
          setLastHash(null);

          startTransition(async () => {
            try {
              const res =
                mode === "deposit" ? await deposit(amount) : await withdraw(amount);

              setLastHash(res.hash);
              setMode(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Transaction failed");
            }
          });
        }}
      />
    </>
  );
}