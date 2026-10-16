"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, Empty, PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { categories } from "@/lib/categories";
import {
  countSubscribers,
  createSmartAlerts,
  listAdOrders,
  listArticles,
  listContentPlan,
  listCrmClients,
  listMessages,
} from "@/lib/data/admin";
import { useAuth } from "@/lib/firebase/auth";
import { formatDate } from "@/lib/i18n/config";
import type { AdOrder, Article, ContentPlanItem, CrmClient } from "@/lib/types";
import { dealStageLabels, contentPlanStatusLabels, paymentStatusLabels } from "@/lib/types";

type Stats = {
  articles: Article[];
  messages: number;
  subscribers: number;
  crmClients: CrmClient[];
  adOrders: AdOrder[];
  contentPlan: ContentPlanItem[];
};

/* ── kiçik köməkçilər ────────────────────────────────────────────────────── */
function isOverdueOrder(order: AdOrder): boolean {
  if (order.paymentStatus === "paid" || order.paymentStatus === "cancelled") return false;
  if (!order.endsAt) return false;
  return new Date(order.endsAt) < new Date();
}

function isOverduePlan(item: ContentPlanItem): boolean {
  if (item.status === "published") return false;
  if (!item.dueDate) return false;
  return new Date(item.dueDate) < new Date();
}

