import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { appUrl, getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  let body: { productId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const productId = Number(body.productId);
  if (!Number.isFinite(productId) || productId <= 0)
    return NextResponse.json({ error: "productId required." }, { status: 400 });

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || product.status !== "published")
    return NextResponse.json({ error: "Product not available." }, { status: 404 });

  const base = appUrl();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            description: [
              product.vehicleMake,
              product.vehicleModel,
              product.engine,
              product.tuningStage,
            ]
              .filter(Boolean)
              .join(" · ") || undefined,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/store/${product.slug}`,
    // Collect the email — this is how the customer recovers downloads later.
    customer_creation: "always",
    billing_address_collection: "auto",
    metadata: {
      productId: String(product.id),
    },
  });

  if (!session.url)
    return NextResponse.json(
      { error: "Stripe did not return a Checkout URL." },
      { status: 502 },
    );

  return NextResponse.json({ url: session.url });
}
