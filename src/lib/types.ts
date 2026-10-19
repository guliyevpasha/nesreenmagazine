import type { CategorySlug } from "@/lib/categories";
import type { Locale } from "@/lib/i18n/config";

// Re-export Locale for convenience
export type { Locale };

/** Beş dildə mətn. Admin paneldə hər dil üçün ayrıca xana var. */
export type LocalizedText = Record<Locale, string>;

/** Beş dildə etiket siyahısı. */
export type LocalizedTags = Record<Locale, string[]>;

export type ArticleStatus = "draft" | "published" | "scheduled";

export type Article = {
  id: string;
  /** URL-də görünən ünvan — bütün dillərdə eynidir. */
  slug: string;
  category: CategorySlug;
  /** Bölmə daxilindəki alt bölmə (menyudakı açılan siyahı). Boş ola bilər. */
  subcategory?: string;
  status: ArticleStatus;
  /** Ana səhifədə böyük "kapak" məqaləsi kimi göstərilir. */
  featured: boolean;
  /** "Çox oxunanlar" siyahısına düşür. */
  trending: boolean;
  /** Üz qabığı şəkli (Firebase Storage və ya xarici URL). Boşdursa naxışlı örtük çəkilir. */
  coverImage: string;
  coverAlt: LocalizedText;
  /** Şəklin müəllifi / mənbəyi. */
  coverCredit: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  /** Markdown formatında əsas mətn. */
  body: LocalizedText;
  tags: LocalizedTags;
  author: string;
  /** ISO tarix — məs. "2026-09-04". */
  publishedAt: string;
  updatedAt?: string;
  /** Oxu müddəti (dəqiqə). 0 olarsa mətnə görə hesablanır. */
  readingMinutes: number;
  /** Planlaşdırılmış dərc tarixi-vaxtı (yalnız status="scheduled" olduqda). ISO string. */
  scheduledAt?: string;
  /** Rich media blocks (video, gallery, embeds). */
  mediaBlocks?: MediaBlock[];
};

/** Firestore-a yazılan, id-siz forma. */
export type ArticleInput = Omit<Article, "id">;

/** E-jurnal — PDF formatında dərc olunan elektron nömrə. */
export type Ejournal = {
  id: string;
  status: ArticleStatus;
  /** Üz qabığı şəkli. Boşdursa naxışlı örtük çəkilir. */
  coverImage: string;
  /** PDF faylın açıq ünvanı (Firebase Storage və ya xarici link). */
  pdfUrl: string;
  /** Nömrənin adı — məs. «Sentyabr 2026». */
  title: LocalizedText;
  /** Nömrədə nə var — bir-iki cümlə. */
  description: LocalizedText;
  /** ISO tarix — məs. "2026-09-01". */
  publishedAt: string;
  /** Səhifə sayı. 0 olarsa göstərilmir. */
  pages: number;
};

export type EjournalInput = Omit<Ejournal, "id">;

export type StaffRole =
  | "admin"
  | "editor"
  | "author"
  | "seo"
  | "sales"
  | "finance"
  | "analyst"
  | "moderator";

export type StaffMember = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  /** Bu şəxsin yaza biləcəyi bölmələr. Boş siyahı = hamısı. */
  categories: CategorySlug[];
  /** Hər kateqoriya üçün seçilmiş alt kateqoriyalar. */
  subcategories?: Partial<Record<CategorySlug, string[]>>;
  active: boolean;
  createdAt: string;
  invitedBy?: string;
};

/** Reklam üçün ayrılmış banner sahələri. */
export type AdSlotId =
  | "home-leaderboard"
  | "home-mid"
  | "category-top"
  | "article-inline"
  | "sidebar";

export type AdBanner = {
  id: string;
  slot: AdSlotId;
  active: boolean;
  /** Reklam şəkli. */
  image: string;
  /** Kliklədikdə açılan ünvan. */
  href: string;
  alt: string;
  advertiser: string;
  startsAt?: string;
  endsAt?: string;
};

