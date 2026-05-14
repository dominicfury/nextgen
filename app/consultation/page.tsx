import Link from "next/link";
import Image from "next/image";
import { ConsultationForm } from "./_components/consultation-form";

export const metadata = {
  title: "Book a consultation",
  description:
    "Sit down with our team to dial in your build. Custom tuning, troubleshooting, parts advice.",
};

export default function ConsultationPage() {
  return (
    <main className="min-h-dvh">
      <header className="px-5 sm:px-8 py-4 border-b border-steel-200/70 bg-white/60 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="NextGen Diesel"
            width={60}
            height={60}
            priority
          />
        </Link>
        <Link
          href="/store"
          className="text-sm text-midnight-700 font-medium hover:text-blaze-600"
        >
          Store
        </Link>
      </header>

      <div className="px-5 sm:px-8 py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blaze-50 border border-blaze-200 text-blaze-700 text-xs font-semibold mb-6">
          <span className="size-1.5 rounded-full bg-blaze-500" />
          1-on-1 with the shop
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-midnight-900 leading-[1.05]">
          Book a consultation.
        </h1>
        <p className="mt-4 text-steel-600 text-base sm:text-lg max-w-2xl">
          Custom tunes, troubleshooting, parts advice, or a build plan from
          mild to wild. Tell us about your truck and we'll set up a call.
        </p>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Bullet>Custom tuning for non-catalog setups</Bullet>
          <Bullet>Diagnostic help for stubborn codes</Bullet>
          <Bullet>Build planning before you buy parts</Bullet>
        </ul>

        <div className="mt-10">
          <ConsultationForm />
        </div>
      </div>
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="card p-4 flex items-start gap-2.5">
      <svg
        className="size-5 text-blaze-500 shrink-0 mt-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span className="text-sm text-midnight-800 font-medium">{children}</span>
    </li>
  );
}
