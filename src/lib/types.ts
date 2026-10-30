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

/** Activity log filter options. */
export type AuditLogFilter = {
  /** İstifadəçi email filtri. */
  userEmail?: string;
  /** Action növü filtri. */
  action?: AuditAction;
  /** Resource (collection) filtri. */
  resource?: string;
  /** Tarix aralığı (başlanğıc). */
  dateFrom?: string;
  /** Tarix aralığı (son). */
  dateTo?: string;
  /** Axtarış sorğusu (description). */
  searchQuery?: string;
};

/** Activity log statistics. */
export type AuditLogStats = {
  /** Ümumi log sayı. */
  totalLogs: number;
  /** Action növünə görə. */
  byAction: Record<AuditAction, number>;
  /** Resource-a görə top 10. */
  byResource: { resource: string; count: number }[];
  /** İstifadəçiyə görə top 10. */
  byUser: { userEmail: string; userName: string; count: number }[];
  /** Son 7 günün trendi. */
  trend: {
    date: string;
    count: number;
    actions: Record<AuditAction, number>;
  }[];
};

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
   Subscription Plans Manager
   ====================================================================== */

/** Üzvlük plan tipi. */
export type SubscriptionPlanType = "free" | "premium" | "vip";

export const subscriptionPlanTypeLabels: Record<SubscriptionPlanType, string> = {
  free:    "Pulsuz",
  premium: "Premium",
  vip:     "VIP",
};

/** Üzvlük müddəti (billing cycle). */
export type BillingCycle = "monthly" | "yearly";

export const billingCycleLabels: Record<BillingCycle, string> = {
  monthly: "Aylıq",
  yearly:  "İllik",
};

/** Üzvlük planı. */
export type SubscriptionPlan = {
  id: string;
  type: SubscriptionPlanType;
  /** Plan adı (5 dildə). */
  name: LocalizedText;
  /** Təsvir (5 dildə). */
  description: LocalizedText;
  /** Xüsusiyyətlər (5 dildə array). */
  features: Record<Locale, string[]>;
  /** Aylıq qiymət (AZN). 0 = pulsuz. */
  priceMonthly: number;
  /** İllik qiymət (AZN). 0 = pulsuz. */
  priceYearly: number;
  /** Stripe Product ID (ödəniş inteqrasiyası üçün). */
  stripeProductId?: string;
  /** Stripe Price ID - monthly. */
  stripePriceIdMonthly?: string;
  /** Stripe Price ID - yearly. */
  stripePriceIdYearly?: string;
  /** PayPal Plan ID (opsional). */
  paypalPlanId?: string;
  /** Plan aktiv? */
  active: boolean;
  /** Populyar (badge göstərilir). */
  popular: boolean;
  /** Sıralama. */
  order: number;
  /** CTA button mətni (5 dildə). */
  ctaText: LocalizedText;
  /** Badge mətni (məs. "Ən populyar", "Ən yaxşı dəyər"). */
  badgeText?: LocalizedText;
  /** Plan limitleri. */
  limits: {
    /** Aylıq oxuya biləcəyi məqalə sayı (0 = unlimited). */
    monthlyArticleLimit: number;
    /** E-jurnal endirim faizi. */
    ejournalDiscount: number;
    /** Premium kontent? */
    premiumContent: boolean;
    /** Reklamlar göstərilir? */
    showAds: boolean;
    /** Erkən giriş? */
    earlyAccess: boolean;
    /** Xüsusi newsletter? */
    exclusiveNewsletter: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
};

export type SubscriptionPlanInput = Omit<SubscriptionPlan, "id">;

/** İstifadəçi üzvlüyü (subscription). */
export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  /** Plan tipi (cache). */
  planType: SubscriptionPlanType;
  /** Billing cycle. */
  billingCycle: BillingCycle;
  /** Status. */
  status: "active" | "cancelled" | "expired" | "pending";
  /** Başlama tarixi. */
  startedAt: string;
  /** Bitmə tarixi. */
  expiresAt: string;
  /** Avtomatik yenilənir? */
  autoRenew: boolean;
  /** Ödəniş metodu. */
  paymentMethod: "stripe" | "paypal" | "manual";
  /** Stripe Subscription ID. */
  stripeSubscriptionId?: string;
  /** PayPal Subscription ID. */
  paypalSubscriptionId?: string;
  /** Aylıq ödəmə məbləği. */
  amount: number;
  /** Valyuta. */
  currency: string;
  /** Ləğv edilmə tarixi. */
  cancelledAt?: string;
  /** Ləğv səbəbi. */
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
};

