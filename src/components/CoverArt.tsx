import type { CategorySlug } from "@/lib/categories";

/**
 * Məqalənin üz qabığı.
 *
 * Şəkil varsa onu göstərir. Yoxdursa — bölmənin rənginə uyğun, gül naxışlı
 * naxışlı örtük çəkir. Beləliklə şəkli hələ yüklənməmiş məqalə də səliqəli görünür.
 */

const WASH: Record<CategorySlug, [string, string]> = {
  gundem: ["#f0e8e6", "#ddd0cb"],
  moda: ["#f1e8ea", "#e0cfd4"],
  gozellik: ["#f4ede4", "#e6d8c4"],
  "heyat-terzi": ["#e9eee7", "#d5ddd0"],
  astrologiya: ["#e9ebef", "#d8dce4"],
  biznes: ["#ebeae4", "#d9d7cc"],
};

const PETAL =
  "M0 0 C -9 -5 -17 -14 -15 -23 C -13.5 -30.5 -5.5 -33 0 -27.5 C 5.5 -33 13.5 -30.5 15 -23 C 17 -14 9 -5 0 0 Z";

/** Slug-dan sabit bir rəqəm — eyni məqalə həmişə eyni naxışı alsın deyə. */
function hash(seed: string): number {
  let value = 0;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value * 31 + seed.charCodeAt(i)) % 100000;
  }
  return value;
}

export default function CoverArt({
  src,
  alt,
  category,
  seed,
  className = "",
  priority = false,
  sizes = "100vw",
}: {
  src?: string;
  alt: string;
  category: CategorySlug;
  seed: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      // Şəkillər Firebase Storage və ya xarici mənbədən gəlir; ölçü CSS ilə idarə olunur.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
      />
    );
  }

  const [from, to] = WASH[category];
  const n = hash(seed);
  const rotation = n % 40 - 20;
  const offsetX = 62 + (n % 17);
  const offsetY = 30 + (n % 23);
  const gradientId = `wash-${category}-${n}`;

  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={alt}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      <rect width="800" height="1000" fill={`url(#${gradientId})`} />

      {/* Böyük gül su nişanı */}
      <g
        transform={`translate(${offsetX * 8} ${offsetY * 10}) rotate(${rotation}) scale(7.6)`}
        fill="none"
        stroke="#7b2233"
        strokeOpacity="0.16"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <path key={angle} d={PETAL} transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="3.4" />
      </g>

      {/* Kiçik ikinci gül */}
      <g
        transform={`translate(${140 + (n % 60)} ${760 - (n % 90)}) rotate(${-rotation}) scale(2.5)`}
        fill="none"
        stroke="#c9a227"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <path key={angle} d={PETAL} transform={`rotate(${angle})`} />
        ))}
      </g>

      {/* İncə qızılı çərçivə */}
      <rect
        x="26"
        y="26"
        width="748"
        height="948"
        fill="none"
        stroke="#c9a227"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <rect
        x="34"
        y="34"
        width="732"
        height="932"
        fill="none"
        stroke="#c9a227"
        strokeOpacity="0.25"
        strokeWidth="0.6"
      />
    </svg>
  );
}
