"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  downloadGrants,
  orders,
  products,
} from "@/lib/db/schema";
import { sendReceiptEmail } from "@/lib/email";

export type ResendReceiptResult = {
  ok: boolean;
  error?: string;
};

export async function resendReceipt(
  orderId: number,
): Promise<ResendReceiptResult> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "paid")
    return { ok: false, error: "Only paid orders can be receipted." };

  const grantRows = await db
    .select({
      token: downloadGrants.token,
      productName: products.name,
    })
    .from(downloadGrants)
    .innerJoin(products, eq(downloadGrants.productId, products.id))
    .where(eq(downloadGrants.orderId, order.id));

  try {
    await sendReceiptEmail({
      to: order.customerEmail,
      orderId: order.id,
      grants: grantRows,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