export type UserSubscriptionInput = Omit<UserSubscription, "id">;

/** Üzvlük ödəniş tarixçəsi. */
export type SubscriptionPayment = {
  id: string;
  subscriptionId: string;
  userId: string;
  planId: string;
  /** Məbləğ. */
  amount: number;
  /** Valyuta. */
  currency: string;
  /** Status. */
  status: "pending" | "completed" | "failed" | "refunded";
  /** Ödəniş provider. */
  provider: "stripe" | "paypal" | "manual";
  /** Transaction ID. */
  transactionId?: string;
  /** Invoice URL. */
  invoiceUrl?: string;
  /** Ödəniş tarixi. */
  paidAt?: string;
  /** Failed səbəbi. */
  failureReason?: string;
  createdAt: string;
};

export type SubscriptionPaymentInput = Omit<SubscriptionPayment, "id">;

/** Üzvlük statistikaları. */
export type SubscriptionStats = {
  /** Cəmi aktiv üzvlük. */
  totalActive: number;
  /** Free plan. */
  freeUsers: number;
  /** Premium plan. */
  premiumUsers: number;
  /** VIP plan. */
  vipUsers: number;
  /** Bu ay yeni üzvlüklər. */
  newThisMonth: number;
  /** Bu ay ləğv edilmə. */
  cancelledThisMonth: number;
  /** Churn rate (%). */
  churnRate: number;
  /** Aylıq recurring gəlir (MRR). */
  monthlyRecurringRevenue: number;
  /** İllik recurring gəlir (ARR). */
  annualRecurringRevenue: number;
  /** Ortalama üzvlük dəyəri. */
  avgSubscriptionValue: number;
  /** Conversion rate (free → paid, %). */
  conversionRate: number;
};

/* ======================================================================
   Push Notifications Manager
   ====================================================================== */

/** Push bildiriş tipi. */
export type PushNotificationType = 
  | "new_article"      // Yeni məqalə
  | "breaking_news"    // Təcili xəbər
  | "ebook_promotion"  // E-kitab promosyonu
  | "subscription"     // Üzvlük xatırlatması
  | "custom";          // Xüsusi mesaj

export const pushNotificationTypeLabels: Record<PushNotificationType, string> = {
  new_article:     "Yeni məqalə",
  breaking_news:   "Təcili xəbər",
  ebook_promotion: "E-kitab promosyonu",
  subscription:    "Üzvlük xatırlatması",
  custom:          "Xüsusi mesaj",
};

/** Push bildiriş auditoriyası. */
export type PushAudience = 
  | "all"              // Bütün istifadəçilər
  | "subscribers"      // Newsletter abunəçiləri
  | "premium"          // Premium üzvlər
  | "category"         // Kateqoriya marağı olanlar
  | "segment";         // Custom segment

export const pushAudienceLabels: Record<PushAudience, string> = {
  all:         "Bütün istifadəçilər",
  subscribers: "Newsletter abunəçiləri",
  premium:     "Premium üzvlər",
  category:    "Kateqoriya marağı",
  segment:     "Xüsusi segment",
};

/** Push bildiriş statusu. */
export type PushNotificationStatus = 
  | "draft"      // Layihə
  | "scheduled"  // Planlaşdırılıb
  | "sending"    // Göndərilir
  | "sent"       // Göndərilib
  | "failed";    // Uğursuz

export const pushNotificationStatusLabels: Record<PushNotificationStatus, string> = {
  draft:     "Layihə",
  scheduled: "Planlaşdırılıb",
  sending:   "Göndərilir",
  sent:      "Göndərilib",
  failed:    "Uğursuz",
};

