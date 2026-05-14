import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./_components/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="NextGen Diesel"
              width={120}
              height={120}
              priority
            />
          </Link>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-3xl font-black tracking-tight text-midnight-900">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-steel-600">
            Enter your admin email. We'll send you a one-time sign-in link.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
