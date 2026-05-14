/**
 * Lower-case, ASCII-only, hyphen-separated slug. Strips diacritics,
 * collapses runs of non-alphanumerics, trims leading/trailing hyphens.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Cents → "$249.00" (USD). */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Tailwind-friendly class merger (no clsx dep — strings + falsy filtered). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Deterministic two-color gradient for product cards / heroes,
 * picked from a hash of the slug. Returns a CSS background value.
 */
export function gradientForSlug(slug: string): string {
  const palette = [
    ["#06c2ff", "#0086c0"], // volt
    ["#7ce5ff", "#00547a"],
    ["#ff8a3d", "#e44d00"], // flame
    ["#22c55e", "#006a99"],
    ["#a855f7", "#0086c0"],
    ["#f43f5e", "#161b24"],
  ];
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const [from, to] = palette[h % palette.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Parse a price string ("249" / "249.00" / "$1,299.99") into integer cents.
 * Throws on garbage input. Used by admin product form.
 */
export function parsePriceToCents(input: string): number {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error(`Invalid price: "${input}"`);
  }
  const [dollars, fraction = ""] = cleaned.split(".");
  const padded = (fraction + "00").slice(0, 2);
  return Number.parseInt(dollars, 10) * 100 + Number.parseInt(padded, 10);
}
