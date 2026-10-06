"use client";

import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert } from "@/components/admin/ui";
import { useAuth } from "@/lib/firebase/auth";

type TimeRange = "today" | "7days" | "30days" | "90days" | "180days" | "365days" | "custom";

interface AnalyticsData {
  // Ümumi məlumatlar
  totalVisitors: number;
  pageViews: number;
  avgSessionDuration: string;
  bounceRate: string;

  // Dil statistikası
  byLanguage: {
    locale: string;
    visitors: number;
    pageviews: number;
    percentage: string;
  }[];

  // Yaş qrupları
  byAge: {
    range: string;
    percentage: string;
    visitors: number;
  }[];

  // Cins
  byGender: {
    gender: string;
    percentage: string;
    visitors: number;
  }[];

  // Ölkə və şəhər
  byCountry: {
    country: string;
    visitors: number;
    percentage: string;
  }[];
  
  byCity: {
    city: string;
    country: string;
    visitors: number;
  }[];

  // Trafik mənbələri
  bySources: {
    source: string;
    visitors: number;
    percentage: string;
  }[];

  // Açar sözlər (5 dil üzrə)
  byKeywords: {
    keyword: string;
    locale: string;
    clicks: number;
    impressions: number;
  }[];

  // Ən çox oxunan məqalələr
  topArticles: {
    title: string;
    slug: string;
    views: number;
    locale: string;
  }[];

  // Etiketlərə görə trafik
  byTags: {
    tag: string;
    locale: string;
    visitors: number;
  }[];

  // Daxili linklər
  internalLinks: {
    clickRate: string;
    topLinks: { url: string; clicks: number }[];
  };
}

