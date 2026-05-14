import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { formatPrice } from "@/lib/utils";
import { DeleteButton } from "./_components/delete-button";
import { StatusToggle } from "./_components/status-toggle";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db
    .select()
    .from(products)
    .orderBy(desc(products.updatedAt));

  return (
    <div className="p-5 sm:p-8 max-w-6xl">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
            Products
          </h1>
          <p className="mt-2 text-steel-600 text-sm">
            {rows.length === 0
              ? "No products yet."
              : `${rows.length} product${rows.length === 1 ? "" : "s"} in the catalog.`}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + New
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <h2 className="text-lg font-bold text-midnight-900">
            Add your first product
          </h2>
          <p className="mt-1 text-steel-600 text-sm">
            Create a listing — you can upload its file later (Phase 3).
          </p>
          <div className="mt-5">
            <Link href="/admin/products/new" className="btn-primary">
              New product
            </Link>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile: stacked cards. Desktop: table. */}
          <div className="divide-y divide-steel-200 sm:hidden">
            {rows.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-midnight-900 truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-steel-500 truncate">
                      {p.slug}
                    </div>
                  </div>
                  <StatusToggle id={p.id} status={p.status} />
                </div>
                <div className="mt-2 text-sm text-steel-600 truncate">
                  {[p.vehicleMake, p.vehicleModel, p.engine]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-bold text-midnight-900">
                    {formatPrice(p.priceCents)}
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-sm font-semibold text-blaze-600 hover:text-blaze-700"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={p.id} name={p.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-paper-100 text-steel-600 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-bold">Product</th>
                <th className="px-5 py-3 font-bold">Vehicle</th>
                <th className="px-5 py-3 font-bold">Price</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-200">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-paper-100/60">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-midnight-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-steel-500 mt-0.5">
                      {p.slug}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-steel-700">
                    {[p.vehicleMake, p.vehicleModel, p.engine]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-5 py-4 font-bold text-midnight-900">
                    {formatPrice(p.priceCents)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusToggle id={p.id} status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-4">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-sm font-semibold text-blaze-600 hover:text-blaze-700"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