/** E-kitab banner - biznes məqalələrində göstərilən reklam */
export type EbookBanner = {
  id: string;
  active: boolean;
  /** Cover şəkli */
  coverImage: string;
  /** Preview slider şəkilləri */
  previewImages: string[];
  /** Affiliate link */
  href: string;
  /** Başlıq */
  title: LocalizedText;
  /** Alt başlıq */
  subtitle: LocalizedText;
  /** Təsvir */
  description: LocalizedText;
  /** Xüsusiyyətlər (4 bullet point) */
  features: Record<Locale, string[]>;
  /** CTA button mətni */
  ctaText: LocalizedText;
  /** Qiymət */
  price: string;
  /** Köhnə qiymət */
  originalPrice: string;
  /** Endirim badge mətni */
  discountText: LocalizedText;
  /** Badge mətni (yuxarıda) */
  badgeText: LocalizedText;
  createdAt: string;
  updatedAt?: string;
};

export type EbookBannerInput = Omit<EbookBanner, "id" | "updatedAt">;

/* ======================================================================
   CRM — Müştəri, Müqavilə, Reklam Sifarişi
   ====================================================================== */

/** CRM-də müştərinin hansı mərhələdə olduğunu göstərir. */
export type DealStage =
  | "new"        // Yeni müraciət
  | "contacted"  // Əlaqə saxlanılıb
  | "proposal"   // Təklif göndərilib
  | "negotiation"// Danışıqlar gedir
  | "won"        // Müqavilə bağlandı
  | "lost";      // Rədd edildi

export type DealStageLabelMap = Record<DealStage, string>;

export const dealStageLabels: DealStageLabelMap = {
  new:         "Yeni müraciət",
  contacted:   "Əlaqə saxlanılıb",
  proposal:    "Təklif göndərilib",
  negotiation: "Danışıqlar",
  won:         "Müqavilə bağlandı",
  lost:        "Rədd edildi",
};

/** Reklam sifarişinin ödəniş statusu. */
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue" | "cancelled";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending:   "Gözlənilir",
  partial:   "Qismən ödənildi",
  paid:      "Ödənilib",
  overdue:   "Gecikdirildi",
  cancelled: "Ləğv edildi",
};

/** Reklam sifarişinin material statusu. */
export type MaterialStatus = "waiting" | "received" | "approved" | "rejected";

export const materialStatusLabels: Record<MaterialStatus, string> = {
  waiting:  "Gözlənilir",
  received: "Alınıb",
  approved: "Təsdiqlənib",
  rejected: "Rədd edildi",
};

/** CRM müştərisi — şirkət və ya fiziki şəxs. */
export type CrmClient = {
  id: string;
  /** Şirkət adı və ya şəxsin adı. */
  name: string;
  /** Əsas əlaqə şəxsi. */
  contactPerson: string;
  email: string;
  phone: string;
  /** Şirkətin fəaliyyət sahəsi. */
  industry: string;
  /** Qeydlər, xüsusi məlumatlar. */
  notes: string;
  /** Müştərinin hazırkı mərhələsi (ən son deal-a əsasən). */
  stage: DealStage;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
};

export type CrmClientInput = Omit<CrmClient, "id">;

/** CRM aktivliyi — zəng, görüş, yazışma, qeyd. */
export type CrmActivityType = "call" | "meeting" | "email" | "note" | "task";

export const crmActivityLabels: Record<CrmActivityType, string> = {
  call:    "Zəng",
  meeting: "Görüş",
  email:   "E-poçt",
  note:    "Qeyd",
  task:    "Tapşırıq",
};

export type CrmActivity = {
  id: string;
  clientId: string;
  type: CrmActivityType;
  title: string;
  body: string;
  /** ISO tarix-vaxt. */
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
};

export type CrmActivityInput = Omit<CrmActivity, "id">;

/** Reklam formatı. */
export type AdFormat =
  | "banner"
  | "sponsored_article"
  | "brand_interview"
  | "social_package"
  | "event_sponsorship"
  | "newsletter"
  | "custom";

export const adFormatLabels: Record<AdFormat, string> = {
  banner:             "Banner reklam",
  sponsored_article:  "Sponsorlu məqalə",
  brand_interview:    "Brend müsahibəsi",
  social_package:     "Sosial media paketi",
  event_sponsorship:  "Tədbir sponsorluğu",
  newsletter:         "Newsletter reklam",
  custom:             "Xüsusi format",
};

