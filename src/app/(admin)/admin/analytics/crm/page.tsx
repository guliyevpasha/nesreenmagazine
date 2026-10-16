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
  ProgressBar,
  type DateRange,
  type LineChartDataPoint,
  type BarChartDataPoint,
  type PieChartDataPoint,
} from "@/components/admin/analytics";
import { useAuth } from "@/lib/firebase/auth";
import {
  listCrmClients,
  listAdOrders,
  getLatestCrmAnalytics,
  saveCrmAnalytics,
} from "@/lib/data/admin";
import { dealStageLabels } from "@/lib/types";
import type { CrmClient, AdOrder, CrmAnalytics } from "@/lib/types";

export default function CrmAnalyticsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [analytics, setAnalytics] = useState<CrmAnalytics | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return { start, end };
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [clientsData, ordersData, analyticsData] = await Promise.all([
        listCrmClients().catch(() => [] as CrmClient[]),
        listAdOrders().catch(() => [] as AdOrder[]),
        getLatestCrmAnalytics().catch(() => null),
      ]);

      setClients(clientsData);
      setOrders(ordersData);

      // Filter data by date range
      const filteredClients = clientsData.filter((c) => {
        const createdDate = c.createdAt.slice(0, 10);
        return createdDate >= dateRange.start && createdDate <= dateRange.end;
      });

      const filteredOrders = ordersData.filter((o) => {
        const createdDate = o.createdAt.slice(0, 10);
        return createdDate >= dateRange.start && createdDate <= dateRange.end;
      });

      // Calculate analytics
      const calculatedAnalytics = calculateCrmAnalytics(
        filteredClients,
        filteredOrders,
        dateRange
      );

      setAnalytics(calculatedAnalytics);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  function calculateCrmAnalytics(
    clients: CrmClient[],
    orders: AdOrder[],
    range: DateRange
  ): CrmAnalytics {
    // Stage distribution
    const stageDistribution = clients.reduce(
      (acc, client) => {
        acc[client.stage] = (acc[client.stage] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const newCount = stageDistribution.new || 0;
    const contactedCount = stageDistribution.contacted || 0;
    const proposalCount = stageDistribution.proposal || 0;
    const negotiationCount = stageDistribution.negotiation || 0;
    const wonCount = stageDistribution.won || 0;
    const lostCount = stageDistribution.lost || 0;

    // Conversion rates
    const newToContacted = newCount > 0 ? (contactedCount / newCount) * 100 : 0;
    const contactedToProposal = contactedCount > 0 ? (proposalCount / contactedCount) * 100 : 0;
    const proposalToNegotiation = proposalCount > 0 ? (negotiationCount / proposalCount) * 100 : 0;
    const negotiationToWon = negotiationCount > 0 ? (wonCount / negotiationCount) * 100 : 0;
    const overallConversion =
      clients.length > 0 ? (wonCount / clients.length) * 100 : 0;

    // Win rate
    const totalClosedDeals = wonCount + lostCount;
    const winRate = totalClosedDeals > 0 ? (wonCount / totalClosedDeals) * 100 : 0;

    // Deal value
    const wonOrders = orders.filter((o) => {
      const client = clients.find((c) => c.id === o.clientId);
      return client && client.stage === "won";
    });
    const totalValue = wonOrders.reduce((sum, o) => sum + o.price, 0);
    const avgDealValue = wonOrders.length > 0 ? totalValue / wonOrders.length : 0;

    // Average deal duration (simplified - using creation date)
    const avgDealDuration = 30; // Placeholder

    return {
      id: Date.now().toString(),
      periodStart: range.start,
      periodEnd: range.end,
      newClients: newCount,
      stageDistribution: {
        new: newCount,
        contacted: contactedCount,
        proposal: proposalCount,
        negotiation: negotiationCount,
        won: wonCount,
        lost: lostCount,
      },
      conversionRates: {
        newToContacted,
        contactedToProposal,
        proposalToNegotiation,
        negotiationToWon,
        overallConversion,
      },
      dealsWon: wonCount,
      dealsLost: lostCount,
      winRate,
      avgDealDuration,
      totalValue,
      avgDealValue,
      createdAt: new Date().toISOString(),
    };
  }

  if (!session) return null;

  // Sales funnel data
  const funnelData: BarChartDataPoint[] = analytics
    ? [
        {
          label: "Yeni",
          value: analytics.stageDistribution.new,
          color: "#E8E4E1",
        },
        {
          label: "Əlaqə",
          value: analytics.stageDistribution.contacted,
          color: "#C5A572",
        },
        {
          label: "Təklif",
          value: analytics.stageDistribution.proposal,
          color: "#8B2635",
        },
        {
          label: "Danışıq",
          value: analytics.stageDistribution.negotiation,
          color: "#2C2C2C",
        },
        {
          label: "Qazanıldı",
          value: analytics.stageDistribution.won,
          color: "#10B981",
        },
      ]
    : [];

  // Stage distribution pie chart
  const stageDistributionPie: PieChartDataPoint[] = analytics
    ? Object.entries(analytics.stageDistribution)
        .filter(([_, count]) => count > 0)
        .map(([stage, count], i) => ({
          label: dealStageLabels[stage as keyof typeof dealStageLabels],
          value: count,
          color: ["#E8E4E1", "#C5A572", "#8B2635", "#2C2C2C", "#10B981", "#EF4444"][i],
        }))
    : [];

  // Conversion rate chart
  const conversionData: BarChartDataPoint[] = analytics
    ? [
        {
          label: "Yeni → Əlaqə",
          value: Math.round(analytics.conversionRates.newToContacted),
          color: "#C5A572",
        },
        {
          label: "Əlaqə → Təklif",
          value: Math.round(analytics.conversionRates.contactedToProposal),
          color: "#8B2635",
        },
        {
          label: "Təklif → Danışıq",
          value: Math.round(analytics.conversionRates.proposalToNegotiation),
          color: "#2C2C2C",
        },
        {
          label: "Danışıq → Qazanıldı",
          value: Math.round(analytics.conversionRates.negotiationToWon),
          color: "#10B981",
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="CRM Konversiya Analitikası"
        description="Satış hunisi, konversiya dərəcələri və müştəri davranışı"
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
            className="border-2 border-bordo bg-bordo px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-cream"
          >
            CRM
          </Link>
          <Link
            href="/admin/analytics/revenue"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            Gəlir
          </Link>
        </div>

        {/* Date range picker */}
        <DateRangePicker value={dateRange} onChange={setDateRange} showPresets />

        {error && <Alert tone="error">{error}</Alert>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-line border-t-bordo" />
            <p className="mt-4 font-ui text-[13px] text-muted">Yüklənir...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Key metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Yeni Müştəri"
                value={analytics.newClients}
                icon="👥"
              />
              <MetricCard
                label="Qazanılmış Müqavilə"
                value={analytics.dealsWon}
                icon="✓"
              />
              <MetricCard
                label="Win Rate"
                value={`${analytics.winRate.toFixed(1)}%`}
                icon="🎯"
                trend={analytics.winRate > 50 ? "up" : "down"}
              />
              <MetricCard
                label="Ümumi Dəyər"
                value={`${analytics.totalValue.toLocaleString()} ₼`}
                icon="💰"
              />
            </div>

            {/* Conversion metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                label="Yeni → Əlaqə"
                value={`${analytics.conversionRates.newToContacted.toFixed(1)}%`}
                loading={false}
              />
              <MetricCard
                label="Əlaqə → Təklif"
                value={`${analytics.conversionRates.contactedToProposal.toFixed(1)}%`}
                loading={false}
              />
              <MetricCard
                label="Təklif → Danışıq"
                value={`${analytics.conversionRates.proposalToNegotiation.toFixed(1)}%`}
                loading={false}
              />
              <MetricCard
                label="Danışıq → Qazanıldı"
                value={`${analytics.conversionRates.negotiationToWon.toFixed(1)}%`}
                loading={false}
              />
              <MetricCard
                label="Ümumi Konversiya"
                value={`${analytics.conversionRates.overallConversion.toFixed(1)}%`}
                loading={false}
                trend={
                  analytics.conversionRates.overallConversion > 20
                    ? "up"
                    : analytics.conversionRates.overallConversion > 10
                      ? "neutral"
                      : "down"
                }
              />
            </div>

            {/* Sales funnel */}
            <Panel
              title="Satış Hunisi (Sales Funnel)"
              description="Müştəri davranışının mərhələ-mərhələ bölgüsü"
            >
              <BarChart data={funnelData} height={280} />
              <div className="mt-6 border-t border-line pt-4">
                <p className="font-ui text-[11px] text-muted">
                  💡 Huni analizi: Hər mərhələdə müştəri itkisini göstərir. İdeal hunidə hər
                  mərhələdə ən azı 50% konversiya olmalıdır.
                </p>
              </div>
            </Panel>

            {/* Stage distribution & Conversion rates */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Mərhələ Bölgüsü" description="Müştərilərin cari statusu">
                <div className="flex justify-center py-4">
                  <PieChart data={stageDistributionPie} size={240} showLegend />
                </div>
              </Panel>

              <Panel
                title="Konversiya Dərəcələri"
                description="Mərhələ-mərhələ keçid faizi"
              >
                <BarChart data={conversionData} height={240} />
              </Panel>
            </div>

            {/* Detailed stats */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Müqavilə Statistikası">
                <StatsList
                  items={[
                    {
                      label: "Qazanılmış müqavilə",
                      value: analytics.dealsWon,
                      color: "#10B981",
                    },
                    {
                      label: "İtirilmiş müqavilə",
                      value: analytics.dealsLost,
                      color: "#EF4444",
                    },
                    {
                      label: "Win rate",
                      value: `${analytics.winRate.toFixed(1)}%`,
                      color: "#8B2635",
                    },
                    {
                      label: "Ortalama müqavilə müddəti",
                      value: `${analytics.avgDealDuration} gün`,
                    },
                  ]}
                />
              </Panel>

              <Panel title="Gəlir Statistikası">
                <StatsList
                  items={[
                    {
                      label: "Ümumi müqavilə dəyəri",
                      value: `${analytics.totalValue.toLocaleString()} ₼`,
                      color: "#10B981",
                    },
                    {
                      label: "Ortalama müqavilə dəyəri",
                      value: `${Math.round(analytics.avgDealValue).toLocaleString()} ₼`,
                      color: "#C5A572",
                    },
                    {
                      label: "Yeni müştəri sayı",
                      value: analytics.newClients,
                    },
                    {
                      label: "Müştəri başına gəlir",
                      value:
                        analytics.newClients > 0
                          ? `${Math.round(analytics.totalValue / analytics.newClients).toLocaleString()} ₼`
                          : "0 ₼",
                    },
                  ]}
                />
              </Panel>
            </div>

            {/* Conversion funnel with progress bars */}
            <Panel title="Konversiya Hunisi (Detallı)" description="Hər mərhələdə keçid faizi">
              <div className="space-y-4">
                <ProgressBar
                  label="Yeni müştəri → Əlaqə saxlanılıb"
                  value={analytics.conversionRates.newToContacted}
                  max={100}
                  color="#C5A572"
                />
                <ProgressBar
                  label="Əlaqə saxlanılıb → Təklif göndərilib"
                  value={analytics.conversionRates.contactedToProposal}
                  max={100}
                  color="#8B2635"
                />
                <ProgressBar
                  label="Təklif göndərilib → Danışıqlar"
                  value={analytics.conversionRates.proposalToNegotiation}
                  max={100}
                  color="#2C2C2C"
                />
                <ProgressBar
                  label="Danışıqlar → Müqavilə bağlandı"
                  value={analytics.conversionRates.negotiationToWon}
                  max={100}
                  color="#10B981"
                />
                <div className="border-t border-line pt-4">
                  <ProgressBar
                    label="Ümumi Konversiya (Yeni → Qazanıldı)"
                    value={analytics.conversionRates.overallConversion}
                    max={100}
                    color="#8B2635"
                  />
                </div>
              </div>
            </Panel>

            {/* Performance insights */}
            <Panel title="Performans Qiymətləndirməsi">
              <div className="space-y-4">
                {analytics.conversionRates.overallConversion < 10 && (
                  <Alert tone="error">
                    ⚠️ Ümumi konversiya dərəcəsi çox aşağıdır ({analytics.conversionRates.overallConversion.toFixed(1)}%). 
                    Satış prosesini təkmilləşdirmək tövsiyə olunur.
                  </Alert>
                )}
                {analytics.winRate < 30 && analytics.dealsWon + analytics.dealsLost > 0 && (
                  <Alert tone="error">
                    ⚠️ Win rate aşağıdır ({analytics.winRate.toFixed(1)}%). 
                    Təklif və danışıq mərhələlərinə fokuslanmaq lazımdır.
                  </Alert>
                )}
                {analytics.winRate >= 50 && (
                  <Alert tone="success">
                    ✓ Win rate yüksəkdir ({analytics.winRate.toFixed(1)}%). Satış prosesi uğurlu işləyir.
                  </Alert>
                )}
                {analytics.conversionRates.overallConversion >= 20 && (
                  <Alert tone="success">
                    ✓ Ümumi konversiya dərəcəsi yaxşıdır ({analytics.conversionRates.overallConversion.toFixed(1)}%).
                  </Alert>
                )}
              </div>
            </Panel>

            {/* Recommendations */}
            <Panel title="Təkmilləşdirmə Təklifləri">
              <div className="space-y-3 font-ui text-[13px] text-ink">
                <div className="flex gap-3">
                  <span className="shrink-0 text-lg">💡</span>
                  <p>
                    <strong>Yeni müştəri konversiyası:</strong> Əgər yeni müştərilərdən əlaqə
                    mərhələsinə keçid aşağıdırsa, ilk təmas strategiyanızı təkmilləşdirin.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="shrink-0 text-lg">💡</span>
                  <p>
                    <strong>Təklif mərhələsi:</strong> Təklifdən danışıqlara keçid aşağıdırsa,
                    təklif paketlərinizi və qiymətləndirməni yenidən nəzərdən keçirin.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="shrink-0 text-lg">💡</span>
                  <p>
                    <strong>Win rate:</strong> 50%-dən aşağı win rate göstərir ki, rəqabət
                    güclüdür və ya təklifləriniz kifayət qədər cəlbedici deyil.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="shrink-0 text-lg">💡</span>
                  <p>
                    <strong>Ortalama müqavilə dəyəri:</strong> Daha yüksək dəyərli müştərilərə
                    fokuslanmaq gəliri artıra bilər.
                  </p>
                </div>
              </div>
            </Panel>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-3xl">
              📊
            </div>
            <p className="font-display text-xl text-ink">Hələ məlumat yoxdur</p>
            <p className="mt-2 font-ui text-[13px] text-muted">
              CRM-də müştəri əlavə edildikdən sonra statistika burada görünəcək.
            </p>
            <Link href="/admin/crm" className="btn-primary mt-6 inline-block">
              CRM-ə keç
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
