"use client";

import { useEffect, useState } from "react";

import { getSiteSettings, saveSiteSettings } from "@/lib/data/admin";
import type { SiteSettings, SocialLinks, SitePopup, FooterColumn } from "@/lib/types";
import { emptyLocalized } from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";

/* ── tab tipləri ─────────────────────────────────────────────────────────── */
type Tab = "general" | "social" | "footer" | "popup";

/* ── default dəyərlər ────────────────────────────────────────────────────── */
function defaultSettings(): Omit<SiteSettings, "updatedAt" | "updatedBy"> {
  return {
    logoUrl: "",
    faviconUrl: "",
    heroBannerUrl: "",
    heroBannerTitle: emptyLocalized(),
    heroBannerSubtitle: emptyLocalized(),
    heroBannerCtaText: emptyLocalized(),
    heroBannerCtaHref: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: emptyLocalized(),
    social: {
      instagram: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      twitter: "",
      whatsapp: "",
      telegram: "",
    },
    footerColumns: [],
    footerNote: emptyLocalized(),
    popup: {
      active: false,
      title: emptyLocalized(),
      body: emptyLocalized(),
      ctaText: emptyLocalized(),
      ctaHref: "",
      startsAt: "",
      endsAt: "",
    },
  };
}

const LOCALES = ["az", "en", "ru", "tr", "ar"] as const;
const LOCALE_NAMES: Record<string, string> = { az: "AZ", en: "EN", ru: "RU", tr: "TR", ar: "AR" };

