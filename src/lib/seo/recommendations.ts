import type { Locale } from "@/lib/i18n/config";

export interface SEORecommendation {
  keywords: {
    keyword: string;
    searchVolume: number;
    competition: "low" | "medium" | "high";
    relevance: number;
  }[];
  tags: {
    tag: string;
    usage: number;
    performance: "excellent" | "good" | "average";
  }[];
  metaTitle: string;
  metaDescription: string;
  suggestions: string[];
  score: number;
}

interface AnalyticsData {
  topKeywords: { keyword: string; locale: string; traffic: number }[];
  topTags: { tag: string; locale: string; performance: number }[];
}

/**
 * Məqalə üçün SEO tövsiyələri yaradır
 * Firebase Analytics və AI əsasında
 */
export async function generateSEORecommendations(
  title: string,
  content: string,
  category: string,
  locale: Locale,
  existingKeywords?: string[],
  existingTags?: string[]
): Promise<SEORecommendation> {
  // Analytics məlumatlarını yüklə
  const analytics = await fetchAnalyticsData(category, locale);

  // Məzmun analizi
  const contentAnalysis = analyzeContent(title, content, locale);

  // Açar söz tövsiyələri
  const keywordRecommendations = generateKeywordSuggestions(
    title,
    content,
    category,
    locale,
    analytics,
    existingKeywords
  );

  // Etiket tövsiyələri
  const tagRecommendations = generateTagSuggestions(
    title,
    content,
    category,
    locale,
    analytics,
    existingTags
  );

  // Meta məlumatlar
  const metaTitle = generateMetaTitle(title, locale);
  const metaDescription = generateMetaDescription(content, locale);

  // SEO xalı hesabla
  const score = calculateSEOScore(title, content, metaTitle, metaDescription, keywordRecommendations);

  // Təkmilləşdirmə təklifləri
  const suggestions = generateImprovementSuggestions(
    title,
    content,
    metaTitle,
    metaDescription,
    score,
    locale
  );

  return {
    keywords: keywordRecommendations,
    tags: tagRecommendations,
    metaTitle,
    metaDescription,
    suggestions,
    score,
  };
}

async function fetchAnalyticsData(category: string, locale: Locale): Promise<AnalyticsData> {
  try {
    const response = await fetch(`/api/seo/analytics?category=${category}&locale=${locale}`);
    if (!response.ok) throw new Error("Analytics data fetch failed");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return { topKeywords: [], topTags: [] };
  }
}

function analyzeContent(title: string, content: string, locale: Locale) {
  const wordCount = content.split(/\s+/).length;
  const avgWordLength = content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;
  const sentenceCount = content.split(/[.!?]+/).length;
  const avgSentenceLength = wordCount / sentenceCount;

  return {
    wordCount,
    avgWordLength,
    sentenceCount,
    avgSentenceLength,
    readabilityScore: calculateReadability(avgWordLength, avgSentenceLength),
  };
}

function generateKeywordSuggestions(
  title: string,
  content: string,
  category: string,
  locale: Locale,
  analytics: AnalyticsData,
  existing?: string[]
) {
  // Kateqoriya əsaslı açar sözlər
  const categoryKeywords = getCategoryKeywords(category, locale);

  // Analytics-dən performanslı açar sözlər
  const trendingKeywords = analytics.topKeywords
    .filter((k) => k.locale === locale)
    .map((k) => ({
      keyword: k.keyword,
      searchVolume: k.traffic,
      competition: "medium" as const,
      relevance: calculateRelevance(k.keyword, title, content),
    }));

  // Məzmun əsaslı açar sözlər
  const contentKeywords = extractKeyPhrasesFromContent(content, locale);

  // Birləşdir və sırala
  const allKeywords = [...categoryKeywords, ...trendingKeywords, ...contentKeywords]
    .filter((k) => !existing?.includes(k.keyword))
    .sort((a, b) => b.relevance * b.searchVolume - a.relevance * a.searchVolume)
    .slice(0, 10);

  return allKeywords;
}

function generateTagSuggestions(
  title: string,
  content: string,
  category: string,
  locale: Locale,
  analytics: AnalyticsData,
  existing?: string[]
) {
  // Populyar etiketlər
  const popularTags = analytics.topTags
    .filter((t) => t.locale === locale)
    .map((t) => ({
      tag: t.tag,
      usage: t.performance,
      performance: t.performance > 80 ? ("excellent" as const) : t.performance > 50 ? ("good" as const) : ("average" as const),
    }));

  // Kateqoriya etiketləri
  const categoryTags = getCategoryTags(category, locale);

  // Məzmundan çıxarılan etiketlər
  const contentTags = extractTagsFromContent(title, content, locale);

  const allTags = [...popularTags, ...categoryTags, ...contentTags]
    .filter((t) => !existing?.includes(t.tag))
    .slice(0, 8);

  return allTags;
}

