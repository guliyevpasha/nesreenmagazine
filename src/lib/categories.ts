import type { Locale } from "@/lib/i18n/config";

export const categorySlugs = [
  "gundem",
  "moda",
  "gozellik",
  "heyat-terzi",
  "astrologiya",
  "biznes",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

/** Naviqasiyadakı açılan menyuda görünən alt bölmə. */
export type Subcategory = {
  /** URL-də görünən ünvan — bütün dillərdə eynidir. */
  slug: string;
  name: Record<Locale, string>;
};

export type Category = {
  slug: CategorySlug;
  /** Naviqasiyada və başlıqlarda görünən ad. */
  name: Record<Locale, string>;
  /** Kateqoriya səhifəsinin başındakı bir cümləlik təsvir. */
  tagline: Record<Locale, string>;
  /** Menyuda bölmənin altında açılan siyahı. */
  subcategories: Subcategory[];
};

export const categories: Category[] = [
  {
    slug: "gundem",
    name: {
      az: "Gündəm",
      en: "Spotlight",
      ru: "Новости",
      tr: "Gündem",
      ar: "الأحداث",
    },
    tagline: {
      az: "Dünyada, Türkiyədə və Azərbaycanda qadın gündəmini müəyyən edən hadisələr, festivallar və maqazin xəbərləri.",
      en: "The events, festivals and society stories shaping the women's agenda in the world, Türkiye and Azerbaijan.",
      ru: "События, фестивали и светские новости, которые формируют женскую повестку в мире, Турции и Азербайджане.",
      tr: "Dünyada, Türkiye'de ve Azerbaycan'da kadın gündemini belirleyen olaylar, festivaller ve magazin haberleri.",
      ar: "الأحداث والمهرجانات وأخبار المجتمع التي تصنع أجندة المرأة في العالم وتركيا وأذربيجان.",
    },
    subcategories: [
      {
        slug: "xeberler",
        name: { az: "Xəbərlər", en: "News", ru: "Новости", tr: "Haberler", ar: "الأخبار" },
      },
      {
        slug: "magazin",
        name: { az: "Maqazin", en: "Society", ru: "Светская жизнь", tr: "Magazin", ar: "أخبار المشاهير" },
      },
      {
        slug: "medeniyyet",
        name: { az: "Mədəniyyət", en: "Culture", ru: "Культура", tr: "Kültür", ar: "الثقافة" },
      },
      {
        slug: "musahibe",
        name: { az: "Müsahibə", en: "Interviews", ru: "Интервью", tr: "Röportajlar", ar: "حوارات" },
      },
    ],
  },
  {
    slug: "moda",
    name: {
      az: "Moda",
      en: "Fashion",
      ru: "Мода",
      tr: "Moda",
      ar: "الموضة",
    },
    tagline: {
      az: "Podiumdan küçəyə: kolleksiyalar, siluetlər, dizaynerlər və mövsümün əsl ruhu.",
      en: "From the runway to the street: collections, silhouettes, designers and the true mood of the season.",
      ru: "От подиума до улицы: коллекции, силуэты, дизайнеры и истинное настроение сезона.",
      tr: "Podyumdan sokağa: koleksiyonlar, siluetler, tasarımcılar ve mevsimin gerçek ruhu.",
      ar: "من المنصة إلى الشارع: المجموعات والقصّات والمصممون وروح الموسم الحقيقية.",
    },
    subcategories: [
      {
        slug: "trendler",
        name: { az: "Trendlər", en: "Trends", ru: "Тренды", tr: "Trendler", ar: "الصيحات" },
      },
      {
        slug: "kuce-modasi",
        name: {
          az: "Küçə modası",
          en: "Street Style",
          ru: "Уличная мода",
          tr: "Sokak Modası",
          ar: "موضة الشارع",
        },
      },
      {
        slug: "podium",
        name: { az: "Podium", en: "Runway", ru: "Подиум", tr: "Podyum", ar: "منصّة العرض" },
      },
      {
        slug: "stil-meslehetleri",
        name: {
          az: "Stil məsləhətləri",
          en: "Style Notes",
          ru: "Советы по стилю",
          tr: "Stil Önerileri",
          ar: "نصائح الأناقة",
        },
      },
      {
        slug: "aksesuarlar",
        name: {
          az: "Aksesuarlar",
          en: "Accessories",
          ru: "Аксессуары",
          tr: "Aksesuar",
          ar: "الإكسسوارات",
        },
      },
      {
        slug: "canta",
        name: { az: "Çanta", en: "Bags", ru: "Сумки", tr: "Çanta", ar: "الحقائب" },
      },
    ],
  },
  {
    slug: "gozellik",
    name: {
      az: "Gözəllik",
      en: "Beauty",
      ru: "Красота",
      tr: "Güzellik",
      ar: "الجمال",
    },
    tagline: {
      az: "Dəri baxımı, makiyaj, ətir və saç — elmə söykənən, tələsməyən gözəllik ritualları.",
      en: "Skincare, make-up, fragrance and hair — unhurried beauty rituals grounded in science.",
      ru: "Уход за кожей, макияж, ароматы и волосы — неторопливые ритуалы красоты, основанные на науке.",
      tr: "Cilt bakımı, makyaj, parfüm ve saç — bilime dayanan, acele etmeyen güzellik ritüelleri.",
      ar: "العناية بالبشرة والمكياج والعطور والشعر — طقوس جمال متأنية قائمة على العلم.",
    },
    subcategories: [
      {
        slug: "deri-baximi",
        name: {
          az: "Dəri baxımı",
          en: "Skincare",
          ru: "Уход за кожей",
          tr: "Cilt Bakımı",
          ar: "العناية بالبشرة",
        },
      },
      {
        slug: "makiyaj",
        name: { az: "Makiyaj", en: "Make-up", ru: "Макияж", tr: "Makyaj", ar: "المكياج" },
      },
      {
        slug: "sac",
        name: { az: "Saç", en: "Hair", ru: "Волосы", tr: "Saç", ar: "الشعر" },
      },
      {
        slug: "etir",
        name: { az: "Ətir", en: "Fragrance", ru: "Ароматы", tr: "Parfüm", ar: "العطور" },
      },
    ],
  },
  {
    slug: "heyat-terzi",
    name: {
      az: "Həyat tərzi",
      en: "Lifestyle",
      ru: "Образ жизни",
      tr: "Yaşam Tarzı",
      ar: "أسلوب الحياة",
    },
    tagline: {
      az: "Texnologiyadan səyahətə, mətbəxdən ev dekorasiyasına — gündəlik həyatı gözəlləşdirən seçimlər.",
      en: "From technology to travel, from the kitchen to the home — the choices that make daily life finer.",
      ru: "От технологий до путешествий, от кухни до интерьера — выбор, который делает повседневность красивее.",
      tr: "Teknolojiden seyahate, mutfaktan ev dekorasyonuna — gündelik hayatı güzelleştiren seçimler.",
      ar: "من التقنية إلى السفر، ومن المطبخ إلى ديكور المنزل — خيارات تجعل الحياة اليومية أجمل.",
    },
    subcategories: [
      {
        slug: "texnologiya",
        name: {
          az: "Texnologiya",
          en: "Technology",
          ru: "Технологии",
          tr: "Teknoloji",
          ar: "التقنية",
        },
      },
      {
        slug: "seyahet",
        name: { az: "Səyahət", en: "Travel", ru: "Путешествия", tr: "Seyahat", ar: "السفر" },
      },
      {
        slug: "yemek",
        name: { az: "Yemək", en: "Food", ru: "Еда", tr: "Yemek", ar: "الطعام" },
      },
      {
        slug: "ev-dekorasiyasi",
        name: {
          az: "Ev dekorasiyası",
          en: "Interiors",
          ru: "Интерьер",
          tr: "Ev Dekorasyonu",
          ar: "ديكور المنزل",
        },
      },
    ],
  },
  {
    slug: "astrologiya",
    name: {
      az: "Astrologiya",
      en: "Astrology",
      ru: "Астрология",
      tr: "Astroloji",
      ar: "الأبراج",
    },
    tagline: {
      az: "Günlük, həftəlik və aylıq bürc şərhləri, tarot, yüksələn bürc və bürc uyğunluğu.",
      en: "Daily, weekly and monthly horoscopes, tarot, rising signs and compatibility.",
      ru: "Ежедневные, еженедельные и месячные гороскопы, таро, асцендент и совместимость знаков.",
      tr: "Günlük, haftalık ve aylık burç yorumları, tarot, yükselen burç ve burç uyumu.",
      ar: "توقعات يومية وأسبوعية وشهرية، والتاروت، والبرج الطالع، والتوافق بين الأبراج.",
    },
    subcategories: [
      {
        slug: "burcler",
        name: {
          az: "Bürc şərhləri",
          en: "Horoscopes",
          ru: "Гороскопы",
          tr: "Burç Yorumları",
          ar: "توقعات الأبراج",
        },
      },
      {
        slug: "tarot",
        name: { az: "Tarot", en: "Tarot", ru: "Таро", tr: "Tarot", ar: "التاروت" },
      },
      {
        slug: "uygunluq",
        name: {
          az: "Bürc uyğunluğu",
          en: "Compatibility",
          ru: "Совместимость",
          tr: "Burç Uyumu",
          ar: "توافق الأبراج",
        },
      },
      {
        slug: "ay-teqvimi",
        name: {
          az: "Ay təqvimi",
          en: "Moon Calendar",
          ru: "Лунный календарь",
          tr: "Ay Takvimi",
          ar: "تقويم القمر",
        },
      },
      {
        slug: "tebii-daslar",
        name: {
          az: "Təbii daşlar",
          en: "Crystals",
          ru: "Натуральные камни",
          tr: "Doğal Taşlar",
          ar: "الأحجار الطبيعية",
        },
      },
      {
        slug: "numerologiya",
        name: {
          az: "Numerologiya",
          en: "Numerology",
          ru: "Нумерология",
          tr: "Numeroloji",
          ar: "علم الأعداد",
        },
      },
      {
        slug: "matrix",
        name: { az: "Matrix", en: "Matrix", ru: "Матрица", tr: "Matrix", ar: "المصفوفة" },
      },
    ],
  },
  {
    slug: "biznes",
    name: {
      az: "Biznes",
      en: "Business",
      ru: "Бизнес",
      tr: "İş Dünyası",
      ar: "الأعمال",
    },
    tagline: {
      az: "Öz işini quran qadınlar, karyera strategiyaları, maliyyə savadı və liderlik.",
      en: "Women building their own companies, career strategy, financial literacy and leadership.",
      ru: "Женщины, строящие собственное дело, карьерные стратегии, финансовая грамотность и лидерство.",
      tr: "Kendi işini kuran kadınlar, kariyer stratejileri, finansal okuryazarlık ve liderlik.",
      ar: "نساء يبنين أعمالهن الخاصة، واستراتيجيات المهنة، والثقافة المالية، والقيادة.",
    },
    subcategories: [
      {
        slug: "karyera",
        name: { az: "Karyera", en: "Career", ru: "Карьера", tr: "Kariyer", ar: "المسيرة المهنية" },
      },
      {
        slug: "sahibkarliq",
        name: {
          az: "Sahibkarlıq",
          en: "Entrepreneurship",
          ru: "Предпринимательство",
          tr: "Girişimcilik",
          ar: "ريادة الأعمال",
        },
      },
      {
        slug: "maliyye",
        name: { az: "Maliyyə", en: "Money", ru: "Финансы", tr: "Finans", ar: "المال" },
      },
      {
        slug: "liderlik",
        name: { az: "Liderlik", en: "Leadership", ru: "Лидерство", tr: "Liderlik", ar: "القيادة" },
      },
      {
        slug: "ilham-veren-qadinlar",
        name: {
          az: "İlham verən qadınlar",
          en: "Women Who Inspire",
          ru: "Вдохновляющие женщины",
          tr: "İlham Veren Kadınlar",
          ar: "نساء ملهمات",
        },
      },
    ],
  },
];

export const categoryBySlug = new Map<CategorySlug, Category>(
  categories.map((category) => [category.slug, category]),
);

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug as CategorySlug);
}

export function isCategorySlug(value: string): value is CategorySlug {
  return (categorySlugs as readonly string[]).includes(value);
}

export function categoryName(slug: string, locale: Locale): string {
  return getCategory(slug)?.name[locale] ?? slug;
}

/** Bölmənin alt bölmələri. Naməlum bölmə üçün boş siyahı. */
export function getSubcategories(slug: string): Subcategory[] {
  return getCategory(slug)?.subcategories ?? [];
}

/** Verilmiş bölmə daxilində alt bölməni tapır. */
export function getSubcategory(
  category: string,
  subcategory: string,
): Subcategory | undefined {
  return getSubcategories(category).find((item) => item.slug === subcategory);
}

export function subcategoryName(category: string, subcategory: string, locale: Locale): string {
  return getSubcategory(category, subcategory)?.name[locale] ?? subcategory;
}
