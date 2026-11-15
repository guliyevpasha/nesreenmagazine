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
      az: "Azərbaycanda, Türkiyədə və dünyada qadınların gündəmində olan hadisələr, festivallar və ulduz xəbərləri.",
      en: "The news, festivals and celebrity stories women are talking about — in Azerbaijan, Türkiye and around the world.",
      ru: "Новости, фестивали и светская хроника, о которых говорят женщины, — в Азербайджане, Турции и во всём мире.",
      tr: "Azerbaycan'da, Türkiye'de ve dünyada kadınların konuştuğu haberler, festivaller ve magazin gelişmeleri.",
      ar: "الأخبار والمهرجانات وأخبار المشاهير التي تشغل المرأة — في أذربيجان وتركيا وحول العالم.",
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
      az: "Mövsümün trendləri, yeni kolleksiyalar və gündəlik həyatda asanlıqla tətbiq edə biləcəyiniz üslub tövsiyələri.",
      en: "Seasonal trends, new collections and style advice that is easy to wear every day.",
      ru: "Тренды сезона, новые коллекции и советы по стилю, которые легко применить в повседневной жизни.",
      tr: "Sezonun trendleri, yeni koleksiyonlar ve günlük hayatta kolayca uygulayabileceğiniz stil önerileri.",
      ar: "صيحات الموسم وأحدث المجموعات ونصائح أناقة يسهل تطبيقها في الحياة اليومية.",
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
      az: "Dəri və saç baxımı, makiyaj və ətirlər haqqında etibarlı məsləhətlər və həqiqətən işə yarayan vasitələr.",
      en: "Trusted advice on skincare, hair, make-up and fragrance — and the products that really work.",
      ru: "Проверенные советы по уходу за кожей и волосами, макияжу и ароматам — и средства, которые действительно работают.",
      tr: "Cilt ve saç bakımı, makyaj ve parfüm üzerine güvenilir öneriler ve gerçekten işe yarayan ürünler.",
      ar: "نصائح موثوقة للعناية بالبشرة والشعر والمكياج والعطور، ومنتجات أثبتت فعاليتها.",
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
      az: "Səyahət, ev, mətbəx və sağlam vərdişlər — gündəlik həyatınızı daha rahat və gözəl edən ideyalar.",
      en: "Travel, home, food and healthy habits — ideas that make everyday life easier and more beautiful.",
      ru: "Путешествия, дом, кухня и полезные привычки — идеи, которые делают каждый день удобнее и красивее.",
      tr: "Seyahat, ev, mutfak ve sağlıklı alışkanlıklar — günlük hayatı daha kolay ve güzel kılan fikirler.",
      ar: "السفر والمنزل والمطبخ والعادات الصحية — أفكار تجعل حياتك اليومية أسهل وأجمل.",
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
      az: "Günlük, həftəlik və aylıq bürc proqnozları, tarot, yüksələn bürc və bürclərin bir-birinə uyğunluğu.",
      en: "Daily, weekly and monthly horoscopes, tarot, rising signs and how the signs get along.",
      ru: "Гороскопы на день, неделю и месяц, таро, асцендент и совместимость знаков.",
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
      az: "Öz işini quran qadınların hekayələri, karyera məsləhətləri, maliyyə savadı və liderlik.",
      en: "Stories of women who built their own business, career advice, money know-how and leadership.",
      ru: "Истории женщин, создавших своё дело, советы по карьере, финансовая грамотность и лидерство.",
      tr: "Kendi işini kuran kadınların hikâyeleri, kariyer önerileri, finansal okuryazarlık ve liderlik.",
      ar: "قصص نساء أسّسن أعمالهن الخاصة، ونصائح مهنية، وثقافة مالية، وقيادة.",
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
