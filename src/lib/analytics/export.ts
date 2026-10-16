/**
 * Analytics Export & Report Generation
 * CSV, JSON və PDF export funksiyaları
 */

import type { DailyAnalytics, ArticleAnalytics, CrmAnalytics, RevenueAnalytics } from "@/lib/types";

/**
 * CSV formatında export edir.
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) {
    alert("Eksport üçün məlumat yoxdur");
    return;
  }

  // Headers
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  // Data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle complex types
      if (typeof value === "object" && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(",") ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(","));
  });

  const csvContent = csvRows.join("\n");
  downloadFile(csvContent, filename, "text/csv");
}

/**
 * JSON formatında export edir.
 */
export function exportToJSON(data: any[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, "application/json");
}

/**
 * Faylı download edir.
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Daily analytics-i CSV kimi export edir.
 */
export function exportDailyAnalyticsToCSV(data: DailyAnalytics[]): void {
  const simplified = data.map((d) => ({
    Tarix: d.date,
    "Səhifə Baxışı": d.pageViews,
    "Unikal Ziyarətçi": d.uniqueVisitors,
    Sessiyalar: d.sessions,
    "Bounce Rate (%)": d.bounceRate.toFixed(1),
    "Orta Session Müddəti (san)": d.avgSessionDuration,
    "Səhifə/Session": d.avgPagesPerSession.toFixed(1),
    Mobile: d.deviceDistribution.mobile,
    Desktop: d.deviceDistribution.desktop,
    Tablet: d.deviceDistribution.tablet,
  }));

  const filename = `daily-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  exportToCSV(simplified, filename);
}

/**
 * Article analytics-i CSV kimi export edir.
 */
export function exportArticleAnalyticsToCSV(data: ArticleAnalytics[]): void {
  const simplified = data.map((a) => ({
    "Məqalə ID": a.articleId,
    "Ümumi Baxış": a.views,
    "Unikal Ziyarətçi": a.uniqueVisitors,
    "Orta Müddət (san)": a.avgTimeOnPage,
    Paylaşım: a.shares,
    Şərh: a.comments,
    "Son 7 Gün": a.viewsLast7Days,
    "Son 30 Gün": a.viewsLast30Days,
    "Trending Score": a.trendingScore.toFixed(1),
  }));

  const filename = `article-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  exportToCSV(simplified, filename);
}

/**
 * CRM analytics-i CSV kimi export edir.
 */
export function exportCrmAnalyticsToCSV(data: CrmAnalytics): void {
  const rows = [
    {
      Məlumat: "Yeni Müştəri",
      Dəyər: data.newClients,
    },
    {
      Məlumat: "Qazanılmış Müqavilə",
      Dəyər: data.dealsWon,
    },
    {
      Məlumat: "İtirilmiş Müqavilə",
      Dəyər: data.dealsLost,
    },
    {
      Məlumat: "Win Rate (%)",
      Dəyər: data.winRate.toFixed(1),
    },
    {
      Məlumat: "Ortalama Müqavilə Müddəti (gün)",
      Dəyər: data.avgDealDuration,
    },
    {
      Məlumat: "Ümumi Müqavilə Dəyəri (₼)",
      Dəyər: data.totalValue,
    },
    {
      Məlumat: "Ortalama Müqavilə Dəyəri (₼)",
      Dəyər: data.avgDealValue.toFixed(2),
    },
    {
      Məlumat: "Yeni → Əlaqə Konversiyası (%)",
      Dəyər: data.conversionRates.newToContacted.toFixed(1),
    },
    {
      Məlumat: "Əlaqə → Təklif Konversiyası (%)",
      Dəyər: data.conversionRates.contactedToProposal.toFixed(1),
    },
    {
      Məlumat: "Təklif → Danışıq Konversiyası (%)",
      Dəyər: data.conversionRates.proposalToNegotiation.toFixed(1),
    },
    {
      Məlumat: "Danışıq → Qazanıldı Konversiyası (%)",
      Dəyər: data.conversionRates.negotiationToWon.toFixed(1),
    },
    {
      Məlumat: "Ümumi Konversiya (%)",
      Dəyər: data.conversionRates.overallConversion.toFixed(1),
    },
  ];

  const filename = `crm-analytics-${data.periodStart}-${data.periodEnd}.csv`;
  exportToCSV(rows, filename);
}

/**
 * Revenue analytics-i CSV kimi export edir.
 */
export function exportRevenueAnalyticsToCSV(data: RevenueAnalytics[]): void {
  const simplified = data.map((r) => ({
    Ay: r.period,
    "Ümumi Gəlir (₼)": r.totalRevenue,
    "Ödənilmiş (₼)": r.paidAmount,
    "Gözlənilən (₼)": r.pendingAmount,
    "Gecikmiş (₼)": r.overdueAmount,
    "Aktiv Kampaniya": r.activeCampaigns,
    "Yeni Sifariş": r.newOrders,
    "Tamamlanan Sifariş": r.completedOrders,
    "Artım (%)": r.growthRate.toFixed(1),
  }));

  const filename = `revenue-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  exportToCSV(simplified, filename);
}

/**
 * Scheduled report generator (future implementation).
 * Həftəlik və ya aylıq avtomatik hesabatlar.
 */
export function generateScheduledReport(
  type: "weekly" | "monthly",
  email: string
): void {
  console.log(`[Analytics] Scheduled ${type} report for ${email} - not implemented yet`);
  // Future: Email API integration
}
