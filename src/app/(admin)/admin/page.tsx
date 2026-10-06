"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, Empty, PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { categories } from "@/lib/categories";
import { countSubscribers, listArticles, listMessages } from "@/lib/data/admin";
import { useAuth } from "@/lib/firebase/auth";
import { formatDate } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";

type Stats = {
  articles: Article[];
  messages: number;
  subscribers: number;
};

export default function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [articles, messages, subscribers] = await Promise.all([
          listArticles(),
          listMessages().then((list) => list.length).catch(() => 0),
          countSubscribers().catch(() => 0),
        ]);
        if (!cancelled) setStats({ articles, messages, subscribers });
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Məlumat oxunmadı.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const articles = stats?.articles ?? [];
  const published = articles.filter((article) => article.status === "published").length;
  const drafts = articles.length - published;

  const tiles = [
    { label: "Dərc olunmuş", value: published },
    { label: "Qaralama", value: drafts },
    { label: "Yeni mesaj", value: stats?.messages ?? 0 },
    { label: "Məktub abunəsi", value: stats?.subscribers ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title="Salam, Nesrin Abbasova"
        description="Sizi yenidən görmək xoşdur!"
      />

      <div className="space-y-6 px-6 py-8 lg:px-10">
        {error && <Alert tone="error">{error}</Alert>}

        {/* Rəqəmlər */}
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-paper px-6 py-7">
              <p className="eyebrow text-muted">{tile.label}</p>
              <p className="mt-3 font-display text-4xl text-ink">
                {stats ? tile.value : "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Bölmələr */}
          <div className="lg:col-span-5">
            <Panel title="Bölmələr" description="Hər bölmədəki məqalə sayı.">
              <ul className="divide-y divide-line">
                {categories.map((category) => {
                  const count = articles.filter(
                    (article) => article.category === category.slug,
                  ).length;
                  return (
                    <li key={category.slug}>
                      <Link
                        href={`/admin/articles?category=${category.slug}`}
                        className="flex items-center justify-between py-3.5 transition-colors hover:text-bordo"
                      >
                        <span className="font-display text-lg">{category.name.az}</span>
                        <span className="font-ui text-[13px] text-muted">
                          {stats ? `${count} məqalə` : "—"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link href="/admin/articles/new" className="btn-primary mt-6 w-full">
                Yeni məqalə
              </Link>
            </Panel>
          </div>

          {/* Son məqalələr */}
          <div className="lg:col-span-7">
            <Panel title="Son məqalələr">
              {!stats ? (
                <p className="py-8 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : articles.length === 0 ? (
                <Empty
                  title="Hələ məqalə yoxdur"
                  text="Firestore boşdursa, terminalda «npm run seed» əmri ilə hazır 15 məqaləni bazaya köçürə bilərsiniz."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {articles.slice(0, 8).map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="flex items-start gap-4 py-3.5 transition-colors hover:text-bordo"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="clamp-2 font-display text-[1.0625rem] leading-snug">
                            {article.title.az || article.title.en || article.slug}
                          </p>
                          <p className="mt-1 font-ui text-[11.5px] text-muted">
                            {categories.find((c) => c.slug === article.category)?.name.az} ·{" "}
                            {formatDate(article.publishedAt, "az")}
                          </p>
                        </div>
                        <StatusPill status={article.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
