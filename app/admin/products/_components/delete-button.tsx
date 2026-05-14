"use client";

import { useTransition } from "react";
import { deleteProduct } from "../actions";

export function DeleteButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        start(async () => {
          await deleteProduct(id);
        });
      }}
      className="text-sm font-semibold text-danger hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
