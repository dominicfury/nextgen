import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── Catalog ──────────────────────────────────────────────────────────────────

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    vehicleMake: text("vehicle_make").notNull().default(""),
    vehicleModel: text("vehicle_model").notNull().default(""),
    engine: text("engine").notNull().default(""),
    tuningStage: text("tuning_stage").notNull().default(""),
    fileFormat: text("file_format").notNull().default(""),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    slugUnique: uniqueIndex("products_slug_unique").on(t.slug),
    statusIdx: index("products_status_idx").on(t.status),
    makeIdx: index("products_make_idx").on(t.vehicleMake),
  }),
);

export const productFiles = sqliteTable(
  "product_files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull().default(""),
    fileSize: integer("file_size").notNull().default(0),
    version: integer("version").notNull().default(1),
    uploadedAt: integer("uploaded_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    productIdx: index("product_files_product_idx").on(t.productId),
  }),
);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerEmail: text("customer_email").notNull(),
    stripeSessionId: text("stripe_session_id").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    totalCents: integer("total_cents").notNull(),
    status: text("status", {
      enum: ["pending", "paid", "refunded", "failed"],
    })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    sessionUnique: uniqueIndex("orders_stripe_session_unique").on(
      t.stripeSessionId,
    ),
    emailIdx: index("orders_email_idx").on(t.customerEmail),
  }),
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    priceAtPurchaseCents: integer("price_at_purchase_cents").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  }),
);

// ─── Download grants ──────────────────────────────────────────────────────────
// One row per (order, product). `token` is the unguessable URL key.

export const downloadGrants = sqliteTable(
  "download_grants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    customerEmail: text("customer_email").notNull(),
    token: text("token").notNull(),
    downloadCount: integer("download_count").notNull().default(0),
    maxDownloads: integer("max_downloads"),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    tokenUnique: uniqueIndex("download_grants_token_unique").on(t.token),
    orderIdx: index("download_grants_order_idx").on(t.orderId),
    emailIdx: index("download_grants_email_idx").on(t.customerEmail),
  }),
);

// ─── Admin auth (magic-link) ──────────────────────────────────────────────────
// `admins` is the allowlist. Only emails present here can log in.
// `admin_login_tokens` holds one-time login link hashes.
// `admin_sessions` holds active sessions (id is the cookie value).

export const admins = sqliteTable(
  "admins",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    role: text("role", { enum: ["owner", "admin"] })
      .notNull()
      .default("admin"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    emailUnique: uniqueIndex("admins_email_unique").on(t.email),
  }),
);

export const adminLoginTokens = sqliteTable(
  "admin_login_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    hashIdx: index("admin_login_tokens_hash_idx").on(t.tokenHash),
    emailIdx: index("admin_login_tokens_email_idx").on(t.email),
  }),
);

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    // `id` is the random session string stored in the HTTP-only cookie.
    id: text("id").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    adminIdx: index("admin_sessions_admin_idx").on(t.adminId),
  }),
);

// ─── Type helpers ─────────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductFile = typeof productFiles.$inferSelect;
export type NewProductFile = typeof productFiles.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type DownloadGrant = typeof downloadGrants.$inferSelect;
export type NewDownloadGrant = typeof downloadGrants.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type AdminLoginToken = typeof adminLoginTokens.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;