/* ── Dil inputu köməkçisi ────────────────────────────────────────────────── */
function LocaleFields({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Record<string, string>;
  onChange: (locale: string, val: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {LOCALES.map((locale) =>
          multiline ? (
            <div key={locale}>
              <label className="mb-1 block font-ui text-[10px] text-muted">{LOCALE_NAMES[locale]}</label>
              <textarea
                className={`${inputClass} text-[12px]`}
                rows={2}
                value={value[locale] ?? ""}
                onChange={(e) => onChange(locale, e.target.value)}
              />
            </div>
          ) : (
            <div key={locale}>
              <label className="mb-1 block font-ui text-[10px] text-muted">{LOCALE_NAMES[locale]}</label>
              <input
                className={`${inputClass} text-[12px]`}
                value={value[locale] ?? ""}
                onChange={(e) => onChange(locale, e.target.value)}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/* ── Footer sütunu redaktəsi ─────────────────────────────────────────────── */
function FooterColumnEditor({
  column,
  index,
  onUpdate,
  onDelete,
}: {
  column: FooterColumn;
  index: number;
  onUpdate: (col: FooterColumn) => void;
  onDelete: () => void;
}) {
  function updateTitle(locale: string, val: string) {
    onUpdate({ ...column, title: { ...column.title, [locale]: val } });
  }

  function addLink() {
    onUpdate({
      ...column,
      links: [
        ...column.links,
        { label: emptyLocalized(), href: "", external: false },
      ],
    });
  }

  function updateLink(i: number, key: string, val: string | boolean) {
    const links = column.links.map((l, idx) =>
      idx === i ? { ...l, [key]: val } : l,
    );
    onUpdate({ ...column, links });
  }

  function updateLinkLabel(i: number, locale: string, val: string) {
    const links = column.links.map((l, idx) =>
      idx === i ? { ...l, label: { ...l.label, [locale]: val } } : l,
    );
    onUpdate({ ...column, links });
  }

  function removeLink(i: number) {
    onUpdate({ ...column, links: column.links.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="border border-line bg-paper p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-ui text-[12px] font-semibold text-ink">Sütun {index + 1}</p>
        <button
          type="button"
          onClick={onDelete}
          className="font-ui text-[11px] text-bordo/60 hover:text-bordo"
        >
          Sütunu sil
        </button>
      </div>

      <LocaleFields
        label="Sütun başlığı"
        value={column.title}
        onChange={updateTitle}
      />

      <div className="space-y-2">
        <p className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted">Keçidlər</p>
        {column.links.map((link, i) => (
          <div key={i} className="border border-line p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {LOCALES.slice(0, 2).map((locale) => (
                <div key={locale}>
                  <label className="mb-1 block font-ui text-[10px] text-muted">Etiket ({LOCALE_NAMES[locale]})</label>
                  <input
                    className={`${inputClass} text-[12px]`}
                    value={link.label[locale] ?? ""}
                    onChange={(e) => updateLinkLabel(i, locale, e.target.value)}
                    placeholder="Keçid mətni"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="mb-1 block font-ui text-[10px] text-muted">URL</label>
                <input
                  className={`${inputClass} text-[12px]`}
                  value={link.href}
                  onChange={(e) => updateLink(i, "href", e.target.value)}
                  placeholder="/haqqimizda"
                />
              </div>
              <label className="flex items-center gap-1.5 font-ui text-[12px] text-muted pb-2.5">
                <input
                  type="checkbox"
                  checked={link.external}
                  onChange={(e) => updateLink(i, "external", e.target.checked)}
                  className="h-4 w-4 accent-bordo"
                />
                Xarici
              </label>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="font-ui text-[11px] text-bordo/60 hover:text-bordo pb-2.5"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        <Button variant="ghost" onClick={addLink} className="w-full py-2 text-[10px]">
          + Keçid əlavə et
        </Button>
      </div>
    </div>
  );
}

/* ── Əsas səhifə ─────────────────────────────────────────────────────────── */
export default function SiteSettingsPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<Omit<SiteSettings, "updatedAt" | "updatedBy">>(defaultSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await getSiteSettings();
        if (s) setSettings(s);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklənmə xətası");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveSiteSettings({
        ...settings,
        updatedBy: session?.email ?? "",
        updatedAt: new Date().toISOString(),
      });
      setSuccess("Parametrlər yadda saxlandı.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlama xətası.");
    } finally {
      setSaving(false);
    }
  }

  function setSocial(key: keyof SocialLinks, val: string) {
    setSettings((p) => ({ ...p, social: { ...p.social, [key]: val } }));
  }

  function setPopup(key: keyof SitePopup, val: unknown) {
    setSettings((p) => ({ ...p, popup: { ...p.popup, [key]: val } }));
  }

  function setPopupLocale(field: "title" | "body" | "ctaText", locale: string, val: string) {
    setSettings((p) => ({
      ...p,
      popup: { ...p.popup, [field]: { ...p.popup[field], [locale]: val } },
    }));
  }

  function addFooterColumn() {
    setSettings((p) => ({
      ...p,
      footerColumns: [
        ...p.footerColumns,
        { id: Date.now().toString(), title: emptyLocalized(), links: [] },
      ],
    }));
  }

  function updateFooterColumn(index: number, col: FooterColumn) {
    setSettings((p) => ({
      ...p,
      footerColumns: p.footerColumns.map((c, i) => (i === index ? col : c)),
    }));
  }

  function deleteFooterColumn(index: number) {
    setSettings((p) => ({
      ...p,
      footerColumns: p.footerColumns.filter((_, i) => i !== index),
    }));
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "general", label: "Ümumi" },
    { key: "social", label: "Sosial media" },
    { key: "footer", label: "Footer" },
    { key: "popup", label: "Pop-up / Elan" },
  ];

  if (loading) return (
    <div className="py-24 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
  );

  return (
    <>
      <PageHeader
        title="Sayt Parametrləri"
        description="Logo, hero banner, əlaqə məlumatları, sosial media, footer və pop-up elanları."
      />

      <div className="px-6 py-6 lg:px-10">
        {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
        {success && <div className="mb-4"><Alert tone="success">{success}</Alert></div>}

        {/* Tab keçidləri */}
        <div className="flex border-b border-line mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 font-ui text-[12px] uppercase tracking-[0.14em] transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-bordo text-bordo"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => void handleSave(e)} className="space-y-6">

          {/* ── Tab 1: Ümumi ── */}
          {tab === "general" && (
            <>
              <Panel title="Logo və Favicon">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Logo URL" hint="SVG və ya PNG şəkil linki">
                    <input className={inputClass} value={settings.logoUrl} onChange={(e) => setSettings((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="https://.../logo.svg" />
                  </Field>
                  <Field label="Favicon URL" hint=".ico və ya 32×32 PNG">
                    <input className={inputClass} value={settings.faviconUrl} onChange={(e) => setSettings((p) => ({ ...p, faviconUrl: e.target.value }))} placeholder="https://.../favicon.ico" />
                  </Field>
                </div>
              </Panel>

              <Panel title="Ana səhifə Hero Banneri">
                <div className="space-y-4">
                  <Field label="Banner şəkli URL">
                    <input className={inputClass} value={settings.heroBannerUrl} onChange={(e) => setSettings((p) => ({ ...p, heroBannerUrl: e.target.value }))} placeholder="https://.../hero.jpg" />
                  </Field>
                  <LocaleFields
                    label="Banner başlığı"
                    value={settings.heroBannerTitle}
                    onChange={(locale, val) => setSettings((p) => ({ ...p, heroBannerTitle: { ...p.heroBannerTitle, [locale]: val } }))}
                  />
                  <LocaleFields
                    label="Banner alt başlığı"
                    value={settings.heroBannerSubtitle}
                    onChange={(locale, val) => setSettings((p) => ({ ...p, heroBannerSubtitle: { ...p.heroBannerSubtitle, [locale]: val } }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <LocaleFields
                        label="CTA düyməsi mətni"
                        value={settings.heroBannerCtaText}
                        onChange={(locale, val) => setSettings((p) => ({ ...p, heroBannerCtaText: { ...p.heroBannerCtaText, [locale]: val } }))}
                      />
                    </div>
                    <Field label="CTA keçid URL-i">
                      <input className={inputClass} value={settings.heroBannerCtaHref} onChange={(e) => setSettings((p) => ({ ...p, heroBannerCtaHref: e.target.value }))} placeholder="/jurnal" />
                    </Field>
                  </div>
                </div>
              </Panel>

              <Panel title="Əlaqə məlumatları">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="E-poçt">
                      <input className={inputClass} type="email" value={settings.contactEmail} onChange={(e) => setSettings((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="info@nesreenmagazine.com" />
                    </Field>
                    <Field label="Telefon">
                      <input className={inputClass} value={settings.contactPhone} onChange={(e) => setSettings((p) => ({ ...p, contactPhone: e.target.value }))} placeholder="+994 12 000 00 00" />
                    </Field>
                  </div>
                  <LocaleFields
                    label="Ünvan"
                    value={settings.contactAddress}
                    onChange={(locale, val) => setSettings((p) => ({ ...p, contactAddress: { ...p.contactAddress, [locale]: val } }))}
                    multiline
                  />
                </div>
              </Panel>
            </>
          )}

          {/* ── Tab 2: Sosial Media ── */}
          {tab === "social" && (
            <Panel title="Sosial Media Keçidləri" description="Boş saxlasanız həmin ikona göstərilmir.">
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.keys(settings.social) as (keyof SocialLinks)[]).map((platform) => (
                  <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                    <input
                      className={inputClass}
                      value={settings.social[platform]}
                      onChange={(e) => setSocial(platform, e.target.value)}
                      placeholder={`https://${platform}.com/nesreenmagazine`}
                    />
                  </Field>
                ))}
              </div>
            </Panel>
          )}

          {/* ── Tab 3: Footer ── */}
          {tab === "footer" && (
            <div className="space-y-4">
              <Panel title="Footer aşağı qeyd (copyright mətni)">
                <LocaleFields
                  label="Footer mətni"
                  value={settings.footerNote}
                  onChange={(locale, val) => setSettings((p) => ({ ...p, footerNote: { ...p.footerNote, [locale]: val } }))}
                />
              </Panel>

              <div className="flex items-center justify-between">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">Footer sütunları ({settings.footerColumns.length})</p>
                <Button variant="ghost" onClick={addFooterColumn} type="button">
                  + Sütun əlavə et
                </Button>
              </div>

              {settings.footerColumns.length === 0 && (
                <div className="border border-dashed border-line px-6 py-10 text-center font-ui text-[13px] text-muted">
                  Hələ footer sütunu yoxdur. Yuxarıdan əlavə edin.
                </div>
              )}

              {settings.footerColumns.map((col, i) => (
                <FooterColumnEditor
                  key={col.id}
                  column={col}
                  index={i}
                  onUpdate={(updated) => updateFooterColumn(i, updated)}
                  onDelete={() => deleteFooterColumn(i)}
                />
              ))}
            </div>
          )}

          {/* ── Tab 4: Pop-up ── */}
          {tab === "popup" && (
            <Panel title="Pop-up Elan" description="Sayta daxil olanlara göstərilən elan banneri.">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 font-ui text-[13px] text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.popup.active}
                      onChange={(e) => setPopup("active", e.target.checked)}
                      className="h-4 w-4 accent-bordo"
                    />
                    Pop-up aktiv
                  </label>
                  {settings.popup.active && (
                    <span className="border border-green-300 bg-green-50 px-2 py-0.5 font-ui text-[10px] text-green-700">
                      Aktiv
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Başlama tarixi">
                    <input
                      className={inputClass}
                      type="date"
                      value={settings.popup.startsAt}
                      onChange={(e) => setPopup("startsAt", e.target.value)}
                    />
                  </Field>
                  <Field label="Bitmə tarixi">
                    <input
                      className={inputClass}
                      type="date"
                      value={settings.popup.endsAt}
                      onChange={(e) => setPopup("endsAt", e.target.value)}
                    />
                  </Field>
                </div>

                <LocaleFields
                  label="Pop-up başlığı"
                  value={settings.popup.title}
                  onChange={(locale, val) => setPopupLocale("title", locale, val)}
                />
                <LocaleFields
                  label="Pop-up mətni"
                  value={settings.popup.body}
                  onChange={(locale, val) => setPopupLocale("body", locale, val)}
                  multiline
                />
                <LocaleFields
                  label="Düymə mətni"
                  value={settings.popup.ctaText}
                  onChange={(locale, val) => setPopupLocale("ctaText", locale, val)}
                />
                <Field label="Düymə URL-i">
                  <input
                    className={inputClass}
                    value={settings.popup.ctaHref}
                    onChange={(e) => setPopup("ctaHref", e.target.value)}
                    placeholder="/aksiya"
                  />
                </Field>
              </div>
            </Panel>
          )}

          {/* Yadda saxla düyməsi */}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saxlanılır…" : "Parametrləri yadda saxla"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
