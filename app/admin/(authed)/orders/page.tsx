import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { downloadGrants, orders, products } from "@/lib/db/schema";
import { formatPrice } from "@/lib/utils";
import { ResendReceiptButton } from "./_components/resend-receipt-button";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

function fmt(d: Date | number): string {
  const date = d instanceof Date ? d : new Date(d * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  // Fetch grants + product names for each order. Two queries instead of N+1.
  const grantRows =
    rows.length > 0
      ? await db
          .select({
            orderId: downloadGrants.orderId,
            productName: products.name,
            token: downloadGrants.token,
            downloadCount: downloadGrants.downloadCount,
          })
          .from(downloadGrants)
          .innerJoin(products, eq(downloadGrants.productId, products.id))
      : [];

  const grantsByOrder = new Map<number, typeof grantRows>();
  for (const g of grantRows) {
    const list = grantsByOrder.get(g.orderId) ?? [];
    list.push(g);
    grantsByOrder.set(g.orderId, list);
  }

  return (
    <div className="p-5 sm:p-8 max-w-6xl">
      <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
        Orders
      </h1>
      <p className="mt-2 text-steel-600 text-sm">
        {rows.length === 0
          ? "No orders yet."
          : `Showing the ${rows.length} most recent`}
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 card p-10 text-center">
          <h2 className="text-lg font-bold text-midnight-900">No sales yet</h2>
          <p className="mt-1 text-steel-600 text-sm">
            Orders appear here automatically when Stripe sends the
            checkout.session.completed webhook.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((o) => {
            const grants = grantsByOrder.get(o.id) ?? [];
            return (
              <article key={o.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-midnight-900 text-lg">
                        #{o.id}
                      </span>
                      <StatusPill status={o.status} />
                    </div>
                    <div className="mt-1 text-sm text-steel-600 flex flex-wrap gap-x-3 gap-y-0.5">
                      <a
                        href={`mailto:${o.customerEmail}`}
                        className="text-blaze-600 font-medium hover:underline"
                      >
                        {o.customerEmail}
                      </a>
                      <span className="text-steel-500">
                        {fmt(o.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-midnight-900 text-xl">
                      {formatPrice(o.totalCents)}
                    </div>
                    {o.status === "paid" ? (
                      <ResendReceiptButton orderId={o.id} />
                    ) : null}
                  </div>
                </div>

                {grants.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {grants.map((g) => (
                      <li
                        key={g.token}
                        className="px-3 py-2 bg-paper-100 border border-steel-200 rounded-md text-sm flex items-center justify-between gap-3"
                      >
                        <span className="font-medium text-midnight-900 truncate">
                          {g.productName}
                        </span>
                        <span className="text-xs text-steel-500 shrink-0">
                          {g.downloadCount} download
                          {g.downloadCount === 1 ? "" : "s"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "pending" | "paid" | "refunded" | "failed";
}) {
  const map: Record<typeof status, string> = {
    paid: "bg-success/10 text-success border-success/30",
    pending: "bg-steel-100 text-steel-700 border-steel-200",
    refunded: "bg-volt-200/30 text-volt-700 border-volt-300",
    failed: "bg-danger/10 text-danger border-danger/30",
  };
  return (
    <span
      className={
        "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-bold capitalize " +
        map[status]
      }
    >
      {status}
    </span>
  );
}
