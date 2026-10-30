"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, saveSiteSettings } from "@/lib/data/admin";
import type { SiteSettings } from "@/lib/types";
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

/* ── boş forma ──────────────────────────────────────────────────────────── */
function emptyForm(): SiteSettings {
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
    updatedAt: "",
    updatedBy: "",
  };
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function SiteSettingsPage() {
  const { session } = useAuth();
  
  const [settings, setSettings] = useState<SiteSettings>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await saveSiteSettings({
        ...settings,
        updatedBy: session?.email ?? "",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlanma xətası");
    } finally {
      setSaving(false);
    }
  }

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setSocial(key: string, value: string) {
    setSettings((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value },
    }));
  }

  function setLocalized(
    field: "heroBannerTitle" | "heroBannerSubtitle" | "heroBannerCtaText" | "contactAddress" | "footerNote",
    lang: "az" | "en" | "ru" | "tr" | "ar",
    value: string
  ) {
    setSettings((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  }

  function setPopup(key: string, value: string | boolean) {
    setSettings((prev) => ({
      ...prev,
      popup: { ...prev.popup, [key]: value },
    }));
  }

  function setPopupLocalized(
    field: "title" | "body" | "ctaText",
    lang: "az" | "en" | "ru" | "tr" | "ar",
    value: string
  ) {
    setSettings((prev) => ({
      ...prev,
      popup: {
        ...prev.popup,
        [field]: { ...prev.popup[field], [lang]: value },
      },
    }));
  }

  if (loading) {
    return (
      <div className="px-6 py-16 lg:px-10 text-center font-ui text-[13px] text-muted">
        Yüklənir…
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Sayt Parametrləri"
        description="Logo, əlaqə məlumatları, sosial media və footer ayarları."
        actions={
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saxlanılır…" : "Yadda saxla"}
          </Button>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">✓ Parametrlər uğurla saxlanıldı!</Alert>}

        {/* Logo və Favicon */}
        <Panel title="Logo və İkonlar">
          <div className="space-y-4">
            <Field label="Logo URL">
              <input
                className={inputClass}
                value={settings.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                placeholder="https://..."
              />
              <p className="mt-1 font-ui text-[11px] text-muted">
                Ana səhifə və header-də göstəriləcək logo şəkli
              </p>
            </Field>
            <Field label="Favicon URL">
              <input
                className={inputClass}
                value={settings.faviconUrl}
                onChange={(e) => set("faviconUrl", e.target.value)}
                placeholder="https://..."
              />
              <p className="mt-1 font-ui text-[11px] text-muted">
                Brauzerdə tab ikonası (16x16 və ya 32x32 px)
              </p>
            </Field>
          </div>
        </Panel>

        {/* Hero Banner */}
        <Panel title="Ana Səhifə Hero Banner" description="Ana səhifənin üst bannerı (optional)">
          <div className="space-y-4">
            <Field label="Banner şəkil URL">
              <input
                className={inputClass}
                value={settings.heroBannerUrl}
                onChange={(e) => set("heroBannerUrl", e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Başlıq (Azərbaycan)">
              <input
                className={inputClass}
                value={settings.heroBannerTitle.az}
                onChange={(e) => setLocalized("heroBannerTitle", "az", e.target.value)}
                placeholder="Qadın dünyasının ən parlaq jurnalı"
              />
            </Field>
            <Field label="Alt başlıq (Azərbaycan)">
              <input
                className={inputClass}
                value={settings.heroBannerSubtitle.az}
                onChange={(e) => setLocalized("heroBannerSubtitle", "az", e.target.value)}
                placeholder="Moda, gözəllik və həyat tərzi"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CTA düyməsi mətni (az)">
                <input
                  className={inputClass}
                  value={settings.heroBannerCtaText.az}
                  onChange={(e) => setLocalized("heroBannerCtaText", "az", e.target.value)}
                  placeholder="Kəşf et"
                />
              </Field>
              <Field label="CTA link">
                <input
                  className={inputClass}
                  value={settings.heroBannerCtaHref}
                  onChange={(e) => set("heroBannerCtaHref", e.target.value)}
                  placeholder="/az/jurnallar"
                />
              </Field>
            </div>
          </div>
        </Panel>

        {/* Əlaqə məlumatları */}
        <Panel title="Əlaqə Məlumatları">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="E-poçt">
                <input
                  className={inputClass}
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  placeholder="info@nesreenmagazine.com"
                />
              </Field>
              <Field label="Telefon">
                <input
                  className={inputClass}
                  value={settings.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  placeholder="+994 50 000 00 00"
                />
              </Field>
            </div>
            <Field label="Ünvan (Azərbaycan)">
              <textarea
                className={inputClass}
                rows={2}
                value={settings.contactAddress.az}
                onChange={(e) => setLocalized("contactAddress", "az", e.target.value)}
                placeholder="Bakı, Azərbaycan"
              />
            </Field>
          </div>
        </Panel>

        {/* Sosial Media */}
        <Panel title="Sosial Media Keçidləri">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instagram">
              <input
                className={inputClass}
                value={settings.social.instagram}
                onChange={(e) => setSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/nesreen"
              />
            </Field>
            <Field label="Facebook">
              <input
                className={inputClass}
                value={settings.social.facebook}
                onChange={(e) => setSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/nesreen"
              />
            </Field>
            <Field label="TikTok">
              <input
                className={inputClass}
                value={settings.social.tiktok}
                onChange={(e) => setSocial("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@nesreen"
              />
            </Field>
            <Field label="YouTube">
              <input
                className={inputClass}
                value={settings.social.youtube}
                onChange={(e) => setSocial("youtube", e.target.value)}
                placeholder="https://youtube.com/@nesreen"
              />
            </Field>
            <Field label="Twitter (X)">
              <input
                className={inputClass}
                value={settings.social.twitter}
                onChange={(e) => setSocial("twitter", e.target.value)}
                placeholder="https://twitter.com/nesreen"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                className={inputClass}
                value={settings.social.whatsapp}
                onChange={(e) => setSocial("whatsapp", e.target.value)}
                placeholder="+994501234567"
              />
            </Field>
            <Field label="Telegram">
              <input
                className={inputClass}
                value={settings.social.telegram}
                onChange={(e) => setSocial("telegram", e.target.value)}
                placeholder="https://t.me/nesreen"
              />
            </Field>
          </div>
        </Panel>

        {/* Footer qeydi */}
        <Panel title="Footer">
          <div className="space-y-4">
            <Field label="Footer qeydi (Azərbaycan)">
              <textarea
                className={inputClass}
                rows={2}
                value={settings.footerNote.az}
                onChange={(e) => setLocalized("footerNote", "az", e.target.value)}
                placeholder="© 2026 Nesreen Magazine. Bütün hüquqlar qorunur."
              />
            </Field>
          </div>
        </Panel>

        {/* Pop-up elan */}
        <Panel title="Pop-up Elan" description="Ana səhifədə avtomatik açılan bildiriş">
          <div className="space-y-4">
            <Field label="Aktiv">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.popup.active}
                  onChange={(e) => setPopup("active", e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="font-ui text-[13px] text-muted">Pop-up göstər</span>
              </label>
            </Field>
            {settings.popup.active && (
              <>
                <Field label="Başlıq (Azərbaycan)">
                  <input
                    className={inputClass}
                    value={settings.popup.title.az}
                    onChange={(e) => setPopupLocalized("title", "az", e.target.value)}
                    placeholder="Yeni nömrə çıxdı!"
                  />
                </Field>
                <Field label="Mətn (Azərbaycan)">
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={settings.popup.body.az}
                    onChange={(e) => setPopupLocalized("body", "az", e.target.value)}
                    placeholder="Sentyabr nömrəmizi indi oxuyun..."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Düymə mətni (az)">
                    <input
                      className={inputClass}
                      value={settings.popup.ctaText.az}
                      onChange={(e) => setPopupLocalized("ctaText", "az", e.target.value)}
                      placeholder="Oxu"
                    />
                  </Field>
                  <Field label="Düymə link">
                    <input
                      className={inputClass}
                      value={settings.popup.ctaHref}
                      onChange={(e) => setPopup("ctaHref", e.target.value)}
                      placeholder="/az/e-jurnal"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Başlama tarixi">
                    <input
                      className={inputClass}
                      type="date"
                      value={settings.popup.startsAt.slice(0, 10)}
                      onChange={(e) => setPopup("startsAt", e.target.value)}
                    />
                  </Field>
                  <Field label="Bitmə tarixi">
                    <input
                      className={inputClass}
                      type="date"
                      value={settings.popup.endsAt.slice(0, 10)}
                      onChange={(e) => setPopup("endsAt", e.target.value)}
                    />
                  </Field>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* Saxla düyməsi (aşağıda da) */}
        <div className="flex justify-end">
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saxlanılır…" : "Yadda saxla"}
          </Button>
        </div>
      </div>
    </>
  );
}
