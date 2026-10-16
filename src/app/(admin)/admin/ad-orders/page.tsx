"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listAdOrders, saveAdOrder, removeAdOrder } from "@/lib/data/admin";
import type { AdOrder, AdFormat, PaymentStatus } from "@/lib/types";
import {
  adFormatLabels,
  paymentStatusLabels,
  materialStatusLabels,
} from "@/lib/types";
import {
  Alert,
  Button,
  Empty,
  PageHeader,
} from "@/components/admin/ui";

/* ── rəng xəritəsi ────────────────────────────────────────────────────── */
const paymentColors: Record<PaymentStatus, string> = {
  pending:   "border-yellow-300 bg-yellow-50 text-yellow-700",
  partial:   "border-blue-300 bg-blue-50 text-blue-700",
  paid:      "border-green-300 bg-green-50 text-green-700",
  overdue:   "border-red-300 bg-red-50 text-red-700",
  cancelled: "border-gray-200 bg-gray-100 text-gray-500",
};

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "partial", "paid", "overdue", "cancelled"];
const AD_FORMATS: AdFormat[] = [
  "banner", "sponsored_article", "brand_interview",
  "social_package", "event_sponsorship", "newsletter", "custom",
];

/* ── köməkçi: tarix formatı ─────────────────────────────────────────────── */
function fmtDate(d?: string) {
  if (!d) return "—";
  return d.slice(0, 10);
}