/** Push bildiriş kampaniyası. */
export type PushNotificationCampaign = {
  id: string;
  /** Kampaniya adı (daxili). */
  name: string;
  /** Bildiriş tipi. */
  type: PushNotificationType;
  /** Status. */
  status: PushNotificationStatus;
  /** Başlıq (5 dildə). */
  title: LocalizedText;
  /** Mətn (5 dildə). */
  body: LocalizedText;
  /** Şəkil URL (opsional). */
  imageUrl?: string;
  /** Click URL. */
  clickUrl?: string;
  /** Auditoriya. */
  audience: PushAudience;
  /** Kateqoriya (əgər audience = "category"). */
  categorySlug?: CategorySlug;
  /** Üzvlük planı (əgər audience = "premium"). */
  subscriptionPlan?: SubscriptionPlanType;
  /** Custom segment filter (JSON). */
  segmentFilter?: string;
  /** Göndərmə tarixi (dərhal və ya planlaşdırılmış). */
  scheduledAt?: string;
  /** Göndərilmə tarixi. */
  sentAt?: string;
  /** Statistika. */
  stats: {
    /** Ümumi recipient sayı. */
    totalRecipients: number;
    /** Uğurla göndərilən. */
    sent: number;
    /** Açılan (opened). */
    opened: number;
    /** Klik edilən. */
    clicked: number;
    /** Uğursuz (failed). */
    failed: number;
  };
  /** Firebase Cloud Messaging token IDs (hədəf cihazlar). */
  fcmTokens?: string[];
  /** Xəta mesajı (əgər failed olarsa). */
  errorMessage?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
};

export type PushNotificationCampaignInput = Omit<PushNotificationCampaign, "id">;

/** Push bildiriş şablonu. */
export type PushNotificationTemplate = {
  id: string;
  /** Şablon adı. */
  name: string;
  /** Şablon tipi. */
  type: PushNotificationType;
  /** Başlıq (5 dildə, variables dəstəyi: {{title}}, {{author}}). */
  title: LocalizedText;
  /** Mətn (5 dildə, variables dəstəyi). */
  body: LocalizedText;
  /** Default şəkil. */
  imageUrl?: string;
  /** Default click URL (variables: {{articleId}}, {{category}}). */
  clickUrl?: string;
  /** Aktiv. */
  active: boolean;
  createdAt: string;
  createdBy: string;
};

export type PushNotificationTemplateInput = Omit<PushNotificationTemplate, "id">;

/** İstifadəçi FCM token (Firebase Cloud Messaging). */
export type UserFcmToken = {
  id: string;
  /** İstifadəçi ID (əgər logged-in olarsa). */
  userId?: string;
  /** FCM token. */
  token: string;
  /** Device type. */
  deviceType: "web" | "android" | "ios";
  /** Browser. */
  browser?: string;
  /** OS. */
  os?: string;
  /** Dil. */
  locale: Locale;
  /** Maraq sahələri. */
  interests?: CategorySlug[];
  /** Üzvlük planı. */
  subscriptionPlan?: SubscriptionPlanType;
  /** Son aktiv. */
  lastActiveAt: string;
  createdAt: string;
};

export type UserFcmTokenInput = Omit<UserFcmToken, "id">;

/** Push bildiriş delivery log. */
export type PushDeliveryLog = {
  id: string;
  campaignId: string;
  /** FCM token. */
  fcmToken: string;
  /** İstifadəçi ID. */
  userId?: string;
  /** Status. */
  status: "sent" | "opened" | "clicked" | "failed";
  /** Göndərilmə tarixi. */
  sentAt: string;
  /** Açılma tarixi. */
  openedAt?: string;
  /** Klik tarixi. */
  clickedAt?: string;
  /** Xəta (əgər failed olarsa). */
  error?: string;
};

export type PushDeliveryLogInput = Omit<PushDeliveryLog, "id">;

