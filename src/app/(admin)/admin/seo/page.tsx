"use client";

import { useEffect, useState } from "react";

import {
  addSeoRedirect,
  getSeoSettings,
  listSeoRedirects,
  removeSeoRedirect,
  saveSeoRedirect,
  saveSeoSettings,
} from "@/lib/data/admin";
import type { SeoRedirect, SeoRedirectInput, SeoSettings } from "@/lib/types";
import { emptyLocalized } from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Empty,
  Field,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";

/* ── tab tipləri ─────────────────────────────────────────────────────────── */
type Tab = "redirects" | "settings";

/* ── boş redirect forması ────────────────────────────────────────────────── */
function emptyRedirect(): Omit<SeoRedirectInput, "createdBy" | "createdAt"> {
  return { from: "", to: "", type: 301, active: true, note: "" };
}

/* ── default SEO parametrləri ────────────────────────────────────────────── */
function defaultSeoSettings(): Omit<SeoSettings, "updatedAt" | "updatedBy"> {
  return {
    titleTemplate: "%s · Nesreen Magazine",
    defaultDescription: emptyLocalized(),
    defaultOgImage: "",
    robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://nesreenmagazine.com/sitemap.xml",
    gscVerification: "",
    gaId: "",
  };
}

/* ── Redirect sıra ───────────────────────────────────────────────────────── */
function RedirectRow({
  redirect,
  onToggle,
  onDelete,
}: {
  redirect: SeoRedirect;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className={`border-b border-line transition-colors hover:bg-cream-deep/40 ${!redirect.active ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <span className={`inline-block border px-2 py-0.5 font-ui text-[10px] font-bold ${redirect.type === 301 ? "border-green-300 bg-green-50 text-green-700" : "border-blue-300 bg-blue-50 text-blue-700"}`}>
          {redirect.type}
        </span>
      </td>
      <td className="px-4 py-3 font-ui text-[13px] text-bordo font-mono">{redirect.from}</td>
      <td className="px-4 py-3 font-ui text-[13px] text-ink font-mono">→ {redirect.to}</td>
      <td className="px-4 py-3 font-ui text-[12px] text-muted">{redirect.note}</td>
      <td className="px-4 py-3">
        <span className={`inline-block border px-2 py-0.5 font-ui text-[10px] ${redirect.active ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-gray-100 text-gray-500"}`}>
          {redirect.active ? "Aktiv" : "Deaktiv"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggle(redirect.id, !redirect.active)}
            className="font-ui text-[11px] text-muted hover:text-ink transition-colors"
          >
            {redirect.active ? "Deaktiv" : "Aktiv"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(redirect.id)}
            className="font-ui text-[11px] text-bordo/60 hover:text-bordo transition-colors"
          >
            Sil
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Əsas səhifə ─────────────────────────────────────────────────────────── */
export default function SeoPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>("redirects");

  /* Redirects state */
  const [redirects, setRedirects] = useState<SeoRedirect[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [redirectForm, setRedirectForm] = useState(emptyRedirect());
  const [redirectSaving, setRedirectSaving] = useState(false);

  /* SEO Settings state */
  const [seoSettings, setSeoSettings] = useState<Omit<SeoSettings, "updatedAt" | "updatedBy">>(defaultSeoSettings());
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Redirects yüklə */
  async function loadRedirects() {
    setRedirectsLoading(true);
    try {
      setRedirects(await listSeoRedirects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setRedirectsLoading(false);
    }
  }

  /* SEO settings yüklə */
  async function loadSettings() {
    setSettingsLoading(true);
    try {
      const s = await getSeoSettings();
      if (s) setSeoSettings(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setSettingsLoading(false);
    }
  }

  useEffect(() => {
    void loadRedirects();
    void loadSettings();
  }, []);

  /* Redirect əlavə et */
  async function handleAddRedirect(e: React.FormEvent) {
    e.preventDefault();
    if (!redirectForm.from.trim() || !redirectForm.to.trim()) {
      setError("From və To sahələri mütləqdir.");
      return;
    }
    setRedirectSaving(true);
    setError("");
    try {
      await addSeoRedirect({
        ...redirectForm,
        createdBy: session?.email ?? "",
        createdAt: new Date().toISOString(),
      });
      setRedirectForm(emptyRedirect());
      setSuccess("Yönləndirmə əlavə edildi.");
      void loadRedirects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi.");
    } finally {
      setRedirectSaving(false);
    }
  }

  async function handleToggleRedirect(id: string, active: boolean) {
    await saveSeoRedirect(id, { active });
    setRedirects((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
  }

  async function handleDeleteRedirect(id: string) {
    if (!confirm("Bu yönləndirməni silmək istəyirsiniz?")) return;
    await removeSeoRedirect(id);
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  }

  /* SEO settings saxla */
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveSeoSettings({
        ...seoSettings,
        updatedBy: session?.email ?? "",
        updatedAt: new Date().toISOString(),
      });
      setSuccess("SEO parametrləri yadda saxlandı.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlama xətası.");
    } finally {
      setSettingsSaving(false);
    }
  }

  /* Aktiv redirect sayı */
  const activeCount = redirects.filter((r) => r.active).length;

  return (
    <>
      <PageHeader
        title="SEO İdarəetməsi"
        description="301/302 yönləndirmələr, meta parametrləri, robots.txt və Google inteqrasiyası."
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ümumi redirect", value: redirects.length },
            { label: "Aktiv", value: activeCount },
            { label: "Deaktiv", value: redirects.length - activeCount },
          ].map((s) => (
            <div key={s.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</p>
              <p className="mt-1 font-display text-3xl text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Mesajlar */}
        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {/* Tab keçidləri */}
        <div className="flex border-b border-line">
          {(["redirects", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-3 font-ui text-[12px] uppercase tracking-[0.14em] transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-bordo text-bordo"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t === "redirects" ? "Yönləndirmələr" : "SEO Parametrləri"}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Redirects ── */}
        {tab === "redirects" && (
          <div className="space-y-6">
            {/* Yeni redirect forması */}
            <Panel title="Yeni yönləndirmə əlavə et">
              <form onSubmit={(e) => void handleAddRedirect(e)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Tip">
                    <select
                      className={inputClass}
                      value={redirectForm.type}
                      onChange={(e) => setRedirectForm((p) => ({ ...p, type: Number(e.target.value) as 301 | 302 }))}
                    >
                      <option value={301}>301 — Daimi</option>
                      <option value={302}>302 — Müvəqqəti</option>
                    </select>
                  </Field>
                  <Field label="Köhnə URL (from) *">
                    <input
                      className={inputClass}
                      value={redirectForm.from}
                      onChange={(e) => setRedirectForm((p) => ({ ...p, from: e.target.value }))}
                      placeholder="/kohnə-yol"
                      required
                    />
                  </Field>
                  <Field label="Yeni URL (to) *">
                    <input
                      className={inputClass}
                      value={redirectForm.to}
                      onChange={(e) => setRedirectForm((p) => ({ ...p, to: e.target.value }))}
                      placeholder="/yeni-yol"
                      required
                    />
                  </Field>
                  <Field label="Qeyd">
                    <input
                      className={inputClass}
                      value={redirectForm.note}
                      onChange={(e) => setRedirectForm((p) => ({ ...p, note: e.target.value }))}
                      placeholder="Niyə əlavə edildi..."
                    />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={redirectSaving}>
                    {redirectSaving ? "Əlavə edilir…" : "Əlavə et"}
                  </Button>
                </div>
              </form>
            </Panel>

            {/* Redirects cədvəli */}
            {redirectsLoading ? (
              <div className="py-12 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
            ) : redirects.length === 0 ? (
              <Empty title="Yönləndirmə yoxdur" text="Yuxarıdan yeni yönləndirmə əlavə edin." />
            ) : (
              <div className="border border-line bg-paper overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-line bg-cream-deep">
                      {["Tip", "Köhnə URL", "Yeni URL", "Qeyd", "Status", "Əməliyyat"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-ui text-[10px] uppercase tracking-[0.14em] text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {redirects.map((r) => (
                      <RedirectRow
                        key={r.id}
                        redirect={r}
                        onToggle={(id, active) => void handleToggleRedirect(id, active)}
                        onDelete={(id) => void handleDeleteRedirect(id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: SEO Parametrləri ── */}
        {tab === "settings" && (
          <form onSubmit={(e) => void handleSaveSettings(e)} className="space-y-6">

            <Panel title="Əsas parametrlər">
              <div className="space-y-4">
                <Field label="Başlıq şablonu" hint="Məs: %s · Nesreen Magazine — %s yerinə səhifə adı yazılır">
                  <input
                    className={inputClass}
                    value={seoSettings.titleTemplate}
                    onChange={(e) => setSeoSettings((p) => ({ ...p, titleTemplate: e.target.value }))}
                    placeholder="%s · Nesreen Magazine"
                  />
                </Field>
                <Field label="Default OG şəkli (URL)">
                  <input
                    className={inputClass}
                    value={seoSettings.defaultOgImage}
                    onChange={(e) => setSeoSettings((p) => ({ ...p, defaultOgImage: e.target.value }))}
                    placeholder="https://nesreenmagazine.com/og-default.jpg"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Google Analytics ID" hint="Məs: G-XXXXXXXXXX">
                    <input
                      className={inputClass}
                      value={seoSettings.gaId}
                      onChange={(e) => setSeoSettings((p) => ({ ...p, gaId: e.target.value }))}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </Field>
                  <Field label="Google Search Console verifikasiya kodu">
                    <input
                      className={inputClass}
                      value={seoSettings.gscVerification}
                      onChange={(e) => setSeoSettings((p) => ({ ...p, gscVerification: e.target.value }))}
                      placeholder="Verifikasiya kodu"
                    />
                  </Field>
                </div>
              </div>
            </Panel>

            <Panel title="Default meta açıqlamaları" description="Hər dil üçün ayrıca meta açıqlama yazın.">
              <div className="space-y-3">
                {(["az", "en", "ru", "tr", "ar"] as const).map((locale) => (
                  <Field key={locale} label={`Meta açıqlama (${locale.toUpperCase()})`}>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={seoSettings.defaultDescription[locale]}
                      onChange={(e) =>
                        setSeoSettings((p) => ({
                          ...p,
                          defaultDescription: { ...p.defaultDescription, [locale]: e.target.value },
                        }))
                      }
                      placeholder={`${locale.toUpperCase()} dilində meta açıqlama (max 160 simvol)`}
                      maxLength={160}
                    />
                    <p className="mt-1 font-ui text-[11px] text-muted">
                      {seoSettings.defaultDescription[locale]?.length ?? 0}/160
                    </p>
                  </Field>
                ))}
              </div>
            </Panel>

            <Panel title="robots.txt" description="Axtarış motorlarına göstəriş faylı.">
              <textarea
                className={`${inputClass} font-mono text-[12px]`}
                rows={8}
                value={seoSettings.robotsTxt}
                onChange={(e) => setSeoSettings((p) => ({ ...p, robotsTxt: e.target.value }))}
              />
              <p className="mt-2 font-ui text-[11px] text-muted">
                ⚠ Bu faylı yanlış konfiqurasiya etmək saytın Google-da indekslənməsini dayandıra bilər.
              </p>
            </Panel>

            <div className="flex justify-end">
              <Button type="submit" disabled={settingsSaving || settingsLoading}>
                {settingsSaving ? "Saxlanılır…" : "Parametrləri yadda saxla"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