/* ── köməkçi: vaxtı keçib? ──────────────────────────────────────────────── */
function isOverdue(order: AdOrder) {
  if (order.paymentStatus === "paid" || order.paymentStatus === "cancelled") return false;
  if (!order.endsAt) return false;
  return new Date(order.endsAt) < new Date();
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function AdOrdersPage() {
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "all">("all");
  const [filterFormat, setFilterFormat] = useState<AdFormat | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "client">("date");

  async function load() {
    setLoading(true);
    try {
      setOrders(await listAdOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleStatusChange(id: string, status: PaymentStatus) {
    try {
      await saveAdOrder(id, { paymentStatus: status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)),
      );
    } catch {
      alert("Status dəyişdirilmədi.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu sifarişi silmək istəyirsiniz?")) return;
    try {
      await removeAdOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Silinmə xətası.");
    }
  }

  /* Filtr + axtarış */
  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        o.title.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        o.placement.toLowerCase().includes(q);
      const matchPayment = filterPayment === "all" || o.paymentStatus === filterPayment;
      const matchFormat = filterFormat === "all" || o.format === filterFormat;
      return matchSearch && matchPayment && matchFormat;
    })
    .sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "client") return a.clientName.localeCompare(b.clientName);
      return b.createdAt.localeCompare(a.createdAt);
    });

  /* Ümumi statistika */
  const totalRevenue = orders.reduce((s, o) => s + o.price, 0);
  const totalPaid = orders.reduce((s, o) => s + o.paidAmount, 0);
  const totalDebt = orders.reduce((s, o) => s + Math.max(0, o.price - o.paidAmount), 0);
  const overdueCount = orders.filter(isOverdue).length;
  const activeCount = orders.filter(
    (o) => o.paymentStatus !== "cancelled" && (!o.endsAt || new Date(o.endsAt) >= new Date()),
  ).length;

  return (
    <>
      <PageHeader
        title="Reklam Sifarişləri"
        description="Bütün müştərilərin reklam kampaniyaları, ödənişlər və nəticə statistikası."
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* KPI kartları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Ümumi sifariş", value: orders.length, color: "text-ink" },
            { label: "Aktiv kampaniya", value: activeCount, color: "text-ink" },
            { label: "Ümumi dəyər", value: `${totalRevenue} ₼`, color: "text-ink" },
            { label: "Ödənilib", value: `${totalPaid} ₼`, color: "text-green-600" },
            { label: "Borc", value: `${totalDebt} ₼`, color: "text-bordo" },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-4 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{stat.label}</p>
              <p className={`mt-1 font-display text-2xl ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Gecikmiş ödənişlər xəbərdarlığı */}
        {overdueCount > 0 && (
          <Alert tone="error">
            ⚠️ {overdueCount} sifarişin ödəniş müddəti keçib. Müştərilərlə əlaqə saxlayın.
          </Alert>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        {/* Axtarış + filtrlər */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[200px]"
            placeholder="Kampaniya adı, müştəri, yerləşdirmə..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value as PaymentStatus | "all")}
          >
            <option value="all">Bütün ödəniş statusları</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{paymentStatusLabels[s]}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value as AdFormat | "all")}
          >
            <option value="all">Bütün formatlar</option>
            {AD_FORMATS.map((f) => (
              <option key={f} value={f}>{adFormatLabels[f]}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "price" | "client")}
          >
            <option value="date">Tarixə görə</option>
            <option value="price">Qiymətə görə</option>
            <option value="client">Müştəriyə görə</option>
          </select>
        </div>

        {/* Yüklənmə */}
        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {/* Cədvəl */}
        {!loading && filtered.length === 0 && (
          <Empty
            title="Sifariş tapılmadı"
            text="Müştəri profilindən yeni reklam sifarişi əlavə edin."
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-line bg-cream-deep">
                  {[
                    "Kampaniya", "Müştəri", "Format",
                    "Tarixlər", "Qiymət", "Ödənilib",
                    "Ödəniş statusu", "Material", "Əməliyyat",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-ui text-[10px] uppercase tracking-[0.14em] text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const overdue = isOverdue(order);
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-line transition-colors hover:bg-cream-deep/50 ${overdue ? "bg-red-50/30" : ""}`}
                    >
                      {/* Kampaniya */}
                      <td className="px-4 py-3">
                        <p className="font-ui text-[13px] font-medium text-ink line-clamp-1">
                          {order.title}
                        </p>
                        {order.placement && (
                          <p className="font-ui text-[11px] text-muted">{order.placement}</p>
                        )}
                        {overdue && (
                          <span className="font-ui text-[10px] text-red-600 font-semibold">
                            ⚠ Gecikib
                          </span>
                        )}
                      </td>

                      {/* Müştəri */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/crm/${order.clientId}`}
                          className="font-ui text-[13px] text-bordo hover:underline line-clamp-1"
                        >
                          {order.clientName}
                        </Link>
                      </td>

                      {/* Format */}
                      <td className="px-4 py-3">
                        <span className="font-ui text-[12px] text-muted">
                          {adFormatLabels[order.format]}
                        </span>
                      </td>

                      {/* Tarixlər */}
                      <td className="px-4 py-3">
                        <p className="font-ui text-[12px] text-ink">{fmtDate(order.startsAt)}</p>
                        <p className="font-ui text-[11px] text-muted">→ {fmtDate(order.endsAt)}</p>
                      </td>

                      {/* Qiymət */}
                      <td className="px-4 py-3">
                        <p className="font-display text-[15px] text-ink">{order.price} ₼</p>
                      </td>

                      {/* Ödənilib */}
                      <td className="px-4 py-3">
                        <p className="font-display text-[15px] text-green-600">{order.paidAmount} ₼</p>
                        {order.price > order.paidAmount && (
                          <p className="font-ui text-[11px] text-bordo">
                            borc: {order.price - order.paidAmount} ₼
                          </p>
                        )}
                      </td>

                      {/* Ödəniş statusu */}
                      <td className="px-4 py-3">
                        <select
                          className={`border px-2 py-1 font-ui text-[11px] focus:outline-none ${paymentColors[order.paymentStatus]}`}
                          value={order.paymentStatus}
                          onChange={(e) =>
                            void handleStatusChange(order.id, e.target.value as PaymentStatus)
                          }
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{paymentStatusLabels[s]}</option>
                          ))}
                        </select>
                      </td>

                      {/* Material statusu */}
                      <td className="px-4 py-3">
                        <span className="font-ui text-[12px] text-muted">
                          {materialStatusLabels[order.materialStatus]}
                        </span>
                        {(order.clicks > 0 || order.impressions > 0) && (
                          <p className="font-ui text-[10px] text-muted/70">
                            {order.clicks} klik · {order.impressions} görünüş
                          </p>
                        )}
                      </td>

                      {/* Əməliyyatlar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/crm/${order.clientId}`}
                            className="font-ui text-[11px] uppercase tracking-[0.1em] text-bordo hover:underline"
                          >
                            Müştəri
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDelete(order.id)}
                            className="font-ui text-[11px] text-bordo/50 hover:text-bordo transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Format üzrə xülasə cədvəli */}
        {!loading && orders.length > 0 && (
          <div className="border border-line bg-paper p-6">
            <h2 className="font-display text-xl mb-4">Format üzrə xülasə</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {AD_FORMATS.map((format) => {
                const fOrders = orders.filter((o) => o.format === format);
                if (fOrders.length === 0) return null;
                const revenue = fOrders.reduce((s, o) => s + o.price, 0);
                return (
                  <div key={format} className="border border-line px-4 py-3">
                    <p className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                      {adFormatLabels[format]}
                    </p>
                    <p className="mt-1 font-display text-xl text-ink">{fOrders.length} sifariş</p>
                    <p className="font-ui text-[12px] text-muted">{revenue} ₼</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
