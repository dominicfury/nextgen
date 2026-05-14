export const metadata = { title: "My downloads" };

export default function DownloadsPage() {
  return (
    <main className="px-5 sm:px-8 py-16 max-w-2xl mx-auto">
      <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">
        Resend my downloads
      </h1>
      <p className="mt-3 text-ink-300">
        Email-based resend ships in Phase 6.
      </p>
    </main>
  );
}
