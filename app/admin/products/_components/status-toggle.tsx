"use client";

import { useTransition } from "react";
import { toggleProductStatus } from "../actions";

export function StatusToggle({
  id,
  status,
}: {
  id: number;
  status: "draft" | "published";
}) {
  const [pending, start] = useTransition();
  const isPublished = status === "published";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await toggleProductStatus(id)))}
      className={
        (isPublished
          ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
          : "bg-steel-100 text-steel-700 border-steel-200 hover:bg-steel-200") +
        " inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors disabled:opacity-50"
      }
      title={isPublished ? "Click to unpublish" : "Click to publish"}
    >
      <span
        className={
          (isPublished ? "bg-success" : "bg-steel-400") +
          " size-1.5 rounded-full"
        }
      />
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}
