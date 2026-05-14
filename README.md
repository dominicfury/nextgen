# NextGen Diesel — digital storefront

Sells pre-made diesel tuning files. Customers browse, pay via Stripe, and download. No customer accounts. Admins manage listings through a gated dashboard at `/admin`.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind v4 · Drizzle ORM · Turso (libSQL) · Stripe Checkout · Cloudflare R2 · Resend.

This README covers local setup. The build is shipped in phases — see `Phase status` below for what's wired up right now.

---

## Phase status

| Phase | What it adds                                                    | Status   |
| ----- | --------------------------------------------------------------- | -------- |
| 1     | Foundation: Next.js, Tailwind, full Drizzle schema, design tokens, deploy skeleton | **shipped** |
| 2     | Catalog: storefront browse + product detail + admin product CRUD | **shipped** |
| 3     | Files: private R2 bucket, admin upload, presigned downloads     | **shipped** |
| 4     | Payments: Stripe Checkout + webhook → `download_grants`         | **shipped** |
| 5     | Admin auth (magic-link via Resend)                              | **shipped** |
| 6     | Polish: search/filter, dashboard stats, receipts, rate limiting | **shipped** |

---

## Local setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database (Turso)

You have two options for local development:

**Option A — local SQLite file (zero setup, recommended for dev):**

```env
# .env.local
TURSO_DATABASE_URL=file:./local.db
# TURSO_AUTH_TOKEN= (leave blank)
```

**Option B — a real Turso cloud DB:**

```bash
# Install the Turso CLI (https://docs.turso.tech/quickstart)
turso db create nextgen-diesel
turso db show nextgen-diesel --url        # -> TURSO_DATABASE_URL
turso db tokens create nextgen-diesel     # -> TURSO_AUTH_TOKEN
```

### 3. Create `.env.local`

```bash
cp .env.example .env.local
# Then fill in TURSO_DATABASE_URL and AUTH_SECRET at minimum.
# For AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Generate + apply migrations

```bash
pnpm db:generate     # writes SQL into drizzle/migrations/
pnpm db:migrate      # applies them to the database
```

### 5. (When Phase 5 lands) Seed the first admin

```bash
ADMIN_SEED_EMAIL=you@example.com pnpm seed:admin
# or:
pnpm seed:admin you@example.com
```

### 6. Run the app

```bash
pnpm dev
# → http://localhost:3000
```

---

## Production setup checklist

You'll fill these in as the relevant phases ship — included here so you can collect credentials in parallel.

### Turso
Create a production database and grab the URL + token. Run `pnpm db:migrate` against it once.

### Stripe (Phase 4)
1. Get your secret + publishable keys from <https://dashboard.stripe.com>.
2. Add a webhook endpoint pointed at `https://<your-domain>/api/stripe/webhook`, subscribed to `checkout.session.completed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. For local dev, use the CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### Cloudflare R2 (Phase 3)

1. **Create the bucket.** Cloudflare dashboard → R2 → *Create bucket*. Name it (e.g. `nextgen-diesel-files`). Leave it **private** — no public access.
2. **Create an API token** scoped to that bucket. R2 → *Manage R2 API Tokens* → *Create API token*. Permissions: *Object Read & Write*, scoped to your bucket. Save the **Access Key ID** and **Secret Access Key**.
3. **Grab your Account ID.** Visible in the R2 dashboard sidebar or under the *Account home* card on the main Cloudflare dashboard.
4. **Configure CORS on the bucket.** This is what people forget — without it the browser→R2 direct upload will fail in dev and prod. In the R2 bucket settings → *Settings* → *CORS Policy*, paste:

   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://your-domain.vercel.app"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   Replace the second origin with your actual production URL. Add more origins (preview branches, custom domain) as needed.

5. **Fill `.env.local`** (and Vercel env vars):

   ```env
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=nextgen-diesel-files
   # R2_ENDPOINT= (leave blank unless you front the bucket with a custom domain)
   ```

### Resend (Phase 5/6)
1. Verify your sending domain (SPF + DKIM records).
2. Create an API key.
3. Set `RESEND_FROM_EMAIL` to a verified address on that domain.

### Vercel
1. Import this repo.
2. Add every variable from `.env.example` to the project's environment settings.
3. Deploy. Vercel will run `pnpm build` automatically.

---

## Useful scripts

```bash
pnpm dev               # local dev server
pnpm build             # production build
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint via next lint
pnpm db:generate       # generate new migrations from schema changes
pnpm db:migrate        # apply migrations to the DB
pnpm db:studio         # open Drizzle Studio against your DB
pnpm seed:admin <email>  # seed the first admin (Phase 5+)
pnpm seed:products     # populate the catalog with sample tunes (dev only)
```

---

## Project layout

```
app/                 # Next.js App Router pages + API routes
  layout.tsx         # root layout (dark theme, fonts)
  page.tsx           # storefront landing
  globals.css        # Tailwind v4 + design tokens (@theme block)
  store/             # public catalog (Phase 2)
  downloads/         # "resend my downloads" (Phase 6)
  admin/             # gated dashboard (Phase 2 onward)
  api/               # route handlers (checkout, webhook, download, …)

lib/
  db/
    index.ts         # Drizzle client (libSQL/Turso)
    schema.ts        # all tables — products, orders, grants, admins, …

scripts/
  migrate.ts         # apply Drizzle migrations
  seed-admin.ts      # seed the first admin email

drizzle/
  migrations/        # generated SQL (created by `db:generate`)

public/
  logo.png           # brand mark
```

---

## Security notes (worth re-reading before going live)

- Stripe webhook signature is **always** verified before fulfillment.
- R2 bucket is **fully private** — every download is a freshly minted presigned URL with ~10 min TTL.
- Download tokens are 32+ bytes of crypto-random data; the URL is unguessable.
- `/api/download/:token` and the resend endpoint are rate-limited (Phase 6).
- Admin routes are protected at the middleware level (Phase 5).
- Secrets only live in `.env.local` / Vercel env vars — never the repo.
