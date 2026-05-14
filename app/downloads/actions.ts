"use server";

import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  downloadGrants,
  orders,
  products,
} from "@/lib/db/schema";
import { sendDownloadLinksEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export type ResendFormState = {
  sent?: boolean;
  email?: string;
  error?: string;
};

export async function resendDownloads(
  _prev: ResendFormState,
  formData: FormData,
): Promise<ResendFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  // Rate-limit by IP — 5 sends per 10 minutes is generous for real users
  // and stops anyone using this endpoint as an email-enumeration oracle.
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`${ip}:resend`, { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.ok) {
    return {
      error: `Too many resend requests. Try again in ${Math.ceil(rl.retryAfterMs / 1000 / 60)} minutes.`,
    };
  }

  // Look up every paid order for this email + its grants.
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerEmail, email))
    .orderBy(desc(orders.createdAt));

  const ordersWithGrants: Array<{
    orderId: number;
    placedAt: Date;
    grants: Array<{ token: string; productName: string }>;
  }> = [];

  for (const o of orderRows) {
    if (o.status !== "paid") continue;
    const grantRows = await db
      .select({
        token: downloadGrants.token,
        productName: products.name,
      })
      .from(downloadGrants)
      .innerJoin(products, eq(downloadGrants.productId, products.id))
      .where(eq(downloadGrants.orderId, o.id));
    if (grantRows.length === 0) continue;
    ordersWithGrants.push({
      orderId: o.id,
      placedAt: o.createdAt,
      grants: grantRows,
    });
  }

  // Only send if there's something to send. But ALWAYS return the same
  // success message to avoid leaking whether the email has orders.
  if (ordersWithGrants.length > 0) {
    try {
      await sendDownloadLinksEmail({ to: email, orders: ordersWithGrants });
    } catch (err) {
      console.error("[resend downloads] email send failed:", err);
    }
  } else {
    // Constant-time-ish: don't reveal "no orders" via response speed.
    await new Promise((r) => setTimeout(r, 250));
  }

  return { sent: true, email };
}
