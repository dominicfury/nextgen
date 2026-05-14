import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      {/* Top bar — logo scales down on phones so nav fits */}
      <header className="px-5 sm:px-8 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="NextGen Diesel Tuning"
            width={180}
            height={180}
            priority
            className="size-24 sm:size-40 lg:size-44 w-auto"
          />
        </div>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-sm">
          <NavButton href="/store">Store</NavButton>
          <NavButton href="/consultation">Consult</NavButton>
          <NavButton href="/downloads">
            <span className="sm:hidden">Downloads</span>
            <span className="hidden sm:inline">My downloads</span>
          </NavButton>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-5 sm:px-8 pt-8 pb-20 sm:pt-20 sm:pb-32 max-w-5xl mx-auto">
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
          <Link href="/consultation" className="btn-secondary text-base">
            Book a consultation
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

        {/* Consultation pitch */}
        <section className="mt-16 sm:mt-24 relative overflow-hidden rounded-2xl bg-midnight-900 text-white p-8 sm:p-12">
          <div
            className="absolute -top-24 -right-24 size-72 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,106,26,0.55) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <div
            className="absolute -bottom-24 -left-24 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(6,194,255,0.55) 0%, transparent 70%)",
            }}
            aria-hidden
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold mb-5">
                <span className="size-1.5 rounded-full bg-blaze-400" />
                1-on-1 with the shop
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
                Need a custom build dialed in?
              </h2>
              <p className="mt-4 text-steel-200 text-base sm:text-lg max-w-2xl">
                Don't see your setup in the catalog? Got problem codes nobody
                can crack? Book a sit-down with our team for custom tuning,
                diagnostics, or a complete build plan.
              </p>
            </div>
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-lg
                         bg-blaze-500 hover:bg-blaze-400 text-white font-bold tracking-tight
                         transition-all duration-150 active:scale-[0.98] whitespace-nowrap
                         shadow-[var(--shadow-blaze)]"
            >
              Book consultation
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
        </section>
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

function NavButton({
  href,
  children,
}: {
  href: "/store" | "/consultation" | "/downloads";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center whitespace-nowrap min-h-11 px-3 sm:px-4 rounded-lg
                 bg-white text-midnight-800 font-semibold tracking-tight
                 border border-steel-300
                 shadow-[0_1px_0_0_rgba(15,18,36,0.04)]
                 transition-all duration-150
                 hover:border-blaze-400 hover:text-blaze-600
                 active:scale-[0.98]"
    >
      {children}
    </Link>
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