/** Reklam sifarişi — bir müştərinin bir kampaniyası. */
export type AdOrder = {
  id: string;
  clientId: string;
  clientName: string;
  /** Kampaniyanın adı. */
  title: string;
  format: AdFormat;
  /** Hansı bölmədə yerləşdiriləcək. */
  placement: string;
  /** Razılaşdırılmış qiymət (AZN). */
  price: number;
  /** Alınan ödəniş məbləği. */
  paidAmount: number;
  paymentStatus: PaymentStatus;
  materialStatus: MaterialStatus;
  /** Kampaniya başlama tarixi. */
  startsAt: string;
  /** Kampaniya bitmə tarixi. */
  endsAt: string;
  /** Reklam materialı URL (şəkil, PDF və s.). */
  materialUrl: string;
  /** Klik sayı (əl ilə daxil edilir və ya inteqrasiyadan). */
  clicks: number;
  /** Göstərilmə sayı. */
  impressions: number;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
};

export type AdOrderInput = Omit<AdOrder, "id">;

/** Kontent planı — redaksiya təqvimindəki tapşırıq. */
export type ContentPlanStatus = "idea" | "assigned" | "writing" | "review" | "ready" | "published";

export const contentPlanStatusLabels: Record<ContentPlanStatus, string> = {
  idea:      "İdea",
  assigned:  "Tapşırılıb",
  writing:   "Yazılır",
  review:    "Yoxlanılır",
  ready:     "Hazırdır",
  published: "Dərc edilib",
};

export type ContentPlanItem = {
  id: string;
  title: string;
  category: string;
  /** Təyin edilmiş müəllif (email). */
  assignedTo: string;
  status: ContentPlanStatus;
  /** Planlaşdırılan dərc tarixi. */
  dueDate: string;
  /** Əlaqəli məqalənin ID-si (dərc olunandan sonra). */
  articleId?: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
};

export type ContentPlanItemInput = Omit<ContentPlanItem, "id">;

/* ======================================================================
   Bildiriş Sistemi
   ====================================================================== */

export type NotificationType =
  | "overdue_payment"
  | "overdue_content"
  | "new_message"
  | "new_subscriber"
  | "article_published"
  | "low_stock"
  | "system";

export const notificationTypeLabels: Record<NotificationType, string> = {
  overdue_payment:   "Gecikmiş ödəniş",
  overdue_content:   "Gecikmiş kontent",
  new_message:       "Yeni mesaj",
  new_subscriber:    "Yeni abunəçi",
  article_published: "Məqalə dərc edildi",
  low_stock:         "Xəbərdarlıq",
  system:            "Sistem",
};

export type NotificationPriority = "low" | "medium" | "high";

export type Notification = {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  forRole?: string[];
  createdAt: string;
};

export type NotificationInput = Omit<Notification, "id">;

/* ======================================================================
   Məqalə Versiya Tarixçəsi
   ====================================================================== */

export type ArticleVersion = {
  id: string;
  articleId: string;
  version: number;
  summary: string;
  snapshot: string;
  createdAt: string;
  createdBy: string;
};

export type ArticleVersionInput = Omit<ArticleVersion, "id">;

/* ======================================================================
   SEO İdarəetməsi
   ====================================================================== */

/** 301/302 yönləndirmə qaydası. */
export type SeoRedirect = {
  id: string;
  /** Köhnə URL yolu — məs. "/kohnə-məqalə". */
  from: string;
  /** Yeni URL yolu. */
  to: string;
  /** 301 daimi, 302 müvəqqəti. */
  type: 301 | 302;
  active: boolean;
  /** Nə üçün əlavə edilib. */
  note: string;
  createdAt: string;
  createdBy: string;
};

export type SeoRedirectInput = Omit<SeoRedirect, "id">;

