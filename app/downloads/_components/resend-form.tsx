"use client";

import { useActionState } from "react";
import { resendDownloads, type ResendFormState } from "../actions";

export function ResendForm() {
  const [state, action, pending] = useActionState<ResendFormState, FormData>(
    resendDownloads,
    {},
  );

  if (state.sent) {
    return (
      <div className="card p-6 sm:p-8 text-center">
        <div className="mx-auto size-12 rounded-full bg-success/10 text-success grid place-items-center">
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-midnight-900">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-steel-600">
          If <strong className="text-midnight-900">{state.email}</strong> has
          orders with us, fresh download links are on their way.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-5 sm:p-6">
      <label
        htmlFor="r-email"
        className="block text-sm font-semibold text-midnight-900 mb-1.5"
      >
        Your email
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="r-email"
          name="email"
          type="email"
          required
          autoFocus
          placeholder="you@example.com"
          className="flex-1 bg-white border border-steel-300 focus:border-blaze-500 rounded-lg px-3.5 py-2.5 min-h-12 text-midnight-900 placeholder:text-steel-400"
        />
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Sending…" : "Send links"}
        </button>
      </div>
      {state.error ? (
        <p className="mt-2 text-xs text-danger">{state.error}</p>
      ) : (
        <p className="mt-3 text-xs text-steel-500">
          We'll email you fresh download links for every order tied to this
          address.
        </p>
      )}
    </form>
  );
}
