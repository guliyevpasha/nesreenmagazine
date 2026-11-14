"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "react-markdown-editor-lite/lib/index.css";

import { authorizedFetch } from "@/lib/auth/authorized-fetch";
import { ensureSubscriberTokens, listSubscribers, type Subscriber } from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import { locales, type Locale } from "@/lib/i18n/config";
import { newsletterMarkdownToHtml } from "@/lib/newsletter/markdown";
import { latestPerEmail } from "@/lib/newsletter/shared";
import NewsletterInsertTools from "@/components/admin/NewsletterInsertTools";
import { PageHeader, Alert, Button, Field, inputClass } from "@/components/admin/ui";

// Markdown editor (client-side only)
const MdEditor = dynamic(() => import("react-markdown-editor-lite"), { ssr: false });

const LOCALE_LABELS: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "İngilis",
  ru: "Rus",
  tr: "Türk",
  ar: "Ərəb",
};

/** Bir API sorğusunda göndərilən alıcı sayı (server limiti 20) */
const CHUNK = 15;

const markdownToHtml = newsletterMarkdownToHtml;

type Progress = { done: number; total: number; sent: number; failed: { email: string; error: string }[] };

export default function NewslettersPage() {
  const { session } = useAuth();
  const admin = isAdmin(session);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [locale, setLocale] = useState<Locale>("az");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!admin) return;
    listSubscribers()
      .then(setSubscribers)
      .catch((err) => setMessage({ tone: "error", text: `Abunəçilər yüklənmədi: ${err.message}` }))
      .finally(() => setLoadingList(false));
  }, [admin]);

  /** Hər dil üzrə göndəriləcək aktiv abunəçilər (təkrarsız, imtina edənlər çıxılıb) */
  const activeByLocale = useMemo(() => {
    const result = Object.fromEntries(locales.map((l) => [l, [] as Subscriber[]])) as Record<Locale, Subscriber[]>;
    for (const s of latestPerEmail(subscribers)) {
      if (!s.active) continue;
      const loc = (locales as readonly string[]).includes(s.locale ?? "") ? (s.locale as Locale) : "az";
      result[loc].push(s);
    }
    return result;
  }, [subscribers]);

  if (!session) {
    return <p className="px-10 py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</p>;
  }

  if (!admin) {
    return (
      <div className="px-6 py-16 lg:px-10">
        <Alert tone="error">Bu bölmə yalnız admin üçündür.</Alert>
      </div>
    );
  }

  const recipients = activeByLocale[locale];

  async function post(payload: Record<string, unknown>) {
    const response = await authorizedFetch("/api/admin/send-newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html: markdownToHtml(content), locale, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data as { sent: string[]; failed: { email: string; error: string }[] };
  }

  async function handleTest() {
    setBusy(true);
    setMessage(null);
    try {
      await post({ test: true });
      setMessage({ tone: "success", text: `Test məktubu ${session?.email} ünvanına göndərildi. Poçtu (və Spam qovluğunu) yoxlayın.` });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Xəta baş verdi" });
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    if (recipients.length === 0) return;
    if (!confirm(`«${subject}» məktubu ${recipients.length} nəfər ${LOCALE_LABELS[locale]} dilli abunəçiyə göndərilsin?`)) return;

    setBusy(true);
    setMessage(null);
    const state: Progress = { done: 0, total: recipients.length, sent: 0, failed: [] };
    setProgress({ ...state });

    try {
      const withTokens = await ensureSubscriberTokens(recipients);
      for (let i = 0; i < withTokens.length; i += CHUNK) {
        const chunk = withTokens.slice(i, i + CHUNK).map((s) => ({ id: s.id, email: s.email, token: s.token! }));
        try {
          const result = await post({ recipients: chunk });
          state.sent += result.sent.length;
          state.failed.push(...result.failed);
        } catch (error) {
          const text = error instanceof Error ? error.message : "Xəta";
          state.failed.push(...chunk.map((c) => ({ email: c.email, error: text })));
        }
        state.done = Math.min(i + CHUNK, withTokens.length);
        setProgress({ ...state, failed: [...state.failed] });
      }
      setMessage({
        tone: state.failed.length ? "error" : "success",
        text: `Göndərildi: ${state.sent}. Uğursuz: ${state.failed.length}.`,
      });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Xəta baş verdi" });
    } finally {
      setBusy(false);
    }
  }

  const canSend = !busy && subject.trim() && content.trim();

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Email Bülten"
        description="«Həftənin seçimi» — abunəçilərə öz dillərində, info@nesreenmagazine.com ünvanından göndərilir."
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <div className="max-w-4xl space-y-6">
        <Field label="Hansı dildə abunə olanlara?">
          <div className="flex flex-wrap gap-2">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                disabled={busy}
                className={`border px-4 py-2 font-ui text-[13px] transition-colors ${
                  locale === l ? "border-bordo bg-bordo text-cream" : "border-line bg-paper text-ink hover:border-bordo"
                }`}
              >
                {LOCALE_LABELS[l]}{" "}
                <span className={locale === l ? "text-cream/70" : "text-muted"}>
                  ({loadingList ? "…" : activeByLocale[l].length})
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Mötərizədə — həmin dildə aktiv abunəçi sayı. İmtina edənlərə məktub getmir.{" "}
            <Link href="/admin/subscribers" className="text-bordo hover:underline">Abunəçilər siyahısı →</Link>
          </p>
        </Field>

        <Field label={`Mövzu (${LOCALE_LABELS[locale]} dilində)`}>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Həftənin seçimi: …"
            className={inputClass}
            dir={locale === "ar" ? "rtl" : "ltr"}
            maxLength={200}
          />
        </Field>

        <Field label={`Məzmun (${LOCALE_LABELS[locale]} dilində)`}>
          <NewsletterInsertTools
            locale={locale}
            disabled={busy}
            onInsert={(md) => setContent((prev) => (prev.trim() ? `${prev.trimEnd()}

${md}` : md))}
          />
          <div className="overflow-hidden border border-line">
            <MdEditor
              value={content}
              style={{ height: "460px" }}
              onChange={({ text }) => setContent(text)}
              renderHTML={(text) => markdownToHtml(text)}
              config={{
                view: { menu: true, md: true, html: true },
                canView: { menu: true, md: true, html: true, fullScreen: true, hideMenu: true },
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Markdown: ## başlıq, **qalın**, *kursiv*, [link](https://…), --- ayırıcı. Abzaslar arasında boş
            sətir buraxın. Loqo, imtina linki və altlıq avtomatik əlavə olunur.
          </p>
        </Field>

        {progress && (
          <div className="border border-line bg-paper p-4">
            <div className="flex justify-between font-ui text-[12px] text-muted">
              <span>Göndərilir: {progress.done} / {progress.total}</span>
              <span>Uğurlu {progress.sent} · Uğursuz {progress.failed.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden bg-line">
              <div className="h-full bg-bordo transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
            {progress.failed.length > 0 && (
              <ul className="mt-3 max-h-40 overflow-auto font-ui text-[12px] text-bordo">
                {progress.failed.map((f) => (
                  <li key={f.email}>{f.email} — {f.error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => void handleTest()} disabled={!canSend}>
            Test — yalnız mənə göndər
          </Button>
          <Button onClick={() => void handleSend()} disabled={!canSend || recipients.length === 0}>
            {busy ? "Göndərilir…" : `${recipients.length} abunəçiyə göndər`}
          </Button>
          <button
            type="button"
            onClick={() => {
              setSubject("");
              setContent("");
              setMessage(null);
              setProgress(null);
            }}
            disabled={busy}
            className="px-4 py-2 text-sm text-muted hover:text-ink"
          >
            Təmizlə
          </button>
        </div>
        <p className="text-xs text-muted">
          Hostinger poçtunun gündəlik göndərmə limiti var. Göndərmə bitənə qədər bu səhifəni bağlamayın.
        </p>
      </div>
    </div>
  );
}