/** Saytın ümumi SEO parametrləri — tək sənəd. */
export type SeoSettings = {
  /** Saytın əsas başlıq şablonu — məs. "%s · Nesreen Magazine" */
  titleTemplate: string;
  /** Default meta açıqlaması (hər dil üçün). */
  defaultDescription: LocalizedText;
  /** Default OG şəkli URL-i. */
  defaultOgImage: string;
  /** robots.txt məzmunu. */
  robotsTxt: string;
  /** Google Search Console verifikasiya kodu. */
  gscVerification: string;
  /** Google Analytics ölçmə ID-si. */
  gaId: string;
  updatedAt: string;
  updatedBy: string;
};

/* ======================================================================
   Sayt Parametrləri (Vizual İdarəetmə)
   ====================================================================== */

/** Menyu elementi. */
export type MenuItem = {
  id: string;
  label: LocalizedText;
  href: string;
  /** Alt menyu elementləri. */
  children?: MenuItem[];
  /** Yeni tabda aç. */
  external: boolean;
  order: number;
};

/** Footer sütunu. */
export type FooterColumn = {
  id: string;
  title: LocalizedText;
  links: { label: LocalizedText; href: string; external: boolean }[];
};

/** Sosial media keçidləri. */
export type SocialLinks = {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  whatsapp: string;
  telegram: string;
};

/** Pop-up / Elan. */
export type SitePopup = {
  active: boolean;
  title: LocalizedText;
  body: LocalizedText;
  ctaText: LocalizedText;
  ctaHref: string;
  /** Nə vaxt başlayır. */
  startsAt: string;
  /** Nə vaxt bitir. */
  endsAt: string;
};

/** Saytın vizual parametrləri — tək sənəd. */
export type SiteSettings = {
  /** Logo URL (əgər şəkil istifadə olunursa). */
  logoUrl: string;
  /** Favicon URL. */
  faviconUrl: string;
  /** Ana səhifə hero banneri. */
  heroBannerUrl: string;
  heroBannerTitle: LocalizedText;
  heroBannerSubtitle: LocalizedText;
  heroBannerCtaText: LocalizedText;
  heroBannerCtaHref: string;
  /** Əlaqə məlumatları. */
  contactEmail: string;
  contactPhone: string;
  contactAddress: LocalizedText;
  /** Sosial media keçidləri. */
  social: SocialLinks;
  /** Footer sütunları. */
  footerColumns: FooterColumn[];
  /** Footer aşağı mətn — copyright və s. */
  footerNote: LocalizedText;
  /** Pop-up elan. */
  popup: SitePopup;
  updatedAt: string;
  updatedBy: string;
};

/* ======================================================================
   Audit Jurnalı
   ====================================================================== */

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "login"
  | "logout"
  | "settings_change";

export const auditActionLabels: Record<AuditAction, string> = {
  create:          "Yaratdı",
  update:          "Yenilədi",
  delete:          "Sildi",
  publish:         "Dərc etdi",
  unpublish:       "Ləğv etdi",
  login:           "Daxil oldu",
  logout:          "Çıxış etdi",
  settings_change: "Parametr dəyişdi",
};

export type AuditLog = {
  id: string;
  /** Əməliyyatı edən istifadəçinin e-poçtu. */
  userEmail: string;
  userName: string;
  action: AuditAction;
  /** Hansı kolleksiya / resurs — məs. "articles", "banners". */
  resource: string;
  /** Resursun ID-si (varsa). */
  resourceId?: string;
  /** Qısa təsvir — məs. "Yeni məqalə: Bahar moda trендləri". */
  description: string;
  /** Əvvəlki dəyər (JSON string). */
  before?: string;
  /** Yeni dəyər (JSON string). */
  after?: string;
  createdAt: string;
};

export type AuditLogInput = Omit<AuditLog, "id">;

/** Boş dil obyekti yaratmaq üçün köməkçi. */
export function emptyLocalized(): LocalizedText {
  return { az: "", en: "", ru: "", tr: "", ar: "" };
}

export function emptyLocalizedTags(): LocalizedTags {
  return { az: [], en: [], ru: [], tr: [], ar: [] };
}

/**
 * Seçilmiş dildə mətni qaytarır; həmin dil boşdursa Azərbaycan,
 * o da boşdursa ingilis dilinə keçir.
 */
export function pick(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return "";
  return text[locale]?.trim() || text.az?.trim() || text.en?.trim() || "";
}