export default function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [articles, messages, subscribers, crmClients, adOrders, contentPlan] =
          await Promise.all([
            listArticles(),
            listMessages().then((list) => list.length).catch(() => 0),
            countSubscribers().catch(() => 0),
            listCrmClients().catch(() => [] as CrmClient[]),
            listAdOrders().catch(() => [] as AdOrder[]),
            listContentPlan().catch(() => [] as ContentPlanItem[]),
          ]);
        if (!cancelled)
          setStats({ articles, messages, subscribers, crmClients, adOrders, contentPlan });

        // Smart alerts — gecikmiş sifarişlər və tapşırıqlar üçün avtomatik bildirişlər yarat
        createSmartAlerts().catch((err) => {
          console.warn("[dashboard] Smart alerts failed:", err);
        });
      } catch (caught) {
        if (!cancelled)
          setError(caught instanceof Error ? caught.message : "Məlumat oxunmadı.");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const articles = stats?.articles ?? [];
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.length - published;

  /* CRM göstəriciləri */
  const clients = stats?.crmClients ?? [];
  const activeClients = clients.filter((c) => !["won", "lost"].includes(c.stage)).length;
  const wonClients = clients.filter((c) => c.stage === "won").length;

  /* Reklam sifarişləri göstəriciləri */
  const orders = stats?.adOrders ?? [];
  const totalRevenue = orders.reduce((s, o) => s + o.paidAmount, 0);
  const totalDebt = orders.reduce((s, o) => s + Math.max(0, o.price - o.paidAmount), 0);
  const overdueOrders = orders.filter(isOverdueOrder).length;
  const activeOrders = orders.filter(
    (o) => o.paymentStatus !== "cancelled" && (!o.endsAt || new Date(o.endsAt) >= new Date()),
  ).length;

  /* Kontent planı göstəriciləri */
  const plan = stats?.contentPlan ?? [];
  const overduePlan = plan.filter(isOverduePlan).length;
  const readyPlan = plan.filter((i) => i.status === "ready").length;

  /* Yuxarı KPI cərgəsi */
  const topTiles = [
    { label: "Dərc olunmuş", value: published, href: "/admin/articles" },
    { label: "Qaralama", value: drafts, href: "/admin/articles" },
    { label: "Yeni mesaj", value: stats?.messages ?? 0, href: "/admin/messages" },
    { label: "Abunəçi", value: stats?.subscribers ?? 0, href: "/admin/subscribers" },
  ];

  /* CRM + gəlir cərgəsi */
  const crmTiles = [
    { label: "CRM müştəri", value: clients.length, href: "/admin/crm", color: "text-ink" },
    { label: "Aktiv müştəri", value: activeClients, href: "/admin/crm", color: "text-ink" },
    { label: "Aktiv kampaniya", value: activeOrders, href: "/admin/ad-orders", color: "text-ink" },
    { label: "Ödənilib", value: `${totalRevenue} ₼`, href: "/admin/ad-orders", color: "text-green-600" },
    { label: "Borc", value: `${totalDebt} ₼`, href: "/admin/ad-orders", color: totalDebt > 0 ? "text-bordo" : "text-ink" },
    { label: "Gecikmiş ödəniş", value: overdueOrders, href: "/admin/ad-orders", color: overdueOrders > 0 ? "text-red-600" : "text-ink" },
  ];

  return (
    <>
      <PageHeader
        title={`Salam, ${session?.name ?? "Nesrin Abbasova"}`}
        description="Sizi yenidən görmək xoşdur!"
      />

      <div className="space-y-8 px-6 py-8 lg:px-10">
        {error && <Alert tone="error">{error}</Alert>}

        {/* Əsas KPI kartları */}
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {topTiles.map((tile) => (
            <Link key={tile.label} href={tile.href} className="group bg-paper px-6 py-7 hover:bg-cream-deep transition-colors">
              <p className="eyebrow text-muted">{tile.label}</p>
              <p className="mt-3 font-display text-4xl text-ink group-hover:text-bordo transition-colors">
                {stats ? tile.value : "—"}
              </p>
            </Link>
          ))}
        </div>

        {/* Xəbərdarlıqlar */}
        {stats && (overdueOrders > 0 || overduePlan > 0) && (
          <div className="space-y-2">
            {overdueOrders > 0 && (
              <Alert tone="error">
                ⚠️ <Link href="/admin/ad-orders" className="underline font-semibold">{overdueOrders} reklam sifarişinin</Link> ödəniş müddəti keçib.
              </Alert>
            )}
            {overduePlan > 0 && (
              <Alert tone="error">
                ⚠️ <Link href="/admin/content-plan" className="underline font-semibold">{overduePlan} kontent tapşırığının</Link> son tarixi keçib.
              </Alert>
            )}
          </div>
        )}

        {/* CRM + Gəlir kartları */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-muted">CRM və Gəlir</p>
            <Link href="/admin/crm" className="font-ui text-[11px] text-bordo hover:underline uppercase tracking-[0.12em]">
              CRM-ə keç →
            </Link>
          </div>
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {crmTiles.map((tile) => (
              <Link key={tile.label} href={tile.href} className="group bg-paper px-5 py-5 hover:bg-cream-deep transition-colors">
                <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{tile.label}</p>
                <p className={`mt-2 font-display text-2xl ${tile.color} group-hover:opacity-80 transition-opacity`}>
                  {stats ? tile.value : "—"}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Kontent planı xülasəsi */}
        {stats && plan.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-muted">Kontent Planı</p>
              <Link href="/admin/content-plan" className="font-ui text-[11px] text-bordo hover:underline uppercase tracking-[0.12em]">
                Plana keç →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-line bg-paper px-5 py-4">
                <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">Ümumi tapşırıq</p>
                <p className="mt-1 font-display text-3xl text-ink">{plan.length}</p>
              </div>
              <div className="border border-line bg-paper px-5 py-4">
                <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">Hazır / Dərc</p>
                <p className="mt-1 font-display text-3xl text-green-600">{readyPlan}</p>
              </div>
              <div className={`border bg-paper px-5 py-4 ${overduePlan > 0 ? "border-red-300 bg-red-50/30" : "border-line"}`}>
                <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">Gecikmiş</p>
                <p className={`mt-1 font-display text-3xl ${overduePlan > 0 ? "text-red-600" : "text-ink"}`}>{overduePlan}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Bölmələr */}
          <div className="lg:col-span-5">
            <Panel title="Bölmələr" description="Hər bölmədəki məqalə sayı.">
              <ul className="divide-y divide-line">
                {categories.map((category) => {
                  const count = articles.filter((a) => a.category === category.slug).length;
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

          {/* Son məqalələr + son CRM müştəriləri */}
          <div className="lg:col-span-7 space-y-6">
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
                  {articles.slice(0, 6).map((article) => (
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

            {/* Son CRM müştəriləri */}
            {stats && clients.length > 0 && (
              <Panel title="Son CRM müştəriləri">
                <ul className="divide-y divide-line">
                  {clients.slice(0, 5).map((client) => (
                    <li key={client.id}>
                      <Link
                        href={`/admin/crm/${client.id}`}
                        className="flex items-center justify-between py-3 transition-colors hover:text-bordo"
                      >
                        <div>
                          <p className="font-display text-[15px]">{client.name}</p>
                          {client.contactPerson && (
                            <p className="font-ui text-[11px] text-muted">{client.contactPerson}</p>
                          )}
                        </div>
                        <span className="font-ui text-[11px] text-muted">
                          {dealStageLabels[client.stage]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/admin/crm" className="mt-4 block font-ui text-[11px] uppercase tracking-[0.14em] text-bordo hover:underline">
                  Bütün müştərilərə bax →
                </Link>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
