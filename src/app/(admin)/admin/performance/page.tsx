"use client";

import { useEffect, useState } from "react";
import {
  getPerformanceSummary,
  listPagePerformance,
  listOptimizationTips,
  testPagePerformance,
  markOptimizationTipImplemented,
  createOptimizationTip,
  deleteOptimizationTip,
} from "@/lib/data/admin";
import type {
  PerformanceSummary,
  PagePerformance,
  OptimizationTip,
} from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";

export default function PerformanceMonitorPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [recentTests, setRecentTests] = useState<PagePerformance[]>([]);
  const [tips, setTips] = useState<OptimizationTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testUrl, setTestUrl] = useState("/");
  const [testDevice, setTestDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [summaryData, testsData, tipsData] = await Promise.all([
        getPerformanceSummary(),
        listPagePerformance(20),
        listOptimizationTips(),
      ]);

      setSummary(summaryData);
      setRecentTests(testsData);
      setTips(tipsData);
    } catch (error) {
      console.error("Failed to load performance data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestPage() {
    if (!testUrl.trim()) return;

    setIsTesting(true);
    try {
      await testPagePerformance(testUrl, testUrl, testDevice);
      await loadData();
      alert("Test tamamlandı!");
    } catch (error) {
      alert("Test uğursuz oldu");
    } finally {
      setIsTesting(false);
    }
  }

  async function handleMarkImplemented(tipId: string) {
    if (!user) return;
    try {
      await markOptimizationTipImplemented(tipId, user.uid);
      loadData();
    } catch (error) {
      alert("Xəta baş verdi");
    }
  }

  function getRatingColor(rating: string): string {
    switch (rating) {
      case "good":
        return "text-green-600 bg-green-50";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performans Monitorinqi</h1>
          <p className="text-muted-foreground">
            Sayt sürəti və Core Web Vitals izləməsi
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={testDevice}
            onChange={(e) => setTestDevice(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>

          <input
            type="text"
            placeholder="Səhifə URL"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          />

          <button
            onClick={handleTestPage}
            disabled={isTesting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isTesting ? "Test edilir..." : "🚀 Test Et"}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Orta Performans</div>
              <div className={`text-4xl font-bold ${getScoreColor(summary.averageScore)}`}>
                {summary.averageScore.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/ 100</div>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Desktop</div>
              <div className={`text-4xl font-bold ${getScoreColor(summary.byDevice.desktop.averageScore)}`}>
                {summary.byDevice.desktop.averageScore.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.byDevice.desktop.testCount} test
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Mobile</div>
              <div className={`text-4xl font-bold ${getScoreColor(summary.byDevice.mobile.averageScore)}`}>
                {summary.byDevice.mobile.averageScore.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.byDevice.mobile.testCount} test
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Son Test</div>
              <div className="text-lg font-medium">
                {new Date(summary.lastTestedAt).toLocaleDateString("az-AZ")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(summary.lastTestedAt).toLocaleTimeString("az-AZ")}
              </div>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Core Web Vitals</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">LCP</div>
                <div className="text-2xl font-bold">
                  {(summary.averageWebVitals.lcp / 1000).toFixed(2)}s
                </div>
                <div className="text-xs text-muted-foreground mt-1">Largest Contentful Paint</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">FID</div>
                <div className="text-2xl font-bold">
                  {summary.averageWebVitals.fid.toFixed(0)}ms
                </div>
                <div className="text-xs text-muted-foreground mt-1">First Input Delay</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">CLS</div>
                <div className="text-2xl font-bold">
                  {summary.averageWebVitals.cls.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Cumulative Layout Shift</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">FCP</div>
                <div className="text-2xl font-bold">
                  {(summary.averageWebVitals.fcp / 1000).toFixed(2)}s
                </div>
                <div className="text-xs text-muted-foreground mt-1">First Contentful Paint</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">TTFB</div>
                <div className="text-2xl font-bold">
                  {summary.averageWebVitals.ttfb.toFixed(0)}ms
                </div>
                <div className="text-xs text-muted-foreground mt-1">Time to First Byte</div>
              </div>
            </div>
          </div>

          {/* Slowest & Fastest Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">🐌 Ən Yavaş Səhifələr</h2>
              <div className="space-y-3">
                {summary.slowestPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{page.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{page.url}</div>
                    </div>
                    <div className={`text-lg font-bold ml-4 ${getScoreColor(page.score)}`}>
                      {page.score.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">⚡ Ən Sürətli Səhifələr</h2>
              <div className="space-y-3">
                {summary.fastestPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{page.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{page.url}</div>
                    </div>
                    <div className={`text-lg font-bold ml-4 ${getScoreColor(page.score)}`}>
                      {page.score.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Optimization Tips */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">💡 Optimallaşdırma Tövsiyələri</h2>
          <span className="text-sm text-muted-foreground">
            {tips.filter((t) => !t.implemented).length} aktiv
          </span>
        </div>

        <div className="space-y-3">
          {tips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tövsiyə yoxdur
            </div>
          ) : (
            tips.map((tip) => (
              <div
                key={tip.id}
                className={`p-4 border rounded-lg ${
                  tip.implemented ? "bg-gray-50 opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{tip.title}</span>
                      {tip.impact === "high" && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                          Yüksək təsir
                        </span>
                      )}
                      {tip.impact === "medium" && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                          Orta təsir
                        </span>
                      )}
                      {tip.effort === "easy" && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Asan
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {tip.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tip.affectedPages} səhifə təsir olunar
                    </div>
                  </div>

                  {!tip.implemented && (
                    <button
                      onClick={() => handleMarkImplemented(tip.id)}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 ml-4"
                    >
                      ✓ Tətbiq edildi
                    </button>
                  )}
                  {tip.implemented && (
                    <div className="text-sm text-green-600 ml-4">✓ Tətbiq edilib</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Tests */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Son Testlər</h2>
        <div className="space-y-3">
          {recentTests.map((test) => (
            <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">{test.pageTitle}</div>
                <div className="text-sm text-muted-foreground">{test.pageUrl}</div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className={`px-2 py-1 rounded ${getRatingColor(test.webVitals.lcpRating)}`}>
                    LCP: {(test.webVitals.lcp / 1000).toFixed(2)}s
                  </span>
                  <span className={`px-2 py-1 rounded ${getRatingColor(test.webVitals.fidRating)}`}>
                    FID: {test.webVitals.fid}ms
                  </span>
                  <span className={`px-2 py-1 rounded ${getRatingColor(test.webVitals.clsRating)}`}>
                    CLS: {test.webVitals.cls.toFixed(3)}
                  </span>
                  <span className="text-muted-foreground">
                    {test.device === "desktop" ? "🖥️" : "📱"} {test.device}
                  </span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(test.performanceScore)}`}>
                {test.performanceScore}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