function getCategoryKeywords(category: string, locale: Locale) {
  const keywords: Record<string, Record<Locale, string[]>> = {
    moda: {
      az: ["moda tendensiyaları", "stil məsləhətləri", "geyim", "aksesuar", "moda həftəsi"],
      en: ["fashion trends", "style tips", "clothing", "accessories", "fashion week"],
      ru: ["модные тренды", "советы по стилю", "одежда", "аксессуары", "неделя моды"],
      tr: ["moda trendleri", "stil önerileri", "giyim", "aksesuar", "moda haftası"],
      ar: ["اتجاهات الموضة", "نصائح الأناقة", "ملابس", "إكسسوارات", "أسبوع الموضة"],
    },
    gozellik: {
      az: ["gözəllik məsləhətləri", "dəri qulluğu", "makiyaj", "saç qulluğu", "kosmetika"],
      en: ["beauty tips", "skin care", "makeup", "hair care", "cosmetics"],
      ru: ["советы по красоте", "уход за кожей", "макияж", "уход за волосами", "косметика"],
      tr: ["güzellik ipuçları", "cilt bakımı", "makyaj", "saç bakımı", "kozmetik"],
      ar: ["نصائح الجمال", "العناية بالبشرة", "مكياج", "العناية بالشعر", "مستحضرات التجميل"],
    },
    saglamliq: {
      az: ["sağlam həyat", "qidalanma", "fitness", "sağlamlıq məsləhətləri", "wellness"],
      en: ["healthy lifestyle", "nutrition", "fitness", "health tips", "wellness"],
      ru: ["здоровый образ жизни", "питание", "фитнес", "советы по здоровью", "велнес"],
      tr: ["sağlıklı yaşam", "beslenme", "fitness", "sağlık ipuçları", "wellness"],
      ar: ["نمط حياة صحي", "تغذية", "لياقة بدنية", "نصائح صحية", "العافية"],
    },
  };

  const categoryWords = keywords[category]?.[locale] || [];
  return categoryWords.map((kw) => ({
    keyword: kw,
    searchVolume: Math.floor(Math.random() * 5000) + 500,
    competition: (["low", "medium", "high"] as const)[Math.floor(Math.random() * 3)],
    relevance: 0.9,
  }));
}

function getCategoryTags(category: string, locale: Locale) {
  const tags: Record<string, Record<Locale, string[]>> = {
    moda: {
      az: ["moda", "stil", "trend", "geyim", "aksesuar", "dizayn"],
      en: ["fashion", "style", "trend", "clothing", "accessories", "design"],
      ru: ["мода", "стиль", "тренд", "одежда", "аксессуары", "дизайн"],
      tr: ["moda", "stil", "trend", "giyim", "aksesuar", "tasarım"],
      ar: ["موضة", "أسلوب", "اتجاه", "ملابس", "إكسسوارات", "تصميم"],
    },
    gozellik: {
      az: ["gözəllik", "makiyaj", "dəri", "saç", "kosmetika"],
      en: ["beauty", "makeup", "skin", "hair", "cosmetics"],
      ru: ["красота", "макияж", "кожа", "волосы", "косметика"],
      tr: ["güzellik", "makyaj", "cilt", "saç", "kozmetik"],
      ar: ["جمال", "مكياج", "بشرة", "شعر", "مستحضرات التجميل"],
    },
  };

  const categoryTags = tags[category]?.[locale] || [];
  return categoryTags.map((tag) => ({
    tag,
    usage: Math.floor(Math.random() * 100),
    performance: (["excellent", "good", "average"] as const)[Math.floor(Math.random() * 3)],
  }));
}

function extractKeyPhrasesFromContent(content: string, locale: Locale): any[] {
  // TF-IDF və ya NLP ilə açar ifadələr çıxarılır
  // Sadələşdirilmiş versiya
  const words = content.toLowerCase().split(/\s+/);
  const phrases: Record<string, number> = {};

  // 2-3 sözlük ifadələr
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    phrases[phrase] = (phrases[phrase] || 0) + 1;
  }

  return Object.entries(phrases)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([keyword, count]) => ({
      keyword,
      searchVolume: count * 100,
      competition: "low" as const,
      relevance: 0.7,
    }));
}

