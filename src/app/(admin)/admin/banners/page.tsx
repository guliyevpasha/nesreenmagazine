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
  addBanner,
  listBanners,
  removeBanner,
  saveBanner,
  uploadImage,
} from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import type { AdBanner, AdSlotId } from "@/lib/types";

const SLOTS: { id: AdSlotId; label: string; size: string; where: string }[] = [
  {
    id: "home-leaderboard",
    label: "Ana səhifə — üst banner",
    size: "970 × 250",
    where: "«Ən son» bölməsindən sonra",
  },
  {
    id: "home-mid",
    label: "Ana səhifə — orta banner",
    size: "728 × 90",
    where: "Bölmələr arasında",
  },
  {
    id: "category-top",
    label: "Bölmə səhifəsi — üst banner",
    size: "970 × 250",
    where: "Bölmə başlığından sonra",
  },
  {
    id: "article-inline",
    label: "Məqalə içi banner",
    size: "640 × 160",
    where: "Mətnin ortasında",
  },
  {
    id: "sidebar",
    label: "Yan sütun",
    size: "300 × 600",
    where: "Əlaqə səhifəsinin yanında",
  },
];

export default function BannersPage() {
  const { session } = useAuth();
  const [banners, setBanners] = useState<AdBanner[] | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const [slot, setSlot] = useState<AdSlotId>("home-leaderboard");
  const [advertiser, setAdvertiser] = useState("");
  const [href, setHref] = useState("");
  const [alt, setAlt] = useState("");
  const [image, setImage] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function refresh() {
    try {
      setBanners(await listBanners());
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
        <PageHeader title="Reklam bannerləri" />
        <div className="px-6 py-8 lg:px-10">
          <Empty title="Bu bölmə yalnız admin üçündür" />
        </div>
      </>
    );
  }

  async function handleUpload(file: File) {
    setBusy(true);
    try {
      setImage(await uploadImage(file, "banners"));
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Şəkil yüklənmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (!image || !href) {
      setMessage({ tone: "error", text: "Banner şəkli və keçid ünvanı mütləqdir." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await addBanner({
        slot,
        active: true,
        image,
        href,
        alt: alt || advertiser,
        advertiser,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
      });
      setAdvertiser("");
      setHref("");
      setAlt("");
      setImage("");
      setStartsAt("");
      setEndsAt("");
      setMessage({ tone: "success", text: "Banner əlavə olundu." });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Əlavə olunmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Reklam bannerləri"
        description="Saytda beş banner sahəsi var. Sahə boş olduqda oxucuya «kirayə verilir» örtüyü görünür. Biznes bölməsində avtomatik e-kitab reklamı göstərilir."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          {/* Yeni banner */}
          <div className="xl:col-span-5">
            <Panel title="Yeni banner">
              <div className="space-y-5">
                <Field
                  label="Sahə"
                  hint={`${SLOTS.find((s) => s.id === slot)?.size} · ${
                    SLOTS.find((s) => s.id === slot)?.where
                  }`}
                >
                  <select
                    value={slot}
                    onChange={(event) => setSlot(event.target.value as AdSlotId)}
                    className={inputClass}
                  >
                    {SLOTS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} ({item.size})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Reklamverən">
                  <input
                    type="text"
                    value={advertiser}
                    onChange={(event) => setAdvertiser(event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Keçid ünvanı">
                  <input
                    type="url"
                    value={href}
                    onChange={(event) => setHref(event.target.value)}
                    className={`${inputClass} font-mono !text-[12px]`}
                    placeholder="https://…"
                  />
                </Field>

                <Field label="Şəklin izahı (alt mətn)">
                  <input
                    type="text"
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Banner şəkli">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                    className="w-full font-ui text-[12px] text-ink-soft file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-ink hover:file:border-bordo"
                  />
                  {image && (
                    <div className="mt-3 border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" className="w-full" />
                    </div>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Başlanğıc">
                    <input
                      type="date"
                      value={startsAt}
                      onChange={(event) => setStartsAt(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Bitiş">
                    <input
                      type="date"
                      value={endsAt}
                      onChange={(event) => setEndsAt(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Button onClick={() => void handleAdd()} disabled={busy} className="w-full">
                  {busy ? "Gözləyin…" : "Banner əlavə et"}
                </Button>
              </div>
            </Panel>
          </div>

          {/* Sahələr və mövcud bannerlər */}
          <div className="space-y-6 xl:col-span-7">
            <Panel title="Banner sahələri" description="Saytdakı beş yer və ölçüləri.">
              <ul className="divide-y divide-line">
                {SLOTS.map((item) => {
                  const count = (banners ?? []).filter(
                    (banner) => banner.slot === item.id && banner.active,
                  ).length;
                  return (
                    <li key={item.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="font-display text-[1.0625rem]">{item.label}</p>
                        <p className="mt-0.5 font-ui text-[11.5px] text-muted">
                          {item.size} · {item.where}
                        </p>
                      </div>
                      <span
                        className={`border px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.14em] ${
                          count > 0
                            ? "border-gold bg-gold/15 text-ink"
                            : "border-line bg-cream-deep text-muted"
                        }`}
                      >
                        {count > 0 ? `${count} aktiv` : "Boş"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Mövcud bannerlər">
              {!banners ? (
                <p className="py-10 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : banners.length === 0 ? (
                <Empty
                  title="Hələ banner yoxdur"
                  text="Sahələr boş olduğu müddətdə oxucuya «Reklam yerləşdirin» örtüyü göstərilir."
                />
              ) : (
                <ul className="space-y-5">
                  {banners.map((banner) => (
                    <li key={banner.id} className="border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.image} alt={banner.alt} className="w-full" />
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-display text-[1.0625rem]">
                            {banner.advertiser || "—"}
                          </p>
                          <p className="truncate font-ui text-[11.5px] text-muted">
                            {SLOTS.find((s) => s.id === banner.slot)?.label} · {banner.href}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              // Fill form with banner data for editing
                              setSlot(banner.slot);
                              setAdvertiser(banner.advertiser || "");
                              setHref(banner.href);
                              setAlt(banner.alt);
                              setImage(banner.image);
                              setStartsAt(banner.startsAt?.slice(0, 10) || "");
                              setEndsAt(banner.endsAt?.slice(0, 10) || "");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Redaktə
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              // Duplicate banner
                              setSlot(banner.slot);
                              setAdvertiser((banner.advertiser || "") + " (kopya)");
                              setHref(banner.href);
                              setAlt(banner.alt);
                              setImage(banner.image);
                              setStartsAt("");
                              setEndsAt("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Kopyala
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              void saveBanner(banner.id, { active: !banner.active }).then(
                                refresh,
                              )
                            }
                          >
                            {banner.active ? "Dayandır" : "Aktiv et"}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              if (window.confirm("Banner silinsin?")) {
                                void removeBanner(banner.id).then(refresh);
                              }
                            }}
                          >
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
      </div>
    </>
  );
}
