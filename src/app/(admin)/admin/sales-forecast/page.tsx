"use client";

import { useEffect, useState } from "react";

import { listAdOrders, listCrmClients } from "@/lib/data/admin";
import type { AdOrder, CrmClient } from "@/lib/types";
import { adFormatLabels, paymentStatusLabels } from "@/lib/types";
import {
  Alert,
  PageHeader,
  Panel,
} from "@/components/admin/ui";

/* ── köməkçilər ─────────────────────────────────────────────────────────── */
function getMonthKey(iso: string): string {
  return iso.slice(0, 7); // "2026-10"
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString("az-AZ", { month: "short", year: "numeric" });
}

function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function getNext3Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

/* ── Mini bar chart ──────────────────────────────────────────────────────── */
function BarChart({
  data,
  maxVal,
  color = "bg-bordo",
  label,
}: {
  data: { key: string; value: number; label: string }[];
  maxVal: number;
  color?: string;
  label: string;
}) {
  return (
    <div>
      <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((d) => {
          const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
          return (
            <div key={d.key} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <span className="font-ui text-[9px] text-muted">{d.value > 0 ? d.value : ""}</span>
              <div className="w-full flex items-end" style={{ height: "80px" }}>
                <div
                  className={`w-full ${color} transition-all`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                  title={`${d.label}: ${d.value} ₼`}
                />
              </div>
              <span className="font-ui text-[9px] text-muted text-center truncate w-full">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Əsas səhifə ─────────────────────────────────────────────────────────── */
export default function SalesForecastPage() {
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, c] = await Promise.all([listAdOrders(), listCrmClients()]);
        setOrders(o);
        setClients(c);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklənmə xətası");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Hesablamalar ── */
  const last6 = getLast6Months();
  const next3 = getNext3Months();

  // Aylıq gəlir (ödənilmiş)
  const monthlyRevenue = last6.map((key) => ({
    key,
    label: monthLabel(key),
    value: orders
      .filter((o) => o.paymentStatus === "paid" && o.createdAt.startsWith(key))
      .reduce((s, o) => s + o.paidAmount, 0),
  }));

  // Aylıq yeni sifariş sayı
  const monthlyOrders = last6.map((key) => ({
    key,
    label: monthLabel(key),
    value: orders.filter((o) => o.createdAt.startsWith(key)).length,
  }));

  // Proqnoz: son 3 ayın ortalaması × 1.1 (10% artım)
  const last3Avg =
    monthlyRevenue.slice(-3).reduce((s, m) => s + m.value, 0) / 3;
  const forecast = next3.map((key, i) => ({
    key,
    label: monthLabel(key),
    value: Math.round(last3Avg * Math.pow(1.05, i + 1)), // 5% aylıq artım
  }));

  // Format üzrə gəlir
  const byFormat = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.format] = (acc[o.format] ?? 0) + o.paidAmount;
      return acc;
    }, {}),
  )
    .map(([format, value]) => ({ format, value }))
    .sort((a, b) => b.value - a.value);

  // Müştəri üzrə gəlir (top 5)
  const byClient = Object.entries(
    orders.reduce<Record<string, { name: string; value: number }>>((acc, o) => {
      if (!acc[o.clientId]) acc[o.clientId] = { name: o.clientName, value: 0 };
      acc[o.clientId].value += o.paidAmount;
      return acc;
    }, {}),
  )
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalRevenue = orders.reduce((s, o) => s + o.paidAmount, 0);
  const totalDebt = orders.reduce((s, o) => s + Math.max(0, o.price - o.paidAmount), 0);
  const totalPending = orders
    .filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "partial")
    .reduce((s, o) => s + (o.price - o.paidAmount), 0);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1);
  const maxOrders = Math.max(...monthlyOrders.map((m) => m.value), 1);
  const maxForecast = Math.max(...forecast.map((f) => f.value), 1);

  // Çevrilmə nisbəti (won / total clients)
  const wonClients = clients.filter((c) => c.stage === "won").length;
  const conversionRate = clients.length > 0 ? Math.round((wonClients / clients.length) * 100) : 0;

  // Ortalama sifariş dəyəri
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <>
      <PageHeader
        title="Satış Proqnozu"
        description="Aylıq gəlir trendi, proqnoz və satış performans göstəriciləri."
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {error && <Alert tone="error">{error}</Alert>}

        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {!loading && (
          <>
            {/* KPI kartları */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Ümumi gəlir", value: `${totalRevenue} ₼`, color: "text-green-600" },
                { label: "Gözlənilən borc", value: `${totalDebt} ₼`, color: totalDebt > 0 ? "text-red-600" : "text-ink" },
                { label: "Orta sifariş", value: `${avgOrderValue} ₼`, color: "text-ink" },
                { label: "Çevrilmə", value: `${conversionRate}%`, color: "text-ink" },
              ].map((s) => (
                <div key={s.label} className="border border-line bg-paper px-5 py-4">
                  <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</p>
                  <p className={`mt-1 font-display text-3xl ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Gəlir trendi */}
            <Panel title="Aylıq Gəlir Trendi (son 6 ay)">
              <BarChart
                data={monthlyRevenue}
                maxVal={maxRevenue}
                color="bg-bordo"
                label="Ödənilmiş gəlir (₼)"
              />
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sifariş sayı */}
              <Panel title="Aylıq Sifariş Sayı">
                <BarChart
                  data={monthlyOrders}
                  maxVal={maxOrders}
                  color="bg-blue-500"
                  label="Yeni sifarişlər"
                />
              </Panel>

              {/* Proqnoz */}
              <Panel title="Gəlir Proqnozu (növbəti 3 ay)" description="Son 3 ayın ortalamasına əsasən 5% aylıq artım proqnozu.">
                <BarChart
                  data={forecast}
                  maxVal={maxForecast}
                  color="bg-gold/70"
                  label="Proqnoz (₼)"
                />
                <div className="mt-3 border-t border-line pt-3">
                  {forecast.map((f) => (
                    <div key={f.key} className="flex items-center justify-between py-1.5">
                      <span className="font-ui text-[13px] text-muted">{f.label}</span>
                      <span className="font-display text-[15px] text-ink">{f.value} ₼</span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                    <span className="font-ui text-[12px] font-semibold text-muted">Cəmi proqnoz</span>
                    <span className="font-display text-lg text-bordo">
                      {forecast.reduce((s, f) => s + f.value, 0)} ₼
                    </span>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Format üzrə gəlir */}
              <Panel title="Format üzrə Gəlir">
                <div className="space-y-3">
                  {byFormat.length === 0 && (
                    <p className="font-ui text-[13px] text-muted">Məlumat yoxdur.</p>
                  )}
                  {byFormat.map(({ format, value }) => {
                    const pct = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;
                    return (
                      <div key={format}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-ui text-[12px] text-ink">
                            {adFormatLabels[format as keyof typeof adFormatLabels] ?? format}
                          </span>
                          <span className="font-display text-[14px] text-ink">{value} ₼</span>
                        </div>
                        <div className="h-1.5 w-full bg-line overflow-hidden">
                          <div className="h-full bg-bordo" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-0.5 font-ui text-[10px] text-muted">{pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Top müştərilər */}
              <Panel title="Top 5 Müştəri">
                <div className="space-y-3">
                  {byClient.length === 0 && (
                    <p className="font-ui text-[13px] text-muted">Məlumat yoxdur.</p>
                  )}
                  {byClient.map(({ id, name, value }, i) => {
                    const pct = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;
                    return (
                      <div key={id}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-[18px] text-muted/40">
                            {i + 1}
                          </span>
                          <span className="font-ui text-[12px] text-ink flex-1 truncate">{name}</span>
                          <span className="font-display text-[14px] text-green-600">{value} ₼</span>
                        </div>
                        <div className="h-1.5 w-full bg-line overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>

            {/* Gözlənilən ödənişlər */}
            {totalPending > 0 && (
              <Panel title="Gözlənilən Ödənişlər">
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "partial")
                    .sort((a, b) => (a.endsAt ?? "").localeCompare(b.endsAt ?? ""))
                    .map((o) => (
                      <div key={o.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
                        <div>
                          <p className="font-ui text-[13px] text-ink">{o.clientName}</p>
                          <p className="font-ui text-[11px] text-muted">{o.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-[15px] text-bordo">
                            {o.price - o.paidAmount} ₼
                          </p>
                          <p className="font-ui text-[10px] text-muted">
                            {paymentStatusLabels[o.paymentStatus]}
                          </p>
                        </div>
                      </div>
                    ))}
                  <div className="border-t border-line pt-3 flex justify-between">
                    <span className="font-ui text-[12px] font-semibold text-muted">Ümumi gözlənilən</span>
                    <span className="font-display text-lg text-bordo">{totalPending} ₼</span>
                  </div>
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </>
  );
}
