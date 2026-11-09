/**
 * Məqalənin ana səhifə yerləşdirmələri
 * ArticleEditor-də göstərilir
 * 
 * Developed by Cradex Agency
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticleHomepagePlacements } from "@/lib/data/admin-homepage";
import type { HomepageSectionId, Locale } from "@/lib/types";
import { homepageSectionLabels } from "@/lib/types";
import { Panel, Alert } from "./ui";

type ArticleHomepagePlacementsProps = {
  articleId: string;
  articleStatus: "draft" | "published" | "scheduled";
};

export default function ArticleHomepagePlacements({
  articleId,
  articleStatus,
}: ArticleHomepagePlacementsProps) {
  const [placements, setPlacements] = useState<
    Array<{ sectionId: HomepageSectionId; locale: Locale; position: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlacements();
  }, [articleId]);

  const loadPlacements = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await getArticleHomepagePlacements(articleId);
      setPlacements(data);
    } catch (err) {
      setError("Yerləşdirmələr yüklənmədi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Panel title="Ana səhifədə yerləşdirmə" description="Yüklənir...">
        <div className="py-4 text-center font-ui text-sm text-muted">
          Yüklənir...
        </div>
      </Panel>
    );
  }

  if (articleStatus !== "published") {
    return (
      <Panel
        title="Ana səhifədə yerləşdirmə"
        description="Yalnız dərc olunmuş məqalələr ana səhifədə yerləşdirilə bilər"
      >
        <Alert tone="warning">
          Bu məqalə hələ dərc olunmayıb. Dərc etdikdən sonra ana səhifə bölmələrinə əlavə edə bilərsiniz.
        </Alert>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Ana səhifədə yerləşdirmə" description="Xəta baş verdi">
        <Alert tone="error">{error}</Alert>
      </Panel>
    );
  }

  if (placements.length === 0) {
    return (
      <Panel
        title="Ana səhifədə yerləşdirmə"
        description="Bu məqalə hazırda heç bir ana səhifə bölməsində deyil"
      >
        <div className="rounded-lg border-2 border-dashed border-line bg-bg-soft p-6 text-center">
          <p className="font-ui text-sm text-muted mb-4">
            Bu məqalə heç bir ana səhifə bölməsində yerləşdirilməyib
          </p>
          <Link
            href="/admin/homepage-builder"
            className="inline-flex items-center gap-2 rounded-lg bg-bordo px-4 py-2 font-ui text-sm font-medium text-white hover:bg-bordo-soft transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ana səhifə idarəetməsinə keç
          </Link>
        </div>
      </Panel>
    );
  }

  // Group by language
  const groupedByLocale: Record<Locale, typeof placements> = {
    az: [],
    en: [],
    ru: [],
    tr: [],
    ar: [],
  };

  placements.forEach((p) => {
    groupedByLocale[p.locale].push(p);
  });

  const localeLabels: Record<Locale, string> = {
    az: "Azərbaycan",
    en: "English",
    ru: "Русский",
    tr: "Türkçe",
    ar: "العربية",
  };

  return (
    <Panel
      title="Ana səhifədə yerləşdirmə"
      description={`Bu məqalə ${placements.length} bölmədə yerləşdirilib`}
    >
      <div className="space-y-6">
        {(Object.keys(groupedByLocale) as Locale[]).map((locale) => {
          const localePlacements = groupedByLocale[locale];
          if (localePlacements.length === 0) return null;

          return (
            <div key={locale} className="rounded-lg border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-ui text-sm font-semibold text-ink">
                  {localeLabels[locale]}
                </h4>
                <span className="rounded-full bg-bordo px-2 py-0.5 font-ui text-xs font-medium text-white">
                  {localePlacements.length} bölmə
                </span>
              </div>

              <div className="space-y-2">
                {localePlacements.map((placement) => (
                  <Link
                    key={`${placement.sectionId}-${placement.locale}`}
                    href={`/admin/homepage-builder/${placement.sectionId}?locale=${placement.locale}`}
                    className="flex items-center justify-between rounded-lg border border-line bg-bg-soft p-3 transition-colors hover:border-bordo hover:bg-bordo/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bordo font-ui text-sm font-semibold text-white">
                        {placement.position}
                      </div>
                      <span className="font-ui text-sm text-ink">
                        {homepageSectionLabels[placement.sectionId]}
                      </span>
                    </div>
                    <svg
                      className="h-4 w-4 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-lg bg-bg-soft p-4">
          <Link
            href="/admin/homepage-builder"
            className="flex items-center justify-center gap-2 font-ui text-sm font-medium text-bordo hover:text-bordo-soft transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Ana səhifə idarəetməsinə keç
          </Link>
        </div>
      </div>
    </Panel>
  );
}
