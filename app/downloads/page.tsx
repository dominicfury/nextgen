import Link from "next/link";
import Image from "next/image";
import { ResendForm } from "./_components/resend-form";

export const metadata = { title: "My downloads" };

export default function DownloadsPage() {
  return (
    <main className="min-h-dvh">
      <header className="px-5 sm:px-8 py-4 border-b border-steel-200/70 bg-white/60 backdrop-blur sticky top-0 z-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="NextGen Diesel"
            width={60}
            height={60}
            priority
          />
        </Link>
      </header>

      <div className="px-5 sm:px-8 py-12 sm:py-16 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-midnight-900">
          Resend my downloads
        </h1>
        <p className="mt-3 text-steel-600 text-base sm:text-lg">
          Enter your email and we'll send fresh download links for every order
          tied to that address.
        </p>

        <div className="mt-8">
          <ResendForm />
        </div>
      </div>
    </main>
  );
}
