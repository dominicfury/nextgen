"use client";

import { useTransition } from "react";
import { deleteConsultation } from "../actions";

export function DeleteButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete request from ${name}? This cannot be undone.`))
          return;
        start(async () => {
          await deleteConsultation(id);
        });
      }}
      className="text-sm font-semibold text-danger hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