/** Push bildiriş statistikası. */
export type PushNotificationStats = {
  /** Cəmi kampaniya sayı. */
  totalCampaigns: number;
  /** Göndərilmiş kampaniyalar. */
  sentCampaigns: number;
  /** Planlaşdırılmış kampaniyalar. */
  scheduledCampaigns: number;
  /** Cəmi göndərilən bildiriş sayı. */
  totalSent: number;
  /** Açılma sayı. */
  totalOpened: number;
  /** Klik sayı. */
  totalClicked: number;
  /** Açılma dərəcəsi (%). */
  openRate: number;
  /** Klik dərəcəsi (%). */
  clickRate: number;
  /** Aktiv FCM token sayı. */
  activeFcmTokens: number;
  /** Bu həftə göndərilən. */
  thisWeekSent: number;
  /** Bu ay göndərilən. */
  thisMonthSent: number;
};

/* ======================================================================
   Translation Manager
   ====================================================================== */

/** Tərcümə statusu. */
export type TranslationStatus = "empty" | "in_progress" | "completed" | "outdated";

export const translationStatusLabels: Record<TranslationStatus, string> = {
  empty:       "Boş",
  in_progress: "Tərcümə olunur",
  completed:   "Tamamlanmış",
  outdated:    "Köhnə",
};

/** Tərcümə tamamlanma faizi. */
export type TranslationProgress = {
  locale: Locale;
  /** Tamamlanma faizi (0-100). */
  percentage: number;
  /** Boş sahələrin sayı. */
  emptyFields: number;
  /** Cəmi sahələrin sayı. */
  totalFields: number;
  /** Status. */
  status: TranslationStatus;
};

/** Məqalə tərcümə məlumatları. */
export type ArticleTranslation = {
  id: string;
  articleId: string;
  /** Məqalə başlığı (cache). */
  articleSlug: string;
  /** Tərcümə progress (hər dil üçün). */
  progress: Record<Locale, TranslationProgress>;
  /** Son yeniləmə. */
  lastUpdatedAt: string;
  /** Son tərcümə edən. */
  lastUpdatedBy?: string;
};

export type ArticleTranslationInput = Omit<ArticleTranslation, "id">;

/** Tərcümə iş növü. */
export type TranslationJobType = "article" | "ejournal" | "banner" | "category" | "tag";

export const translationJobTypeLabels: Record<TranslationJobType, string> = {
  article:  "Məqalə",
  ejournal: "E-jurnal",
  banner:   "Banner",
  category: "Kateqoriya",
  tag:      "Etiket",
};

/** Tərcümə işi. */
export type TranslationJob = {
  id: string;
  /** İş tipi. */
  type: TranslationJobType;
  /** Resurs ID (article, ejournal, etc.). */
  resourceId: string;
  /** Resurs başlığı (cache). */
  resourceTitle: string;
  /** Tərcümə olunacaq dil. */
  targetLocale: Locale;
  /** Status. */
  status: "pending" | "in_progress" | "completed" | "failed";
  /** Təyin edilmiş tərcüməçi. */
  assignedTo?: string;
  /** Deadline. */
  dueDate?: string;
  /** Priority. */
  priority: "low" | "medium" | "high";
  /** Tərcümə mənbəyi. */
  sourceLocale: Locale;
  /** Qeydlər. */
  notes?: string;
  /** Başlanma tarixi. */
  startedAt?: string;
  /** Tamamlanma tarixi. */
  completedAt?: string;
  createdAt: string;
  createdBy: string;
};

export type TranslationJobInput = Omit<TranslationJob, "id">;

/** Tərcümə statistikaları. */
export type TranslationStats = {
  /** Cəmi məqalə sayı. */
  totalArticles: number;
  /** Hər dildə tamamlanma. */
  completionByLocale: Record<Locale, {
    completed: number;
    inProgress: number;
    empty: number;
    percentage: number;
  }>;
  /** Aktiv işlər. */
  activeJobs: number;
  /** Tamamlanan işlər (bu həftə). */
  completedJobsThisWeek: number;
  /** Gecikən işlər. */
  overdueJobs: number;
};

/** Auto-translate request (Google Translate API placeholder). */
export type AutoTranslateRequest = {
  /** Tərcümə olunacaq mətn. */
  text: string;
  /** Mənbə dil. */
  sourceLocale: Locale;
  /** Hədəf dil. */
  targetLocale: Locale;
};

export type AutoTranslateResponse = {
  /** Tərcümə olunmuş mətn. */
  translatedText: string;
  /** Mənbə dil (detected). */
  detectedSourceLocale?: Locale;
};