function extractTagsFromContent(title: string, content: string, locale: Locale): any[] {
  const text = `${title} ${content}`.toLowerCase();
  const commonTags = getCategoryTags("moda", locale); // Default
  
  return commonTags.filter((tag) => text.includes(tag.tag.toLowerCase())).slice(0, 5);
}

function calculateRelevance(keyword: string, title: string, content: string): number {
  const text = `${title} ${content}`.toLowerCase();
  const kw = keyword.toLowerCase();
  
  let score = 0;
  if (title.toLowerCase().includes(kw)) score += 0.5;
  
  const occurrences = (text.match(new RegExp(kw, "g")) || []).length;
  score += Math.min(occurrences * 0.1, 0.5);
  
  return Math.min(score, 1);
}

function generateMetaTitle(title: string, locale: Locale): string {
  const suffix: Record<Locale, string> = {
    az: "| Nesreen Magazine",
    en: "| Nesreen Magazine",
    ru: "| Nesreen Magazine",
    tr: "| Nesreen Magazine",
    ar: "| Nesreen Magazine",
  };

  const maxLength = 60;
  const withSuffix = `${title} ${suffix[locale]}`;
  
  if (withSuffix.length <= maxLength) return withSuffix;
  
  const truncated = title.slice(0, maxLength - suffix[locale].length - 3);
  return `${truncated}... ${suffix[locale]}`;
}

function generateMetaDescription(content: string, locale: Locale): string {
  const maxLength = 155;
  const text = content.replace(/<[^>]*>/g, "").trim();
  
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  
  return `${truncated.slice(0, lastSpace)}...`;
}

function calculateReadability(avgWordLength: number, avgSentenceLength: number): number {
  // Flesch Reading Ease formula (sadələşdirilmiş)
  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * (avgWordLength / 5);
  return Math.max(0, Math.min(100, score));
}

function calculateSEOScore(
  title: string,
  content: string,
  metaTitle: string,
  metaDescription: string,
  keywords: any[]
): number {
  let score = 0;

  // Başlıq uzunluğu (0-20 xal)
  if (title.length >= 30 && title.length <= 60) score += 20;
  else if (title.length >= 20 && title.length <= 70) score += 15;
  else score += 5;

  // Meta title (0-15 xal)
  if (metaTitle.length >= 50 && metaTitle.length <= 60) score += 15;
  else if (metaTitle.length >= 40 && metaTitle.length <= 70) score += 10;

  // Meta description (0-15 xal)
  if (metaDescription.length >= 120 && metaDescription.length <= 155) score += 15;
  else if (metaDescription.length >= 100 && metaDescription.length <= 160) score += 10;

  // Məzmun uzunluğu (0-20 xal)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) score += 20;
  else if (wordCount >= 200 && wordCount <= 2500) score += 15;
  else if (wordCount >= 100) score += 10;

  // Açar söz istifadəsi (0-15 xal)
  const keywordsInContent = keywords.filter((k) => content.toLowerCase().includes(k.keyword.toLowerCase())).length;
  score += Math.min(keywordsInContent * 3, 15);

  // Oxunaqlılıq (0-15 xal)
  const readability = calculateReadability(
    content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / content.split(/\s+/).length,
    content.split(/\s+/).length / content.split(/[.!?]+/).length
  );
  if (readability >= 60) score += 15;
  else if (readability >= 40) score += 10;
  else score += 5;

  return Math.round(score);
}

