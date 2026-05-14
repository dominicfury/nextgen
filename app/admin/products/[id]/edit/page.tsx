import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productFiles, products } from "@/lib/db/schema";
import { ProductForm } from "../../_components/product-form";
import { updateProduct, type ProductFormState } from "../../actions";
import { FileManager } from "./_components/file-manager";

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id)) notFound();

  const [rows, fileRows] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)).limit(1),
    db
      .select()
      .from(productFiles)
      .where(eq(productFiles.productId, id))
      .orderBy(desc(productFiles.version)),
  ]);

  const product = rows[0];
  if (!product) notFound();

  const boundUpdate = async (
    state: ProductFormState,
    fd: FormData,
  ): Promise<ProductFormState> => {
    "use server";
    return updateProduct(id, state, fd);
  };

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-steel-600 hover:text-blaze-600 inline-flex items-center gap-1.5 font-medium"
        >
          ← Back to products
        </Link>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
          Edit product
        </h1>
        <p className="mt-2 text-sm text-steel-500">{product.slug}</p>
      </div>

      <div className="card p-5 sm:p-8">
        <ProductForm
          action={boundUpdate}
          initial={product}
          submitLabel="Save changes"
        />
      </div>

      <div className="mt-8 card p-5 sm:p-8">
        <FileManager productId={id} files={fileRows} />
      </div>
    </div>
  );
}