/* ======================================================================
   Tags Manager
   ====================================================================== */

/** Tag (etiket). */
export type Tag = {
  id: string;
  /** Tag slug (URL-friendly). */
  slug: string;
  /** Tag adı (5 dil). */
  name: LocalizedText;
  /** Təsvir (5 dil, opsional). */
  description?: LocalizedText;
  /** Rəng (hex code, opsional). */
  color?: string;
  /** Aktiv? */
  active: boolean;
  /** İstifadə sayı (məqalələrdə). */
  usageCount: number;
  /** Son istifadə tarixi. */
  lastUsedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
};

export type TagInput = Omit<Tag, "id">;

/** Tag statistikası. */
export type TagStats = {
  /** Cəmi tag sayı. */
  totalTags: number;
  /** Aktiv tag-lar. */
  activeTags: number;
  /** İstifadə edilməyən tag-lar (usage count = 0). */
  unusedTags: number;
  /** Ən populyar tag-lar (top 10). */
  topTags: { tagId: string; tagName: string; usageCount: number }[];
  /** Bu ay yaradılan tag-lar. */
  tagsCreatedThisMonth: number;
};

/** Tag merge tələbi. */
export type TagMergeRequest = {
  /** Birləşdiriləcək tag ID-ləri. */
  sourceTagIds: string[];
  /** Hədəf tag ID (hansına birləşdiriləcək). */
  targetTagId: string;
};

/* ======================================================================
   File Manager Enhancement
   ====================================================================== */

/** File type. */
export type FileType = "image" | "video" | "audio" | "document" | "other";

/** Media folder. */
export type MediaFolder = {
  id: string;
  /** Folder adı. */
  name: string;
  /** Folder slug (URL-friendly). */
  slug: string;
  /** Parent folder ID (null = root). */
  parentId: string | null;
  /** Firebase Storage path. */
  storagePath: string;
  /** İkon. */
  icon?: string;
  /** Rəngi. */
  color?: string;
  /** Yaradılma tarixi. */
  createdAt: string;
  /** Yeniləmə tarixi. */
  updatedAt?: string;
};

export type MediaFolderInput = Omit<MediaFolder, "id">;

/** Media file metadata. */
export type MediaFile = {
  id: string;
  /** Folder ID. */
  folderId: string | null;
  /** Fayl adı. */
  name: string;
  /** Fayl növü. */
  type: FileType;
  /** Mime type. */
  mimeType: string;
  /** Firebase Storage path or Cloudinary public ID. */
  storagePath: string;
  /** Cloudinary public ID (for Cloudinary uploads). */
  publicId?: string;
  /** Public URL. */
  url: string;
  /** Fayl ölçüsü (bytes). */
  size: number;
  /** Şəkil ölçüləri (width x height). */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Alt text (accessibility). */
  alt?: string;
  /** Təsvir. */
  description?: string;
  /** Tags. */
  tags: string[];
  /** Upload edən istifadəçi. */
  uploadedBy: string;
  /** Upload tarixi. */
  uploadedAt: string;
  /** İstifadə sayı (neçə məqalədə istifadə olunur). */
  usageCount: number;
  /** Son istifadə tarixi. */
  lastUsedAt?: string;
};

export type MediaFileInput = Omit<MediaFile, "id">;

/** File editing operations. */
export type FileEditOperation = {
  type: "crop" | "resize" | "rotate" | "filter";
  /** Crop: { x, y, width, height } */
  cropArea?: { x: number; y: number; width: number; height: number };
  /** Resize: { width, height } */
  resizeDimensions?: { width: number; height: number };
  /** Rotate: angle in degrees (90, 180, 270). */
  rotateAngle?: number;
  /** Filter: brightness, contrast, saturation, blur, grayscale, sepia. */
  filter?: {
    name: string;
    value: number;
  };
};

/** Batch upload progress. */
export type BatchUploadProgress = {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  files: {
    name: string;
    status: "pending" | "uploading" | "completed" | "failed";
    progress: number;
    url?: string;
    error?: string;
  }[];
};

