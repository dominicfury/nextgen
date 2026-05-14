import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      {/* Top bar */}
      <header className="px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="NextGen Diesel Tuning"
            width={90}
            height={90}
            priority
          />
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/store"
            className="px-3 py-2 rounded-md text-midnight-700 font-medium hover:bg-white hover:shadow-sm transition-all"
          >
            Store
          </Link>
          <Link
            href="/downloads"
            className="px-3 py-2 rounded-md text-midnight-700 font-medium hover:bg-white hover:shadow-sm transition-all"
          >
            My downloads
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-5 sm:px-8 pt-8 pb-20 sm:pt-20 sm:pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blaze-50 border border-blaze-200 text-blaze-700 text-xs font-semibold mb-6">
          <span className="size-1.5 rounded-full bg-blaze-500 animate-pulse" />
          Pre-made tunes · instant download
        </div>

        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-[var(--tracking-display)] text-midnight-900">
          Diesel power,
          <br />
          <span className="bg-gradient-to-r from-blaze-500 via-blaze-600 to-blaze-700 bg-clip-text text-transparent">
            ready to flash.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-steel-600 max-w-2xl leading-relaxed">
          Browse pre-made tuning files for your make, model and engine. Buy
          once, download forever. No subscriptions, no waiting.
        </p>

        <div className="mt-10">
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
        </div>

        {/* Value props */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            title="Instant delivery"
            body="Pay with card, get your download link the second the payment clears."
            accent="blaze"
          />
          <FeatureCard
            title="Make · model · stage"
            body="Filter the catalog by your truck and the power level you're chasing."
            accent="volt"
          />
          <FeatureCard
            title="No account needed"
            body="We email your download link. Lose it? Drop your email, we'll resend."
            accent="midnight"
          />
        </div>
      </section>

      <footer className="border-t border-steel-200 mt-10 px-5 sm:px-8 py-8 text-sm text-steel-500 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} NextGen Diesel Tuning</span>
        <span className="text-steel-400">
          Built for trucks. Engineered for power.
        </span>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: "blaze" | "volt" | "midnight";
}) {
  const stripe = {
    blaze: "from-blaze-400 to-blaze-600",
    volt: "from-volt-300 to-volt-600",
    midnight: "from-midnight-400 to-midnight-700",
  }[accent];

  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stripe}`} />
      <h3 className="font-semibold text-midnight-900 text-base">{title}</h3>
      <p className="mt-1.5 text-sm text-steel-600 leading-relaxed">{body}</p>
    </div>
  );
}
