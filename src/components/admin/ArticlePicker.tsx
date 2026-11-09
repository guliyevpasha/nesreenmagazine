/**
 * Məqalə Seçici (Article Picker)
 * Homepage editorial management üçün məqalə axtarışı və seçimi
 * 
 * Developed by Cradex Agency
 */

"use client";

import { useState, useEffect } from "react";
import { searchPublishedArticles } from "@/lib/data/admin-homepage";
import type { Article, Locale, CategorySlug } from "@/lib/types";
import { pick } from "@/lib/types";
import { categories, categoryName, getSubcategories } from "@/lib/categories";
import { Alert, Button, Field, inputClass } from "./ui";

type ArticlePickerProps = {
  locale: Locale;
  onSelect: (article: Article) => void;
  existingIds: string[];
  categoryFilter?: CategorySlug;
  maxReached?: boolean;
};

export default function ArticlePicker({
  locale,
  onSelect,
  existingIds,
  categoryFilter,
  maxReached,
}: ArticlePickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">(categoryFilter || "");
  const [subcategory, setSubcategory] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || category) {
        handleSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, category, subcategory]);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    
    try {
      const articles = await searchPublishedArticles(query, {
        category: category || undefined,
        subcategory: subcategory || undefined,
        locale,
        limit: 30,
      });
      
      // Artıq seçilmiş məqalələri çıxar
      const filtered = articles.filter(a => !existingIds.includes(a.id));
      setResults(filtered);
      setShowResults(true);
    } catch (err) {
      setError("Axtarış zamanı xəta baş verdi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subcategories = category ? getSubcategories(category) : [];

  return (
    <div className="space-y-4">
      {maxReached && (
        <Alert tone="warning">
          Məqalə limiti dolub. Yeni məqalə əlavə etmək üçün əvvəlcə mövcud məqalələrdən birini silin.
        </Alert>
      )}

      {/* Axtarış və filtrlər */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <Field label="Axtarış">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Başlıq, slug və ya ID..."
              className={inputClass}
              disabled={maxReached}
            />
          </Field>
        </div>

        <div className="md:col-span-4">
          <Field label="Kateqoriya">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as CategorySlug | "");
                setSubcategory("");
              }}
              className={inputClass}
              disabled={maxReached || !!categoryFilter}
            >
              <option value="">Hamısı</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name[locale]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Alt kateqoriya">
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className={inputClass}
              disabled={maxReached || !category || subcategories.length === 0}
            >
              <option value="">Hamısı</option>
              {subcategories.map((sub) => (
                <option key={sub.slug} value={sub.slug}>
                  {sub.name[locale]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {/* Nəticələr */}
      {showResults && (
        <div className="rounded-lg border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <p className="font-ui text-sm font-medium text-ink">
              {loading ? (
                "Axtarılır..."
              ) : (
                <>
                  {results.length} məqalə tapıldı
                  {results.length === 0 && query && " — başqa açar sözlə cəhd edin"}
                </>
              )}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && !loading ? (
              <div className="p-8 text-center">
                <p className="font-ui text-sm text-muted">
                  {query || category
                    ? "Heç bir məqalə tapılmadı"
                    : "Axtarış üçün başlıq daxil edin və ya kateqoriya seçin"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {results.map((article) => {
                  const title = pick(article.title, locale);
                  const excerpt = pick(article.excerpt, locale);
                  const cat = categoryName(article.category, locale);

                  return (
                    <button
                      key={article.id}
                      onClick={() => {
                        if (!maxReached) {
                          onSelect(article);
                          setQuery("");
                          setResults([]);
                          setShowResults(false);
                        }
                      }}
                      disabled={maxReached}
                      className="w-full p-4 text-left transition-colors hover:bg-bg-soft disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        {article.coverImage && (
                          <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded bg-line">
                            <img
                              src={article.coverImage}
                              alt={title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-ui text-sm font-medium text-ink line-clamp-1">
                            {title}
                          </h4>
                          <p className="mt-1 font-ui text-xs text-muted line-clamp-2">
                            {excerpt}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span className="rounded bg-bg px-2 py-0.5">{cat}</span>
                            {article.subcategory && (
                              <span className="rounded bg-bg px-2 py-0.5">
                                {article.subcategory}
                              </span>
                            )}
                            <span>{new Date(article.publishedAt).toLocaleDateString("az-AZ")}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="rounded bg-bordo px-3 py-1.5 font-ui text-xs font-medium text-white">
                            Əlavə et
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
