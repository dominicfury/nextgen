import Link from "next/link";
import { redirect } from "next/navigation";
import { consumeLoginToken } from "@/lib/auth";

export const metadata = { title: "Signing in…" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    const admin = await consumeLoginToken(token);
    if (admin) redirect("/admin");
  }

  return (
    <main className="min-h-dvh grid place-items-center px-5 py-10">
      <div className="card p-6 sm:p-8 max-w-md w-full text-center">
        <h1 className="font-display text-2xl font-black tracking-tight text-midnight-900">
          Link expired
        </h1>
        <p className="mt-2 text-sm text-steel-600">
          That sign-in link is invalid or has already been used. Request a new
          one to sign in.
        </p>
        <div className="mt-5">
          <Link href="/admin/login" className="btn-primary">
            Request a new link
          </Link>
        </div>
      </div>
    </main>
  );
}
