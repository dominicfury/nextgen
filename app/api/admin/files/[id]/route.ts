import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { productFiles } from "@/lib/db/schema";
import { deleteObject } from "@/lib/r2";

export async function DELETE(
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

  // Delete from R2 first; if that fails we keep the DB row so we don't end
  // up with a "deleted" record pointing at a still-paid-for storage object.
  try {
    await deleteObject(row.storageKey);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to delete from storage.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }

  await db.delete(productFiles).where(eq(productFiles.id, id));
  revalidatePath(`/admin/products/${row.productId}/edit`);

  return NextResponse.json({ ok: true });
}
