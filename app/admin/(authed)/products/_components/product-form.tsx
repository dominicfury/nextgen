"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Product } from "@/lib/db/schema";
import type { ProductFormState } from "../actions";

type Action = (
  state: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState> | ProductFormState;

export function ProductForm({
  action,
  initial,
  submitLabel,
}: {
  action: Action;
  initial?: Partial<Product>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  const v = state.values;
  const errs = state.fieldErrors ?? {};

  const get = <K extends keyof Product>(
    key: K,
    fromInput: string | undefined,
  ): string =>
    (fromInput ?? (initial?.[key] as unknown as string | undefined) ?? "") + "";

  const priceDefault =
    v?.price ??
    (initial?.priceCents != null
      ? (initial.priceCents / 100).toFixed(2)
      : "");

  const status =
    v?.status ??
    ((initial?.status as "draft" | "published" | undefined) ?? "draft");

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 text-danger px-4 py-3 text-sm font-medium"
        >
          {state.error}
        </div>
      ) : null}

      <Field
        label="Name"
        name="name"
        defaultValue={get("name", v?.name)}
        error={errs.name}
        required
        placeholder="e.g. 6.7L Cummins Stage 2 Hot Tune"
      />

      <Field
        label="Slug"
        name="slug"
        defaultValue={get("slug", v?.slug)}
        error={errs.slug}
        hint="URL path under /store/. Leave blank to auto-generate from name."
        placeholder="auto from name"
      />

      <Field
        label="Description"
        name="description"
        defaultValue={get("description", v?.description)}
        as="textarea"
        rows={5}
        hint="Plain text. Line breaks preserved on the product page."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Price (USD)"
          name="price"
          defaultValue={priceDefault}
          error={errs.price}
          required
          placeholder="249.00"
          inputMode="decimal"
        />
        <Field
          label="File format"
          name="fileFormat"
          defaultValue={get("fileFormat", v?.fileFormat)}
          placeholder="e.g. EFI Live, EZ Lynk, MPVI3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field
          label="Vehicle make"
          name="vehicleMake"
          defaultValue={get("vehicleMake", v?.vehicleMake)}
          placeholder="Ram"
        />
        <Field
          label="Model"
          name="vehicleModel"
          defaultValue={get("vehicleModel", v?.vehicleModel)}
          placeholder="2500/3500"
        />
        <Field
          label="Engine"
          name="engine"
          defaultValue={get("engine", v?.engine)}
          placeholder="6.7L Cummins"
        />
      </div>

      <Field
        label="Tuning stage"
        name="tuningStage"
        defaultValue={get("tuningStage", v?.tuningStage)}
        placeholder="Stage 1 / Stage 2 / Race"
      />

      <fieldset>
        <legend className="text-sm font-semibold text-midnight-900 mb-2">
          Status
        </legend>
        <div className="flex gap-2">
          <StatusRadio
            name="status"
            value="draft"
            label="Draft"
            checked={status === "draft"}
          />
          <StatusRadio
            name="status"
            value="published"
            label="Published"
            checked={status === "published"}
          />
        </div>
        <p className="mt-2 text-xs text-steel-500">
          Only published products appear in the public store.
        </p>
      </fieldset>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Link href="/admin/products" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn-primary flex-1 sm:flex-none">
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  hint,
  required,
  placeholder,
  inputMode,
  as = "input",
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: "decimal";
  as?: "input" | "textarea";
  rows?: number;
}) {
  const id = `f-${name}`;
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
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className={`${base} ${border} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
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

function StatusRadio({
  name,
  value,
  label,
  checked,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label
      className={
        (checked
          ? "border-blaze-500 bg-blaze-50 text-blaze-700"
          : "border-steel-300 bg-white text-steel-600 hover:border-steel-400") +
        " flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm font-bold transition-colors text-center"
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="sr-only"
      />
      {label}
    </label>
  );
}
