import Link from "next/link";
import Image from "next/image";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { ProductCard } from "./_components/product-card";
import { FilterBar } from "./_components/filter-bar";

export const metadata = { title: "Store" };
export const dynamic = "force-dynamic";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; stage?: string }>;
}) {
  const { make, stage } = await searchParams;

  const whereClauses = [eq(products.status, "published" as const)];
  if (make) whereClauses.push(eq(products.vehicleMake, make));
  if (stage) whereClauses.push(eq(products.tuningStage, stage));

  const [rows, distinctMakesRows, distinctStagesRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(...whereClauses))
      .orderBy(asc(products.name)),
    db
      .selectDistinct({ v: products.vehicleMake })
      .from(products)
      .where(eq(products.status, "published" as const)),
    db
      .selectDistinct({ v: products.tuningStage })
      .from(products)
      .where(eq(products.status, "published" as const)),
  ]);

  const makes = distinctMakesRows
    .map((r) => r.v)
    .filter((v): v is string => Boolean(v))
    .sort();
  const stages = distinctStagesRows
    .map((r) => r.v)
    .filter((v): v is string => Boolean(v))
    .sort();

  return (
    <main className="min-h-dvh">
      <header className="px-5 sm:px-8 py-4 flex items-center justify-between border-b border-steel-200/70 bg-white/60 backdrop-blur sticky top-0 z-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="NextGen Diesel"
            width={60}
            height={60}
            priority
          />
        </Link>
        <Link
          href="/downloads"
          className="text-sm text-midnight-700 font-medium hover:text-blaze-600"
        >
          My downloads
        </Link>
      </header>

      <div className="px-5 sm:px-8 py-10 sm:py-14 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-midnight-900">
            Store
          </h1>
          <p className="mt-2 text-steel-600 text-base sm:text-lg">
            Pre-made tuning files. Pick your truck, pick your stage, send it.
          </p>
        </div>

        <div className="mb-8">
          <FilterBar makes={makes} stages={stages} active={{ make, stage }} />
        </div>

        {rows.length === 0 ? (
          <EmptyState filtered={Boolean(make || stage)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {rows.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto size-12 rounded-full bg-paper-100 flex items-center justify-center mb-4">
        <svg
          className="size-6 text-steel-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 21l-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-midnight-900">
        {filtered ? "No files match those filters" : "Catalog is empty"}
      </h2>
      <p className="mt-1 text-steel-600 text-sm">
        {filtered
          ? "Try clearing a filter or two."
          : "Check back soon — files coming up the line."}
      </p>
    </div>
  );
}
