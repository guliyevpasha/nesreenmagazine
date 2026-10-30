"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, Alert, Panel, Field } from "@/components/admin/ui";
import { getBanner, updateBanner } from "@/lib/data/banners";
import type { AdvancedAdBanner, AdBannerLocation } from "@/lib/types";
import { adBannerLocationLabels } from "@/lib/types";

const inputClass = "w-full border border-line bg-paper px-3 py-2 font-ui text-[14px] text-ink focus:border-gold focus:outline-none";
const labelClass = "mb-2 block font-ui text-[11px] uppercase tracking-[0.12em] text-muted";

export default function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [banner, setBanner] = useState<AdvancedAdBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBanner();
  }, [id]);

  async function loadBanner() {
    try {
      const data = await getBanner(id);
      if (!data) {
        setMessage({ tone: "error", text: "Banner tapılmadı" });
        return;
      }
      setBanner(data);
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Xəta baş verdi",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!banner) return;

    setSaving(true);
    setMessage(null);

    try {
      const { id: _, clicks, impressions, createdAt, updatedAt, createdBy, ...updates } = banner;
      await updateBanner(id, updates as any);
      setMessage({ tone: "success", text: "Banner yeniləndi" });
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Yadda saxlanılmadı",
      });
    } finally {
      setSaving(false);
    }
  }

  function toggleLocation(location: AdBannerLocation) {
    if (!banner) return;
    const newLocations = banner.locations.includes(location)
      ? banner.locations.filter((l) => l !== location)
      : [...banner.locations, location];
    setBanner({ ...banner, locations: newLocations });
  }

  function toggleDevice(device: "desktop" | "tablet" | "mobile") {
    if (!banner) return;
    setBanner({
      ...banner,
      showOn: {
        ...banner.showOn,
        [device]: !banner.showOn[device],
      },
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
    if (!validTypes.includes(file.type)) {
      setMessage({ tone: "error", text: "Yalnız şəkil (JPG, PNG, GIF, WebP) və ya video (MP4, WebM) fayl yükləyə bilərsiniz" });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ tone: "error", text: "Fayl ölçüsü 50MB-dan çox ola bilməz" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Fayl yüklənmədi");
      }

      const data = await response.json();
      
      // Auto-detect media type from file
      let mediaType: "image" | "gif" | "video" = "image";
      if (file.type === "image/gif") {
        mediaType = "gif";
      } else if (file.type.startsWith("video/")) {
        mediaType = "video";
      }

      setBanner({ 
        ...banner, 
        imageUrl: data.url,
        mediaType: mediaType
      });
      setMessage({ tone: "success", text: "Fayl uğurla yükləndi" });
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Fayl yüklənərkən xəta baş verdi",
      });
    } finally {
      setUploading(false);
    }
  }

  function applyPresetSize(width: number, height: number) {
    if (!banner) return;
    setBanner({
      ...banner,
      dimensions: { width, height }
    });
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Banner Redaktəsi" />
        <div className="p-10 text-center text-sm text-muted">Yüklənir...</div>
      </>
    );
  }

  if (!banner) {
    return (
      <>
        <PageHeader title="Banner tapılmadı" />
        <div className="px-6 py-8 lg:px-10">
          {message && <Alert tone={message.tone}>{message.text}</Alert>}
          <div className="mt-6">
            <Link href="/admin/advanced-banners" className="btn-ghost">
              ← Geri
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={banner.name}
        description={`Banner ID: ${id}`}
        actions={
          <Link href="/admin/advanced-banners" className="btn-ghost !py-2.5 !text-[11px]">
            ← Geri
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          {/* Sol Panel - Əsas Məlumatlar */}
          <div className="space-y-6 xl:col-span-8">
            <Panel title="Əsas Məlumatlar">
              <div className="space-y-5">
                <Field label="Banner Adı" hint="Admin paneldə görünən ad">
                  <input
                    type="text"
                    value={banner.name}
                    onChange={(e) => setBanner({ ...banner, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Media Tipi">
                  <select
                    value={banner.mediaType || "image"}
                    onChange={(e) => setBanner({ ...banner, mediaType: e.target.value as "image" | "gif" | "video" })}
                    className={inputClass}
                  >
                    <option value="image">Şəkil (Image)</option>
                    <option value="gif">GIF / Motion Dizayn</option>
                    <option value="video">Video</option>
                  </select>
                </Field>

                <Field label="Şəkil URL" hint="Banner mediyasının ünvanı">
                  <input
                    type="url"
                    value={banner.imageUrl}
                    onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Və ya Cihazdan Yüklə" hint="Şəkil, GIF və ya Video (maksimum 50MB)">
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="w-full text-sm text-muted file:mr-4 file:rounded file:border-0 file:bg-bordo file:px-4 file:py-2 file:text-sm file:text-white file:cursor-pointer hover:file:bg-bordo/90 disabled:opacity-50"
                    />
                    {uploading && (
                      <p className="text-xs text-muted animate-pulse">Yüklənir...</p>
                    )}
                  </div>
                </Field>

                {banner.imageUrl && (
                  <div className="border border-line bg-cream-deep/30 p-4">
                    <p className="mb-2 text-xs text-muted uppercase tracking-wider">Önizləmə</p>
                    {banner.mediaType === "video" ? (
                      <video
                        src={banner.imageUrl}
                        controls
                        className="max-h-64 w-auto border border-line"
                      />
                    ) : (
                      <img
                        src={banner.imageUrl}
                        alt={banner.altText}
                        className="max-h-64 w-auto border border-line"
                      />
                    )}
                  </div>
                )}

                <Field label="Link URL" hint="Klik zamanı açılacaq ünvan">
                  <input
                    type="url"
                    value={banner.linkUrl}
                    onChange={(e) => setBanner({ ...banner, linkUrl: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Alt Mətn" hint="Şəkil yüklənməyəndə görünən mətn">
                  <input
                    type="text"
                    value={banner.altText}
                    onChange={(e) => setBanner({ ...banner, altText: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Yerləşmə" description="Bannerin harada göstəriləcəyini seçin">
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(adBannerLocationLabels) as AdBannerLocation[]).map((location) => (
                  <label
                    key={location}
                    className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
                      banner.locations.includes(location)
                        ? "border-bordo bg-bordo/5"
                        : "border-line hover:border-bordo/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={banner.locations.includes(location)}
                      onChange={() => toggleLocation(location)}
                      className="h-4 w-4 accent-bordo"
                    />
                    <span className="text-sm text-ink">
                      {adBannerLocationLabels[location]}
                    </span>
                  </label>
                ))}
              </div>
            </Panel>

            <Panel title="Ölçülər">
              <div className="space-y-4">
                <Field label="Standart Ölçülər" hint="Populyar banner ölçüləri">
                  <select
                    onChange={(e) => {
                      const [width, height] = e.target.value.split("x").map(Number);
                      if (width && height) applyPresetSize(width, height);
                    }}
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Hazır ölçü seç...</option>
                    <option value="300x250">300×250 (Medium Rectangle)</option>
                    <option value="728x90">728×90 (Leaderboard)</option>
                    <option value="300x600">300×600 (Half Page)</option>
                    <option value="320x50">320×50 (Mobile Banner)</option>
                    <option value="320x100">320×100 (Mobile Large)</option>
                    <option value="970x90">970×90 (Large Leaderboard)</option>
                    <option value="160x600">160×600 (Wide Skyscraper)</option>
                    <option value="300x50">300×50 (Mobile Banner)</option>
                    <option value="468x60">468×60 (Banner)</option>
                  </select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Genişlik (px)">
                    <input
                      type="number"
                      value={banner.dimensions.width}
                      onChange={(e) =>
                        setBanner({
                          ...banner,
                          dimensions: { ...banner.dimensions, width: parseInt(e.target.value) || 0 },
                        })
                      }
                      className={inputClass}
                      min="1"
                    />
                  </Field>

                  <Field label="Hündürlük (px)">
                    <input
                      type="number"
                      value={banner.dimensions.height}
                      onChange={(e) =>
                        setBanner({
                          ...banner,
                          dimensions: { ...banner.dimensions, height: parseInt(e.target.value) || 0 },
                        })
                      }
                      className={inputClass}
                      min="1"
                    />
                  </Field>
                </div>
              </div>
            </Panel>
          </div>

          {/* Sağ Panel - Parametrlər */}
          <div className="space-y-6 xl:col-span-4">
            <Panel title="Status">
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={banner.active}
                    onChange={(e) => setBanner({ ...banner, active: e.target.checked })}
                    className="h-5 w-5 accent-bordo"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">Aktiv</p>
                    <p className="text-xs text-muted">Banner saytda göstərilsin</p>
                  </div>
                </label>

                <Field label="Prioritet (1-10)" hint="Yüksək rəqəm = daha çox göstərilir">
                  <input
                    type="number"
                    value={banner.priority}
                    onChange={(e) => setBanner({ ...banner, priority: parseInt(e.target.value) || 1 })}
                    className={inputClass}
                    min="1"
                    max="10"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Device Seçimi">
              <div className="space-y-3">
                {(["desktop", "tablet", "mobile"] as const).map((device) => (
                  <label key={device} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={banner.showOn[device]}
                      onChange={() => toggleDevice(device)}
                      className="h-4 w-4 accent-bordo"
                    />
                    <span className="text-sm text-ink capitalize">{device}</span>
                  </label>
                ))}
              </div>
            </Panel>

            <Panel title="Animasiya">
              <Field label="Effekt">
                <select
                  value={banner.animation || "none"}
                  onChange={(e) => setBanner({ ...banner, animation: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="none">Yoxdur</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="pulse">Pulse</option>
                  <option value="bounce">Bounce</option>
                </select>
              </Field>
            </Panel>

            <Panel title="Tarix Aralığı" description="Opsional: Banner nə vaxt göstərilsin">
              <div className="space-y-4">
                <Field label="Başlama Tarixi">
                  <input
                    type="datetime-local"
                    value={banner.startsAt?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setBanner({
                        ...banner,
                        startsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Bitmə Tarixi">
                  <input
                    type="datetime-local"
                    value={banner.endsAt?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setBanner({
                        ...banner,
                        endsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Statistika">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Görüntülənmə:</span>
                  <span className="font-medium">{banner.impressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Klik:</span>
                  <span className="font-medium">{banner.clicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">CTR:</span>
                  <span className="font-medium">
                    {banner.impressions > 0
                      ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
                      : "0"}
                    %
                  </span>
                </div>
              </div>
            </Panel>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? "Yadda saxlanılır..." : "Yadda saxla"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
