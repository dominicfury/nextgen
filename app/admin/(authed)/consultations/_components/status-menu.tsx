"use client";

import { useTransition } from "react";
import { updateConsultationStatus } from "../actions";

const STATUSES: Array<{
  value: "new" | "contacted" | "closed";
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export function StatusMenu({
  id,
  current,
}: {
  id: number;
  current: "new" | "contacted" | "closed";
}) {
  const [pending, start] = useTransition();
  return (
    <select
      disabled={pending}
      defaultValue={current}
      onChange={(e) => {
        const next = e.target.value as "new" | "contacted" | "closed";
        if (next === current) return;
        start(async () => {
          await updateConsultationStatus(id, next);
        });
      }}
      className="bg-white border border-steel-300 rounded-md px-2.5 py-1 text-xs font-bold text-midnight-800 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
