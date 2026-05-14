import Stripe from "stripe";

// Lazy Stripe client — same pattern as lib/db, lib/r2. Module load must not
// require env vars so the build still succeeds when secrets aren't wired up.

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local / Vercel env (see .env.example).",
    );
  }
  _client = new Stripe(key, {
    // Use the account's default API version. Update intentionally if a
    // specific feature needs pinning.
    typescript: true,
  });
  return _client;
}

export function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set — needed for Stripe success/cancel URLs.",
    );
  }
  return url.replace(/\/$/, "");
}
