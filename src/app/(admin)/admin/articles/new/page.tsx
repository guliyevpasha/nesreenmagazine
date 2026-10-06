"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import ImageUpload from "@/components/admin/ImageUpload";
import { createArticle, type Article, type LocalizedText } from "@/lib/firebase/articles";
import { categories } from "@/lib/categories";
import { PageHeader } from "@/components/admin/ui";

const LANGUAGES = [
  { code: "az", name: "Azərbaycan" },
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "tr", name: "Türkçe" },
  { code: "ar", name: "العربية" },
] as const;

type LanguageCode = "az" | "en" | "ru" | "tr" | "ar";

const IMAGE_REQUIREMENTS = {
  hero: "1200x675px (16:9) - Hero Carousel üçün",
  grid: "800x600px (4:3) - Grid görünüş",
  compact: "600x400px (3:2) - Kompakt kart",
  thumbnail: "400x300px (4:3) - Kiçik şəkil",
};

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("az");
  
  // Form state
  const [title, setTitle] = useState<LocalizedText>({ az: "", en: "", ru: "", tr: "", ar: "" });
  const [slug, setSlug] = useState<LocalizedText>({ az: "", en: "", ru: "", tr: "", ar: "" });
  const [excerpt, setExcerpt] = useState<LocalizedText>({ az: "", en: "", ru: "", tr: "", ar: "" });
  const [content, setContent] = useState<LocalizedText>({ az: "", en: "", ru: "", tr: "", ar: "" });
  
  const [coverImage, setCoverImage] = useState<{
    url: string;
    width: number;
    height: number;
    storagePath: string;
  } | null>(null);
  
  const [category, setCategory] = useState<string>("gundem");
  const [subcategory, setSubcategory] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [publishDate, setPublishDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  
  const [isHero, setIsHero] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  const selectedCategory = categories.find((cat) => cat.slug === category);
  const subcategories = selectedCategory?.subcategories || [];

  // Auto-generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9ə-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (lang: LanguageCode, value: string) => {
    setTitle({ ...title, [lang]: value });
    
    // Auto-generate slug for the same language
    if (value && !slug[lang]) {
      setSlug({ ...slug, [lang]: generateSlug(value) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!title.az.trim()) {
        throw new Error("Azərbaycan dilində başlıq tələb olunur");
      }
      
      if (!slug.az.trim()) {
        throw new Error("Azərbaycan dilində slug tələb olunur");
      }
      
      if (!content.az.trim()) {
        throw new Error("Azərbaycan dilində məzmun tələb olunur");
      }
      
      if (!coverImage) {
        throw new Error("Cover şəkli tələb olunur");
      }

      // Calculate reading time (words per minute)
      const wordCount = content.az.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

      const article: Omit<Article, "id"> = {
        slug,
        title,
        excerpt,
        content,
        coverImage: {
          url: coverImage.url,
          alt: title.az,
          width: coverImage.width,
          height: coverImage.height,
          storagePath: coverImage.storagePath,
        },
        category,
        subcategory: subcategory || null,
        author: {
          id: "current-user",
          name: "Admin",
          avatar: "",
        },
        publishedAt: new Date(publishDate),
        updatedAt: new Date(),
        status,
        featured: {
          isHero,
          isTrending,
          isFeatured,
        },
        seo: {
          metaTitle: metaTitle || title.az,
          metaDescription: metaDescription || excerpt.az,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        },
        views: 0,
        readingTime,
      };

      const articleId = await createArticle(article);
      
      // Redirect to article edit page
      router.push(`/admin/articles/${articleId}`);
    } catch (err) {
      console.error("Error creating article:", err);
      setError(err instanceof Error ? err.message : "Məqalə yaradıla bilmədi");
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Yeni Məqalə"
        description="5 dildə məqalə əlavə edin"
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8 p-8">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Language Tabs */}
        <div className="flex gap-2 border-b border-line">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLanguage(lang.code)}
              className={`px-4 py-2 font-ui text-sm transition-colors ${
                activeLanguage === lang.code
                  ? "border-b-2 border-bordo text-bordo"
                  : "text-muted hover:text-ink"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Localized Fields */}
        <div className="space-y-6 rounded-lg border border-line bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Başlıq ({LANGUAGES.find((l) => l.code === activeLanguage)?.name})
              {activeLanguage === "az" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={title[activeLanguage]}
              onChange={(e) => handleTitleChange(activeLanguage, e.target.value)}
              className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              placeholder="Məqalə başlığı..."
              required={activeLanguage === "az"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Slug ({LANGUAGES.find((l) => l.code === activeLanguage)?.name})
              {activeLanguage === "az" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={slug[activeLanguage]}
              onChange={(e) =>
                setSlug({ ...slug, [activeLanguage]: e.target.value })
              }
              className="w-full rounded border border-line px-4 py-2 font-mono text-sm focus:border-bordo focus:outline-none"
              placeholder="meqale-slug-url"
              required={activeLanguage === "az"}
            />
            <p className="mt-1 text-xs text-muted">
              URL-də görünəcək (məs: nesreenmagazine.com/az/moda/{slug[activeLanguage] || "slug"})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Qısa məzmun ({LANGUAGES.find((l) => l.code === activeLanguage)?.name})
            </label>
            <textarea
              value={excerpt[activeLanguage]}
              onChange={(e) =>
                setExcerpt({ ...excerpt, [activeLanguage]: e.target.value })
              }
              rows={3}
              className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              placeholder="Məqalənin qısa təsviri (ana səhifədə göstəriləcək)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Məzmun ({LANGUAGES.find((l) => l.code === activeLanguage)?.name})
              {activeLanguage === "az" && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={content[activeLanguage]}
              onChange={(e) =>
                setContent({ ...content, [activeLanguage]: e.target.value })
              }
              rows={15}
              className="w-full rounded border border-line px-4 py-2 font-mono text-sm focus:border-bordo focus:outline-none"
              placeholder="Məqalənin tam mətni (HTML istifadə edə bilərsiniz)..."
              required={activeLanguage === "az"}
            />
            <p className="mt-1 text-xs text-muted">
              HTML istifadə edə bilərsiniz: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;ol&gt;
            </p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded-lg border border-line bg-white p-6">
          <h3 className="text-lg font-medium text-ink mb-4">
            Cover Şəkil <span className="text-red-500">*</span>
          </h3>
          
          <div className="mb-4 space-y-2 rounded-lg bg-cream-deep p-4 text-sm">
            <p className="font-medium text-ink">📐 Tövsiyə olunan ölçülər:</p>
            {Object.entries(IMAGE_REQUIREMENTS).map(([key, value]) => (
              <p key={key} className="text-muted">• {value}</p>
            ))}
          </div>

          <ImageUpload
            onUpload={(url, width, height, storagePath) => {
              setCoverImage({ url, width, height, storagePath });
            }}
            currentImage={coverImage?.url}
            folder="articles"
            recommendedSize="1200x675px"
            maxSizeMB={5}
          />
        </div>

        {/* Category & Settings */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-6 space-y-4">
            <h3 className="text-lg font-medium text-ink">Kateqoriya</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Əsas kateqoriya <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
                className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name.az}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Alt kateqoriya
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
                >
                  <option value="">Seçilməyib</option>
                  {subcategories.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name.az}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-line bg-white p-6 space-y-4">
            <h3 className="text-lg font-medium text-ink">Status & Tarix</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              >
                <option value="draft">Qaralama</option>
                <option value="published">Dərc edilmiş</option>
                <option value="scheduled">Planlaşdırılmış</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Dərc tarixi
              </label>
              <input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Featured Options */}
        <div className="rounded-lg border border-line bg-white p-6">
          <h3 className="text-lg font-medium text-ink mb-4">Ana Səhifədə Göstərilsin?</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHero}
                onChange={(e) => setIsHero(e.target.checked)}
                className="h-5 w-5 rounded border-line text-bordo focus:ring-bordo"
              />
              <div>
                <p className="font-medium text-ink">Bu həftənin baş mövzusu (Hero Carousel)</p>
                <p className="text-sm text-muted">Ana səhifə üst hissədə böyük slayderə əlavə ediləcək</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="h-5 w-5 rounded border-line text-bordo focus:ring-bordo"
              />
              <div>
                <p className="font-medium text-ink">Çox oxunanlar</p>
                <p className="text-sm text-muted">Sağ sidebar "Çox oxunanlar" bölməsinə əlavə ediləcək</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-5 w-5 rounded border-line text-bordo focus:ring-bordo"
              />
              <div>
                <p className="font-medium text-ink">Seçilmiş məqalə</p>
                <p className="text-sm text-muted">Ana səhifədə vurğulanacaq</p>
              </div>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-lg border border-line bg-white p-6 space-y-4">
          <h3 className="text-lg font-medium text-ink">SEO (Axtarış Motorları)</h3>
          
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Meta Başlıq
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              placeholder="Boş qoyulsarsa, məqalə başlığı istifadə ediləcək"
              maxLength={60}
            />
            <p className="mt-1 text-xs text-muted">
              {metaTitle.length}/60 simvol (Google-da görünəcək)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Meta Təsvir
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              placeholder="Boş qoyulsarsa, qısa məzmun istifadə ediləcək"
              maxLength={160}
            />
            <p className="mt-1 text-xs text-muted">
              {metaDescription.length}/160 simvol
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Açar sözlər
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded border border-line px-4 py-2 focus:border-bordo focus:outline-none"
              placeholder="moda, gözəllik, trend, 2024"
            />
            <p className="mt-1 text-xs text-muted">
              Vergüllə ayırın (məs: moda, gözəllik, trend)
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost"
            disabled={loading}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Yüklənir..." : "Məqaləni yarat"}
          </button>
        </div>
      </form>
    </>
  );
}
