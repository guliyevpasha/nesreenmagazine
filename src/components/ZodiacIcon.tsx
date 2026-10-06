import type { ZodiacElement, ZodiacKey } from "@/lib/zodiac";

/**
 * 12 bürcün klassik astroloji işarəsi — incə xətli, dairə içində.
 * Element dairənin fon çalarını, bürc işarəsi isə bordo xətti müəyyən edir.
 */

const GLYPHS: Record<ZodiacKey, string[]> = {
  aries: [
    "M24 41 V17",
    "M24 19 C24 10.5 19 6 13.5 6 C8.5 6 5.5 10 5.5 15.5",
    "M24 19 C24 10.5 29 6 34.5 6 C39.5 6 42.5 10 42.5 15.5",
  ],
  taurus: [
    "M10 18 C10 7.5 19 5 24 13.5 C29 5 38 7.5 38 18",
    "M24 41 C17.5 41 12.5 36.5 12.5 30 C12.5 23.5 17.5 19 24 19 C30.5 19 35.5 23.5 35.5 30 C35.5 36.5 30.5 41 24 41 Z",
  ],
  gemini: [
    "M14.5 10.5 V37.5",
    "M33.5 10.5 V37.5",
    "M7 9.5 C13 5.5 35 5.5 41 9.5",
    "M7 38.5 C13 42.5 35 42.5 41 38.5",
  ],
  cancer: [
    "M7 21 C7 13.5 16 9 25 12.5",
    "M41 27 C41 34.5 32 39 23 35.5",
    "M11.5 24.5 m -4.5 0 a 4.5 4.5 0 1 0 9 0 a 4.5 4.5 0 1 0 -9 0",
    "M36.5 23.5 m -4.5 0 a 4.5 4.5 0 1 0 9 0 a 4.5 4.5 0 1 0 -9 0",
  ],
  leo: [
    "M17 31 m -7.5 0 a 7.5 7.5 0 1 0 15 0 a 7.5 7.5 0 1 0 -15 0",
    "M24.3 30 C24 20.5 17.5 14.5 23.5 9.5 C29.5 4.5 38.5 9 36.5 17.5 C34.5 26 34.5 32.5 41 37",
  ],
  virgo: [
    "M9 37 V16 C9 10.5 15 10.5 15 16 V37",
    "M15 16 C15 10.5 21 10.5 21 16 V33",
    "M21 16 C21 10.5 27 10.5 27 16 V30",
    "M27 22 C33 19 39 24 35.5 31 C33 36 26 37 21.5 32.5",
    "M29 30 L39 39",
  ],
  libra: [
    "M6.5 38.5 H41.5",
    "M6.5 29.5 H16",
    "M32 29.5 H41.5",
    "M16 29.5 A 8 8 0 0 1 32 29.5",
  ],
  scorpio: [
    "M7 37 V16 C7 10.5 13 10.5 13 16 V37",
    "M13 16 C13 10.5 19 10.5 19 16 V37",
    "M19 16 C19 10.5 25 10.5 25 16 V31.5 L36 41.5",
    "M36 41.5 V33",
    "M36 41.5 H27.5",
  ],
  sagittarius: [
    "M9 39 L37 11",
    "M37 11 H25.5",
    "M37 11 V22.5",
    "M16.5 21.5 L26.5 31.5",
  ],
  capricorn: [
    "M8 12 C10.5 21.5 14.5 28.5 18.5 30.5 C21 31.7 23 29 23 23.5 V13",
    "M23 22 C24 16.5 28.5 14 32 17.5 C37 22.5 34.5 33.5 27 33 C23 32.7 21.5 29 24.5 26.5",
  ],
  aquarius: [
    "M7 21.5 C9.5 16 13 16 15.5 20.5 C18 25 21.5 25 24 20 C26.5 15 30 15 32.5 19.5 C34.5 23 37.5 23.5 41 20",
    "M7 32.5 C9.5 27 13 27 15.5 31.5 C18 36 21.5 36 24 31 C26.5 26 30 26 32.5 30.5 C34.5 34 37.5 34.5 41 31",
  ],
  pisces: [
    "M14.5 7.5 C6.5 15.5 6.5 32.5 14.5 40.5",
    "M33.5 7.5 C41.5 15.5 41.5 32.5 33.5 40.5",
    "M7.5 24 H40.5",
  ],
};

/** Elementə görə dairənin fon çaları — hamısı krem-bordo paletinin içindədir. */
const ELEMENT_TINT: Record<ZodiacElement, string> = {
  fire: "#f6e4e2",
  earth: "#eeeade",
  air: "#f5efe1",
  water: "#e9edee",
};

export default function ZodiacIcon({
  sign,
  element,
  className = "",
  strokeWidth = 1.7,
  withRing = true,
}: {
  sign: ZodiacKey;
  element: ZodiacElement;
  className?: string;
  strokeWidth?: number;
  withRing?: boolean;
}) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <circle cx="48" cy="48" r="46" fill={ELEMENT_TINT[element]} />
      {withRing && (
        <circle
          cx="48"
          cy="48"
          r="41.5"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="0.7"
          opacity="0.55"
        />
      )}
      <g
        transform="translate(24 24)"
        fill="none"
        stroke="var(--color-bordo)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[sign].map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
    </svg>
  );
}