export function pickTags(tags: LocalizedTags | undefined, locale: Locale): string[] {
  if (!tags) return [];
  const list = tags[locale];
  if (list && list.length > 0) return list;
  return tags.az ?? [];
}

/** Markdown mətninə görə təxmini oxu müddəti (dəqiqə). */
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ======================================================================
   Analytics — Ziyarətçi Statistikası və Performans
   ====================================================================== */

/** Səhifə baxışı — hər ziyarət üçün bir qeyd. */
export type PageView = {
  id: string;
  /** Baxılan səhifənin URL yolu — məs. "/az/məqalələr/yaz-trendləri". */
  path: string;
  /** Məqalə ID-si (əgər məqalə səhifəsidirsə). */
  articleId?: string;
  /** Məqalə başlığı (cache üçün). */
  articleTitle?: string;
  /** Kateqoriya slug. */
  category?: CategorySlug;
  /** Ziyarətçinin istifadə etdiyi dil. */
  locale: Locale;
  /** Session ID — eyni ziyarət zamanı bütün səhifələr üçün eyni. */
  sessionId: string;
  /** Referrer URL (haradan gəlib). */
  referrer: string;
  /** User agent string. */
  userAgent: string;
  /** IP ünvanı (privacy üçün hash-lənmiş ola bilər). */
  ipHash?: string;
  /** Ziyarətçi ölkəsi (GeoIP-dən). */
  country?: string;
  /** Səhifədə qaldığı müddət (saniyə). */
  timeOnPage?: number;
  /** ISO timestamp. */
  viewedAt: string;
};

export type PageViewInput = Omit<PageView, "id">;

/** Məqalə performans məlumatları — aggregate stats. */
export type ArticleAnalytics = {
  articleId: string;
  /** Ümumi baxış sayı. */
  views: number;
  /** Unikal ziyarətçi sayı (sessionId-ə görə). */
  uniqueVisitors: number;
  /** Ortalama səhifədə qalma müddəti (saniyə). */
  avgTimeOnPage: number;
  /** Paylaşım sayı (sosial media). */
  shares: number;
  /** Şərh sayı (əgər comment sistemi varsa). */
  comments: number;
  /** Son 7 gündəki baxış sayı. */
  viewsLast7Days: number;
  /** Son 30 gündəki baxış sayı. */
  viewsLast30Days: number;
  /** Trending score — son günlərdə populyarlıq. */
  trendingScore: number;
  /** Son yeniləmə tarixi. */
  updatedAt: string;
};

/** Session məlumatları — bir ziyarət sessiyası. */
export type SessionData = {
  id: string;
  sessionId: string;
  /** Session başlama vaxtı. */
  startedAt: string;
  /** Session bitmə vaxtı (əgər bitibsə). */
  endedAt?: string;
  /** Session müddəti (saniyə). */
  duration?: number;
  /** Baxılan səhifə sayı. */
  pageViews: number;
  /** İlk baxılan səhifə. */
  landingPage: string;
  /** Son baxılan səhifə. */
  exitPage?: string;
  /** Referrer — haradan gəlib. */
  referrer: string;
  /** Traffic mənbəyi — organic, social, direct, referral. */
  source: "organic" | "social" | "direct" | "referral" | "email" | "ads";
  /** Device type — mobile, tablet, desktop. */
  device: "mobile" | "tablet" | "desktop";
  /** Browser. */
  browser: string;
  /** OS. */
  os: string;
  /** Dil. */
  locale: Locale;
  /** Ölkə. */
  country?: string;
  /** Bounce — yalnız 1 səhifə baxıb çıxıb. */
  bounced: boolean;
};

export type SessionDataInput = Omit<SessionData, "id">;

