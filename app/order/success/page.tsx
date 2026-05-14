import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  downloadGrants,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";

export const metadata = { title: "Order complete" };
export const dynamic = "force-dynamic";

// Brief poll loop — the webhook usually lands within a second of the user
// being redirected back, but occasionally it's slower. We try up to 5 times
// (~5s total) before showing the "still processing" fallback.
async function loadOrderWithRetry(sessionId: string) {
  for (let i = 0; i < 5; i++) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, sessionId))
      .limit(1);
    if (order) return order;
    if (i < 4) await new Promise((r) => setTimeout(r, 1000));
  }
  return null;
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  const order = await loadOrderWithRetry(session_id);

  return (
    <main className="min-h-dvh">
      <header className="px-5 sm:px-8 py-4 border-b border-steel-200/70 bg-white/60 backdrop-blur sticky top-0 z-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="NextGen Diesel"
            width={60}
            height={60}
            priority
          />
        </Link>
      </header>

      <div className="px-5 sm:px-8 py-10 sm:py-16 max-w-2xl mx-auto">
        {order ? (
          <PaidView orderId={order.id} customerEmail={order.customerEmail} />
        ) : (
          <ProcessingView />
        )}
      </div>
    </main>
  );
}

async function PaidView({
  orderId,
  customerEmail,
}: {
  orderId: number;
  customerEmail: string;
}) {
  const items = await db
    .select({
      grantToken: downloadGrants.token,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(downloadGrants, eq(downloadGrants.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return (
    <>
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
      <h1 className="mt-6 font-display text-4xl sm:text-5xl font-black tracking-tight text-midnight-900 text-center">
        Order complete.
      </h1>
      <p className="mt-3 text-steel-600 text-base sm:text-lg text-center">
        Receipt sent to <strong className="text-midnight-900">{customerEmail}</strong>.
        Your download{items.length === 1 ? " is" : "s are"} ready below.
      </p>

      <div className="mt-10 space-y-3">
        {items.map((it) => (
          <div
            key={it.grantToken}
            className="card p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="min-w-0">
              <div className="font-bold text-midnight-900">{it.productName}</div>
              <div className="text-xs text-steel-500 mt-0.5">
                Order #{orderId}
              </div>
            </div>
            <a
              href={`/api/download/${it.grantToken}`}
              className="btn-primary"
            >
              Download
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-steel-500 text-center">
        Lost this page later? Visit{" "}
        <Link
          href="/downloads"
          className="text-blaze-600 font-semibold hover:underline"
        >
          your downloads
        </Link>{" "}
        and we'll email fresh links.
      </p>
    </>
  );
}

function ProcessingView() {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto size-12 rounded-full bg-blaze-50 grid place-items-center">
        <span className="size-3 rounded-full bg-blaze-500 animate-pulse" />
      </div>
      <h1 className="mt-5 font-display text-3xl font-black tracking-tight text-midnight-900">
        Payment received — preparing your downloads
      </h1>
      <p className="mt-3 text-steel-600">
        Your card was charged. The download link normally appears within a few
        seconds; refresh this page in a moment, or check your email — we just
        sent the link there too.
      </p>
      <div className="mt-6">
        <Link href="/downloads" className="btn-secondary">
          Go to my downloads
        </Link>
      </div>
    </div>
  );
}
