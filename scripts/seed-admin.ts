import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { admins } from "../lib/db/schema";

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL ?? process.argv[2])?.toLowerCase();
  if (!email) {
    console.error(
      "Usage: pnpm seed:admin <email>  (or set ADMIN_SEED_EMAIL in .env.local)",
    );
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Not a valid email: ${email}`);
    process.exit(1);
  }

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is required.");

  const client = createClient({
    url,
    ...(process.env.TURSO_AUTH_TOKEN
      ? { authToken: process.env.TURSO_AUTH_TOKEN }
      : {}),
  });
  const db = drizzle(client);

  const existing = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  if (existing.length) {
    console.log(`Admin already exists: ${email} (id=${existing[0].id})`);
  } else {
    const [row] = await db
      .insert(admins)
      .values({ email, role: "owner" })
      .returning();
    console.log(`Seeded admin: ${email} (id=${row.id}, role=owner)`);
  }

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