/** Gündəlik analytics xülasəsi — hər gün üçün aggregate. */
export type DailyAnalytics = {
  id: string;
  /** Tarix — "YYYY-MM-DD" formatında. */
  date: string;
  /** Ümumi səhifə baxışı. */
  pageViews: number;
  /** Unikal ziyarətçi sayı. */
  uniqueVisitors: number;
  /** Yeni session sayı. */
  sessions: number;
  /** Bounce rate (%). */
  bounceRate: number;
  /** Ortalama session müddəti (saniyə). */
  avgSessionDuration: number;
  /** Ortalama səhifə/session. */
  avgPagesPerSession: number;
  /** Ən çox baxılan məqalələr (top 10). */
  topArticles: { articleId: string; title: string; views: number }[];
  /** Traffic mənbələri. */
  trafficSources: Record<string, number>;
  /** Device distribution. */
  deviceDistribution: { mobile: number; tablet: number; desktop: number };
  /** Ən çox oxunan kateqoriyalar. */
  topCategories: Record<CategorySlug, number>;
  createdAt: string;
};

export type DailyAnalyticsInput = Omit<DailyAnalytics, "id">;

/** CRM analitikası — sales funnel. */
export type CrmAnalytics = {
  id: string;
  /** Tarix aralığı başlanğıcı. */
  periodStart: string;
  /** Tarix aralığı sonu. */
  periodEnd: string;
  /** Yeni müştəri sayı. */
  newClients: number;
  /** Hər mərhələdəki müştəri sayı. */
  stageDistribution: Record<DealStage, number>;
  /** Konversiya dərəcələri (mərhələ-mərhələ). */
  conversionRates: {
    newToContacted: number;
    contactedToProposal: number;
    proposalToNegotiation: number;
    negotiationToWon: number;
    overallConversion: number;
  };
  /** Qazanılan müqavilə sayı. */
  dealsWon: number;
  /** İtirilən müqavilə sayı. */
  dealsLost: number;
  /** Win rate (%). */
  winRate: number;
  /** Ortalama deal müddəti (gün). */
  avgDealDuration: number;
  /** Ümumi müqavilə dəyəri. */
  totalValue: number;
  /** Ortalama müqavilə dəyəri. */
  avgDealValue: number;
  createdAt: string;
};

export type CrmAnalyticsInput = Omit<CrmAnalytics, "id">;

/** Gəlir analitikası. */
export type RevenueAnalytics = {
  id: string;
  /** Tarix — "YYYY-MM" formatında (aylıq). */
  period: string;
  /** Ümumi gəlir (AZN). */
  totalRevenue: number;
  /** Ödənilmiş məbləğ. */
  paidAmount: number;
  /** Gözlənilən gəlir (pending + partial). */
  pendingAmount: number;
  /** Borc məbləği. */
  overdueAmount: number;
  /** Aktiv kampaniya sayı. */
  activeCampaigns: number;
  /** Yeni sifariş sayı. */
  newOrders: number;
  /** Tamamlanan sifariş sayı. */
  completedOrders: number;
  /** Format üzrə gəlir bölgüsü. */
  revenueByFormat: Record<AdFormat, number>;
  /** Ən yüksək gəlir gətirən müştərilər (top 5). */
  topClients: { clientId: string; clientName: string; revenue: number }[];
  /** Əvvəlki aya görə artım (%). */
  growthRate: number;
  /** Gələn ay proqnozu. */
  forecast?: number;
  createdAt: string;
};

export type RevenueAnalyticsInput = Omit<RevenueAnalytics, "id">;

/** Analytics ümumi xülasə — dashboard üçün. */
export type AnalyticsSummary = {
  /** Bu gün. */
  today: {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
  };
  /** Bu həftə. */
  thisWeek: {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    topArticle?: { id: string; title: string; views: number };
  };
  /** Bu ay. */
  thisMonth: {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    revenue: number;
    newSubscribers: number;
  };
  /** Real-time — son 5 dəqiqə. */
  realTime: {
    activeUsers: number;
    currentPageViews: { path: string; count: number }[];
  };
};

/* ======================================================================
   Şərh İdarəetməsi (Comments)
   ====================================================================== */

/** Şərhin statusu. */
export type CommentStatus = "pending" | "approved" | "spam" | "deleted";

export const commentStatusLabels: Record<CommentStatus, string> = {
  pending:  "Gözləmədə",
  approved: "Təsdiqlənib",
  spam:     "Spam",
  deleted:  "Silinib",
};