/** Storage statistics. */
export type StorageStats = {
  /** Ümumi istifadə olunan yaddaş (bytes). */
  totalUsed: number;
  /** Limit (bytes). */
  totalLimit: number;
  /** İstifadə faizi. */
  usagePercentage: number;
  /** Fayl növünə görə statistika. */
  byType: Record<FileType, { count: number; size: number }>;
  /** Folder-ə görə statistika. */
  byFolder: { folderId: string; folderName: string; count: number; size: number }[];
  /** Ən böyük fayllar. */
  largestFiles: { id: string; name: string; size: number; url: string }[];
};

/* ======================================================================
   Site Performance Monitor
   ====================================================================== */

/** Core Web Vitals metric. */
export type WebVitalMetric = "LCP" | "FID" | "CLS" | "FCP" | "TTFB" | "INP";

/** Performance rating. */
export type PerformanceRating = "good" | "needs-improvement" | "poor";

/** Page performance snapshot. */
export type PagePerformance = {
  id: string;
  /** Səhifə URL (relative path). */
  pageUrl: string;
  /** Səhifə başlığı. */
  pageTitle: string;
  /** Test tarixi. */
  testedAt: string;
  /** Test cihazı (desktop, mobile). */
  device: "desktop" | "mobile";
  /** Ümumi performans balı (0-100). */
  performanceScore: number;
  /** Core Web Vitals. */
  webVitals: {
    /** Largest Contentful Paint (milliseconds). */
    lcp: number;
    lcpRating: PerformanceRating;
    /** First Input Delay (milliseconds). */
    fid: number;
    fidRating: PerformanceRating;
    /** Cumulative Layout Shift (score). */
    cls: number;
    clsRating: PerformanceRating;
    /** First Contentful Paint (milliseconds). */
    fcp: number;
    fcpRating: PerformanceRating;
    /** Time to First Byte (milliseconds). */
    ttfb: number;
    ttfbRating: PerformanceRating;
    /** Interaction to Next Paint (milliseconds). */
    inp?: number;
    inpRating?: PerformanceRating;
  };
  /** Resource timing. */
  resources: {
    /** Ümumi resurs sayı. */
    totalCount: number;
    /** Ümumi resurs ölçüsü (bytes). */
    totalSize: number;
    /** JS fayllar. */
    javascript: { count: number; size: number };
    /** CSS fayllar. */
    css: { count: number; size: number };
    /** Şəkillər. */
    images: { count: number; size: number };
    /** Fontlar. */
    fonts: { count: number; size: number };
  };
  /** Opportunities (təkmilləşdirmə imkanları). */
  opportunities: {
    id: string;
    title: string;
    description: string;
    /** Qənaət (milliseconds və ya bytes). */
    savings: number;
    savingsUnit: "ms" | "bytes";
    priority: "high" | "medium" | "low";
  }[];
  /** Server response time (milliseconds). */
  serverResponseTime: number;
  /** DOM content loaded (milliseconds). */
  domContentLoaded: number;
  /** Full page load (milliseconds). */
  fullPageLoad: number;
};

export type PagePerformanceInput = Omit<PagePerformance, "id">;

/** Performance summary (aggregated). */
export type PerformanceSummary = {
  /** Son test tarixi. */
  lastTestedAt: string;
  /** Orta performans balı. */
  averageScore: number;
  /** Desktop vs Mobile. */
  byDevice: {
    desktop: { averageScore: number; testCount: number };
    mobile: { averageScore: number; testCount: number };
  };
  /** Core Web Vitals ortalaması. */
  averageWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  /** Ən yavaş səhifələr. */
  slowestPages: { url: string; title: string; score: number }[];
  /** Ən sürətli səhifələr. */
  fastestPages: { url: string; title: string; score: number }[];
  /** Trend (son 7 gün). */
  trend: {
    date: string;
    averageScore: number;
  }[];
};

/** Optimization recommendation. */
export type OptimizationTip = {
  id: string;
  category: "images" | "scripts" | "css" | "fonts" | "caching" | "server" | "other";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "easy" | "moderate" | "hard";
  /** Təsir olunan səhifə sayı. */
  affectedPages: number;
  /** Tətbiq olunubmu? */
  implemented: boolean;
  implementedAt?: string;
  implementedBy?: string;
};

