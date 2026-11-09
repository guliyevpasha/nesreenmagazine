/**
 * Sürüklənə bilən məqalə siyahısı (Drag & Drop)
 * Homepage editorial management üçün
 * 
 * Developed by Cradex Agency
 */

"use client";

import { useState } from "react";
import type { HomepageArticleCache, Locale } from "@/lib/types";
import { pick } from "@/lib/types";
import { categoryName } from "@/lib/categories";

type DraggableArticleListProps = {
  articles: HomepageArticleCache[];
  locale: Locale;
  onReorder: (newOrder: HomepageArticleCache[]) => void;
  onRemove: (articleId: string) => void;
  maxItems?: number;
  displayLimit?: number;
};

export default function DraggableArticleList({
  articles,
  locale,
  onReorder,
  onRemove,
  maxItems,
  displayLimit,
}: DraggableArticleListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newArticles = [...articles];
    const [movedArticle] = newArticles.splice(draggedIndex, 1);
    newArticles.splice(dropIndex, 0, movedArticle);

    onReorder(newArticles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mobil üçün alternativ: ox düymələri
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newArticles = [...articles];
    [newArticles[index - 1], newArticles[index]] = [newArticles[index], newArticles[index - 1]];
    onReorder(newArticles);
  };

  const moveDown = (index: number) => {
    if (index === articles.length - 1) return;
    const newArticles = [...articles];
    [newArticles[index], newArticles[index + 1]] = [newArticles[index + 1], newArticles[index]];
    onReorder(newArticles);
  };

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-line bg-bg-soft p-10 text-center">
        <p className="font-ui text-sm text-muted">
          Məqalə seçilməyib. Aşağıda axtarış edib məqalələr əlavə edin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, index) => {
        const title = pick(article.title, locale);
        const category = categoryName(article.category, locale);
        const isBeingDisplayed = !displayLimit || index < displayLimit;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={article.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              group relative rounded-lg border bg-white p-4 transition-all
              ${isDragging ? "opacity-40 scale-95" : "opacity-100"}
              ${isDragOver ? "border-bordo shadow-md" : "border-line"}
              ${!isBeingDisplayed ? "bg-amber-50/50" : ""}
              hover:border-bordo-soft hover:shadow-sm cursor-move
            `}
          >
            {/* Pozisiya nömrəsi */}
            <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-bordo font-ui text-sm font-semibold text-white shadow-sm">
              {index + 1}
            </div>

            {/* Ana səhifədə göstərilmir badge */}
            {!isBeingDisplayed && (
              <div className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-2 py-1 font-ui text-[10px] font-medium text-white shadow-sm">
                Gizli
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Şəkil */}
              {article.coverImage && (
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-line">
                  <img
                    src={article.coverImage}
                    alt={pick(article.coverAlt, locale) || title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Məlumat */}
              <div className="flex-1 min-w-0">
                <h4 className="font-ui text-sm font-medium text-ink line-clamp-2">
                  {title}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded bg-bg px-2 py-0.5 font-ui">{category}</span>
                  {article.subcategory && (
                    <span className="rounded bg-bg px-2 py-0.5 font-ui">
                      {article.subcategory}
                    </span>
                  )}
                  <span>{new Date(article.publishedAt).toLocaleDateString("az-AZ")}</span>
                  <span>•</span>
                  <span>{article.readingMinutes} dəq</span>
                </div>
              </div>

              {/* Əməliyyatlar */}
              <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Ox düymələri - mobil üçün də əlverişli */}
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="rounded bg-bg p-1.5 text-ink-soft hover:bg-bordo-soft hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Yuxarı"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === articles.length - 1}
                  className="rounded bg-bg p-1.5 text-ink-soft hover:bg-bordo-soft hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Aşağı"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onRemove(article.id)}
                  className="rounded bg-bg p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  title="Sil"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Statistika */}
      <div className="rounded-lg bg-bg-soft p-4 font-ui text-xs text-muted">
        <div className="flex items-center justify-between">
          <span>
            <strong className="text-ink">{articles.length}</strong> məqalə seçilib
            {maxItems && ` (maksimum ${maxItems})`}
          </span>
          {displayLimit && displayLimit < articles.length && (
            <span className="text-amber-600">
              Ana səhifədə <strong>{displayLimit}</strong> məqalə göstəriləcək
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
