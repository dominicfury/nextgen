import Link from "next/link";
import { ProductForm } from "../_components/product-form";
import { createProduct } from "../actions";

export const metadata = { title: "New product" };

export default function NewProductPage() {
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
          New product
        </h1>
      </div>
      <div className="card p-5 sm:p-8">
        <ProductForm action={createProduct} submitLabel="Create product" />
      </div>
    </div>
  );
}
