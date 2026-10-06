export const locales = ["az", "en", "ru", "tr", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "az";

/** Dildən asılı olaraq mətn istiqaməti. */
export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  az: "ltr",
  en: "ltr",
  ru: "ltr",
  tr: "ltr",
  ar: "rtl",
};

/** Dil seçicisində göstərilən adlar (hər dil öz dilində yazılır). */
export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
  tr: "Türkçe",
  ar: "العربية",
};

/** Dil seçicisində qısa kod. */
export const localeShort: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
  tr: "TR",
  ar: "AR",
};

/** <html lang="..."> və hreflang üçün BCP-47 kodları. */
export const localeHtmlLang: Record<Locale, string> = {
  az: "az-AZ",
  en: "en",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar",
};

/** Tarix formatlaması üçün Intl locale kodları. */
export const localeIntl: Record<Locale, string> = {
  az: "az-AZ",
  en: "en-GB",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar-EG",
};

/**
 * Ay adları öz cədvəlimizdən götürülür, Intl-dən yox.
 *
 * Səbəb: brauzerlərin bir hissəsində (məsələn Chrome) Azərbaycan dili üçün
 * ICU məlumatı yoxdur və `Intl.DateTimeFormat("az-AZ")` "2026 M09 5" kimi
 * yararsız nəticə qaytarır. Serverdə (Node) isə düzgün işləyir — bu fərq
 * hidrasiya uyğunsuzluğu yaradır. Öz cədvəlimiz hər iki tərəfdə eyni nəticə verir.
 */
const monthNames: Record<Locale, string[]> = {
  az: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Ərəb dilində rəqəmləri şərq ərəb rəqəmləri ilə yazır. */
export function localizeDigits(value: number, locale: Locale): string {
  const text = String(value);
  if (locale !== "ar") return text;
  return text.replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

/** "5 sentyabr" — ilsiz gün və ay. */
export function formatDayMonth(month: number, day: number, locale: Locale): string {
  const name = monthNames[locale][month - 1] ?? "";
  return `${localizeDigits(day, locale)} ${name}`;
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Accept-Language başlığından ən uyğun dili seçir.
 * Uyğun dil tapılmazsa, standart dil (az) qaytarılır.
 */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}

/**
 * "5 sentyabr 2026" formatında tarix.
 *
 * ISO sətri (2026-09-05) birbaşa parçalanır — `new Date()` ilə oxunsa,
 * UTC-dən geri qalan saat qurşaqlarında bir gün əvvəli göstərə bilər.
 */
export function formatDate(iso: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);

  let year: number;
  let month: number;
  let day: number;

  if (match) {
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  } else {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  return `${formatDayMonth(month, day, locale)} ${localizeDigits(year, locale)}`;
}
