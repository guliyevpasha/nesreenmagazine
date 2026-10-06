"use client";

import { useState, useEffect } from "react";
import { generateSEORecommendations, type SEORecommendation } from "@/lib/seo/recommendations";
import type { Locale } from "@/lib/i18n/config";
import { Alert, Panel, Button } from "./ui";

interface SEOAssistantProps {
  title: string;
  content: string;
  category: string;
  locale: Locale;
  existingKeywords?: string[];
  existingTags?: string[];
  onApplyKeywords: (keywords: string[]) => void;
  onApplyTags: (tags: string[]) => void;
  onApplyMeta: (title: string, description: string) => void;
}

export default function SEOAssistant({
  title,
  content,
  category,
  locale,
  existingKeywords = [],
  existingTags = [],
  onApplyKeywords,
  onApplyTags,
  onApplyMeta,
}: SEOAssistantProps) {
  const [recommendations, setRecommendations] = useState<SEORecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  async function analyze() {
    if (!title.trim() || !content.trim()) {
      setError("Analiz üçün başlıq və məzmun lazımdır");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await generateSEORecommendations(
        title,
        content,
        category,
        locale,
        existingKeywords,
        existingTags
      );
      setRecommendations(result);
      setSelectedKeywords([]);
      setSelectedTags([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-analyze when title/content changes (debounced)
    const timer = setTimeout(() => {
      if (title && content) {
        analyze();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, category, locale]);

  function toggleKeyword(keyword: string) {
    setSelectedKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function applySelected() {
    if (selectedKeywords.length > 0) {
      onApplyKeywords([...existingKeywords, ...selectedKeywords]);
    }
    if (selectedTags.length > 0) {
      onApplyTags([...existingTags, ...selectedTags]);
    }
    if (recommendations) {
      onApplyMeta(recommendations.metaTitle, recommendations.metaDescription);
    }
    setSelectedKeywords([]);
    setSelectedTags([]);
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-yellow-700";
    return "text-red-700";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 border-green-300";
    if (score >= 60) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  return (
    <Panel
      title="SEO Köməkçisi"
      description="AI əsasında açar söz, etiket və meta məlumat tövsiyələri"
    >
      <div className="space-y-5">
        {/* Analiz düyməsi */}
        <div className="flex items-center gap-3">
          <Button onClick={analyze} disabled={loading || !title || !content}>
            {loading ? "Analiz edilir..." : "Yenidən analiz et"}
          </Button>
          {recommendations && (
            <div
              className={`flex items-center gap-2 border px-4 py-2 ${getScoreBg(recommendations.score)}`}
            >
              <span className="font-ui text-[11px] uppercase tracking-wide text-muted">
                SEO Xalı
              </span>
              <span className={`font-display text-[1.5rem] ${getScoreColor(recommendations.score)}`}>
                {recommendations.score}/100
              </span>
            </div>
          )}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {recommendations && (
          <>
            {/* Təkmilləşdirmə təklifləri */}
            {recommendations.suggestions.length > 0 && (
              <div className="border border-gold/30 bg-gold/5 p-4">
                <h4 className="mb-2 font-ui text-[12px] uppercase tracking-wide text-ink">
                  Təkmilləşdirmə təklifləri
                </h4>
                <ul className="space-y-1.5">
                  {recommendations.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-2 font-ui text-[13px] text-ink-soft">
                      <span className="text-gold">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tövsiyə edilən açar sözlər */}
            <div>
              <h4 className="mb-3 font-ui text-[12px] uppercase tracking-wide text-muted">
                Tövsiyə edilən açar sözlər
                {selectedKeywords.length > 0 && (
                  <span className="ml-2 text-bordo">({selectedKeywords.length} seçilib)</span>
                )}
              </h4>
              <div className="space-y-2">
                {recommendations.keywords.slice(0, 10).map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex cursor-pointer items-center justify-between border p-3 transition-colors ${
                      selectedKeywords.includes(item.keyword)
                        ? "border-bordo bg-bordo/5"
                        : "border-line hover:border-bordo/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedKeywords.includes(item.keyword)}
                        onChange={() => toggleKeyword(item.keyword)}
                        className="h-4 w-4 accent-bordo"
                      />
                      <div>
                        <p className="font-ui text-[13px] text-ink">{item.keyword}</p>
                        <p className="mt-0.5 font-ui text-[11px] text-muted">
                          Axtarış: {item.searchVolume.toLocaleString()} · Rəqabət:{" "}
                          {item.competition === "low"
                            ? "Aşağı"
                            : item.competition === "medium"
                            ? "Orta"
                            : "Yüksək"}{" "}
                          · Uyğunluq: {Math.round(item.relevance * 100)}%
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tövsiyə edilən etiketlər */}
            <div>
              <h4 className="mb-3 font-ui text-[12px] uppercase tracking-wide text-muted">
                Tövsiyə edilən etiketlər
                {selectedTags.length > 0 && (
                  <span className="ml-2 text-bordo">({selectedTags.length} seçilib)</span>
                )}
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.tags.slice(0, 12).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTag(item.tag)}
                    className={`border px-3 py-1.5 font-ui text-[12px] transition-colors ${
                      selectedTags.includes(item.tag)
                        ? "border-bordo bg-bordo text-cream"
                        : "border-line bg-paper text-ink hover:border-bordo"
                    }`}
                  >
                    {item.tag}
                    <span className="ml-1.5 opacity-60">
                      ({item.performance === "excellent" ? "⭐" : item.performance === "good" ? "✓" : "○"})
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 font-ui text-[11px] text-muted">
                ⭐ = Əla performans · ✓ = Yaxşı performans · ○ = Orta performans
              </p>
            </div>

            {/* Meta məlumatlar */}
            <div className="border-t border-line pt-5">
              <h4 className="mb-3 font-ui text-[12px] uppercase tracking-wide text-muted">
                Tövsiyə edilən Meta məlumatlar
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block font-ui text-[11px] text-muted">Meta Title</label>
                  <input
                    type="text"
                    value={recommendations.metaTitle}
                    readOnly
                    className="w-full border border-line bg-cream-deep px-3 py-2 font-ui text-[13px] text-ink"
                  />
                  <p className="mt-1 font-ui text-[10px] text-muted">
                    {recommendations.metaTitle.length} simvol
                  </p>
                </div>
                <div>
                  <label className="mb-1 block font-ui text-[11px] text-muted">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={recommendations.metaDescription}
                    readOnly
                    className="w-full resize-none border border-line bg-cream-deep px-3 py-2 font-ui text-[13px] text-ink"
                  />
                  <p className="mt-1 font-ui text-[10px] text-muted">
                    {recommendations.metaDescription.length} simvol
                  </p>
                </div>
              </div>
            </div>

            {/* Tətbiq düyməsi */}
            {(selectedKeywords.length > 0 || selectedTags.length > 0) && (
              <Button onClick={applySelected} className="w-full">
                Seçilənləri tətbiq et ({selectedKeywords.length + selectedTags.length} element)
              </Button>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
