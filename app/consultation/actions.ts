"use server";

import { db } from "@/lib/db";
import { consultationRequests } from "@/lib/db/schema";

export type ConsultationFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof ConsultationInput, string>>;
  values?: ConsultationInput;
};

type ConsultationInput = {
  name: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  engine: string;
  message: string;
};

function read(formData: FormData): ConsultationInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    vehicleMake: String(formData.get("vehicleMake") ?? "").trim(),
    vehicleModel: String(formData.get("vehicleModel") ?? "").trim(),
    vehicleYear: String(formData.get("vehicleYear") ?? "").trim(),
    engine: String(formData.get("engine") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };
}

export async function submitConsultation(
  _prev: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> {
  const input = read(formData);
  const fieldErrors: ConsultationFormState["fieldErrors"] = {};

  if (!input.name) fieldErrors.name = "Required.";
  if (!input.email) fieldErrors.email = "Required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    fieldErrors.email = "Doesn't look like a valid email.";
  if (!input.message) fieldErrors.message = "Tell us a bit about what you need.";
  else if (input.message.length < 10)
    fieldErrors.message = "A little more detail helps — at least 10 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors,
      values: input,
    };
  }

  await db.insert(consultationRequests).values({
    name: input.name,
    email: input.email,
    phone: input.phone,
    vehicleMake: input.vehicleMake,
    vehicleModel: input.vehicleModel,
    vehicleYear: input.vehicleYear,
    engine: input.engine,
    message: input.message,
  });

  // TODO Phase 5/6: also fire a Resend notification to admins.

  return { success: true };
}
