import { formatDayMonth, type Locale } from "@/lib/i18n/config";

export const zodiacKeys = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type ZodiacKey = (typeof zodiacKeys)[number];
export type ZodiacElement = "fire" | "earth" | "air" | "water";
export type ZodiacQuality = "cardinal" | "fixed" | "mutable";

type PlanetKey =
  | "mars"
  | "venus"
  | "mercury"
  | "moon"
  | "sun"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

type ColorKey =
  | "red"
  | "emerald"
  | "yellow"
  | "silver"
  | "gold"
  | "navy"
  | "pink"
  | "burgundy"
  | "turquoise"
  | "charcoal"
  | "skyblue"
  | "seagreen";

export type ZodiacSign = {
  key: ZodiacKey;
  element: ZodiacElement;
  quality: ZodiacQuality;
  ruler: PlanetKey;
  luckyNumber: number;
  luckyColor: ColorKey;
  /** Bürcün başlanğıc tarixi — ay 1-dən başlayır. */
  start: { month: number; day: number };
  end: { month: number; day: number };
};

export const zodiac: ZodiacSign[] = [
  { key: "aries", element: "fire", quality: "cardinal", ruler: "mars", luckyNumber: 9, luckyColor: "red", start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { key: "taurus", element: "earth", quality: "fixed", ruler: "venus", luckyNumber: 6, luckyColor: "emerald", start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { key: "gemini", element: "air", quality: "mutable", ruler: "mercury", luckyNumber: 5, luckyColor: "yellow", start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { key: "cancer", element: "water", quality: "cardinal", ruler: "moon", luckyNumber: 2, luckyColor: "silver", start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { key: "leo", element: "fire", quality: "fixed", ruler: "sun", luckyNumber: 1, luckyColor: "gold", start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { key: "virgo", element: "earth", quality: "mutable", ruler: "mercury", luckyNumber: 4, luckyColor: "navy", start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { key: "libra", element: "air", quality: "cardinal", ruler: "venus", luckyNumber: 7, luckyColor: "pink", start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { key: "scorpio", element: "water", quality: "fixed", ruler: "pluto", luckyNumber: 8, luckyColor: "burgundy", start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { key: "sagittarius", element: "fire", quality: "mutable", ruler: "jupiter", luckyNumber: 3, luckyColor: "turquoise", start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  { key: "capricorn", element: "earth", quality: "cardinal", ruler: "saturn", luckyNumber: 10, luckyColor: "charcoal", start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { key: "aquarius", element: "air", quality: "fixed", ruler: "uranus", luckyNumber: 11, luckyColor: "skyblue", start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { key: "pisces", element: "water", quality: "mutable", ruler: "neptune", luckyNumber: 12, luckyColor: "seagreen", start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
];

export const zodiacByKey = new Map<ZodiacKey, ZodiacSign>(
  zodiac.map((sign) => [sign.key, sign]),
);

export function isZodiacKey(value: string): value is ZodiacKey {
  return (zodiacKeys as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ */
/*  Adlar — 5 dildə                                                     */
/* ------------------------------------------------------------------ */

export const zodiacNames: Record<Locale, Record<ZodiacKey, string>> = {
  az: {
    aries: "Qoç", taurus: "Buğa", gemini: "Əkizlər", cancer: "Xərçəng",
    leo: "Şir", virgo: "Qız", libra: "Tərəzi", scorpio: "Əqrəb",
    sagittarius: "Oxatan", capricorn: "Oğlaq", aquarius: "Dolça", pisces: "Balıqlar",
  },
  en: {
    aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer",
    leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio",
    sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
  },
  ru: {
    aries: "Овен", taurus: "Телец", gemini: "Близнецы", cancer: "Рак",
    leo: "Лев", virgo: "Дева", libra: "Весы", scorpio: "Скорпион",
    sagittarius: "Стрелец", capricorn: "Козерог", aquarius: "Водолей", pisces: "Рыбы",
  },
  tr: {
    aries: "Koç", taurus: "Boğa", gemini: "İkizler", cancer: "Yengeç",
    leo: "Aslan", virgo: "Başak", libra: "Terazi", scorpio: "Akrep",
    sagittarius: "Yay", capricorn: "Oğlak", aquarius: "Kova", pisces: "Balık",
  },
  ar: {
    aries: "الحمل", taurus: "الثور", gemini: "الجوزاء", cancer: "السرطان",
    leo: "الأسد", virgo: "العذراء", libra: "الميزان", scorpio: "العقرب",
    sagittarius: "القوس", capricorn: "الجدي", aquarius: "الدلو", pisces: "الحوت",
  },
};

const planetNames: Record<Locale, Record<PlanetKey, string>> = {
  az: {
    mars: "Mars", venus: "Venera", mercury: "Merkuri", moon: "Ay", sun: "Günəş",
    jupiter: "Yupiter", saturn: "Saturn", uranus: "Uran", neptune: "Neptun", pluto: "Pluton",
  },
  en: {
    mars: "Mars", venus: "Venus", mercury: "Mercury", moon: "Moon", sun: "Sun",
    jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
  },
  ru: {
    mars: "Марс", venus: "Венера", mercury: "Меркурий", moon: "Луна", sun: "Солнце",
    jupiter: "Юпитер", saturn: "Сатурн", uranus: "Уран", neptune: "Нептун", pluto: "Плутон",
  },
  tr: {
    mars: "Mars", venus: "Venüs", mercury: "Merkür", moon: "Ay", sun: "Güneş",
    jupiter: "Jüpiter", saturn: "Satürn", uranus: "Uranüs", neptune: "Neptün", pluto: "Plüton",
  },
  ar: {
    mars: "المريخ", venus: "الزهرة", mercury: "عطارد", moon: "القمر", sun: "الشمس",
    jupiter: "المشتري", saturn: "زحل", uranus: "أورانوس", neptune: "نبتون", pluto: "بلوتو",
  },
};

const colorNames: Record<Locale, Record<ColorKey, string>> = {
  az: {
    red: "Alov qırmızısı", emerald: "Zümrüd", yellow: "Sarı", silver: "Gümüşü",
    gold: "Qızılı", navy: "Tünd göy", pink: "Toz çəhrayı", burgundy: "Bordo",
    turquoise: "Firuzəyi", charcoal: "Antrasit", skyblue: "Səma mavisi", seagreen: "Dəniz yaşılı",
  },
  en: {
    red: "Flame red", emerald: "Emerald", yellow: "Yellow", silver: "Silver",
    gold: "Gold", navy: "Navy", pink: "Dusty pink", burgundy: "Burgundy",
    turquoise: "Turquoise", charcoal: "Charcoal", skyblue: "Sky blue", seagreen: "Sea green",
  },
  ru: {
    red: "Алый", emerald: "Изумрудный", yellow: "Жёлтый", silver: "Серебряный",
    gold: "Золотой", navy: "Тёмно-синий", pink: "Пыльно-розовый", burgundy: "Бордовый",
    turquoise: "Бирюзовый", charcoal: "Антрацитовый", skyblue: "Небесно-голубой", seagreen: "Морской зелёный",
  },
  tr: {
    red: "Alev kırmızısı", emerald: "Zümrüt", yellow: "Sarı", silver: "Gümüş",
    gold: "Altın", navy: "Lacivert", pink: "Pudra pembe", burgundy: "Bordo",
    turquoise: "Turkuaz", charcoal: "Antrasit", skyblue: "Gök mavisi", seagreen: "Deniz yeşili",
  },
  ar: {
    red: "أحمر لهبي", emerald: "زمردي", yellow: "أصفر", silver: "فضي",
    gold: "ذهبي", navy: "كحلي", pink: "وردي باهت", burgundy: "عنابي",
    turquoise: "فيروزي", charcoal: "فحمي", skyblue: "أزرق سماوي", seagreen: "أخضر بحري",
  },
};

export function zodiacName(key: ZodiacKey, locale: Locale): string {
  return zodiacNames[locale][key];
}

export function planetName(sign: ZodiacSign, locale: Locale): string {
  return planetNames[locale][sign.ruler];
}

export function luckyColorName(sign: ZodiacSign, locale: Locale): string {
  return colorNames[locale][sign.luckyColor];
}

/** "21 mart – 19 aprel" şəklində tarix aralığı. */
export function zodiacDateRange(sign: ZodiacSign, locale: Locale): string {
  const start = formatDayMonth(sign.start.month, sign.start.day, locale);
  const end = formatDayMonth(sign.end.month, sign.end.day, locale);
  return `${start} – ${end}`;
}

/** Verilmiş tarixin hansı bürcə düşdüyünü tapır. */
export function signForDate(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  for (const sign of zodiac) {
    const { start, end } = sign;
    if (start.month === month && day >= start.day) return sign;
    if (end.month === month && day <= end.day) return sign;
  }
  return zodiac[0];
}
