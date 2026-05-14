import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { formatPrice, gradientForSlug } from "@/lib/utils";
import { BuyButton } from "./_components/buy-button";

export const dynamic = "force-dynamic";

async function loadProduct(slug: string) {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(eq(products.slug, slug), eq(products.status, "published" as const)),
    )
    .limit(1);
  return rows[0];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description:
      product.description ||
      `Pre-made tuning file for ${[product.vehicleMake, product.vehicleModel, product.engine].filter(Boolean).join(" ")}.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const specs: Array<[string, string]> = [
    ["Make", product.vehicleMake],
    ["Model", product.vehicleModel],
    ["Engine", product.engine],
    ["Stage", product.tuningStage],
    ["Format", product.fileFormat],
  ].filter(([, v]) => Boolean(v)) as Array<[string, string]>;

  return (
    <main className="min-h-dvh">
      <header className="px-5 sm:px-8 py-4 border-b border-steel-200/70 bg-white/60 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
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
          href="/store"
          className="text-sm text-midnight-700 font-medium hover:text-blaze-600 inline-flex items-center gap-1.5"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to store
        </Link>
      </header>

      <article className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Hero strip */}
        <div
          className="relative aspect-[16/7] sm:aspect-[16/5] rounded-2xl overflow-hidden mb-8 sm:mb-10 shadow-[var(--shadow-card)]"
          style={{ background: gradientForSlug(product.slug) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-10">
            {product.tuningStage ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1
                               rounded-full bg-white/95 backdrop-blur text-midnight-900 text-sm font-bold
                               shadow-sm">
                <span className="size-1.5 rounded-full bg-blaze-500" />
                {product.tuningStage}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] text-midnight-900">
              {product.name}
            </h1>
            <p className="mt-3 text-steel-600 text-base sm:text-lg">
              {[product.vehicleMake, product.vehicleModel, product.engine]
                .filter(Boolean)
                .join(" · ") || "Universal"}
            </p>

            {product.description ? (
              <div className="mt-8">
                <p className="text-steel-700 text-base leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            ) : null}

            {specs.length > 0 ? (
              <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wider text-steel-500 font-bold">
                      {label}
                    </dt>
                    <dd className="mt-1 text-midnight-900 font-medium">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <aside className="lg:col-span-1">
            <div className="card p-6 sm:sticky sm:top-24">
              <div className="text-sm text-steel-500 font-medium">Price</div>
              <div className="mt-1 text-4xl sm:text-5xl font-black tracking-tight text-midnight-900">
                {formatPrice(product.priceCents)}
              </div>
              <div className="mt-1 text-xs text-steel-500">
                One-time. Instant download after payment.
              </div>

              <BuyButton productId={product.id} />
              <p className="mt-3 text-xs text-steel-500 text-center">
                Secure payment by Stripe · Card / Apple Pay / Google Pay
              </p>

              <ul className="mt-6 pt-6 border-t border-steel-200 space-y-2.5 text-sm text-midnight-800">
                <Check>Delivered as a downloadable file</Check>
                <Check>Email receipt with permanent download link</Check>
                <Check>Lost the link? We resend by email</Check>
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        className="size-5 text-blaze-500 shrink-0 mt-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
