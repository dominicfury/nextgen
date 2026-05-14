import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { downloadGrants, productFiles } from "@/lib/db/schema";
import { presignGet } from "@/lib/r2";

// Public, token-gated download endpoint.
//
// Flow:
//   1. Resolve grant by opaque token (32+ bytes of randomness — unguessable).
//   2. Reject if expired, exhausted, or unknown — always with a generic 404
//      to avoid token-enumeration leakage.
//   3. Resolve the latest product_files row for the grant's product.
//   4. Atomically increment download_count.
//   5. Mint a fresh short-lived presigned GET URL on R2 (10 min).
//   6. 302 redirect to it.
//
// Phase 6 will add rate-limiting in front of this route.

function notFound() {
  return NextResponse.json(
    { error: "Download link not found, expired, or already used." },
    { status: 404 },
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 32) return notFound();

  const [grant] = await db
    .select()
    .from(downloadGrants)
    .where(eq(downloadGrants.token, token))
    .limit(1);
  if (!grant) return notFound();

  const now = new Date();
  if (grant.expiresAt && grant.expiresAt < now) return notFound();
  if (
    grant.maxDownloads != null &&
    grant.downloadCount >= grant.maxDownloads
  )
    return notFound();

  const [file] = await db
    .select()
    .from(productFiles)
    .where(eq(productFiles.productId, grant.productId))
    .orderBy(desc(productFiles.version))
    .limit(1);

  if (!file) {
    // Order was paid for but no file is uploaded yet — surface a clear
    // message rather than a stealth 404, because admin action will fix it.
    return NextResponse.json(
      {
        error:
          "No file is currently attached to this product. Please contact support.",
      },
      { status: 503 },
    );
  }

  // Increment first, then presign. If the increment fails we never hand out
  // a URL; if the presign fails the user retries and we re-charge a count —
  // acceptable since downloads are normally uncapped.
  await db
    .update(downloadGrants)
    .set({ downloadCount: sql`${downloadGrants.downloadCount} + 1` })
    .where(
      and(
        eq(downloadGrants.id, grant.id),
        // Optimistic concurrency: only bump if still under cap.
        grant.maxDownloads != null
          ? sql`${downloadGrants.downloadCount} < ${grant.maxDownloads}`
          : sql`1=1`,
      ),
    );

  const url = await presignGet({
    key: file.storageKey,
    filename: file.originalFilename,
    expiresInSec: 60 * 10, // 10 min
  });

  return NextResponse.redirect(url, 302);
}
