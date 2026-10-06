import type { CSSProperties } from "react";

/**
 * NESREEN — loqo ailəsi.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 *
 * "Nəsrin" yabanı gül (itburnu gülü) deməkdir: beş ləçəkli, ləçəklərinin ucu
 * çərtikli, sadə və dözümlü bir gül. Bütün variantlar həmin beş ləçəkli gülün
 * incə xətli təsviri üzərində qurulub.
 *
 * Üç variant var — saytda hansının işlədiləcəyini `LOGO_VARIANT` təyin edir:
 *   "rose"     — açılmış yabanı gül + serif yazı (standart)
 *   "monogram" — gül ləçəkləri ilə birləşən "N" möhürü
 *   "wreath"   — yazının iki tərəfində gül budaqları
 */
export type LogoVariant = "rose" | "monogram" | "wreath";

/** Saytda istifadə olunan loqo variantı. Dəyişmək üçün bu sətri redaktə edin. */
export const LOGO_VARIANT: LogoVariant = "rose";

/* ------------------------------------------------------------------ */
/*  Nişanlar (yalnız ikon)                                             */
/* ------------------------------------------------------------------ */

const PETAL =
  "M0 0 C -9 -5 -17 -14 -15 -23 C -13.5 -30.5 -5.5 -33 0 -27.5 C 5.5 -33 13.5 -30.5 15 -23 C 17 -14 9 -5 0 0 Z";

/** Beş ləçəkli açılmış yabanı gül. */
export function RoseMark({
  className,
  strokeWidth = 1.15,
  title,
}: {
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="-40 -40 80 80"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {[0, 72, 144, 216, 288].map((angle) => (
        <path key={angle} d={PETAL} transform={`rotate(${angle})`} />
      ))}
      {/* Erkəkciklər */}
      {[18, 90, 162, 234, 306].map((angle) => (
        <line
          key={angle}
          x1={0}
          y1={0}
          x2={0}
          y2={-8.5}
          transform={`rotate(${angle})`}
          strokeWidth={strokeWidth * 0.72}
        />
      ))}
      {[18, 90, 162, 234, 306].map((angle) => (
        <circle
          key={`d-${angle}`}
          cx={0}
          cy={-9.4}
          r={1.15}
          fill="currentColor"
          stroke="none"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle cx={0} cy={0} r={3.1} strokeWidth={strokeWidth * 0.85} />
    </svg>
  );
}

/** Gül ləçəkləri içində "N" möhürü. */
export function MonogramMark({
  className,
  strokeWidth = 1.15,
  title,
}: {
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="-40 -40 80 80"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={0} cy={0} r={35} strokeWidth={strokeWidth * 0.8} />
      <circle cx={0} cy={0} r={31.5} strokeWidth={strokeWidth * 0.45} />
      {/* Yuxarıda üç ləçək */}
      {[-46, 0, 46].map((angle) => (
        <path
          key={angle}
          d={PETAL}
          transform={`rotate(${angle}) translate(0 -6) scale(0.62)`}
        />
      ))}
      {/* Aşağıda iki yarpaq */}
      {[-150, 150].map((angle) => (
        <path
          key={angle}
          d="M0 0 C 5 -4 11 -3.5 13 1 C 11 5.5 5 6 0 0 Z"
          transform={`rotate(${angle}) translate(0 -22)`}
          strokeWidth={strokeWidth * 0.8}
        />
      ))}
      {/* Serif "N" */}
      <text
        x={0}
        y={9.5}
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "30px",
          letterSpacing: "0.02em",
        }}
      >
        N
      </text>
    </svg>
  );
}

/** Nazik gül budağı — çələng variantında yazının yanlarında dayanır. */
function Sprig({
  className,
  flip = false,
  strokeWidth = 1.05,
}: {
  className?: string;
  flip?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 54 34"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Budaq */}
      <path d="M2 17 C 14 17 26 14 38 11" />
      {/* Yarpaqlar */}
      <path d="M11 16.6 C 13.5 12 18 10.5 21 12.5 C 19 17 14 18.5 11 16.6 Z" />
      <path d="M15 17.4 C 16.5 22 21 24 24.5 22.2 C 23 17.8 18 16 15 17.4 Z" />
      <path d="M25 14.4 C 27.5 10 32 8.8 34.8 11 C 32.6 15.2 27.8 16.2 25 14.4 Z" />
      {/* Ucundakı gül */}
      <g transform="translate(45 9) scale(0.3)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d={PETAL}
            transform={`rotate(${angle})`}
            strokeWidth={strokeWidth * 3.1}
          />
        ))}
        <circle cx={0} cy={0} r={3.4} strokeWidth={strokeWidth * 3.1} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tam loqolar (nişan + yazı)                                         */
