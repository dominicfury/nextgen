"use client";

import { useActionState } from "react";
import { submitConsultation, type ConsultationFormState } from "../actions";

export function ConsultationForm() {
  const [state, formAction, pending] = useActionState<
    ConsultationFormState,
    FormData
  >(submitConsultation, {});

  if (state.success) {
    return (
      <div className="card p-8 sm:p-10 text-center">
        <div className="mx-auto size-14 rounded-full bg-success/10 text-success grid place-items-center">
          <svg
            className="size-7"
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
        <h2 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-midnight-900">
          Got it — we'll be in touch.
        </h2>
        <p className="mt-3 text-steel-600 max-w-md mx-auto">
          Your consultation request is in. Expect a reply within one business
          day at the email you provided.
        </p>
      </div>
    );
  }

  const v = state.values;
  const errs = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="card p-5 sm:p-8 space-y-5">
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 text-danger px-4 py-3 text-sm font-medium"
        >
          {state.error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Name"
          name="name"
          required
          defaultValue={v?.name}
          error={errs.name}
          placeholder="Jordan Trucker"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={v?.email}
          error={errs.email}
          placeholder="you@example.com"
        />
      </div>

      <Field
        label="Phone"
        name="phone"
        type="tel"
        defaultValue={v?.phone}
        hint="Optional — we'll text if it's faster."
        placeholder="(555) 555-5555"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field
          label="Year"
          name="vehicleYear"
          defaultValue={v?.vehicleYear}
          placeholder="2021"
          inputMode="numeric"
        />
        <Field
          label="Make"
          name="vehicleMake"
          defaultValue={v?.vehicleMake}
          placeholder="Ram"
        />
        <Field
          label="Model"
          name="vehicleModel"
          defaultValue={v?.vehicleModel}
          placeholder="2500"
        />
        <Field
          label="Engine"
          name="engine"
          defaultValue={v?.engine}
          placeholder="6.7 Cummins"
        />
      </div>

      <Field
        as="textarea"
        rows={5}
        label="What are you looking for?"
        name="message"
        required
        defaultValue={v?.message}
        error={errs.message}
        placeholder="Tell us about the truck, mods, what you're chasing (power / towing / fuel economy), and any problem codes."
      />

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full sm:w-auto"
      >
        {pending ? "Sending…" : "Send request"}
      </button>
      <p className="text-xs text-steel-500">
        No spam. Your info goes straight to our shop — we only use it to reply.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  error,
  hint,
  placeholder,
  inputMode,
  as = "input",
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal" | "tel";
  as?: "input" | "textarea";
  rows?: number;
}) {
  const id = `c-${name}`;
  const base =
    "w-full bg-white border rounded-lg px-3.5 py-2.5 text-midnight-900 placeholder:text-steel-400 min-h-12";
  const border = error
    ? "border-danger focus:border-danger"
    : "border-steel-300 focus:border-blaze-500";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-midnight-900 mb-1.5"
      >
        {label}
        {required ? <span className="text-blaze-600 ml-1">*</span> : null}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={rows ?? 4}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`${base} ${border} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`${base} ${border}`}
        />
      )}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-steel-500">{hint}</p>
      ) : null}
    </div>
  );
}
