import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { SignOutButton } from "../_components/sign-out-button";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const NAV: Array<{ href: Route; label: string }> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/consultations", label: "Consultations" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real auth check (middleware only verifies cookie presence). If the
  // cookie points at a deleted/expired session, this catches it.
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-paper-50">
      <aside className="border-b lg:border-b-0 lg:border-r border-steel-200 bg-white lg:flex lg:flex-col">
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
              className="inline-flex items-center px-3 min-h-11 rounded-md text-sm text-midnight-700 font-medium
                         hover:bg-paper-100 hover:text-blaze-600
                         whitespace-nowrap lg:flex lg:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block lg:mt-auto p-4 border-t border-steel-200">
          <div className="text-xs text-steel-500">Signed in as</div>
          <div className="font-semibold text-midnight-900 text-sm truncate">
            {admin.email}
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
