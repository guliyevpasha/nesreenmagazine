"use client";

/**
 * Redaktor test stendi: yaz → «Saxla» (localStorage + server sanitizasiyası) →
 * səhifəni yenilə → məzmun bərpa olunur. Saytdakı render ilə eyni funksiya istifadə olunur.
 */
import { useEffect, useState } from "react";
import WordEditor from "@/components/admin/editor/word/WordEditor";

const KEY = "nm-editor-harness";

export default function EditorTestPage() {
  const [ready, setReady] = useState(false);
  const [locale, setLocale] = useState("az");
  const [html, setHtml] = useState("");
  const [rendered, setRendered] = useState<{ html: string; toc: { id: string; text: string; level: number }[] } | null>(null);
  const [saved, setSaved] = useState(false);

  async function render(source: string) {
    const res = await fetch("/api/editor-test/render", { method: "POST", body: source });
    setRendered(await res.json());
  }

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null") as { html: string; locale: string } | null;
      if (raw) {
        setHtml(raw.html);
        setLocale(raw.locale);
        void render(raw.html);
      }
    } catch {
      /* */
    }
    setReady(true);
  }, []);

  if (!ready) return null;
  return (
    <main className="mx-auto max-w-6xl p-3 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-3 font-ui text-[13px]">
        <strong>Redaktor test stendi</strong>
        <select value={locale} onChange={(e) => setLocale(e.target.value)} data-testid="harness-locale" className="border border-line px-2 py-1">
          {["az", "en", "ru", "tr", "ar"].map((l) => <option key={l}>{l}</option>)}
        </select>
        <button
          type="button"
          data-testid="harness-save"
          className="bg-bordo px-3 py-1.5 text-white"
          onClick={async () => {
            localStorage.setItem(KEY, JSON.stringify({ html, locale }));
            await render(html);
            setSaved(true);
          }}
        >
          Saxla
        </button>
        <button type="button" data-testid="harness-clear" className="border border-line px-3 py-1.5" onClick={() => { localStorage.removeItem(KEY); location.reload(); }}>
          Təmizlə
        </button>
        {saved && <span data-testid="harness-saved">Saxlanıldı</span>}
      </div>
      <WordEditor key={locale} locale={locale} content={html} onChange={setHtml} />
      <pre data-testid="harness-html" className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap bg-white p-3 text-[11px]">{html}</pre>
      {rendered && (
        <section className="mt-6 bg-white p-6">
          <p className="font-ui text-[12px] text-muted">Saytdakı render (server sanitizasiyası ilə):</p>
          <ol data-testid="harness-toc">
            {rendered.toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}
          </ol>
          <div className="prose-mag" data-testid="harness-render" dir={locale === "ar" ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: rendered.html }} />
        </section>
      )}
    </main>
  );
}