export default function AnalyticsPage() {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, customStart, customEnd]);

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    
    try {
      // Google Analytics 4 API çağırışı
      const params = new URLSearchParams({
        range: timeRange,
        ...(timeRange === "custom" && customStart && customEnd
          ? { start: customStart, end: customEnd }
          : {}),
      });

      const response = await fetch(`/api/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error("Statistika yüklənmədi");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
      
      // Demo məlumat (Firebase konfiqurasiya olunana qədər)
      setData({
        totalVisitors: 12847,
        pageViews: 45231,
        avgSessionDuration: "3:45",
        bounceRate: "42.3%",
        
        byLanguage: [
          { locale: "az", visitors: 7854, pageviews: 28145, percentage: "61.1%" },
          { locale: "ru", visitors: 2341, pageviews: 8934, percentage: "18.2%" },
          { locale: "tr", visitors: 1523, pageviews: 5123, percentage: "11.9%" },
          { locale: "en", visitors: 892, pageviews: 2456, percentage: "6.9%" },
          { locale: "ar", visitors: 237, pageviews: 573, percentage: "1.9%" },
        ],
        
        byAge: [
          { range: "18-24", percentage: "23.5%", visitors: 3019 },
          { range: "25-34", percentage: "38.2%", visitors: 4908 },
          { range: "35-44", percentage: "21.7%", visitors: 2788 },
          { range: "45-54", percentage: "11.3%", visitors: 1452 },
          { range: "55+", percentage: "5.3%", visitors: 680 },
        ],
        
        byGender: [
          { gender: "Qadın", percentage: "68.5%", visitors: 8800 },
          { gender: "Kişi", percentage: "29.8%", visitors: 3828 },
          { gender: "Məlum deyil", percentage: "1.7%", visitors: 219 },
        ],
        
        byCountry: [
          { country: "Azərbaycan", visitors: 8234, percentage: "64.1%" },
          { country: "Türkiyə", visitors: 2145, percentage: "16.7%" },
          { country: "Rusiya", visitors: 1523, percentage: "11.9%" },
          { country: "Almaniya", visitors: 456, percentage: "3.5%" },
          { country: "ABŞ", visitors: 289, percentage: "2.3%" },
          { country: "Digər", visitors: 200, percentage: "1.5%" },
        ],
        
        byCity: [
          { city: "Bakı", country: "Azərbaycan", visitors: 6234 },
          { city: "İstanbul", country: "Türkiyə", visitors: 1523 },
          { city: "Moskva", country: "Rusiya", visitors: 892 },
          { city: "Sumqayıt", country: "Azərbaycan", visitors: 678 },
          { city: "Gəncə", country: "Azərbaycan", visitors: 534 },
        ],
        
        bySources: [
          { source: "Google Axtarış", visitors: 5892, percentage: "45.9%" },
          { source: "Instagram", visitors: 3456, percentage: "26.9%" },
          { source: "Facebook", visitors: 1823, percentage: "14.2%" },
          { source: "Birbaşa", visitors: 1123, percentage: "8.7%" },
          { source: "YouTube", visitors: 345, percentage: "2.7%" },
          { source: "Digər", visitors: 208, percentage: "1.6%" },
        ],
        
        byKeywords: [
          { keyword: "moda tendensiyaları", locale: "az", clicks: 1234, impressions: 12450 },
          { keyword: "gözəllik məsləhətləri", locale: "az", clicks: 987, impressions: 10230 },
          { keyword: "sağlam qidalanma", locale: "az", clicks: 765, impressions: 8900 },
          { keyword: "модные тренды", locale: "ru", clicks: 543, impressions: 6780 },
          { keyword: "beauty tips", locale: "en", clicks: 432, impressions: 5670 },
        ],
        
        topArticles: [
          { title: "2026-cı il moda tendensiyaları", slug: "2026-moda-tendensiyalari", views: 3456, locale: "az" },
          { title: "Dəri qulluğu üçün 10 qızıl qayda", slug: "deri-qulluqu-10-qayda", views: 2891, locale: "az" },
          { title: "Bahar-yay kolleksiyası", slug: "bahar-yay-kolleksiyasi", views: 2345, locale: "az" },
          { title: "Макияж на каждый день", slug: "makiyazh-kazhdyi-den", views: 1678, locale: "ru" },
          { title: "Saç qulluğu sirləri", slug: "sac-qulluqu-sirleri", views: 1456, locale: "az" },
        ],
        
        byTags: [
          { tag: "moda", locale: "az", visitors: 4523 },
          { tag: "gözəllik", locale: "az", visitors: 3892 },
          { tag: "sağlamlıq", locale: "az", visitors: 2456 },
          { tag: "мода", locale: "ru", visitors: 1678 },
          { tag: "lifestyle", locale: "en", visitors: 892 },
        ],
        
        internalLinks: {
          clickRate: "12.5%",
          topLinks: [
            { url: "/az/moda", clicks: 2345 },
            { url: "/az/gozellik", clicks: 1892 },
            { url: "/az/astrologiya", clicks: 1456 },
            { url: "/az/saglamliq", clicks: 1123 },
            { url: "/az/e-jurnal", clicks: 789 },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  }

  const TIME_RANGES = [
    { value: "today", label: "Bu gün" },
    { value: "7days", label: "Son 7 gün" },
    { value: "30days", label: "Son 30 gün" },
    { value: "90days", label: "Son 3 ay" },
    { value: "180days", label: "Son 6 ay" },
    { value: "365days", label: "Son 1 il" },
    { value: "custom", label: "Özəl tarix" },
  ];

  if (!session) return null;

  return (
    <>
      <PageHeader
        title="Statistika və Analitika"
        description="Google Analytics 4 əsasında sayt statistikası, izləyici davranışı və məqalə performansı"
      />

      <div className="px-6 py-8 lg:px-10">
        {/* Tarix seçimi */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as TimeRange)}
              className={`px-4 py-2 font-ui text-[12px] transition-colors ${
                timeRange === range.value
                  ? "border border-bordo bg-bordo text-cream"
                  : "border border-line bg-paper text-ink hover:border-bordo"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {timeRange === "custom" && (
          <div className="mb-6 flex gap-4">
            <div>
              <label className="mb-1 block font-ui text-[11px] text-muted">Başlanğıc</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-line bg-paper px-3 py-2 font-ui text-[13px]"
              />
            </div>
            <div>
              <label className="mb-1 block font-ui text-[11px] text-muted">Bitmə</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-line bg-paper px-3 py-2 font-ui text-[13px]"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <Alert tone="error">
              {error}
              <br />
              <span className="text-[11px]">
                Demo məlumat göstərilir. Firebase və Google Analytics konfiqurasiyası tamamlandıqdan sonra real məlumatlar görünəcək.
              </span>
            </Alert>
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir...</p>
        ) : !data ? (
          <Alert tone="error">Məlumat tapılmadı</Alert>
        ) : (
          <div className="space-y-6">
            {/* Ümumi statistika */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Ümumi ziyarətçi" value={data.totalVisitors.toLocaleString()} />
              <StatCard title="Səhifə baxışı" value={data.pageViews.toLocaleString()} />
              <StatCard title="Orta müddət" value={data.avgSessionDuration} />
              <StatCard title="Bounce rate" value={data.bounceRate} />
            </div>

            {/* Dil statistikası */}
            <Panel title="Dil üzrə statistika" description="5 dildə gələn ziyarətçi sayı">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase text-muted">Dil</th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">Ziyarətçi</th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">Baxış</th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">Faiz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.byLanguage.map((item) => (
                      <tr key={item.locale} className="hover:bg-cream-deep/30">
                        <td className="px-4 py-3 font-display text-[15px]">{item.locale.toUpperCase()}</td>
                        <td className="px-4 py-3 text-right font-ui text-[13px]">{item.visitors.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-ui text-[13px]">{item.pageviews.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-bordo">{item.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            {/* Demoqrafiya */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Yaş qrupları">
                <div className="space-y-3">
                  {data.byAge.map((item) => (
                    <div key={item.range}>
                      <div className="mb-1 flex justify-between font-ui text-[12px]">
                        <span className="text-ink">{item.range} yaş</span>
                        <span className="text-bordo">{item.percentage}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden bg-cream-deep">
                        <div
                          className="h-full bg-bordo transition-all"
                          style={{ width: item.percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Cins statistikası">
                <div className="space-y-3">
                  {data.byGender.map((item) => (
                    <div key={item.gender}>
                      <div className="mb-1 flex justify-between font-ui text-[12px]">
                        <span className="text-ink">{item.gender}</span>
                        <span className="text-bordo">{item.percentage}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden bg-cream-deep">
                        <div
                          className="h-full bg-gold transition-all"
                          style={{ width: item.percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Coğrafiya */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Ölkələr üzrə">
                <div className="space-y-2">
                  {data.byCountry.map((item) => (
                    <div key={item.country} className="flex justify-between border-b border-line py-2">
                      <span className="font-ui text-[13px] text-ink">{item.country}</span>
                      <span className="font-ui text-[13px] text-bordo">{item.visitors.toLocaleString()} ({item.percentage})</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Şəhərlər üzrə (Top 5)">
                <div className="space-y-2">
                  {data.byCity.map((item, idx) => (
                    <div key={`${item.city}-${idx}`} className="flex justify-between border-b border-line py-2">
                      <span className="font-ui text-[13px] text-ink">
                        {item.city}, {item.country}
                      </span>
                      <span className="font-ui text-[13px] text-bordo">{item.visitors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Trafik mənbələri */}
            <Panel title="Trafik mənbələri" description="Ziyarətçilər harad gəlir">
              <div className="space-y-3">
                {data.bySources.map((item) => (
                  <div key={item.source}>
                    <div className="mb-1 flex justify-between font-ui text-[12px]">
                      <span className="text-ink">{item.source}</span>
                      <span className="text-bordo">{item.visitors.toLocaleString()} ({item.percentage})</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden bg-cream-deep">
                      <div
                        className="h-full bg-bordo transition-all"
                        style={{ width: item.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Açar sözlər */}
            <Panel title="Açar sözlər (5 dil üzrə)" description="Google axtarışında hansı açar sözlərlə tapılır">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase text-muted">Açar söz</th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase text-muted">Dil</th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">Klikslər</th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">Göstərilmə</th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase text-muted">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.byKeywords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-cream-deep/30">
                        <td className="px-4 py-3 font-ui text-[13px]">{item.keyword}</td>
                        <td className="px-4 py-3 font-ui text-[11px] uppercase text-muted">{item.locale}</td>
                        <td className="px-4 py-3 text-right font-ui text-[13px]">{item.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-ui text-[13px]">{item.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-bordo">
                          {((item.clicks / item.impressions) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            {/* Ən çox oxunan məqalələr */}
            <Panel title="Ən çox oxunan məqalələr">
              <div className="space-y-2">
                {data.topArticles.map((article, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-line py-3">
                    <div className="flex-1">
                      <p className="font-display text-[15px] text-ink">{article.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted">
                        /{article.slug} · {article.locale.toUpperCase()}
                      </p>
                    </div>
                    <span className="font-ui text-[13px] text-bordo">{article.views.toLocaleString()} baxış</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Etiketlər üzrə trafik */}
            <Panel title="Etiketlərə görə trafik" description="Hansı etiketlər daha çox izləyici gətirir">
              <div className="flex flex-wrap gap-3">
                {data.byTags.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-line bg-cream-deep px-4 py-2 transition-colors hover:border-bordo"
                  >
                    <span className="font-display text-[14px] text-ink">{item.tag}</span>
                    <span className="ml-2 font-ui text-[11px] text-muted">
                      ({item.locale.toUpperCase()})
                    </span>
                    <span className="ml-2 font-ui text-[12px] text-bordo">
                      {item.visitors.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Daxili linklər */}
            <Panel title="Daxili link performansı" description={`Daxili linklərə klik nisbəti: ${data.internalLinks.clickRate}`}>
              <div className="space-y-2">
                {data.internalLinks.topLinks.map((link, idx) => (
                  <div key={idx} className="flex justify-between border-b border-line py-2">
                    <span className="font-mono text-[12px] text-ink">{link.url}</span>
                    <span className="font-ui text-[13px] text-bordo">{link.clicks.toLocaleString()} klik</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="border border-line bg-paper p-5">
      <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">{title}</p>
      <p className="mt-2 font-display text-[1.75rem] text-bordo">{value}</p>
    </div>
  );
}
