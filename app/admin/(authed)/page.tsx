import Link from "next/link";
import { eq, count, desc, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  consultationRequests,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmt(d: Date | number): string {
  const date = d instanceof Date ? d : new Date(d * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const [
    publishedRows,
    draftRows,
    newConsultRows,
    orderStatsRows,
    recentOrderRows,
    topSellerRows,
  ] = await Promise.all([
    db
      .select({ n: count() })
      .from(products)
      .where(eq(products.status, "published" as const)),
    db
      .select({ n: count() })
      .from(products)
      .where(eq(products.status, "draft" as const)),
    db
      .select({ n: count() })
      .from(consultationRequests)
      .where(eq(consultationRequests.status, "new" as const)),
    db
      .select({
        orderCount: count(),
        revenueCents: sum(orders.totalCents).mapWith(Number),
      })
      .from(orders)
      .where(eq(orders.status, "paid" as const)),
    db
      .select()
      .from(orders)
      .where(eq(orders.status, "paid" as const))
      .orderBy(desc(orders.createdAt))
      .limit(8),
    db
      .select({
        productId: orderItems.productId,
        name: products.name,
        slug: products.slug,
        count: count(),
        revenueCents: sum(orderItems.priceAtPurchaseCents).mapWith(Number),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.status, "paid" as const))
      .groupBy(orderItems.productId, products.name, products.slug)
      .orderBy(desc(count()))
      .limit(5),
  ]);

  const published = publishedRows[0]?.n ?? 0;
  const drafts = draftRows[0]?.n ?? 0;
  const newConsults = newConsultRows[0]?.n ?? 0;
  const orderCount = orderStatsRows[0]?.orderCount ?? 0;
  const revenueCents = orderStatsRows[0]?.revenueCents ?? 0;

  return (
    <div className="p-5 sm:p-8 max-w-6xl">
      <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
        Dashboard
      </h1>
      <p className="mt-2 text-steel-600">Catalog and sales at a glance.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat
          label="Revenue (all-time)"
          value={formatPrice(revenueCents)}
          accent="blaze"
        />
        <Stat label="Orders" value={orderCount} accent="midnight" />
        <Stat label="Published products" value={published} accent="volt" />
        <Stat
          label="New consultations"
          value={newConsults}
          hint={drafts > 0 ? `${drafts} draft${drafts === 1 ? "" : "s"}` : undefined}
          accent="midnight"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-midnight-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-blaze-600 hover:text-blaze-700"
            >
              All orders →
            </Link>
          </div>
          {recentOrderRows.length === 0 ? (
            <div className="text-sm text-steel-500 py-6 text-center">
              No paid orders yet. They'll show up here as Stripe webhooks fire.
            </div>
          ) : (
            <ul className="divide-y divide-steel-200">
              {recentOrderRows.map((o) => (
                <li
                  key={o.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-midnight-900 text-sm truncate">
                      #{o.id} · {o.customerEmail}
                    </div>
                    <div className="text-xs text-steel-500">
                      {fmt(o.createdAt)}
                    </div>
                  </div>
                  <div className="font-bold text-midnight-900 shrink-0">
                    {formatPrice(o.totalCents)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-bold text-midnight-900 mb-4">Top sellers</h2>
          {topSellerRows.length === 0 ? (
            <div className="text-sm text-steel-500 py-6 text-center">
              Sales data appears here after your first paid order.
            </div>
          ) : (
            <ol className="space-y-3">
              {topSellerRows.map((row, i) => (
                <li key={row.productId} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-paper-100 text-steel-600 grid place-items-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/store/${row.slug}`}
                      className="font-semibold text-midnight-900 text-sm hover:text-blaze-600 truncate block"
                    >
                      {row.name}
                    </Link>
                    <div className="text-xs text-steel-500">
                      {row.count} sale{row.count === 1 ? "" : "s"} ·{" "}
                      {formatPrice(row.revenueCents)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="mt-8 card p-5 sm:p-6">
        <h2 className="font-bold text-midnight-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="btn-primary">
            New product
          </Link>
          <Link href="/admin/products" className="btn-secondary">
            Manage products
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent: "blaze" | "volt" | "midnight";
}) {
  const stripe = {
    blaze: "from-blaze-400 to-blaze-600",
    volt: "from-volt-300 to-volt-600",
    midnight: "from-midnight-400 to-midnight-700",
  }[accent];

  return (
    <div className="card p-5 relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stripe}`}
      />
      <div className="text-xs uppercase tracking-wider font-bold text-steel-500">
        {label}
      </div>
      <div className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-steel-500">{hint}</div> : null}
    </div>
  );
}
