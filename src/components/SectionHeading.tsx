import Link from "next/link";

/**
 * Bölmə başlığı — ortada serif ad, iki tərəfində incə qızılı xətt.
 * Jurnalın bütün səhifələrində eyni ritmi saxlayır.
 */
export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  action,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  action?: { label: string; href: string };
}) {
  if (align === "start") {
    return (
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-3xl sm:text-[2.1rem]">{title}</h2>
          {subtitle && (
            <p className="mt-1.5 font-ui text-[11px] uppercase tracking-[0.18em] text-muted">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="link-underline font-ui text-[11px] uppercase tracking-[0.18em] text-bordo"
          >
            {action.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex max-w-2xl items-center gap-5">
        <span className="rule-gold h-px flex-1" aria-hidden="true" />
        <h2 className="text-3xl sm:text-[2.35rem]">{title}</h2>
        <span className="rule-gold h-px flex-1" aria-hidden="true" />
      </div>
      {subtitle && (
        <p className="mt-3 font-ui text-[11px] uppercase tracking-[0.18em] text-muted">
          {subtitle}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="link-underline mt-4 inline-block font-ui text-[11px] uppercase tracking-[0.18em] text-bordo"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
