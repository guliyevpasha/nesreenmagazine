"use client";

import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert, Empty, Button, Field, inputClass } from "@/components/admin/ui";
import { useAuth } from "@/lib/firebase/auth";
import { listSubscribers } from "@/lib/data/admin";
import type { Subscriber } from "@/lib/data/admin";
import { emptyLocalized } from "@/lib/types";
import type { LocalizedText } from "@/lib/types";

/* ── newsletter campaign type ───────────────────────────────────────────── */
type Campaign = {
  id: string;
  name: string;
  subject: LocalizedText;
  preview: LocalizedText;
  htmlContent: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
};

/* ── mock campaigns ─────────────────────────────────────────────────────── */
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Oktyabr Nömrəsi Çıxdı",
    subject: {
      az: "🎉 Yeni Nömrə: Payız Moda Trendləri",
      en: "🎉 New Issue: Fall Fashion Trends",
      ru: "🎉 Новый выпуск: Осенние тренды моды",
      tr: "🎉 Yeni Sayı: Sonbahar Moda Trendleri",
      ar: "🎉 عدد جديد: اتجاهات الموضة الخريفية",
    },
    preview: {
      az: "Oktyabr nömrəmizdə ən isti moda xəbərləri...",
      en: "In our October issue, the hottest fashion news...",
      ru: "В октябрьском номере самые горячие новости моды...",
      tr: "Ekim sayımızda en sıcak moda haberleri...",
      ar: "في عدد أكتوبر أحدث أخبار الموضة...",
    },
    htmlContent: "<h1>Merhaba!</h1><p>Yeni nömrəmiz çıxdı...</p>",
    status: "sent",
    recipientCount: 1250,
    sentCount: 1250,
    openedCount: 520,
    clickedCount: 145,
    sentAt: "2024-10-01T09:00:00Z",
    createdAt: "2024-09-28T10:00:00Z",
    createdBy: "admin@nesreenmagazine.com",
  },
  {
    id: "2",
    name: "Həftəlik Xülasə #42",
    subject: {
      az: "📰 Bu həftənin ən oxunan məqalələri",
      en: "📰 This week's most read articles",
      ru: "📰 Самые читаемые статьи этой недели",
      tr: "📰 Bu haftanın en çok okunan makaleleri",
      ar: "📰 المقالات الأكثر قراءة هذا الأسبوع",
    },
    preview: emptyLocalized(),
    htmlContent: "<p>Bu həftənin top məqalələri...</p>",
    status: "draft",
    recipientCount: 1250,
    sentCount: 0,
    openedCount: 0,
    clickedCount: 0,
    createdAt: "2024-10-10T14:00:00Z",
    createdBy: "admin@nesreenmagazine.com",
  },
];

/* ── status colors ──────────────────────────────────────────────────────── */
const statusColors: Record<Campaign["status"], string> = {
  draft: "border-gray-300 bg-gray-50 text-gray-600",
  scheduled: "border-blue-300 bg-blue-50 text-blue-700",
  sending: "border-yellow-300 bg-yellow-50 text-yellow-700",
  sent: "border-green-300 bg-green-50 text-green-700",
  failed: "border-red-300 bg-red-50 text-red-700",
};

const statusLabels: Record<Campaign["status"], string> = {
  draft: "Qaralama",
  scheduled: "Planlaşdırılıb",
  sending: "Göndərilir",
  sent: "Göndərilib",
  failed: "Uğursuz",
};

