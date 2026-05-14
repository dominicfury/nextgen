import Link from "next/link";
import type { Route } from "next";

type Filters = {
  make?: string;
  stage?: string;
};

export function FilterBar({
  makes,
  stages,
  active,
}: {
  makes: string[];
  stages: string[];
  active: Filters;
}) {
  const hasAny = Boolean(active.make || active.stage);

  return (
    <div className="flex flex-col gap-3">
      <FilterRow
        label="Make"
        param="make"
        options={makes}
        active={active.make}
        carry={active}
      />
      <FilterRow
        label="Stage"
        param="stage"
        options={stages}
        active={active.stage}
        carry={active}
      />
      {hasAny ? (
        <div>
          <Link
            href="/store"
            className="inline-flex items-center gap-1.5 text-sm text-steel-600
                       hover:text-blaze-600"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            Clear filters
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function FilterRow({
  label,
  param,
  options,
  active,
  carry,
}: {
  label: string;
  param: "make" | "stage";
  options: string[];
  active?: string;
  carry: Filters;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wider font-bold text-steel-500 w-12">
        {label}
      </span>
      <Pill href={hrefFor(param, undefined, carry)} active={!active}>
        All
      </Pill>
      {options.map((opt) => (
        <Pill
          key={opt}
          href={hrefFor(param, opt, carry)}
          active={active?.toLowerCase() === opt.toLowerCase()}
        >
          {opt}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  href,
  active,
  children,
}: {
  href: Route;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "px-3 py-1.5 rounded-full text-sm font-bold bg-midnight-700 text-white shadow-sm"
          : "px-3 py-1.5 rounded-full text-sm font-medium bg-white text-midnight-700 hover:bg-paper-100 border border-steel-200"
      }
    >
      {children}
    </Link>
  );
}

function hrefFor(
  param: "make" | "stage",
  value: string | undefined,
  carry: Filters,
): Route {
  const next = { ...carry, [param]: value };
  const sp = new URLSearchParams();
  if (next.make) sp.set("make", next.make);
  if (next.stage) sp.set("stage", next.stage);
  const qs = sp.toString();
  return (qs ? `/store?${qs}` : "/store") as Route;
}
