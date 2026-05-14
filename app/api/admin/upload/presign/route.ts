import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { makeStorageKey, presignPut } from "@/lib/r2";

// TODO(Phase 5): gate behind admin session middleware.

const MAX_BYTES = 200 * 1024 * 1024; // 200MB — generous; tune files are small

export async function POST(req: Request) {
  let body: {
    productId?: number;
    filename?: string;
    fileSize?: number;
    contentType?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const productId = Number(body.productId);
  const filename = String(body.filename ?? "").trim();
  const fileSize = Number(body.fileSize ?? 0);
  const contentType = String(body.contentType ?? "application/octet-stream");

  if (!Number.isFinite(productId) || productId <= 0)
    return NextResponse.json({ error: "productId required." }, { status: 400 });
  if (!filename)
    return NextResponse.json({ error: "filename required." }, { status: 400 });
  if (!Number.isFinite(fileSize) || fileSize <= 0)
    return NextResponse.json({ error: "fileSize required." }, { status: 400 });
  if (fileSize > MAX_BYTES)
    return NextResponse.json(
      { error: `Max upload size is ${MAX_BYTES / 1024 / 1024}MB.` },
      { status: 413 },
    );

  // Confirm product exists so we never write to orphan keys.
  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!row)
    return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const storageKey = makeStorageKey(productId, filename);
  const uploadUrl = await presignPut({
    key: storageKey,
    contentType,
    contentLength: fileSize,
  });

  return NextResponse.json({ uploadUrl, storageKey });
}