/** İstifadəçi şərhi. */
export type Comment = {
  id: string;
  /** Şərhin aid olduğu məqalə. */
  articleId: string;
  /** Məqalə başlığı (cache). */
  articleTitle: string;
  /** Parent comment ID (əgər cavabdırsa). */
  parentId?: string;
  /** Şərh yazan şəxsin adı. */
  authorName: string;
  /** E-poçt ünvanı. */
  authorEmail: string;
  /** Website (opsional). */
  authorWebsite?: string;
  /** IP ünvanı (hash-lənmiş). */
  ipHash?: string;
  /** Şərh mətni. */
  body: string;
  /** Status — pending, approved, spam. */
  status: CommentStatus;
  /** Moderator cavabı. */
  moderatorReply?: string;
  /** Moderator tərəfindən cavablandırıldı. */
  repliedBy?: string;
  /** Cavablandırma tarixi. */
  repliedAt?: string;
  /** Yaradılma tarixi. */
  createdAt: string;
  /** Təsdiqlənmə tarixi. */
  approvedAt?: string;
  /** Təsdiq edən moderator. */
  approvedBy?: string;
  /** Like sayı (opsional feature). */
  likes: number;
  /** Report sayı (spam report). */
  reports: number;
};

export type CommentInput = Omit<Comment, "id">;

/** Şərh statistikaları. */
export type CommentStats = {
  total: number;
  pending: number;
  approved: number;
  spam: number;
  deleted: number;
  todayCount: number;
  avgPerDay: number;
};

/* ======================================================================
   İstifadəçi İdarəetməsi (Frontend Users)
   ====================================================================== */

/** Frontend istifadəçisinin statusu. */
export type UserStatus = "active" | "suspended" | "deleted";

export const userStatusLabels: Record<UserStatus, string> = {
  active:    "Aktiv",
  suspended: "Dayandırılıb",
  deleted:   "Silinib",
};

/** Frontend istifadəçi (registered user with profile). */
export type FrontendUser = {
  id: string;
  /** Firebase Auth UID. */
  uid: string;
  email: string;
  name: string;
  /** Profil şəkli URL. */
  photoUrl?: string;
  /** Telefon nömrəsi. */
  phone?: string;
  /** Doğum tarixi. */
  birthDate?: string;
  /** Cins. */
  gender?: "male" | "female" | "other";
  /** Ölkə. */
  country?: string;
  /** Şəhər. */
  city?: string;
  /** İstifadəçinin seçdiyi dil. */
  locale: Locale;
  /** Maraq sahələri (kateqoriyalar). */
  interests: CategorySlug[];
  /** Newsletter abunəliyi. */
  subscribedToNewsletter: boolean;
  /** Status. */
  status: UserStatus;
  /** Qeydiyyat tarixi. */
  createdAt: string;
  /** Son giriş tarixi. */
  lastLoginAt?: string;
  /** İstifadəçinin oxuduğu məqalələrin sayı. */
  articlesRead: number;
  /** İstifadəçinin yazdığı şərhlərin sayı. */
  commentsCount: number;
  /** Dayandırılma səbəbi (əgər suspended olarsa). */
  suspendedReason?: string;
  /** Dayandıran moderator. */
  suspendedBy?: string;
  /** Dayandırılma tarixi. */
  suspendedAt?: string;
};

export type FrontendUserInput = Omit<FrontendUser, "id">;

/** İstifadəçi oxuma tarixçəsi. */
export type UserReadingHistory = {
  id: string;
  userId: string;
  articleId: string;
  /** Məqalə başlığı (cache). */
  articleTitle: string;
  /** Məqalə kateqoriyası. */
  category: CategorySlug;
  /** Oxuma tarixi. */
  readAt: string;
  /** Oxuma müddəti (saniyə). */
  timeSpent?: number;
  /** Oxuma tamamlandı (scroll to end). */
  completed: boolean;
};

export type UserReadingHistoryInput = Omit<UserReadingHistory, "id">;

/** İstifadəçi aktivliyi. */
export type UserActivity = {
  id: string;
  userId: string;
  /** Aktivlik tipi. */
  type: "login" | "logout" | "article_read" | "comment_posted" | "profile_updated" | "password_changed";
  /** Təsvir. */
  description: string;
  /** IP ünvanı (hash). */
  ipHash?: string;
  /** User agent. */
  userAgent?: string;
  /** Əlaqəli resurs (məqalə ID və s.). */
  resourceId?: string;
  /** Tarix. */
  createdAt: string;
};

