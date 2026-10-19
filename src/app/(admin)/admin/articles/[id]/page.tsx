"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import ArticleEditor from "@/components/admin/ArticleEditor";
import { Alert, Empty, PageHeader } from "@/components/admin/ui";
import { getCategory } from "@/lib/categories";
import { getArticle } from "@/lib/data/admin";
import type { Article } from "@/lib/types";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getArticle(id)
      .then((found) => {
        if (!cancelled) setArticle(found);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Məqalə oxunmadı.");
          setArticle(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (article === undefined) {
    return (
      <>
        <PageHeader title="Məqalə" />
        <p className="px-10 py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <PageHeader title="Məqalə tapılmadı" />
        <div className="px-6 py-8 lg:px-10">
          {error && (
            <div className="mb-6">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <Empty
            title="Bu məqalə mövcud deyil"
            text="Silinmiş ola bilər. Siyahıya qayıdıb yenidən yoxlayın."
          />
          <div className="mt-6 text-center">
            <Link href="/admin/articles" className="btn-ghost">
              Məqalələrə qayıt
            </Link>
          </div>
        </div>
      </>
    );
  }

  const publicHref = `/az/${article.category}/${article.slug}`;

  return (
    <>
      <PageHeader
        title={article.title.az || article.title.en || "Məqalə"}
        description={`${getCategory(article.category)?.name.az} · /${article.slug}`}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/admin/articles/${id}/media`}
              className="btn-ghost !py-2.5 !text-[11px]"
            >
              🎬 Media Blocks
            </Link>
            <Link
              href={`/admin/articles/${id}/versions`}
              className="btn-ghost !py-2.5 !text-[11px]"
            >
              📚 Versiya tarixçəsi
            </Link>
            {article.status === "published" && (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !py-2.5 !text-[11px]"
              >
                Saytda bax
              </a>
            )}
          </div>
        }
      />
      <ArticleEditor article={article} />
    </>
  );
}
