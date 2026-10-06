import { Inter, Lora, Noto_Naskh_Arabic, Playfair_Display } from "next/font/google";

/**
 * Jurnalın şrift ailəsi.
 *   Playfair Display — başlıqlar (klassik jurnal serifi)
 *   Lora            — məqalə mətni
 *   Inter           — rubrika etiketləri, düymələr, naviqasiya
 *   Noto Naskh      — ərəb dili
 *
 * Bütün şriftlər latın, genişlənmiş latın (ə, ğ, ş, ı, ö, ü) və kiril
 * hərflərini dəstəkləyir — yəni beş dilin hamısı düzgün görünür.
 */

export const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const lora = Lora({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

/** Bütün şrift dəyişənlərini bir sətirdə toplayır. */
export const fontVariables = [
  playfair.variable,
  lora.variable,
  inter.variable,
  notoArabic.variable,
].join(" ");