export type UserActivityInput = Omit<UserActivity, "id">;

/** İstifadəçi statistikaları. */
export type UserStats = {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
  todayCount: number;
  monthlyGrowth: number;
  avgArticlesRead: number;
};

/* ======================================================================
   Advanced Text Editor - Rich Media Blocks
   ====================================================================== */

/** Rich media block tipi. */
export type MediaBlockType = 
  | "video"        // YouTube/Vimeo embed
  | "gallery"      // Image gallery
  | "instagram"    // Instagram post embed
  | "twitter"      // Twitter/X post embed
  | "quote"        // Styled quote block
  | "html"         // Custom HTML
  | "divider";     // Styled divider

/** Rich media block. */
export type MediaBlock = {
  id: string;
  type: MediaBlockType;
  /** Video URL (YouTube, Vimeo). */
  videoUrl?: string;
  /** Gallery images. */
  images?: { url: string; caption: string }[];
  /** Instagram post URL. */
  instagramUrl?: string;
  /** Twitter/X post URL. */
  twitterUrl?: string;
  /** Quote text (multilingual). */
  quoteText?: LocalizedText;
  /** Quote author. */
  quoteAuthor?: string;
  /** Custom HTML. */
  html?: string;
  /** Divider style. */
  dividerStyle?: "solid" | "dashed" | "dotted" | "stars";
};

/* ======================================================================
   E-Jurnal İdarəetməsi (Enhanced with Sales Tracking)
   ====================================================================== */

/** E-jurnal sifarişinin statusu. */
export type EjournalOrderStatus = "pending" | "paid" | "failed" | "refunded";

export const ejournalOrderStatusLabels: Record<EjournalOrderStatus, string> = {
  pending:  "Gözlənilir",
  paid:     "Ödənilib",
  failed:   "Uğursuz",
  refunded: "Geri qaytarılıb",
};

/** E-jurnal sifarişi (purchase). */
export type EjournalOrder = {
  id: string;
  ejournalId: string;
  /** E-jurnal başlığı (cache). */
  ejournalTitle: string;
  /** Alıcı (istifadəçi ID və ya email). */
  buyerUserId?: string;
  buyerEmail: string;
  buyerName: string;
  /** Qiymət (AZN). */
  price: number;
  /** Status. */
  status: EjournalOrderStatus;
  /** Ödəniş növü. */
  paymentMethod: "card" | "bank_transfer" | "cash" | "other";
  /** Ödəniş provider (Stripe, PayPal və s.). */
  paymentProvider?: string;
  /** Transaction ID. */
  transactionId?: string;
  /** Sifariş tarixi. */
  createdAt: string;
  /** Ödəniş tarixi. */
  paidAt?: string;
  /** Qeydlər. */
  notes?: string;
};

export type EjournalOrderInput = Omit<EjournalOrder, "id">;

/** E-jurnal download log. */
export type EjournalDownload = {
  id: string;
  ejournalId: string;
  /** İstifadəçi ID (əgər logged-in olarsa). */
  userId?: string;
  /** Session ID. */
  sessionId: string;
  /** IP hash. */
  ipHash?: string;
  /** Download tarixi. */
  downloadedAt: string;
};

export type EjournalDownloadInput = Omit<EjournalDownload, "id">;

/** E-jurnal statistikaları. */
export type EjournalStats = {
  /** Cəmi nömrə sayı. */
  totalIssues: number;
  /** Dərc olunmuş. */
  publishedIssues: number;
  /** Draft. */
  draftIssues: number;
  /** Cəmi satış. */
  totalSales: number;
  /** Cəmi gəlir (AZN). */
  totalRevenue: number;
  /** Cəmi download sayı. */
  totalDownloads: number;
  /** Bu ay satış. */
  thisMonthSales: number;
  /** Bu ay gəlir. */
  thisMonthRevenue: number;
  /** Ortalama qiymət. */
  avgPrice: number;
};
