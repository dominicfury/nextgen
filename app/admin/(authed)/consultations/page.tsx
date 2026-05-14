import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { consultationRequests } from "@/lib/db/schema";
import { StatusMenu } from "./_components/status-menu";
import { DeleteButton } from "./_components/delete-button";

export const metadata = { title: "Consultations" };
export const dynamic = "force-dynamic";

function fmt(d: Date | number): string {
  const date = d instanceof Date ? d : new Date(d * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminConsultationsPage() {
  const rows = await db
    .select()
    .from(consultationRequests)
    .orderBy(desc(consultationRequests.createdAt));

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div className="p-5 sm:p-8 max-w-6xl">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
            Consultations
          </h1>
          <p className="mt-2 text-steel-600 text-sm">
            {rows.length === 0
              ? "No requests yet."
              : `${rows.length} request${rows.length === 1 ? "" : "s"} · ${newCount} unread`}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <h2 className="text-lg font-bold text-midnight-900">
            Inbox is empty
          </h2>
          <p className="mt-1 text-steel-600 text-sm">
            New consultation requests will land here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const vehicle = [r.vehicleYear, r.vehicleMake, r.vehicleModel, r.engine]
              .filter(Boolean)
              .join(" ");
            return (
              <article key={r.id} className="card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="font-bold text-midnight-900 text-lg">
                        {r.name}
                      </h2>
                      {r.status === "new" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blaze-50 text-blaze-700 border border-blaze-200 text-xs font-bold">
                          <span className="size-1.5 rounded-full bg-blaze-500" />
                          New
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-steel-600 flex flex-wrap gap-x-3 gap-y-0.5">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-blaze-600 font-medium hover:underline"
                      >
                        {r.email}
                      </a>
                      {r.phone ? (
                        <a
                          href={`tel:${r.phone}`}
                          className="text-blaze-600 font-medium hover:underline"
                        >
                          {r.phone}
                        </a>
                      ) : null}
                      <span className="text-steel-500">{fmt(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusMenu id={r.id} current={r.status} />
                    <DeleteButton id={r.id} name={r.name} />
                  </div>
                </div>

                {vehicle ? (
                  <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-paper-100 border border-steel-200 text-xs font-semibold text-midnight-800">
                    <svg
                      className="size-3.5 text-steel-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                      <circle cx="6.5" cy="16.5" r="2.5" />
                      <circle cx="16.5" cy="16.5" r="2.5" />
                    </svg>
                    {vehicle}
                  </div>
                ) : null}

                <p className="mt-4 text-steel-700 leading-relaxed whitespace-pre-line">
                  {r.message}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
