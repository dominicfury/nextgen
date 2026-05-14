import Link from "next/link";
import type { Product } from "@/lib/db/schema";
import { formatPrice, gradientForSlug } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/store/${product.slug}`}
      className="card group block overflow-hidden transition-all duration-150
                 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5
                 hover:border-blaze-300"
    >
      {/* Visual hero — deterministic gradient + stage badge */}
      <div
        className="relative aspect-[4/3] flex items-end p-4"
        style={{ background: gradientForSlug(product.slug) }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        {product.tuningStage ? (
          <span className="relative z-10 inline-flex items-center gap-1.5
                           px-2.5 py-1 rounded-full
                           bg-white/95 backdrop-blur text-midnight-900 text-xs font-bold
                           shadow-sm">
            <span className="size-1.5 rounded-full bg-blaze-500" />
            {product.tuningStage}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-midnight-900 text-base sm:text-lg leading-tight
                       group-hover:text-blaze-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-steel-600 truncate">
          {[product.vehicleMake, product.vehicleModel, product.engine]
            .filter(Boolean)
            .join(" · ") || "Universal"}
        </p>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-2xl font-black tracking-tight text-midnight-900">
            {formatPrice(product.priceCents)}
          </span>
          <span className="text-sm font-semibold text-blaze-600 inline-flex items-center gap-1">
            Details
            <svg
              className="size-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
