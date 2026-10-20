"use client";

import { useState } from "react";
import { PageHeader, Panel, Button, Alert } from "@/components/admin/ui";

export default function ScheduledJobsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function runScheduledJobs() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/cron/publish-scheduled", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Planlaşdırılmış Tapşırıqlar"
        description="Scheduled məqalələr və reklamlar üçün avtomatik job trigger"
      />

      <div className="px-6 py-8 lg:px-10 space-y-6">
        <Panel title="Cron Job Status">
          <div className="space-y-4">
            <Alert tone="info">
              ℹ️ Bu səhifə planlaşdırılmış məqalələrin və reklamların vaxtı çatdıqda avtomatik
              dərc edilməsi sistemini idarə edir.
            </Alert>

            <div className="space-y-3">
              <h3 className="font-ui text-[13px] uppercase tracking-[0.14em] text-muted">
                Avtomatik İşləmə
              </h3>
              <p className="font-ui text-[13px] text-ink-soft leading-relaxed">
                Production mühitində (Vercel), cron job <strong>hər 10 dəqiqədə bir</strong> avtomatik
                işləyir və aşağıdakı əməliyyatları yerinə yetirir:
              </p>
              <ul className="list-disc list-inside space-y-2 font-ui text-[13px] text-ink-soft">
                <li>Scheduled status-da vaxtı çatan məqalələri published edir</li>
                <li>Scheduled reklamları active edir (startsAt tarixi çatıbsa)</li>
                <li>Active reklamları expired edir (endsAt tarixi keçibsə)</li>
              </ul>
            </div>

            <div className="border-t border-line pt-4 mt-4">
              <h3 className="font-ui text-[13px] uppercase tracking-[0.14em] text-muted mb-3">
                Manual Test
              </h3>
              <p className="font-ui text-[13px] text-ink-soft mb-4">
                Sistemin düzgün işlədiyini yoxlamaq üçün manual olaraq işə sala bilərsiniz:
              </p>
              
              <Button
                onClick={runScheduledJobs}
                disabled={loading}
              >
                {loading ? "İşləyir..." : "▶ İndi İşlət"}
              </Button>
            </div>

            {error && (
              <div className="mt-4">
                <Alert tone="error">{error}</Alert>
              </div>
            )}

            {result && (
              <div className="mt-4 border border-line bg-cream p-4 space-y-3">
                <h3 className="font-ui text-[13px] uppercase tracking-[0.14em] text-ink">
                  Nəticə
                </h3>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="border border-line bg-paper p-3">
                    <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                      Dərc edilən məqalələr
                    </p>
                    <p className="mt-1 font-display text-2xl text-ink">
                      {result.publishedArticles}
                    </p>
                  </div>

                  <div className="border border-line bg-paper p-3">
                    <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                      Aktivləşən reklamlar
                    </p>
                    <p className="mt-1 font-display text-2xl text-ink">
                      {result.activatedAds}
                    </p>
                  </div>

                  <div className="border border-line bg-paper p-3">
                    <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                      Bitən reklamlar
                    </p>
                    <p className="mt-1 font-display text-2xl text-ink">
                      {result.deactivatedAds}
                    </p>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-ui text-[12px] text-red-600 mb-2">
                      ⚠️ Xətalar ({result.errors.length}):
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i} className="font-mono text-[11px] text-red-600">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="font-ui text-[11px] text-muted">
                  Timestamp: {new Date(result.timestamp).toLocaleString("az-AZ")}
                </p>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Konfiqurasiya">
          <div className="space-y-4">
            <div>
              <h3 className="font-ui text-[13px] uppercase tracking-[0.14em] text-muted mb-2">
                Vercel Cron Setup
              </h3>
              <p className="font-ui text-[13px] text-ink-soft mb-3">
                <code className="bg-cream px-2 py-1 border border-line">vercel.json</code> faylında
                konfiqurasiya edilib:
              </p>
              <pre className="bg-cream-deep border border-line p-4 overflow-x-auto font-mono text-[11px] text-ink-soft">
{`{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/10 * * * *"
    }
  ]
}`}
              </pre>
              <p className="mt-2 font-ui text-[11px] text-muted">
                Schedule: Hər 10 dəqiqədə bir (*/10 * * * *)
              </p>
            </div>

            <div>
              <h3 className="font-ui text-[13px] uppercase tracking-[0.14em] text-muted mb-2">
                Security
              </h3>
              <p className="font-ui text-[13px] text-ink-soft mb-2">
                Cron endpoint-i qorunması üçün secret key istifadə edin:
              </p>
              <pre className="bg-cream-deep border border-line p-4 overflow-x-auto font-mono text-[11px] text-ink-soft">
{`# .env.local
CRON_SECRET_KEY=your_random_secret_key_here`}
              </pre>
              <p className="mt-2 font-ui text-[11px] text-muted">
                Xarici cron servislər (cron-job.org, EasyCron) istifadə edirsinizsə,
                Authorization header əlavə edin: <code className="bg-cream px-1">Bearer YOUR_SECRET</code>
              </p>
            </div>

            <div>
              <h3 className="font-ui text-[13px] uppercase tracking-[0.14em] text-muted mb-2">
                Alternativ: Xarici Cron Service
              </h3>
              <p className="font-ui text-[13px] text-ink-soft mb-2">
                Vercel Cron əvəzinə xarici servis də istifadə edə bilərsiniz:
              </p>
              <ul className="list-disc list-inside space-y-1 font-ui text-[12px] text-ink-soft">
                <li><strong>cron-job.org</strong> - pulsuz, 1 dəqiqə interval</li>
                <li><strong>EasyCron</strong> - pulsuz, flexible scheduling</li>
                <li><strong>UptimeRobot</strong> - monitoring + cron</li>
              </ul>
              <p className="mt-2 font-ui text-[12px] text-muted">
                URL: <code className="bg-cream px-1">https://nesreenmagazine.com/api/cron/publish-scheduled</code>
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Monitoring və Logs">
          <div className="space-y-3">
            <p className="font-ui text-[13px] text-ink-soft">
              Cron job-ların işləməsini izləmək üçün:
            </p>
            <ul className="list-disc list-inside space-y-2 font-ui text-[13px] text-ink-soft">
              <li>Vercel Dashboard → Deployments → Logs</li>
              <li>[CRON] prefix ilə log-lar göstərilir</li>
              <li>Uğurlu və ya uğursuz icraların sayını görə bilərsiniz</li>
            </ul>
            
            <Alert tone="info">
              💡 <strong>Best Practice:</strong> Hər həftə bu səhifəyə daxil olub manual test edin
              və sistemin düzgün işlədiyini yoxlayın.
            </Alert>
          </div>
        </Panel>
      </div>
    </>
  );
}