/* ------------------------------------------------------------------ */

export type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<
  LogoSize,
  { mark: string; word: string; sub: string; gap: string; subGap: string }
> = {
  sm: { mark: "h-6 w-6", word: "text-lg", sub: "text-[7px]", gap: "gap-2", subGap: "mt-[3px]" },
  md: { mark: "h-8 w-8", word: "text-2xl", sub: "text-[8px]", gap: "gap-2.5", subGap: "mt-[4px]" },
  lg: { mark: "h-11 w-11", word: "text-[2rem]", sub: "text-[9px]", gap: "gap-3", subGap: "mt-[5px]" },
  xl: { mark: "h-16 w-16", word: "text-5xl", sub: "text-[11px]", gap: "gap-4", subGap: "mt-2" },
};

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  /** Yazını gizlədib yalnız nişanı göstərir. */
  markOnly?: boolean;
  /** Nişanın rəngini yazıdan fərqli etmək üçün (məs. qızılı gül + bordo yazı). */
  markClassName?: string;
  className?: string;
  style?: CSSProperties;
};

export default function Logo({
  variant = LOGO_VARIANT,
  size = "md",
  markOnly = false,
  markClassName = "text-gold",
  className = "",
  style,
}: LogoProps) {
  const s = sizeMap[size];

  // lang="en" — Azərbaycan dilində "i" hərfi böyüdüləndə "İ" olur;
  // brend adı isə həmişə NESREEN MAGAZINE kimi yazılmalıdır.
  const wordmark = (
    <span lang="en" className="flex flex-col items-center leading-none">
      <span
        className={`font-display ${s.word} leading-none tracking-[0.16em] ltr:indent-[0.16em] rtl:indent-0`}
      >
        NESREEN
      </span>
      <span
        className={`font-ui ${s.sub} ${s.subGap} font-medium uppercase tracking-[0.42em] text-muted ltr:indent-[0.42em] rtl:indent-0`}
      >
        Magazine
      </span>
    </span>
  );

  if (variant === "monogram") {
    return (
      <span className={`inline-flex items-center ${s.gap} ${className}`} style={style} dir="ltr">
        <MonogramMark className={`${s.mark} shrink-0 ${markClassName}`} title="Nesreen Magazine" />
        {!markOnly && wordmark}
      </span>
    );
  }

  if (variant === "wreath") {
    return (
      <span
        className={`inline-flex items-center justify-center ${s.gap} ${className}`}
        style={style}
        dir="ltr"
      >
        {!markOnly && (
          <Sprig className={`h-5 w-8 shrink-0 opacity-90 ${markClassName}`} />
        )}
        {markOnly ? (
          <RoseMark className={`${s.mark} shrink-0 ${markClassName}`} title="Nesreen Magazine" />
        ) : (
          wordmark
        )}
        {!markOnly && (
          <Sprig className={`h-5 w-8 shrink-0 opacity-90 ${markClassName}`} flip />
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`} style={style} dir="ltr">
      <RoseMark className={`${s.mark} shrink-0 ${markClassName}`} title="Nesreen Magazine" />
      {!markOnly && wordmark}
    </span>
  );
}
