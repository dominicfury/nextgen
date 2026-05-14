import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  downloadGrants,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";
import { sendReceiptEmail } from "@/lib/email";

// Stripe webhook handler — the source of truth for fulfilling orders.
// NEVER trust the client redirect; ONLY this signed webhook creates grants.

// The raw body is required for signature verification. Next.js App Router
// route handlers expose it via req.text().
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function downloadToken(): string {
  // 32 bytes -> 64 hex chars. Unguessable per the spec.
  return randomBytes(32).toString("hex");
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook signature or secret missing." },
      { status: 400 },
    );
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Webhook signature verification failed.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    // Ignore other events — return 200 so Stripe doesn't retry.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Only fulfill paid sessions.
  if (session.payment_status !== "paid") {
    return NextResponse.json({
      received: true,
      ignored: "payment not in 'paid' state",
    });
  }

  // Idempotency — Stripe may retry. If we already have an order for this
  // session, return success without doing anything.
  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeSessionId, session.id))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  const email = (
    session.customer_details?.email ??
    session.customer_email ??
    ""
  )
    .trim()
    .toLowerCase();
  if (!email) {
    // Without an email we can't deliver the file — flag, but don't 500
    // (Stripe would retry forever). Surface in logs.
    console.error(
      `[stripe webhook] paid session ${session.id} has no customer email`,
    );
    return NextResponse.json({
      received: true,
      warning: "no email on session",
    });
  }

  // Reconstruct the cart. We only support 1 item per session for now (see
  // /api/checkout) but write this resilient to multiple line items.
  const productIdFromMeta = Number(session.metadata?.productId);
  const productIds: number[] = [];
  if (Number.isFinite(productIdFromMeta) && productIdFromMeta > 0) {
    productIds.push(productIdFromMeta);
  } else {
    // Fallback: expand line items.
    const items = await getStripe().checkout.sessions.listLineItems(
      session.id,
      { limit: 50, expand: ["data.price.product"] },
    );
    for (const li of items.data) {
      const productMeta = (
        (li.price?.product as Stripe.Product | undefined)?.metadata ?? {}
      )["productId"];
      const id = Number(productMeta);
      if (Number.isFinite(id) && id > 0) productIds.push(id);
    }
  }

  if (productIds.length === 0) {
    console.error(
      `[stripe webhook] session ${session.id} -> could not resolve any productId`,
    );
    return NextResponse.json({
      received: true,
      warning: "no product id resolved",
    });
  }

  const purchased = await db
    .select()
    .from(products)
    .where(eq(products.id, productIds[0]));

  // Look up any additional products if there were multiple.
  for (let i = 1; i < productIds.length; i++) {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, productIds[i]))
      .limit(1);
    if (row) purchased.push(row);
  }
  if (purchased.length === 0) {
    console.error(
      `[stripe webhook] session ${session.id} -> products not found: ${productIds.join(",")}`,
    );
    return NextResponse.json({
      received: true,
      warning: "products not found",
    });
  }

  // Insert order + items + grants. SQLite doesn't have transactions in
  // libSQL's HTTP mode in all configs, but the operations are tolerant:
  // duplicate orders are blocked by the unique index on stripe_session_id.
  const [order] = await db
    .insert(orders)
    .values({
      customerEmail: email,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      totalCents: session.amount_total ?? 0,
      status: "paid",
    })
    .returning();

  const grants: Array<{ token: string; productName: string }> = [];

  for (const p of purchased) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: p.id,
      priceAtPurchaseCents: p.priceCents,
    });

    const token = downloadToken();
    await db.insert(downloadGrants).values({
      orderId: order.id,
      productId: p.id,
      customerEmail: email,
      token,
      // Unlimited downloads, no expiry. (Phase 6 could tighten this.)
    });
    grants.push({ token, productName: p.name });
  }

  // Fire-and-forget receipt email. Errors are logged but don't fail the
  // webhook — the customer can recover via /downloads.
  await sendReceiptEmail({
    to: email,
    orderId: order.id,
    grants,
  }).catch((err) =>
    console.error(
      `[stripe webhook] receipt email failed for order ${order.id}:`,
      err,
    ),
  );

  return NextResponse.json({
    received: true,
    orderId: order.id,
    grants: grants.length,
  });
}
