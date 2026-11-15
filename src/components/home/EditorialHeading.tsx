import Link from "next/link";

/**
 * Ana səhifə bölmə başlığı — jurnal üslubunda: qızılı sıra nömrəsi, iri serif ad,
 * kiçik izah və «Hamısına bax» keçidi; altda qızılı vurğulu xətt.
 */
export default function EditorialHeading({
  title,
  eyebrow,
  index,
  action,
  tone = "light",
}: {
  title: string;
  eyebrow?: string;
  /** 1-dən başlayan sıra nömrəsi — «01», «02» kimi göstərilir. */
  index?: number;
  action?: { label: string; href: string };
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex items-start gap-4 sm:gap-6">
          {index !== undefined && (
            <span
              className="font-display text-[3.25rem] leading-[0.8] text-gold/70 sm:text-[4.5rem]"
              aria-hidden="true"
            >
              {String(index).padStart(2, "0")}
            </span>
          )}
          <div>
            <h2
              className={`text-[2.1rem] leading-none sm:text-5xl ${dark ? "text-cream" : "text-ink"}`}
            >
              {title}
            </h2>
            {eyebrow && (
              <p
                className={`mt-3 max-w-xl font-display text-[0.98rem] italic leading-snug ${dark ? "text-cream/70" : "text-ink-soft"}`}
              >
                {eyebrow}
              </p>
            )}
          </div>
        </div>

        {action && (
          <Link
            href={action.href}
            className={`group/link inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.2em] ${
              dark ? "text-gold-soft" : "text-bordo"
            }`}
          >
            <span className="link-underline">{action.label}</span>
            <span
              className="inline-block transition-transform duration-300 group-hover/link:translate-x-1 rtl:-scale-x-100 rtl:group-hover/link:-translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        )}
      </div>

      <div className={`relative mt-6 h-px ${dark ? "bg-cream/15" : "bg-line"}`} aria-hidden="true">
        <span className="absolute start-0 top-0 h-px w-24 bg-gold" />
      </div>
    </div>
  );
}
