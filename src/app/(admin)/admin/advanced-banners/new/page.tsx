"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, Alert, Panel, Field } from "@/components/admin/ui";
import { createBanner } from "@/lib/data/banners";
import type { AdvancedAdBannerInput, AdBannerLocation } from "@/lib/types";
import { adBannerLocationLabels } from "@/lib/types";

const inputClass = "w-full border border-line bg-paper px-3 py-2 font-ui text-[14px] text-ink focus:border-gold focus:outline-none";

export default function NewBannerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const [banner, setBanner] = useState<AdvancedAdBannerInput>({
    name: "",
    imageUrl: "",
    mediaType: "image",
    linkUrl: "",
    altText: "",
    locations: [],
    active: true,
    showOn: {
      desktop: true,
      tablet: true,
      mobile: true,
    },
    dimensions: {
      width: 300,
      height: 250,
    },
    priority: 5,
    animation: "none",
    createdBy: "system",
  });

  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (banner.locations.length === 0) {
      setMessage({ tone: "error", text: "Ən azı bir yerləşmə seçin" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const id = await createBanner(banner, "admin");
      setMessage({ tone: "success", text: "Banner yaradıldı!" });
      setTimeout(() => {
        router.push(`/admin/advanced-banners/${id}`);
      }, 1000);
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Yaradılmadı",
      });
      setSaving(false);
    }
  }

  function toggleLocation(location: AdBannerLocation) {
    const newLocations = banner.locations.includes(location)
      ? banner.locations.filter((l) => l !== location)
      : [...banner.locations, location];
    setBanner({ ...banner, locations: newLocations });
  }

  function toggleDevice(device: "desktop" | "tablet" | "mobile") {
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
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      alert("Yalnız şəkil (JPG, PNG, GIF, WebP) və ya video (MP4, WebM) yükləyə bilərsiniz.");
      return;
    }

    // Validate file size (max 50MB for video, 10MB for image)
    const maxSize = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Fayl ölçüsü ${file.type.startsWith("video/") ? "50MB" : "10MB"}-dan çox ola bilməz.`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Yüklənmədi");
      }

      const data = await response.json();
      
      // Determine media type
      let mediaType: "image" | "gif" | "video" = "image";
      if (file.type === "image/gif") {
        mediaType = "gif";
      } else if (file.type.startsWith("video/")) {
        mediaType = "video";
      }

      setBanner({
        ...banner,
        imageUrl: data.url,
        mediaType,
      });

      setMessage({ tone: "success", text: "Fayl uğurla yükləndi!" });
    } catch (err) {
      setMessage({
        tone: "error",
        text: "Yüklənərkən xəta: " + (err instanceof Error ? err.message : "Xəta"),
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Yeni Banner"
        description="Reklam banneri yaradın"
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
          {/* Sol Panel */}
          <div className="space-y-6 xl:col-span-8">
            <Panel title="Əsas Məlumatlar">
              <div className="space-y-5">
                <Field label="Banner Adı" hint="Admin paneldə görünən ad">
                  <input
                    type="text"
                    value={banner.name}
                    onChange={(e) => setBanner({ ...banner, name: e.target.value })}
                    className={inputClass}
                    placeholder="Məs: Ana səhifə Hero Banner"
                    required
                  />
                </Field>

                <Field label="Şəkil/Video" hint="Banner media faylı (şəkil, GIF, video)">
                  <div className="space-y-3">
                    {/* URL Input */}
                    <div>
                      <label className="mb-1 block text-xs text-muted">URL ilə</label>
                      <input
                        type="url"
                        value={banner.imageUrl}
                        onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
                        className={inputClass}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="mb-1 block text-xs text-muted">və ya cihazdan yüklə</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="w-full font-ui text-sm text-ink file:mr-4 file:rounded file:border file:border-line file:bg-cream file:px-4 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.12em] file:text-ink hover:file:border-bordo hover:file:bg-bordo hover:file:text-cream disabled:opacity-50"
                      />
                      {uploading && (
                        <p className="mt-2 text-xs text-blue-600">Yüklənir...</p>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        Şəkil: JPG, PNG, GIF, WebP (max 10MB) · Video: MP4, WebM (max 50MB)
                      </p>
                    </div>

                    {/* Media Type Selection */}
                    {banner.imageUrl && (
                      <div>
                        <label className="mb-1 block text-xs text-muted">Media tipi</label>
                        <select
                          value={banner.mediaType}
                          onChange={(e) => setBanner({ ...banner, mediaType: e.target.value as any })}
                          className={inputClass}
                        >
                          <option value="image">Şəkil (statik)</option>
                          <option value="gif">GIF (animasiyalı)</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    )}
                  </div>
                </Field>

                {banner.imageUrl && (
                  <div className="border border-line bg-cream-deep/30 p-4">
                    <p className="mb-2 text-xs text-muted uppercase tracking-wider">
                      Önizləmə ({banner.mediaType})
                    </p>
                    {banner.mediaType === "video" ? (
                      <video
                        src={banner.imageUrl}
                        className="max-h-64 w-auto border border-line"
                        controls
                        muted
                        loop
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <img
                        src={banner.imageUrl}
                        alt={banner.altText}
                        className="max-h-64 w-auto border border-line"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
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
                    placeholder="https://example.com"
                  />
                </Field>

                <Field label="Alt Mətn" hint="Şəkil yüklənməyəndə görünən mətn">
                  <input
                    type="text"
                    value={banner.altText}
                    onChange={(e) => setBanner({ ...banner, altText: e.target.value })}
                    className={inputClass}
                    placeholder="Banner təsviri"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Yerləşmə" description="Bannerin harada göstəriləcəyini seçin (çoxlu seçim)">
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

            <Panel title="Ölçülər" description="Fayl yükləyəndə avtomatik təyin olunur">
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
            </Panel>
          </div>

          {/* Sağ Panel */}
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
                    <p className="text-xs text-muted">Banner yaradılandan sonra dərhal göstərilsin</p>
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
                  <option value="fade">Fade (Görünüb-yox olma)</option>
                  <option value="slide">Slide (Sürüşmə)</option>
                  <option value="pulse">Pulse (Nəbz)</option>
                  <option value="bounce">Bounce (Sıçrama)</option>
                </select>
              </Field>
            </Panel>

            <Panel title="Tarix Aralığı" description="Opsional: Banner nə vaxt göstərilsin">
              <div className="space-y-4">
                <Field label="Başlama Tarixi">
                  <input
                    type="datetime-local"
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

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? "Yaradılır..." : "Banneri Yarat"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
