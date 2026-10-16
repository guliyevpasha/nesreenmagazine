"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert } from "@/components/admin/ui";
import {
  MetricCard,
  LineChart,
  BarChart,
  PieChart,
  DateRangePicker,
  StatsList,
  type DateRange,
  type LineChartDataPoint,
  type BarChartDataPoint,
  type PieChartDataPoint,
} from "@/components/admin/analytics";
import { useAuth } from "@/lib/firebase/auth";
import { listAdOrders, listCrmClients, getRevenueAnalytics, saveRevenueAnalytics } from "@/lib/data/admin";
import { adFormatLabels, paymentStatusLabels } from "@/lib/types";
import type { AdOrder, CrmClient, RevenueAnalytics } from "@/lib/types";

export default function RevenueAnalyticsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueAnalytics[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
    return { start, end };
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [ordersData, clientsData, revenueData] = await Promise.all([
        listAdOrders().catch(() => [] as AdOrder[]),
        listCrmClients().catch(() => [] as CrmClient[]),
        getRevenueAnalytics(dateRange.start, dateRange.end).catch(() => [] as RevenueAnalytics[]),
      ]);

      setOrders(ordersData);
      setClients(clientsData);

      // Calculate monthly revenue if not exists
      if (revenueData.length === 0) {
        const calculated = calculateMonthlyRevenue(ordersData, clientsData, dateRange);
        setMonthlyRevenue(calculated);
      } else {
        setMonthlyRevenue(revenueData);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  function calculateMonthlyRevenue(
    orders: AdOrder[],
    clients: CrmClient[],
    range: DateRange
  ): RevenueAnalytics[] {
    const months: RevenueAnalytics[] = [];
    const startParts = range.start.split("-");
    const endParts = range.end.split("-");

    let currentYear = parseInt(startParts[0]);
    let currentMonth = parseInt(startParts[1]);
    const endYear = parseInt(endParts[0]);
    const endMonth = parseInt(endParts[1]);

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      const period = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
      const periodOrders = orders.filter((o) => o.createdAt.startsWith(period));

      const totalRevenue = periodOrders.reduce((sum, o) => sum + o.price, 0);
      const paidAmount = periodOrders.reduce((sum, o) => sum + o.paidAmount, 0);
      const pendingAmount = periodOrders
        .filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "partial")
        .reduce((sum, o) => sum + (o.price - o.paidAmount), 0);
      const overdueAmount = periodOrders
        .filter((o) => o.paymentStatus === "overdue")
        .reduce((sum, o) => sum + (o.price - o.paidAmount), 0);

      const activeCampaigns = periodOrders.filter(
        (o) => !o.endsAt || new Date(o.endsAt) >= new Date()
      ).length;

      const completedOrders = periodOrders.filter(
        (o) => o.paymentStatus === "paid" || o.paymentStatus === "cancelled"
      ).length;

      // Revenue by format
      const revenueByFormat: Record<string, number> = {};
      periodOrders.forEach((o) => {
        revenueByFormat[o.format] = (revenueByFormat[o.format] || 0) + o.price;
      });

      // Top clients
      const clientRevenue: Record<string, { name: string; revenue: number }> = {};
      periodOrders.forEach((o) => {
        if (!clientRevenue[o.clientId]) {
          clientRevenue[o.clientId] = { name: o.clientName, revenue: 0 };
        }
        clientRevenue[o.clientId].revenue += o.price;
      });

      const topClients = Object.entries(clientRevenue)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([clientId, data]) => ({
          clientId,
          clientName: data.name,
          revenue: data.revenue,
        }));

      // Growth rate (compared to previous month)
      const prevMonthData = months[months.length - 1];
      const growthRate = prevMonthData
        ? ((totalRevenue - prevMonthData.totalRevenue) / prevMonthData.totalRevenue) * 100
        : 0;

      // Forecast (simple linear projection)
      const forecast =
        months.length >= 3
          ? (months[months.length - 1].totalRevenue +
              months[months.length - 2].totalRevenue +
              months[months.length - 3].totalRevenue) /
            3
          : undefined;

      months.push({
        id: period,
        period,
        totalRevenue,
        paidAmount,
        pendingAmount,
        overdueAmount,
        activeCampaigns,
        newOrders: periodOrders.length,
        completedOrders,
        revenueByFormat: revenueByFormat as any,
        topClients,
        growthRate,
        forecast,
        createdAt: new Date().toISOString(),
      });

      // Next month
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return months;
  }

  if (!session) return null;

  // Ümumi statistika
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.totalRevenue, 0);
  const totalPaid = monthlyRevenue.reduce((sum, m) => sum + m.paidAmount, 0);
  const totalPending = monthlyRevenue.reduce((sum, m) => sum + m.pendingAmount, 0);
  const totalOverdue = monthlyRevenue.reduce((sum, m) => sum + m.overdueAmount, 0);

  const avgMonthlyRevenue =
    monthlyRevenue.length > 0 ? totalRevenue / monthlyRevenue.length : 0;

  const latestMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];

  // Charts
  const revenueChartData: LineChartDataPoint[] = monthlyRevenue.map((m) => ({
    label: m.period.slice(5), // MM
    value: m.totalRevenue,
  }));

  const paidVsPendingData: BarChartDataPoint[] = monthlyRevenue.map((m) => ({
    label: m.period.slice(5),
    value: m.paidAmount,
    color: "#10B981",
  }));

  const pendingChartData: BarChartDataPoint[] = monthlyRevenue.map((m) => ({
    label: m.period.slice(5),
    value: m.pendingAmount,
    color: "#F59E0B",
  }));

  // Format distribution (aggregate)
  const formatRevenue: Record<string, number> = {};
  monthlyRevenue.forEach((m) => {
    Object.entries(m.revenueByFormat).forEach(([format, amount]) => {
      formatRevenue[format] = (formatRevenue[format] || 0) + amount;
    });
  });

  const formatPieData: PieChartDataPoint[] = Object.entries(formatRevenue)
    .sort((a, b) => b[1] - a[1])
    .map(([format, amount], i) => ({
      label: adFormatLabels[format as keyof typeof adFormatLabels] || format,
      value: amount,
      color: ["#8B2635", "#C5A572", "#2C2C2C", "#E8E4E1", "#10B981", "#F59E0B", "#EF4444"][i % 7],
    }));

  // Top clients (aggregate)
  const clientTotalRevenue: Record<string, { name: string; revenue: number }> = {};
  monthlyRevenue.forEach((m) => {
    m.topClients.forEach((client) => {
      if (!clientTotalRevenue[client.clientId]) {
        clientTotalRevenue[client.clientId] = {
          name: client.clientName,
          revenue: 0,
        };
      }
      clientTotalRevenue[client.clientId].revenue += client.revenue;
    });
  });

  const topClientsOverall = Object.entries(clientTotalRevenue)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  return (
    <>
      <PageHeader
        title="Gəlir Analitikası və Proqnozlar"
        description="Aylıq gəlir trendləri, ödəniş statusu və gələcək proqnozlar"
      />

      <div className="space-y-8 px-6 py-8 lg:px-10">
        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/analytics"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            Ümumi
          </Link>
          <Link
            href="/admin/analytics/articles"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            Məqalələr
          </Link>
          <Link
            href="/admin/analytics/crm"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            CRM
          </Link>
          <Link
            href="/admin/analytics/revenue"
            className="border-2 border-bordo bg-bordo px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-cream"
          >
            Gəlir
          </Link>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-line border-t-bordo" />
            <p className="mt-4 font-ui text-[13px] text-muted">Yüklənir...</p>
          </div>
        ) : monthlyRevenue.length > 0 ? (
          <>
            {/* Key metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Ümumi Gəlir"
                value={`${totalRevenue.toLocaleString()} ₼`}
                icon="💰"
              />
              <MetricCard
                label="Ödənilmiş"
                value={`${totalPaid.toLocaleString()} ₼`}
                icon="✓"
                trend="up"
              />
              <MetricCard
                label="Gözlənilən"
                value={`${totalPending.toLocaleString()} ₼`}
                icon="⏳"
              />
              <MetricCard
                label="Gecikmiş"
                value={`${totalOverdue.toLocaleString()} ₼`}
                icon="⚠️"
                trend={totalOverdue > 0 ? "down" : "neutral"}
              />
            </div>

            {/* Current month vs Previous */}
            {latestMonth && previousMonth && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Panel title={`Bu Ay (${latestMonth.period})`}>
                  <StatsList
                    items={[
                      {
                        label: "Gəlir",
                        value: `${latestMonth.totalRevenue.toLocaleString()} ₼`,
                        change: latestMonth.growthRate,
                        trend:
                          latestMonth.growthRate > 0
                            ? "up"
                            : latestMonth.growthRate < 0
                              ? "down"
                              : "neutral",
                      },
                      {
                        label: "Ödənilmiş",
                        value: `${latestMonth.paidAmount.toLocaleString()} ₼`,
                      },
                      {
                        label: "Aktiv kampaniya",
                        value: latestMonth.activeCampaigns,
                      },
                      {
                        label: "Yeni sifariş",
                        value: latestMonth.newOrders,
                      },
                    ]}
                  />
                </Panel>

                <Panel title="Proqnoz və Trend">
                  <div className="space-y-4">
                    {latestMonth.forecast && (
                      <div className="border-b border-line pb-4">
                        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                          Gələn ay proqnozu
                        </p>
                        <p className="mt-1 font-display text-2xl text-bordo">
                          {Math.round(latestMonth.forecast).toLocaleString()} ₼
                        </p>
                        <p className="mt-1 font-ui text-[11px] text-muted">
                          Son 3 ayın ortalaması əsasında
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                        Ortalama aylıq gəlir
                      </p>
                      <p className="mt-1 font-display text-xl text-ink">
                        {Math.round(avgMonthlyRevenue).toLocaleString()} ₼
                      </p>
                    </div>
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                        Artım dərəcəsi
                      </p>
                      <p
                        className={`mt-1 font-display text-xl ${
                          latestMonth.growthRate > 0
                            ? "text-green-600"
                            : latestMonth.growthRate < 0
                              ? "text-red-600"
                              : "text-ink"
                        }`}
                      >
                        {latestMonth.growthRate > 0 ? "+" : ""}
                        {latestMonth.growthRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* Revenue trend chart */}
            <Panel
              title="Aylıq Gəlir Trendi"
              description={`${dateRange.start} - ${dateRange.end}`}
            >
              <LineChart data={revenueChartData} height={280} showGrid showPoints />
            </Panel>

            {/* Paid vs Pending */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Ödənilmiş Məbləğ" description="Aylıq ödənilmiş gəlir">
                <BarChart data={paidVsPendingData} height={240} />
              </Panel>

              <Panel title="Gözlənilən Ödənişlər" description="Hələ ödənilməmiş məbləğ">
                <BarChart data={pendingChartData} height={240} />
              </Panel>
            </div>

            {/* Format distribution */}
            <Panel
              title="Reklam Formatı üzrə Gəlir"
              description="Hansı formatlar daha çox gəlir gətirir"
            >
              <div className="flex justify-center py-4">
                <PieChart data={formatPieData} size={260} showLegend />
              </div>
            </Panel>

            {/* Top clients */}
            <Panel title="Ən Çox Gəlir Gətirən Müştərilər (Top 10)">
              {topClientsOverall.length === 0 ? (
                <p className="py-8 text-center font-ui text-[12px] text-muted">
                  Məlumat yoxdur
                </p>
              ) : (
                <div className="space-y-2">
                  {topClientsOverall.map(([clientId, data], index) => (
                    <div
                      key={clientId}
                      className="flex items-center justify-between border-b border-line py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bordo font-ui text-[13px] font-bold text-cream">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-display text-[15px] text-ink">{data.name}</p>
                          <p className="font-ui text-[11px] text-muted">
                            {((data.revenue / totalRevenue) * 100).toFixed(1)}% ümumi gəlirdən
                          </p>
                        </div>
                      </div>
                      <span className="font-display text-lg text-bordo">
                        {data.revenue.toLocaleString()} ₼
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Monthly breakdown table */}
            <Panel title="Aylıq Detallı Hesabat">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase text-muted">
                        Ay
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">
                        Gəlir
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">
                        Ödənilmiş
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">
                        Gözlənilən
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">
                        Gecikmiş
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">
                        Artım
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">
                        Sifarişlər
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {monthlyRevenue.map((month) => (
                      <tr key={month.period} className="hover:bg-cream-deep/30">
                        <td className="px-4 py-3 font-display text-[14px]">
                          {month.period}
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] font-semibold">
                          {month.totalRevenue.toLocaleString()} ₼
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-green-600">
                          {month.paidAmount.toLocaleString()} ₼
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-yellow-600">
                          {month.pendingAmount.toLocaleString()} ₼
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-red-600">
                          {month.overdueAmount.toLocaleString()} ₼
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-ui text-[13px] font-semibold ${
                            month.growthRate > 0
                              ? "text-green-600"
                              : month.growthRate < 0
                                ? "text-red-600"
                                : "text-muted"
                          }`}
                        >
                          {month.growthRate > 0 ? "+" : ""}
                          {month.growthRate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px]">
                          {month.newOrders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-bordo bg-cream-deep/30">
                      <td className="px-4 py-3 font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                        Cəmi
                      </td>
                      <td className="px-4 py-3 text-right font-display text-[15px] font-bold text-bordo">
                        {totalRevenue.toLocaleString()} ₼
                      </td>
                      <td className="px-4 py-3 text-right font-ui text-[13px] font-semibold text-green-600">
                        {totalPaid.toLocaleString()} ₼
                      </td>
                      <td className="px-4 py-3 text-right font-ui text-[13px] font-semibold text-yellow-600">
                        {totalPending.toLocaleString()} ₼
                      </td>
                      <td className="px-4 py-3 text-right font-ui text-[13px] font-semibold text-red-600">
                        {totalOverdue.toLocaleString()} ₼
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right font-ui text-[13px] font-semibold">
                        {monthlyRevenue.reduce((sum, m) => sum + m.newOrders, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Panel>

            {/* Insights & Recommendations */}
            <Panel title="Analiz və Təkliflər">
              <div className="space-y-4">
                {totalOverdue > totalRevenue * 0.1 && (
                  <Alert tone="error">
                    ⚠️ Gecikmiş ödənişlər ümumi gəlirin 10%-dən çoxdur ({((totalOverdue / totalRevenue) * 100).toFixed(1)}%). 
                    Ödəniş toplama strategiyanızı təkmilləşdirin.
                  </Alert>
                )}
                {latestMonth && latestMonth.growthRate < -10 && (
                  <Alert tone="error">
                    ⚠️ Son ayda gəlir 10%-dən çox azalıb. Satış və marketing strategiyanızı yenidən nəzərdən keçirin.
                  </Alert>
                )}
                {latestMonth && latestMonth.growthRate > 20 && (
                  <Alert tone="success">
                    ✓ Əla! Son ayda gəlir 20%-dən çox artıb. Bu tempi davam etdirin.
                  </Alert>
                )}
                <div className="space-y-3 font-ui text-[13px] text-ink">
                  <div className="flex gap-3">
                    <span className="shrink-0 text-lg">💡</span>
                    <p>
                      <strong>Gözlənilən ödənişlər:</strong> {totalPending.toLocaleString()} ₼ gözlənilən ödəniş var. 
                      Müştərilərlə əlaqə saxlayaraq ödəniş planı hazırlayın.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="shrink-0 text-lg">💡</span>
                    <p>
                      <strong>Diversifikasiya:</strong> Ən yüksək gəlirli formatlarınızı müəyyənləşdirin və 
                      digər formatlara da fokuslanmağı düşünün.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="shrink-0 text-lg">💡</span>
                    <p>
                      <strong>Müştəri sadiqliyi:</strong> Top müştərilərinizlə uzunmüddətli əməkdaşlıq planları hazırlayın.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-3xl">
              💰
            </div>
            <p className="font-display text-xl text-ink">Hələ gəlir məlumatı yoxdur</p>
            <p className="mt-2 font-ui text-[13px] text-muted">
              Reklam sifarişləri əlavə edildikdən sonra gəlir analitikası burada görünəcək.
            </p>
            <Link href="/admin/ad-orders" className="btn-primary mt-6 inline-block">
              Reklam Sifarişləri
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
