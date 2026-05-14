"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginFormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginFormState, FormData>(
    requestMagicLink,
    {},
  );

  if (state.sent) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 text-success px-4 py-4 text-sm">
        <strong className="block text-base mb-1 text-midnight-900">
          Check your email
        </strong>
        <span className="text-steel-700">
          If <strong>{state.email}</strong> is an admin, a sign-in link is on
          its way. The link expires in 15 minutes.
        </span>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-midnight-900 mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          placeholder="you@example.com"
          className="w-full bg-white border border-steel-300 focus:border-blaze-500 rounded-lg px-3.5 py-2.5 min-h-12 text-midnight-900 placeholder:text-steel-400"
        />
        {state.error ? (
          <p className="mt-1.5 text-xs text-danger">{state.error}</p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Sending link…" : "Send sign-in link"}
      </button>
    </form>
  );
}
