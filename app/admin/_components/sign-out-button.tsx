"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "../actions";

export function SignOutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await signOut();
          router.push("/admin/login");
          router.refresh();
        })
      }
      className="mt-3 text-sm font-semibold text-steel-600 hover:text-blaze-600 disabled:opacity-50"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
