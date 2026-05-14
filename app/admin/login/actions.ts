"use server";

import { issueLoginToken } from "@/lib/auth";
import { sendAdminMagicLink } from "@/lib/email";
import { appUrl } from "@/lib/stripe";

export type LoginFormState = {
  sent?: boolean;
  email?: string;
  error?: string;
};

export async function requestMagicLink(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const token = await issueLoginToken(email);
  if (token) {
    const url = `${appUrl()}/admin/login/verify?token=${token}`;
    try {
      await sendAdminMagicLink({ to: email, url });
    } catch (err) {
      console.error("[admin login] email send failed:", err);
      // Still return success — we don't want to leak whether the email is
      // a valid admin via the error path either.
    }
  } else {
    // Constant-time-ish: do a no-op delay so the response time doesn't
    // distinguish "admin" from "not admin".
    await new Promise((r) => setTimeout(r, 250));
  }

  return { sent: true, email };
}
