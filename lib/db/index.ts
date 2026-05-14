import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Lazy initialization. Module load must not touch env — otherwise Next's
// build-time page-data collection fails when env vars haven't been provided
// (e.g. on a fresh Vercel deploy before secrets are wired up).

type Schema = typeof schema;
type DB = LibSQLDatabase<Schema>;

let _client: Client | null = null;
let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Add it to .env.local locally, " +
        "or to your Vercel project's environment variables in production " +
        "(see .env.example).",
    );
  }

  _client = createClient({
    url,
    ...(process.env.TURSO_AUTH_TOKEN
      ? { authToken: process.env.TURSO_AUTH_TOKEN }
      : {}),
  });
  _db = drizzle(_client, { schema });
  return _db;
}

// Proxy so callers can `import { db } from "@/lib/db"` and use it normally,
// while the underlying client is only created the first time a method is called.
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