function generateImprovementSuggestions(
  title: string,
  content: string,
  metaTitle: string,
  metaDescription: string,
  score: number,
  locale: Locale
): string[] {
  const suggestions: string[] = [];
  const wordCount = content.split(/\s+/).length;

  const messages: Record<Locale, Record<string, string>> = {
    az: {
      titleShort: "Başlıq çox qısadır. 30-60 simvol arası tövsiyə olunur.",
      titleLong: "Başlıq çox uzundur. 30-60 simvol arası tövsiyə olunur.",
      contentShort: "Məzmun çox qısadır. Ən azı 300 söz yazın.",
      contentLong: "Məzmun çox uzundur. 1500-2000 söz optimal hesab olunur.",
      metaDescShort: "Meta təsvir çox qısadır. 120-155 simvol arası tövsiyə olunur.",
      metaDescLong: "Meta təsvir çox uzundur. 120-155 simvol arası tövsiyə olunur.",
      addKeywords: "Məzmunda daha çox açar söz istifadə edin.",
      improveReadability: "Mətnin oxunaqlılığını artırın - daha qısa cümlələr istifadə edin.",
      addImages: "Məqaləyə şəkil və media əlavə edin.",
      useHeadings: "H2, H3 başlıqları istifadə edərək məzmunu strukturlaşdırın.",
    },
    en: {
      titleShort: "Title is too short. Recommended 30-60 characters.",
      titleLong: "Title is too long. Recommended 30-60 characters.",
      contentShort: "Content is too short. Write at least 300 words.",
      contentLong: "Content is too long. 1500-2000 words is optimal.",
      metaDescShort: "Meta description is too short. Recommended 120-155 characters.",
      metaDescLong: "Meta description is too long. Recommended 120-155 characters.",
      addKeywords: "Use more keywords in your content.",
      improveReadability: "Improve readability - use shorter sentences.",
      addImages: "Add images and media to the article.",
      useHeadings: "Structure content using H2, H3 headings.",
    },
    ru: {
      titleShort: "Заголовок слишком короткий. Рекомендуется 30-60 символов.",
      titleLong: "Заголовок слишком длинный. Рекомендуется 30-60 символов.",
      contentShort: "Контент слишком короткий. Напишите минимум 300 слов.",
      contentLong: "Контент слишком длинный. Оптимально 1500-2000 слов.",
      metaDescShort: "Мета-описание слишком короткое. Рекомендуется 120-155 символов.",
      metaDescLong: "Мета-описание слишком длинное. Рекомендуется 120-155 символов.",
      addKeywords: "Используйте больше ключевых слов в контенте.",
      improveReadability: "Улучшите читаемость - используйте более короткие предложения.",
      addImages: "Добавьте изображения и медиа в статью.",
      useHeadings: "Структурируйте контент используя заголовки H2, H3.",
    },
    tr: {
      titleShort: "Başlık çok kısa. 30-60 karakter önerilir.",
      titleLong: "Başlık çok uzun. 30-60 karakter önerilir.",
      contentShort: "İçerik çok kısa. En az 300 kelime yazın.",
      contentLong: "İçerik çok uzun. 1500-2000 kelime optimal.",
      metaDescShort: "Meta açıklama çok kısa. 120-155 karakter önerilir.",
      metaDescLong: "Meta açıklama çok uzun. 120-155 karakter önerilir.",
      addKeywords: "İçerikte daha fazla anahtar kelime kullanın.",
      improveReadability: "Okunabilirliği artırın - daha kısa cümleler kullanın.",
      addImages: "Makaleye resim ve medya ekleyin.",
      useHeadings: "H2, H3 başlıkları kullanarak içeriği yapılandırın.",
    },
    ar: {
      titleShort: "العنوان قصير جدًا. يوصى بـ 30-60 حرفًا.",
      titleLong: "العنوان طويل جدًا. يوصى بـ 30-60 حرفًا.",
      contentShort: "المحتوى قصير جدًا. اكتب 300 كلمة على الأقل.",
      contentLong: "المحتوى طويل جدًا. 1500-2000 كلمة مثالية.",
      metaDescShort: "الوصف التعريفي قصير جدًا. يوصى بـ 120-155 حرفًا.",
      metaDescLong: "الوصف التعريفي طويل جدًا. يوصى بـ 120-155 حرفًا.",
      addKeywords: "استخدم المزيد من الكلمات الرئيسية في المحتوى.",
      improveReadability: "حسّن القراءة - استخدم جمل أقصر.",
      addImages: "أضف صورًا ووسائط إلى المقال.",
      useHeadings: "قم بتنظيم المحتوى باستخدام عناوين H2 و H3.",
    },
  };

  const msg = messages[locale];

  if (title.length < 30) suggestions.push(msg.titleShort);
  if (title.length > 70) suggestions.push(msg.titleLong);
  if (wordCount < 300) suggestions.push(msg.contentShort);
  if (wordCount > 2500) suggestions.push(msg.contentLong);
  if (metaDescription.length < 120) suggestions.push(msg.metaDescShort);
  if (metaDescription.length > 155) suggestions.push(msg.metaDescLong);
  if (score < 60) suggestions.push(msg.addKeywords);
  if (score < 70) suggestions.push(msg.improveReadability);

  return suggestions;
}
