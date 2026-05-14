import Link from "next/link";
import Image from "next/image";

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

      <div className="px-5 sm:px-8 py-16 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-midnight-900">
          Resend my downloads
        </h1>
        <p className="mt-3 text-steel-600">
          Enter your email and we'll send fresh download links for every order
          you've placed. Coming online in Phase 6.
        </p>

        <div className="mt-8 card p-6">
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              disabled
              placeholder="you@example.com"
              className="flex-1 bg-paper-100 border border-steel-200 rounded-lg px-3.5 py-2.5 min-h-12 text-midnight-900 placeholder:text-steel-400"
            />
            <button disabled type="button" className="btn-primary disabled:opacity-60">
              Send links
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
