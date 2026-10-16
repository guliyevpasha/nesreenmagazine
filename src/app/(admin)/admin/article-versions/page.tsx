"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getArticle, listArticleVersions } from "@/lib/data/admin";
import type { Article, ArticleVersion } from "@/lib/types";
import {
  Alert,
  Button,
  Empty,
  PageHeader,
} from "@/components/admin/ui";

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("az-AZ", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

/* ── Snapshot diff ───────────────────────────────────────────────────────── */
function SnapshotView({ snapshot }: { snapshot: string }) {
  const [open, setOpen] = useState(false);
  let parsed: unknown;
  try { parsed = JSON.parse(snapshot); } catch { parsed = snapshot; }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted hover:text-ink"
      >
        {open ? "▲ Snapshot-u gizlət" : "▼ Snapshot-u göstər"}
      </button>
      {open && (
        <pre className="mt-2 overflow-x-auto border border-line bg-cream-deep p-3 font-mono text-[11px] text-muted max-h-60">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function ArticleVersionsPage() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");

  const [article, setArticle] = useState<Article | null>(null);
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    (async () => {
      try {
        const [art, vers] = await Promise.all([
          getArticle(articleId),
          listArticleVersions(articleId),
        ]);
        setArticle(art);
        setVersions(vers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklənmə xətası");
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId]);

  return (
    <>
      <PageHeader
        title="Versiya Tarixçəsi"
        description={
          article
            ? `${article.title.az || article.slug} — ${versions.length} versiya`
            : "Məqalənin bütün versiyaları."
        }
        actions={
          article && (
            <Link href={`/admin/articles/${article.id}`}>
              <Button variant="ghost">← Məqaləyə qayıt</Button>
            </Link>
          )
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        {!articleId && (
          <Alert tone="info">
            Versiya tarixçəsini görmək üçün məqalə redaktorundan bu səhifəyə keçin.
          </Alert>
        )}

        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {!loading && articleId && versions.length === 0 && (
          <Empty
            title="Versiya tapılmadı"
            text="Bu məqalə hələ versiyalanmayıb. Növbəti saxlamada versiya yaradılacaq."
          />
        )}

        {!loading && versions.map((v) => (
          <div key={v.id} className="border border-line bg-paper p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="border border-bordo/30 bg-bordo/5 px-2 py-0.5 font-ui text-[11px] font-bold text-bordo">
                    v{v.version}
                  </span>
                  <p className="font-ui text-[13px] font-medium text-ink">{v.summary || "Dəyişiklik"}</p>
                </div>
                <p className="mt-1 font-ui text-[11px] text-muted">
                  👤 {v.createdBy} · {fmtDateTime(v.createdAt)}
                </p>
              </div>
            </div>
            <SnapshotView snapshot={v.snapshot} />
          </div>
        ))}
      </div>
    </>
  );
}