/* ── campaign modal ─────────────────────────────────────────────────────── */
function CampaignModal({
  onClose,
  subscribers,
}: {
  onClose: () => void;
  subscribers: Subscriber[];
}) {
  const { session } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [subjectAz, setSubjectAz] = useState("");
  const [previewAz, setPreviewAz] = useState("");
  const [content, setContent] = useState("");
  const [segment, setSegment] = useState<"all" | "active">("all");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);

  const recipientCount =
    segment === "all"
      ? subscribers.length
      : subscribers.filter((s) => s.active).length;

  async function handleSend() {
    setSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`✓ Email kampaniyası ${recipientCount} abunəçiyə göndərildi!`);
    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-paper border border-line shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between sticky top-0 bg-paper z-10">
          <h2 className="font-display text-xl">Yeni Email Kampaniyası</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Steps indicator */}
        <div className="border-b border-line px-6 py-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s as 1 | 2 | 3)}
                className={`h-8 w-8 rounded-full font-ui text-[12px] border-2 transition-colors ${
                  step === s
                    ? "border-bordo bg-bordo text-cream"
                    : step > s
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-line bg-paper text-muted"
                }`}
              >
                {step > s ? "✓" : s}
              </button>
              {s < 3 && <div className="w-12 h-0.5 bg-line" />}
            </div>
          ))}
        </div>

        <div className="px-6 py-6">
          {/* Step 1: Campaign Info */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Kampaniya adı (internal)">
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Oktyabr Nömrəsi 2024"
                />
              </Field>
              <Field label="Email mövzusu (Azərbaycan)">
                <input
                  className={inputClass}
                  value={subjectAz}
                  onChange={(e) => setSubjectAz(e.target.value)}
                  placeholder="🎉 Yeni nömrəmiz çıxdı!"
                />
              </Field>
              <Field label="Preview mətni (Azərbaycan)">
                <input
                  className={inputClass}
                  value={previewAz}
                  onChange={(e) => setPreviewAz(e.target.value)}
                  placeholder="Bu ayın ən maraqlı məqalələri..."
                />
              </Field>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Email məzmunu (HTML)">
                <textarea
                  className={inputClass}
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<h1>Salam!</h1><p>Yeni nömrəmiz çıxdı...</p>"
                />
                <p className="mt-2 font-ui text-[11px] text-muted">
                  💡 HTML formatında yaza bilərsiniz. Template builder gələcək versiyada əlavə olunacaq.
                </p>
              </Field>
              <div className="border border-line bg-cream/30 p-4">
                <p className="font-ui text-[12px] text-muted mb-2">Preview:</p>
                <div
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: content || "<p>Məzmun boşdur</p>" }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Recipients & Schedule */}
          {step === 3 && (
            <div className="space-y-4">
              <Field label="Alıcı qrupu">
                <select
                  className={inputClass}
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as "all" | "active")}
                >
                  <option value="all">Bütün abunəçilər ({subscribers.length})</option>
                  <option value="active">
                    Yalnız aktiv ({subscribers.filter((s) => s.active).length})
                  </option>
                </select>
              </Field>
              <Field label="Göndərmə vaxtı">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
                <p className="mt-1 font-ui text-[11px] text-muted">
                  Boş buraxsanız dərhal göndəriləcək
                </p>
              </Field>
              <div className="border border-line bg-paper p-4">
                <h3 className="font-display text-[15px] text-ink mb-2">Xülasə:</h3>
                <ul className="space-y-1 font-ui text-[13px] text-muted">
                  <li>📧 Alıcı: <strong>{recipientCount}</strong> abunəçi</li>
                  <li>📝 Mövzu: <strong>{subjectAz || "(boş)"}</strong></li>
                  <li>⏰ Vaxt: <strong>{scheduledAt ? new Date(scheduledAt).toLocaleString("az-AZ") : "Dərhal"}</strong></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-line px-6 py-4 flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
                ← Geri
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Ləğv et
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((step + 1) as 1 | 2 | 3)}>
                Növbəti →
              </Button>
            ) : (
              <Button onClick={() => void handleSend()} disabled={sending || !name || !subjectAz}>
                {sending ? "Göndərilir..." : scheduledAt ? "Planlaşdır" : "Göndər"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────────────────── */
export default function NewslettersPage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const subs = await listSubscribers();
      setSubscribers(subs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
  const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0;

  return (
    <>
      <PageHeader
        title="Newsletter Kampaniyaları"
        description="Email kampaniya yaradın və abunəçilərə göndərin."
        actions={<Button onClick={() => setModal(true)}>+ Yeni kampaniya</Button>}
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Ümumi abunəçi", value: subscribers.length },
            { label: "Göndərilən email", value: totalSent },
            { label: "Açılma nisbəti", value: `${avgOpenRate}%` },
            { label: "Klik nisbəti", value: `${avgClickRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Campaigns List */}
        <Panel title="Kampaniyalar">
          {campaigns.length === 0 ? (
            <Empty title="Kampaniya yoxdur" text="Yeni email kampaniyası yaradın." />
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const openRate = campaign.sentCount > 0
                  ? ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)
                  : 0;
                return (
                  <div
                    key={campaign.id}
                    className="border border-line bg-paper p-5 hover:border-bordo/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-[17px] text-ink">{campaign.name}</h3>
                          <span
                            className={`inline-block border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${statusColors[campaign.status]}`}
                          >
                            {statusLabels[campaign.status]}
                          </span>
                        </div>
                        <p className="font-ui text-[13px] text-muted mb-3">
                          {campaign.subject.az}
                        </p>
                        <div className="flex flex-wrap gap-4 font-ui text-[12px] text-muted">
                          <span>📧 {campaign.recipientCount} alıcı</span>
                          {campaign.sentCount > 0 && (
                            <>
                              <span>📨 {campaign.sentCount} göndərilib</span>
                              <span>👁️ {campaign.openedCount} açılıb ({openRate}%)</span>
                              <span>🖱️ {campaign.clickedCount} klik</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-ui text-[11px] text-muted">
                          {campaign.sentAt
                            ? `Göndərilib: ${new Date(campaign.sentAt).toLocaleDateString("az-AZ")}`
                            : `Yaradılıb: ${new Date(campaign.createdAt).toLocaleDateString("az-AZ")}`}
                        </p>
                        {campaign.status === "draft" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo hover:underline"
                            >
                              Redaktə
                            </button>
                            <button
                              type="button"
                              className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                            >
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Info */}
        <Alert tone="info">
          ℹ️ <strong>Demo sistem:</strong> Email göndərmə funksiyası simulyasiya edilib. 
          Real göndərmə üçün SendGrid, Mailchimp və ya AWS SES API inteqrasiyası lazımdır.
        </Alert>
      </div>

      {/* Modal */}
      {modal && (
        <CampaignModal onClose={() => setModal(false)} subscribers={subscribers} />
      )}
    </>
  );
}
