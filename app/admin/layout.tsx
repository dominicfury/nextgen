import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";

export const metadata = { title: "Admin" };

const NAV: Array<{ href: Route; label: string }> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-paper-50">
      {/* Sidebar */}
      <aside className="border-b lg:border-b-0 lg:border-r border-steel-200 bg-white">
        <div className="px-5 py-4 flex items-center justify-between lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo.png" alt="NextGen" width={48} height={48} />
            <span className="font-bold tracking-tight text-midnight-900 hidden lg:block">
              Admin
            </span>
          </Link>
        </div>
        <nav className="px-3 pb-3 lg:pb-5 flex lg:block gap-1 lg:gap-0 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-md text-sm text-midnight-700 font-medium
                         hover:bg-paper-100 hover:text-blaze-600
                         whitespace-nowrap lg:block"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block mx-3 mt-4 p-3 rounded-lg
                        bg-blaze-50 border border-blaze-200 text-blaze-700 text-xs leading-relaxed">
          <strong className="block font-bold mb-0.5">Heads up</strong>
          Admin auth ships in Phase 5. This area is currently open — protect
          before deploying.
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
