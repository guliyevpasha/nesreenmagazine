/**
 * Ana səhifə bölməsinin redaktəsi
 * Drag-and-drop ilə məqalə sıralama
 * 
 * Developed by Cradex Agency
 */

"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { PageHeader, Alert, Button, LocaleTabs, Panel } from "@/components/admin/ui";
import DraggableArticleList from "@/components/admin/DraggableArticleList";
import ArticlePicker from "@/components/admin/ArticlePicker";
import { useAuth } from "@/lib/firebase/auth";
import type {
  HomepageSectionId,
  HomepageSectionData,
  HomepageArticleCache,
  Locale,
  Article,
} from "@/lib/types";
import {
  homepageSectionLabels,
  homepageSectionLimits,
  articleToCache,
} from "@/lib/types";
import {
  fetchHomepageSection,
  saveHomepageSection,
  revalidateHomepageCache,
} from "@/lib/data/admin-homepage";

export default function HomepageSectionEditorPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId: rawSectionId } = use(params);
  const sectionId = rawSectionId as HomepageSectionId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const [locale, setLocale] = useState<Locale>(
    (searchParams.get("locale") as Locale) || "az"
  );
  const [data, setData] = useState<HomepageSectionData | null>(null);
  const [articles, setArticles] = useState<HomepageArticleCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const limits = homepageSectionLimits[sectionId];
  const sectionLabel = homepageSectionLabels[sectionId];

  // Load section data
  useEffect(() => {
    loadSection();
  }, [sectionId, locale]);

  const loadSection = async () => {
    setLoading(true);
    setError("");
    
    try {
      const sectionData = await fetchHomepageSection(sectionId, locale);
      setData(sectionData);
      setArticles(sectionData?.articles || []);
      setHasChanges(false);
    } catch (err) {
      setError("Məlumatlar yüklənmədi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newOrder: HomepageArticleCache[]) => {
    setArticles(newOrder);
    setHasChanges(true);
    setSuccess("");
  };

  const handleRemove = (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    setHasChanges(true);
    setSuccess("");
  };

  const handleAddArticle = (article: Article) => {
    // Check if already exists
    if (articles.some((a) => a.id === article.id)) {
      setError("Bu məqalə artıq seçilib");
      return;
    }

    // Check limit
    if (articles.length >= limits.manage) {
      setError(`Maksimum ${limits.manage} məqalə əlavə edə bilərsiniz`);
      return;
    }

    const cached = articleToCache(article);
    setArticles((prev) => [...prev, cached]);
    setHasChanges(true);
    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    if (!session) {
      setError("Giriş tələb olunur");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const articleIds = articles.map((a) => a.id);

      await saveHomepageSection({
        sectionId,
        locale,
        articleIds,
        updatedBy: session.uid,
        updatedByName: session.name,
        updatedAt: new Date().toISOString(),
        version: (data?.updatedAt ? 1 : 0), // Will be incremented by API
      });

      // Revalidate homepage cache
      await revalidateHomepageCache(locale);

      setSuccess("Dəyişikliklər uğurla saxlanıldı və ana səhifə yeniləndi");
      setHasChanges(false);

      // Reload to get updated data
      await loadSection();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlama zamanı xəta baş verdi");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm("Dəyişikliklər yadda saxlanılmayıb. Çıxmaq istədiyinizdən əminsiniz?")) {
        return;
      }
    }
    router.push("/admin/homepage-builder");
  };

  // Check permissions
  if (session && !["admin", "editor"].includes(session.role)) {
    return (
      <>
        <PageHeader title="Giriş məhdudlaşdırılıb" />
        <div className="px-6 py-8 lg:px-10">
          <Alert tone="error">
            Bu səhifəyə giriş yalnız admin və editor rolları üçündür.
          </Alert>
          <div className="mt-6">
            <Link href="/admin" className="btn-ghost">
              İdarə panelinə qayıt
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={sectionLabel}
        description={`${locale.toUpperCase()} | ${limits.manage} məqalə idarə, ${limits.display} göstərilir`}
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="ghost">
              Ləğv et
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges || loading}
            >
              {saving ? "Saxlanılır..." : "Saxla"}
            </Button>
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {/* Language selector */}
        <div className="flex items-center justify-between">
          <LocaleTabs active={locale} onChange={setLocale} />
          
          {hasChanges && (
            <div className="rounded-full bg-amber-100 px-4 py-1.5 font-ui text-xs font-medium text-amber-800">
              Saxlanmamış dəyişikliklər var
            </div>
          )}
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {loading ? (
          <div className="rounded-lg border border-line bg-white p-12 text-center">
            <p className="font-ui text-sm text-muted">Yüklənir...</p>
          </div>
        ) : (
          <>
            {/* Current articles */}
            <Panel
              title="Seçilmiş məqalələr"
              description={`Drag-and-drop ilə sıralamaq üçün məqaləni tutub sürükləyin. ${articles.length}/${limits.manage} məqalə seçilib.`}
            >
              <DraggableArticleList
                articles={articles}
                locale={locale}
                onReorder={handleReorder}
                onRemove={handleRemove}
                maxItems={limits.manage}
                displayLimit={limits.display}
              />
            </Panel>

            {/* Article picker */}
            <Panel
              title="Məqalə əlavə et"
              description="Dərc olunmuş məqalələrdən axtarış edib seçin"
            >
              <ArticlePicker
                locale={locale}
                onSelect={handleAddArticle}
                existingIds={articles.map((a) => a.id)}
                maxReached={articles.length >= limits.manage}
              />
            </Panel>
          </>
        )}
      </div>
    </>
  );
}
