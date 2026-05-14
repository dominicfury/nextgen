"use client";

import { useState, useTransition } from "react";
import { resendReceipt } from "../actions";

export function ResendReceiptButton({ orderId }: { orderId: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={() =>
        start(async () => {
          const res = await resendReceipt(orderId);
          if (!res.ok) {
            alert(`Resend failed: ${res.error}`);
            return;
          }
          setDone(true);
          setTimeout(() => setDone(false), 4000);
        })
      }
      className="mt-1 text-xs font-semibold text-blaze-600 hover:text-blaze-700 disabled:opacity-50"
    >
      {done ? "✓ Sent" : pending ? "Sending…" : "Resend receipt"}
    </button>
  );
}
