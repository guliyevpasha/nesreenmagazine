"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Empty,
  Field,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";
import {
  addEbookBanner,
  duplicateEbookBanner,
  listEbookBanners,
  removeEbookBanner,
  saveEbookBanner,
  uploadImage,
} from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import type { EbookBanner, Locale } from "@/lib/types";
import { emptyLocalized } from "@/lib/types";

const locales: Locale[] = ["az", "en", "ru", "tr", "ar"];
const localeLabels: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
  tr: "Türkçe",
  ar: "العربية",
};

export default function EbookBannerPage() {
  const { session } = useAuth();
  const [banners, setBanners] = useState<EbookBanner[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  // Form state
  const [active, setActive] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [href, setHref] = useState("");
  const [title, setTitle] = useState(emptyLocalized());
  const [subtitle, setSubtitle] = useState(emptyLocalized());
  const [description, setDescription] = useState(emptyLocalized());
  const [features, setFeatures] = useState<Record<Locale, string[]>>({
    az: ["", "", "", ""],
    en: ["", "", "", ""],
    ru: ["", "", "", ""],
    tr: ["", "", "", ""],
    ar: ["", "", "", ""],
  });
  const [ctaText, setCtaText] = useState(emptyLocalized());
  const [price, setPrice] = useState("$10");
  const [originalPrice, setOriginalPrice] = useState("$12.5");
  const [discountText, setDiscountText] = useState(emptyLocalized());
  const [badgeText, setBadgeText] = useState(emptyLocalized());

  async function refresh() {
    try {
      setBanners(await listEbookBanners());
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Bannerlər oxunmadı.",
      });
      setBanners([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (!isAdmin(session)) {
    return (
      <>
        <PageHeader title="E-kitab Reklamı" />
        <div className="px-6 py-8 lg:px-10">
          <Empty title="Bu bölmə yalnız admin üçündür" />
        </div>
      </>
    );
  }

  async function handleUploadCover(file: File) {
    setBusy(true);
    try {
      setCoverImage(await uploadImage(file, "ebook"));
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Şəkil yüklənmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleUploadPreview(file: File) {
    setBusy(true);
    try {
      const url = await uploadImage(file, "ebook");
      setPreviewImages((prev) => [...prev, url]);
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Şəkil yüklənmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setActive(false);
    setCoverImage("");
    setPreviewImages([]);
    setHref("");
    setTitle(emptyLocalized());
    setSubtitle(emptyLocalized());
    setDescription(emptyLocalized());
    setFeatures({
      az: ["", "", "", ""],
      en: ["", "", "", ""],
      ru: ["", "", "", ""],
      tr: ["", "", "", ""],
      ar: ["", "", "", ""],
    });
    setCtaText(emptyLocalized());
    setPrice("$10");
    setOriginalPrice("$12.5");
    setDiscountText(emptyLocalized());
    setBadgeText(emptyLocalized());
  }

  function loadBannerToForm(banner: EbookBanner) {
    setEditingId(banner.id);
    setActive(banner.active);
    setCoverImage(banner.coverImage);
    setPreviewImages(banner.previewImages);
    setHref(banner.href);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setDescription(banner.description);
    setFeatures(banner.features);
    setCtaText(banner.ctaText);
    setPrice(banner.price);
    setOriginalPrice(banner.originalPrice);
    setDiscountText(banner.discountText);
    setBadgeText(banner.badgeText);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!coverImage || !href) {
      setMessage({ tone: "error", text: "Cover şəkli və link mütləqdir." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const data = {
        active,
        coverImage,
        previewImages,
        href,
        title,
        subtitle,
        description,
        features,
        ctaText,
        price,
        originalPrice,
        discountText,
        badgeText,
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        await saveEbookBanner(editingId, data);
        setMessage({ tone: "success", text: "Banner yeniləndi." });
      } else {
        await addEbookBanner(data);
        setMessage({ tone: "success", text: "Banner əlavə olundu." });
      }

      resetForm();
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Əməliyyat alınmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDuplicate(id: string) {
    if (!window.confirm("Banner kopyası yaradılsın?")) return;
    setBusy(true);
    try {
      await duplicateEbookBanner(id);
      setMessage({ tone: "success", text: "Banner kopyası yaradıldı." });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Kopya yaradılmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Banner silinsin?")) return;
    setBusy(true);
    try {
      await removeEbookBanner(id);
      setMessage({ tone: "success", text: "Banner silindi." });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Silinmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="E-kitab Reklamı"
        description="Biznes məqalələrində avtomatik göstərilən banner. Yalnız bir banner aktiv ola bilər."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <div className="space-y-8">
          {/* Form */}
          <Panel title={editingId ? "Banner Redaktə Et" : "Yeni Banner Yarat"}>
            <div className="space-y-6">
              {/* Active toggle */}
              <Field label="Status">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="font-ui text-sm">Aktiv (biznes məqalələrində görünür)</span>
                </label>
              </Field>

              {/* Cover Image */}
              <Field label="Cover Şəkli (əsas)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUploadCover(file);
                  }}
                  className="w-full font-ui text-[12px] file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2"
                />
                {coverImage && (
                  <div className="mt-3 border border-line">
                    <img src={coverImage} alt="" className="w-full max-w-xs" />
                  </div>
                )}
              </Field>

              {/* Preview Images */}
              <Field label="Preview Şəkilləri (slider)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUploadPreview(file);
                  }}
                  className="w-full font-ui text-[12px] file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2"
                />
                {previewImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative border border-line">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full" />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute right-1 top-1 rounded bg-red-600 px-2 py-0.5 text-xs text-white"
                        >
                          Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              {/* Affiliate Link */}
              <Field label="Affiliate Link">
                <input
                  type="url"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  className={inputClass}
                  placeholder="https://whop.com/..."
                />
              </Field>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Qiymət">
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                    placeholder="$10"
                  />
                </Field>
                <Field label="Köhnə Qiymət">
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className={inputClass}
                    placeholder="$12.5"
                  />
                </Field>
              </div>

              {/* Multilingual fields */}
              <div className="space-y-6 rounded-lg border border-line bg-cream-deep p-6">
                <h3 className="font-display text-lg text-bordo">Çoxdilli Mətn</h3>

                {locales.map((locale) => (
                  <div key={locale} className="space-y-4 border-t border-line pt-4">
                    <h4 className="font-ui text-sm font-semibold uppercase tracking-wide text-ink">
                      {localeLabels[locale]}
                    </h4>

                    <Field label="Badge Mətni">
                      <input
                        type="text"
                        value={badgeText[locale]}
                        onChange={(e) =>
                          setBadgeText((prev) => ({ ...prev, [locale]: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Başlıq">
                      <input
                        type="text"
                        value={title[locale]}
                        onChange={(e) => setTitle((prev) => ({ ...prev, [locale]: e.target.value }))}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Alt Başlıq">
                      <input
                        type="text"
                        value={subtitle[locale]}
                        onChange={(e) =>
                          setSubtitle((prev) => ({ ...prev, [locale]: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Təsvir">
                      <textarea
                        value={description[locale]}
                        onChange={(e) =>
                          setDescription((prev) => ({ ...prev, [locale]: e.target.value }))
                        }
                        className={inputClass}
                        rows={3}
                      />
                    </Field>

                    <Field label="Xüsusiyyətlər (4 ədəd)">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={features[locale]?.[idx] || ""}
                          onChange={(e) => {
                            const newFeatures = [...(features[locale] || ["", "", "", ""])];
                            newFeatures[idx] = e.target.value;
                            setFeatures((prev) => ({ ...prev, [locale]: newFeatures }));
                          }}
                          className={`${inputClass} mt-2`}
                          placeholder={`Xüsusiyyət ${idx + 1}`}
                        />
                      ))}
                    </Field>

                    <Field label="CTA Button Mətni">
                      <input
                        type="text"
                        value={ctaText[locale]}
                        onChange={(e) =>
                          setCtaText((prev) => ({ ...prev, [locale]: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Endirim Badge">
                      <input
                        type="text"
                        value={discountText[locale]}
                        onChange={(e) =>
                          setDiscountText((prev) => ({ ...prev, [locale]: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={() => void handleSave()} disabled={busy} className="flex-1">
                  {busy ? "Gözləyin..." : editingId ? "Yenilə" : "Yarat"}
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={resetForm}>
                    Ləğv et
                  </Button>
                )}
              </div>
            </div>
          </Panel>

          {/* List */}
          <Panel title="Mövcud Bannerlər">
            {!banners ? (
              <p className="py-10 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
            ) : banners.length === 0 ? (
              <Empty title="Hələ banner yoxdur" text="Yuxarıdakı formdan yeni banner yaradın." />
            ) : (
              <ul className="space-y-4">
                {banners.map((banner) => (
                  <li key={banner.id} className="border border-line p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-display text-lg text-bordo">
                          {banner.title.az || "Başlıqsız"}
                        </h4>
                        <p className="mt-1 font-ui text-xs text-muted">
                          {banner.active ? "✅ Aktiv" : "⏸ Passiv"} • {banner.href}
                        </p>
                        <div className="mt-2 flex gap-2">
                          {banner.coverImage && (
                            <img
                              src={banner.coverImage}
                              alt=""
                              className="h-20 w-16 border border-line object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" onClick={() => loadBannerToForm(banner)}>
                          Redaktə et
                        </Button>
                        <Button variant="ghost" onClick={() => void handleDuplicate(banner.id)}>
                          Kopya yarat
                        </Button>
                        <Button variant="danger" onClick={() => void handleDelete(banner.id)}>
                          Sil
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
