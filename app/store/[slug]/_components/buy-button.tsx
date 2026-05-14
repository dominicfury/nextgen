"use client";

import { useState } from "react";

export function BuyButton({ productId }: { productId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({
          error: `Checkout failed (${res.status}).`,
        }));
        throw new Error(error || "Checkout failed");
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="btn-primary w-full mt-6 text-base"
      >
        {pending ? "Redirecting…" : "Buy now"}
        {pending ? null : (
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-danger font-medium">{error}</p>
      ) : null}
    </>
  );
}
