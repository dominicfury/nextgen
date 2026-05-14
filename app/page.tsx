import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      {/* Top bar */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="NextGen Diesel"
            width={36}
            height={36}
            priority
            className="rounded-md"
          />
          <span className="font-semibold tracking-tight text-base sm:text-lg">
            NextGen Diesel
          </span>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/store"
            className="px-3 py-2 rounded-md text-ink-200 hover:text-white hover:bg-ink-700 transition-colors"
          >
            Store
          </Link>
          <Link
            href="/downloads"
            className="px-3 py-2 rounded-md text-ink-200 hover:text-white hover:bg-ink-700 transition-colors"
          >
            My downloads
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-5 sm:px-8 pt-8 pb-20 sm:pt-20 sm:pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt-400/10 border border-volt-400/30 text-volt-300 text-xs font-medium mb-6">
          <span className="size-1.5 rounded-full bg-volt-400 animate-pulse" />
          Pre-made tunes · instant download
        </div>

        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-[var(--tracking-display)]">
          Diesel power,
          <br />
          <span className="bg-gradient-to-r from-volt-300 via-volt-400 to-volt-200 bg-clip-text text-transparent">
            ready to flash.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-200 max-w-2xl leading-relaxed">
          Browse pre-made tuning files for your make, model and engine. Buy
          once, download forever. No subscriptions, no waiting.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link href="/store" className="btn-primary text-base">
            Browse files
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/downloads" className="btn-secondary text-base">
            Resend my downloads
          </Link>
        </div>

        {/* Value props */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            title="Instant delivery"
            body="Pay with card, get your download link the second the payment clears."
          />
          <FeatureCard
            title="Make · model · stage"
            body="Filter the catalog by your truck and the power level you're chasing."
          />
          <FeatureCard
            title="No account needed"
            body="We email your download link. Lose it? Drop your email, we'll resend."
          />
        </div>
      </section>

      <footer className="border-t border-ink-700 mt-10 px-5 sm:px-8 py-8 text-sm text-ink-300 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} NextGen Diesel Tuning</span>
        <span className="text-ink-400">
          Built for trucks. Engineered for power.
        </span>
      </footer>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white text-base">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-200 leading-relaxed">{body}</p>
    </div>
  );
}