export type OptimizationTipInput = Omit<OptimizationTip, "id">;

/* ======================================================================
   Backup & Restore
   ====================================================================== */

/** Backup status. */
export type BackupStatus = "pending" | "in-progress" | "completed" | "failed";

/** Backup type. */
export type BackupType = "manual" | "scheduled" | "automatic";

/** Database backup snapshot. */
export type DatabaseBackup = {
  id: string;
  /** Backup adı. */
  name: string;
  /** Backup növü. */
  type: BackupType;
  /** Status. */
  status: BackupStatus;
  /** Backup tarixi. */
  createdAt: string;
  /** Backup ölçüsü (bytes). */
  size: number;
  /** Backup faylının storage path-i. */
  storagePath: string;
  /** Backup faylının URL-i. */
  downloadUrl?: string;
  /** Backup-a daxil olan kolleksiyalar. */
  collections: string[];
  /** Ümumi document sayı. */
  totalDocuments: number;
  /** Backup yaradan istifadəçi. */
  createdBy: string;
  /** Backup yaratma müddəti (milliseconds). */
  duration?: number;
  /** Xəta mesajı (əgər failed olarsa). */
  error?: string;
  /** Qeydlər. */
  notes?: string;
};

export type DatabaseBackupInput = Omit<DatabaseBackup, "id">;

/** Backup schedule configuration. */
export type BackupSchedule = {
  id: string;
  /** Schedule adı. */
  name: string;
  /** Aktiv? */
  enabled: boolean;
  /** Cron expression (e.g., "0 2 * * *" = hər gün saat 02:00). */
  cronExpression: string;
  /** Human-readable açıqlama. */
  description: string;
  /** Backup-a daxil ediləcək kolleksiyalar. */
  collections: string[];
  /** Saxlama müddəti (gün). */
  retentionDays: number;
  /** Son icra tarixi. */
  lastRunAt?: string;
  /** Növbəti icra tarixi. */
  nextRunAt?: string;
  /** Son backup ID. */
  lastBackupId?: string;
  /** Yaradılma tarixi. */
  createdAt: string;
  /** Yaradan istifadəçi. */
  createdBy: string;
};

export type BackupScheduleInput = Omit<BackupSchedule, "id">;

/** Restore operation. */
export type RestoreOperation = {
  id: string;
  /** Backup ID (hansı backup-dan restore edilir). */
  backupId: string;
  /** Status. */
  status: "pending" | "in-progress" | "completed" | "failed";
  /** Başlanma tarixi. */
  startedAt: string;
  /** Bitirmə tarixi. */
  completedAt?: string;
  /** Restore olunan kolleksiyalar. */
  collections: string[];
  /** Restore olunan document sayı. */
  restoredDocuments: number;
  /** Progress (%). */
  progress: number;
  /** Xəta mesajı. */
  error?: string;
  /** Restore edən istifadəçi. */
  restoredBy: string;
};

export type RestoreOperationInput = Omit<RestoreOperation, "id">;

/** Backup statistics. */
export type BackupStats = {
  /** Ümumi backup sayı. */
  totalBackups: number;
  /** Uğurlu backup sayı. */
  successfulBackups: number;
  /** Uğursuz backup sayı. */
  failedBackups: number;
  /** Ümumi backup ölçüsü (bytes). */
  totalSize: number;
  /** Orta backup ölçüsü (bytes). */
  averageSize: number;
  /** Son backup tarixi. */
  lastBackupDate?: string;
  /** Son uğurlu backup. */
  lastSuccessfulBackup?: DatabaseBackup;
  /** Scheduled backup sayı. */
  activeSchedules: number;
  /** Backup trend (son 30 gün). */
  trend: {
    date: string;
    count: number;
    totalSize: number;
  }[];
};

/* ======================================================================
   Category Manager Enhancement
   ====================================================================== */

/** Category SEO metadata. */
export type CategorySeo = {
  /** Meta title. */
  title: LocalizedText;
  /** Meta description. */
  description: LocalizedText;
  /** Meta keywords. */
  keywords: Record<Locale, string[]>;
  /** OG image URL. */
  ogImage?: string;
};

