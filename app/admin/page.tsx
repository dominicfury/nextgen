import Link from "next/link";
import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [publishedRows, draftRows] = await Promise.all([
    db
      .select({ n: count() })
      .from(products)
      .where(eq(products.status, "published" as const)),
    db
      .select({ n: count() })
      .from(products)
      .where(eq(products.status, "draft" as const)),
  ]);

  const published = publishedRows[0]?.n ?? 0;
  const drafts = draftRows[0]?.n ?? 0;

  return (
    <div className="p-5 sm:p-8 max-w-5xl">
      <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
        Dashboard
      </h1>
      <p className="mt-2 text-steel-600">
        Catalog at a glance. Revenue + top sellers ship in Phase 6.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Published products" value={published} accent="blaze" />
        <Stat label="Drafts" value={drafts} accent="volt" />
        <Stat label="Orders" value="—" hint="ships Phase 4" accent="midnight" />
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
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stripe}`} />
      <div className="text-xs uppercase tracking-wider font-bold text-steel-500">
        {label}
      </div>
      <div className="mt-2 text-4xl font-black tracking-tight text-midnight-900">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-steel-500">{hint}</div> : null}
    </div>
  );
}
