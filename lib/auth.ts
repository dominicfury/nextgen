import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  adminLoginTokens,
  adminSessions,
  admins,
  type Admin,
} from "@/lib/db/schema";

// ─── Constants ────────────────────────────────────────────────────────────────

import { SESSION_COOKIE } from "./auth-cookie";
export { SESSION_COOKIE };
const SESSION_TTL_DAYS = 30;
const LOGIN_TOKEN_TTL_MIN = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ─── Magic-link tokens ───────────────────────────────────────────────────────

/**
 * Issue a magic-link token for the given email IF that email is an admin.
 * Returns the unhashed token (caller embeds in a URL); the hash is stored.
 *
 * To avoid leaking which emails are admins to attackers, callers should
 * ALWAYS return the same response whether or not this returns null.
 */
export async function issueLoginToken(
  emailRaw: string,
): Promise<string | null> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return null;

  const [admin] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  if (!admin) return null;

  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MIN * 60 * 1000);

  await db.insert(adminLoginTokens).values({
    email,
    tokenHash,
    expiresAt,
  });

  return token;
}

/**
 * Verify a presented magic-link token. On success, marks the token used,
 * creates a session row, sets the session cookie, and returns the admin.
 */
export async function consumeLoginToken(
  presented: string,
): Promise<Admin | null> {
  if (!presented || presented.length < 32) return null;
  const tokenHash = sha256(presented);

  const [tokenRow] = await db
    .select()
    .from(adminLoginTokens)
    .where(
      and(
        eq(adminLoginTokens.tokenHash, tokenHash),
        gt(adminLoginTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!tokenRow || tokenRow.usedAt != null) return null;

  // Defense-in-depth: constant-time check on the stored hash too.
  if (!safeEqual(tokenRow.tokenHash, tokenHash)) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, tokenRow.email))
    .limit(1);
  if (!admin) return null;

  await db
    .update(adminLoginTokens)
    .set({ usedAt: new Date() })
    .where(eq(adminLoginTokens.id, tokenRow.id));

  await createSession(admin.id);
  return admin;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

async function createSession(adminId: number): Promise<void> {
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(adminSessions).values({
    id: sessionId,
    adminId,
    expiresAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Look up the current admin from the session cookie. Returns null if no
 * cookie, unknown session, or expired session. Use this in Server
 * Components / route handlers anywhere under /admin.
 */
export async function getCurrentAdmin(): Promise<Admin | null> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.id, sessionId),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!session) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.id, session.adminId))
    .limit(1);
  return admin ?? null;
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
  }
  jar.delete(SESSION_COOKIE);
}