/** Enhanced category with SEO, icons, stats. */
export type EnhancedCategory = {
  id: string;
  slug: string;
  /** Parent category ID (null = top level). */
  parentId?: string;
  /** Category adı (5 dil). */
  name: LocalizedText;
  /** Təsvir (5 dil). */
  description: LocalizedText;
  /** Tagline (5 dil). */
  tagline: LocalizedText;
  /** Icon (emoji və ya URL). */
  icon?: string;
  /** Rəng (hex code). */
  color?: string;
  /** SEO metadata. */
  seo: CategorySeo;
  /** Aktiv? */
  active: boolean;
  /** Sıralama. */
  order: number;
  /** Məqalə sayı (cache). */
  articleCount: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
};

export type EnhancedCategoryInput = Omit<EnhancedCategory, "id">;

/** Category statistikası. */
export type CategoryStats = {
  id?: string;
  categoryId: string;
  categorySlug: string;
  /** Ümumi məqalə sayı. */
  totalArticles: number;
  /** Dərc olunmuş məqalə sayı. */
  publishedArticles: number;
  /** Draft məqalələr. */
  draftArticles: number;
  /** Son 30 gündə dərc edilən. */
  articlesLast30Days: number;
  /** Ümumi baxış sayı. */
  totalViews: number;
  /** Ortalama məqalə baxışı. */
  avgViewsPerArticle: number;
  /** Son yeniləmə. */
  updatedAt: string;
};

export type CategoryStatsInput = Omit<CategoryStats, "id">;

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

/* ======================================================================
   Advanced Ad Banner Management
   ====================================================================== */

/** Reklam banner yerləşməsi. */
export type AdBannerLocation = 
  | "article-sidebar-left"
  | "article-sidebar-right"
  | "article-inline"
  | "article-header"
  | "article-between-h2"
  | "article-between-h3"
  | "home-hero"
  | "category-top";

export const adBannerLocationLabels: Record<AdBannerLocation, string> = {
  "article-sidebar-left":   "Məqalə - Sol Sidebar",
  "article-sidebar-right":  "Məqalə - Sağ Sidebar",
  "article-inline":         "Məqalə - Mətn Ortası",
  "article-header":         "Məqalə - Başlıq Altı",
  "article-between-h2":     "Məqalə - H2 Başlıqlar Arası",
  "article-between-h3":     "Məqalə - H3 Başlıqlar Arası",
  "home-hero":              "Ana səhifə - Hero",
  "category-top":           "Kateqoriya - Üst",
};

/** Yeni reklam banner sistemi. */
export type AdvancedAdBanner = {
  id: string;
  /** Banner adı (admin üçün). */
  name: string;
  /** Banner rəsminin URL-i. */
  imageUrl: string;
  /** Reklam linki. */
  linkUrl: string;
  /** Alt mətn. */
  altText: string;
  /** Banner yerləşmələri (çoxlu seçim). */
  locations: AdBannerLocation[];
  /** Aktiv/Deaktiv. */
  active: boolean;
  /** Hansı device-da göstərilsin. */
  showOn: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  /** Banner ölçüləri. */
  dimensions: {
    width: number;
    height: number;
  };
  /** Başlama tarixi (opsional). */
  startsAt?: string;
  /** Bitmə tarixi (opsional). */
  endsAt?: string;
  /** Click sayı. */
  clicks: number;
  /** Görüntülənmə sayı. */
  impressions: number;
  /** Prioritet (1-10, yüksək öncelikli). */
  priority: number;
  /** Custom CSS class. */
  customClass?: string;
  /** Animasiya effekti. */
  animation?: "none" | "fade" | "slide" | "pulse" | "bounce";
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
};

export type AdvancedAdBannerInput = Omit<AdvancedAdBanner, "id" | "clicks" | "impressions" | "createdAt" | "updatedAt">;

/** Default placeholder banner. */
export const DEFAULT_BANNER_TEXT = {
  title: "Burada sizin reklamınız ola bilər",
  contact: "WhatsApp: 0503807787",
  animation: "pulse" as const,
};
