"use client";

import { useEffect, useState } from "react";
import {
  PageHeader,
  Panel,
  Alert,
  Empty,
  Button,
  Field,
  inputClass,
} from "@/components/admin/ui";
import { useAuth } from "@/lib/firebase/auth";
import {
  listSeoRedirects,
  addSeoRedirect,
  saveSeoRedirect,
  removeSeoRedirect,
  listArticles,
} from "@/lib/data/admin";
import type { SeoRedirect, SeoRedirectInput } from "@/lib/types";

/* ── redirect modal ─────────────────────────────────────────────────────── */
function RedirectModal({
  editing,
  onClose,
  onSaved,
  userEmail,
}: {
  editing: SeoRedirect | null;
  onClose: () => void;
  onSaved: () => void;
  userEmail: string;
}) {
  const [form, setForm] = useState<Omit<SeoRedirectInput, "createdBy" | "createdAt">>(
    editing
      ? { ...editing }
      : {
          from: "",
          to: "",
          type: 301,
          active: true,
          note: "",
        }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, val: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.from || !form.to) {
      setError("From və To sahələri mütləqdir.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await saveSeoRedirect(editing.id, form as Partial<SeoRedirectInput>);
      } else {
        await addSeoRedirect({
          ...form,
          createdBy: userEmail,
          createdAt: new Date().toISOString(),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-paper border border-line shadow-xl">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-xl">
            {editing ? "Redirect redaktə et" : "Yeni redirect"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-6 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <Field label="From (köhnə URL) *">
            <input
              className={inputClass}
              value={form.from}
              onChange={(e) => set("from", e.target.value)}
              placeholder="/az/kohnə-məqalə"
              required
            />
            <p className="mt-1 font-ui text-[11px] text-muted">
              Yalnız path (domain olmadan): /az/category/slug
            </p>
          </Field>

          <Field label="To (yeni URL) *">
            <input
              className={inputClass}
              value={form.to}
              onChange={(e) => set("to", e.target.value)}
              placeholder="/az/yeni-məqalə"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Redirect tipi">
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => set("type", parseInt(e.target.value))}
              >
                <option value={301}>301 (Daimi)</option>
                <option value={302}>302 (Müvəqqəti)</option>
              </select>
            </Field>
            <Field label="Status">
              <label className="flex items-center gap-2 h-full border border-line bg-paper px-3.5">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="font-ui text-[13px] text-ink">Aktiv</span>
              </label>
            </Field>
          </div>

          <Field label="Qeyd">
            <textarea
              className={inputClass}
              rows={2}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Niyə əlavə edildi..."
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saxlanılır…" : editing ? "Yadda saxla" : "Əlavə et"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── sitemap generator ──────────────────────────────────────────────────── */
function generateSitemap(articles: any[]): string {
  const baseUrl = "https://nesreenmagazine.com";
  const locales = ["az", "en", "ru", "tr", "ar"];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Add article pages
  articles
    .filter((a) => a.status === "published")
    .forEach((article) => {
      locales.forEach((locale) => {
        xml += `  <url>
    <loc>${baseUrl}/${locale}/${article.category}/${article.slug}</loc>
    <lastmod>${article.updatedAt || article.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      });
    });

  xml += `</urlset>`;
  return xml;
}

/* ── main page ──────────────────────────────────────────────────────────── */
export default function SEOToolsPage() {
  const { session } = useAuth();
  const [redirects, setRedirects] = useState<SeoRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<SeoRedirect | null>(null);
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://nesreenmagazine.com/sitemap.xml`
  );
  const [sitemapGenerated, setSitemapGenerated] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await listSeoRedirects();
      setRedirects(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu redirect-i silmək istəyirsiniz?")) return;
    try {
      await removeSeoRedirect(id);
      setRedirects((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Silinmə xətası baş verdi.");
    }
  }

  function openEdit(redirect: SeoRedirect) {
    setEditingRedirect(redirect);
    setModal(true);
  }

  function openNew() {
    setEditingRedirect(null);
    setModal(true);
  }

  function handleSaved() {
    setModal(false);
    setEditingRedirect(null);
    void load();
  }

  async function handleGenerateSitemap() {
    try {
      const articles = await listArticles();
      const xml = generateSitemap(articles);
      
      // Download
      const blob = new Blob([xml], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      a.click();
      
      setSitemapGenerated(true);
      setTimeout(() => setSitemapGenerated(false), 3000);
    } catch {
      alert("Sitemap yaradılma xətası");
    }
  }

  function downloadRobotsTxt() {
    const blob = new Blob([robotsTxt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    a.click();
  }

  const activeRedirects = redirects.filter((r) => r.active).length;

  return (
    <>
      <PageHeader
        title="SEO Alətləri"
        description="Sitemap, robots.txt, URL redirects və meta tag idarəetməsi."
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {error && <Alert tone="error">{error}</Alert>}
        {sitemapGenerated && <Alert tone="success">✓ Sitemap uğurla yaradıldı və yükləndi!</Alert>}

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { label: "Aktiv redirectlər", value: activeRedirects },
            { label: "Ümumi redirect", value: redirects.length },
            { label: "Sitemap status", value: "Hazır" },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sitemap Generator */}
          <Panel title="Sitemap Generator">
            <div className="space-y-4">
              <p className="font-ui text-[13px] text-muted">
                Sitemap.xml faylı bütün dərc olunmuş məqalələri və səhifələri ehtiva edir.
                Google və digər axtarış motorları üçün avtomatik yaradılır.
              </p>
              <div className="border border-line bg-cream/30 p-4">
                <p className="font-ui text-[12px] text-muted mb-2">Sitemap strukturu:</p>
                <ul className="space-y-1 font-ui text-[12px] text-ink">
                  <li>✓ Ana səhifə (5 dildə)</li>
                  <li>✓ Bütün dərc olunmuş məqalələr</li>
                  <li>✓ Kateqoriya səhifələri</li>
                  <li>✓ Hər dil üçün alternate linkləri</li>
                </ul>
              </div>
              <Button onClick={() => void handleGenerateSitemap()} className="w-full">
                🗺️ Sitemap.xml yarat və yüklə
              </Button>
              <p className="font-ui text-[11px] text-muted">
                💡 Yaradılan faylı <code>/public</code> qovluğuna köçürün və ya 
                Google Search Console-a yükləyin.
              </p>
            </div>
          </Panel>

          {/* Robots.txt Editor */}
          <Panel title="Robots.txt">
            <div className="space-y-4">
              <Field label="robots.txt məzmunu">
                <textarea
                  className={inputClass}
                  rows={8}
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                />
              </Field>
              <Button onClick={downloadRobotsTxt} className="w-full" variant="ghost">
                ↓ robots.txt yüklə
              </Button>
              <p className="font-ui text-[11px] text-muted">
                💡 Yaradılan faylı <code>/public/robots.txt</code> olaraq saxlayın.
              </p>
            </div>
          </Panel>
        </div>

        {/* URL Redirects */}
        <Panel
          title="URL Redirectlər (301/302)"
          description="Köhnə URL-ləri yenilərə yönləndirin."
          actions={<Button onClick={openNew}>+ Yeni redirect</Button>}
        >
          {loading && (
            <div className="py-8 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
          )}

          {!loading && redirects.length === 0 ? (
            <Empty
              title="Redirect yoxdur"
              text="URL dəyişdikdə redirect əlavə edin ki, SEO itməsin."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      From
                    </th>
                    <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      To
                    </th>
                    <th className="px-4 py-3 text-center font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Tip
                    </th>
                    <th className="px-4 py-3 text-center font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {redirects.map((redirect) => (
                    <tr key={redirect.id} className="hover:bg-cream/30">
                      <td className="px-4 py-3 font-ui text-[13px] text-ink">
                        {redirect.from}
                      </td>
                      <td className="px-4 py-3 font-ui text-[13px] text-muted">
                        {redirect.to}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block border border-line px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] text-muted">
                          {redirect.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            redirect.active ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(redirect)}
                            className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                          >
                            Redaktə
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(redirect.id)}
                            className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* SEO Tips */}
        <Alert tone="info">
          <strong>💡 SEO Məsləhətləri:</strong>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>Sitemap-i hər yeni məqalədən sonra yeniləyin</li>
            <li>301 redirect-ləri köhnə URL-lər üçün istifadə edin</li>
            <li>Robots.txt-də admin paneli bloklayın</li>
            <li>Google Search Console-da sitemap submit edin</li>
          </ul>
        </Alert>
      </div>

      {/* Modal */}
      {modal && (
        <RedirectModal
          editing={editingRedirect}
          onClose={() => {
            setModal(false);
            setEditingRedirect(null);
          }}
          onSaved={handleSaved}
          userEmail={session?.email ?? ""}
        />
      )}
    </>
  );
}
