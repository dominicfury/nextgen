import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { productFiles, products } from "@/lib/db/schema";

// Records the product_files row AFTER the browser successfully uploaded
// to R2 via the presigned PUT. The version is set to (max existing + 1)
// so admins can keep historical revisions without overwriting.

export async function POST(req: Request) {
  let body: {
    productId?: number;
    storageKey?: string;
    originalFilename?: string;
    fileSize?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const productId = Number(body.productId);
  const storageKey = String(body.storageKey ?? "").trim();
  const originalFilename = String(body.originalFilename ?? "").trim();
  const fileSize = Number(body.fileSize ?? 0);

  if (!Number.isFinite(productId) || productId <= 0)
    return NextResponse.json({ error: "productId required." }, { status: 400 });
  if (!storageKey)
    return NextResponse.json({ error: "storageKey required." }, { status: 400 });
  if (!originalFilename)
    return NextResponse.json(
      { error: "originalFilename required." },
      { status: 400 },
    );
  if (!Number.isFinite(fileSize) || fileSize <= 0)
    return NextResponse.json({ error: "fileSize required." }, { status: 400 });

  const [productRow] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!productRow)
    return NextResponse.json({ error: "Product not found." }, { status: 404 });

  // version = max(existing) + 1
  const [latest] = await db
    .select({ version: productFiles.version })
    .from(productFiles)
    .where(eq(productFiles.productId, productId))
    .orderBy(desc(productFiles.version))
    .limit(1);
  const nextVersion = (latest?.version ?? 0) + 1;

  const [inserted] = await db
    .insert(productFiles)
    .values({
      productId,
      storageKey,
      originalFilename,
      fileSize,
      version: nextVersion,
    })
    .returning();

  revalidatePath(`/admin/products/${productId}/edit`);

  return NextResponse.json({ file: inserted });
}
