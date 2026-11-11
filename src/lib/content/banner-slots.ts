/**
 * Məqalə mətninə reklam yer tutucuları əlavə edir.
 *
 * Giriş: artıq təmizlənmiş (sanitize) məqalə HTML-inin üst səviyyəli blokları (hər sətir bir blok).
 * «H2 başlıqlar arası» və «H3 başlıqlar arası» yerləşmələri üçün hər başlıqdan ƏVVƏL
 * (ilk başlıqdan başqa — yəni yalnız başlıqların ARASINA) boş `<div data-nm-banner-slot="…">` qoyulur.
 * Banner özü brauzerdə həmin div-in içinə çəkilir (ArticleContentBanners).
 */

/** Bir yerləşmə üçün maksimum yer tutucu sayı (mətn reklamla dolmasın). */
const MAX_SLOTS_PER_LOCATION = 3;

const SLOT_ATTR = "data-nm-banner-slot";

export function withBannerSlots(blocks: string[]): string[] {
  const out: string[] = [];
  const seen = { h2: 0, h3: 0 };
  const placed = { h2: 0, h3: 0 };

  for (const block of blocks) {
    const m = /^\s*<h([23])[\s>]/i.exec(block);
    if (m) {
      const key = m[1] === "2" ? "h2" : "h3";
      seen[key]++;
      // İlk başlıqdan əvvəl yox — yalnız başlıqlar arasında
      if (seen[key] > 1 && placed[key] < MAX_SLOTS_PER_LOCATION) {
        out.push(`<div ${SLOT_ATTR}="article-between-${key}"></div>`);
        placed[key]++;
      }
    }
    out.push(block);
  }
  return out;
}
