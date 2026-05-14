import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productFiles } from "@/lib/db/schema";
import { presignGet } from "@/lib/r2";

// Admin verification path — fetch a presigned GET for any uploaded file
// without needing a download_grant. Phase 5 will gate this behind admin auth.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const [row] = await db
    .select()
    .from(productFiles)
    .where(eq(productFiles.id, id))
    .limit(1);
  if (!row)
    return NextResponse.json({ error: "File not found." }, { status: 404 });

  const url = await presignGet({
    key: row.storageKey,
    filename: row.originalFilename,
    expiresInSec: 60 * 5, // 5 min — admin verification only
  });

  return NextResponse.redirect(url, 302);
}
