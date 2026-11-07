"use client";

/**
 * Çap nəşrləri — fiziki (kağız) jurnal nömrələri, saytda satışa çıxarılır.
 * Saytda: /jurnallar (üz qabığı, qiymət, kateqoriya, tarix, «Bu nömrədə», «Sifariş et»).
 * Sifarişlər admin paneldə «Mesajlar» bölməsinə düşür.
 */
import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Empty,
  Field,
  LocaleTabs,
  PageHeader,
  Panel,
  StatusPill,
  inputClass,
} from "@/components/admin/ui";
import { authorizedFetch } from "@/lib/auth/authorized-fetch";
import { categories } from "@/lib/categories";
import {
  addPrintEdition,
  listPrintEditions,
  removePrintEdition,
  savePrintEdition,
  uploadFile,
} from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import { locales, type Locale } from "@/lib/i18n/config";
import {
  emptyLocalized,
  SPECIAL_ISSUE_CATEGORY,
  type PrintEdition,
  type PrintEditionInput,
} from "@/lib/types";

const fileInputClass =
  "w-full font-ui text-[12px] text-ink-soft file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-ink hover:file:border-bordo";

const EDITION_CATEGORIES = [
  ...categories.map((category) => ({ slug: category.slug, name: category.name.az })),
  { slug: SPECIAL_ISSUE_CATEGORY, name: "Xüsusi buraxılış" },
];

function emptyEdition(): PrintEditionInput {
  return {
    status: "draft",
    title: emptyLocalized(),
    description: emptyLocalized(),
    highlights: emptyLocalized(),
    coverImage: "",
    price: 0,
    category: "",
    releaseDate: new Date().toISOString().slice(0, 10),
    pages: 0,
    inStock: true,
  };
}

function publishProblem(edition: PrintEditionInput): string | null {
  if (!edition.title.az.trim()) return "Azərbaycan dilində başlıq mütləqdir.";
  if (!edition.coverImage) return "Dərc üçün üz qabığı şəkli lazımdır.";
  if (!(edition.price > 0)) return "Satış üçün qiymət daxil edin.";
  return null;
}

async function refreshSitePage() {
  await authorizedFetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: locales.map((code) => `/${code}/jurnallar`) }),
  }).catch(() => undefined);
}

export default function PrintEditionsPage() {
  const { session } = useAuth();
  const [editions, setEditions] = useState<PrintEdition[] | null>(null);
  const [draft, setDraft] = useState<PrintEditionInput>(emptyEdition);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const canDelete = isAdmin(session);

  async function refresh() {
    try {
      setEditions(await listPrintEditions());
    } catch (caught) {
      setEditions([]);
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Nəşrlər oxunmadı." });
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filled = Object.fromEntries(
    locales.map((code) => [code, Boolean(draft.title[code]?.trim())]),
  ) as Record<Locale, boolean>;

  function setLocalized(field: "title" | "description" | "highlights", value: string) {
    setDraft((current) => ({ ...current, [field]: { ...current[field], [activeLocale]: value } }));
  }

  function resetForm() {
    setDraft(emptyEdition());
    setEditingId(null);
    setActiveLocale("az");
  }

  function startEdit(edition: PrintEdition) {
    const { id, updatedAt: _updatedAt, ...rest } = edition;
    setDraft({ ...emptyEdition(), ...rest });
    setEditingId(id);
    setActiveLocale("az");
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCover(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const url = await uploadFile(file, "ejournal-covers");
      setDraft((current) => ({ ...current, coverImage: url }));
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Şəkil yüklənmədi." });
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!draft.title.az.trim()) {
      setMessage({ tone: "error", text: "Azərbaycan dilində başlıq mütləqdir." });
      setActiveLocale("az");
      return;
    }
    if (draft.status === "published") {
      const problem = publishProblem(draft);
      if (problem) {
        setMessage({ tone: "error", text: problem });
        return;
      }
    }
    const payload: PrintEditionInput = { ...draft, price: Math.max(0, Number(draft.price) || 0) };

    setBusy(true);
    setMessage(null);
    try {
      if (editingId) await savePrintEdition(editingId, payload);
      else await addPrintEdition(payload);
      await refreshSitePage();
      setMessage({ tone: "success", text: editingId ? "Nəşr yeniləndi." : "Nəşr əlavə olundu." });
      resetForm();
      await refresh();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Yadda saxlanılmadı." });
    } finally {
      setBusy(false);
    }
  }

  async function quickUpdate(edition: PrintEdition, patch: Partial<PrintEditionInput>) {
    setMessage(null);
    if (patch.status === "published") {
      const problem = publishProblem({ ...edition, ...patch });
      if (problem) {
        setMessage({ tone: "error", text: `«${edition.title.az}»: ${problem}` });
        return;
      }
    }
    try {
      await savePrintEdition(edition.id, patch);
      await refreshSitePage();
      await refresh();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Dəyişmədi." });
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Nəşr həmişəlik silinsin?")) return;
    try {
      await removePrintEdition(id);
      if (editingId === id) resetForm();
      await refreshSitePage();
      await refresh();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Silinmədi." });
    }
  }

  if (!session) return null;

  return (
    <>
      <PageHeader
        title="Çap nəşrləri"
        description="Fiziki jurnal nömrələri — saytın «Nəşrlər» bölməsində qiymət və «Sifariş et» ilə satışa çıxır. Sifarişlər «Mesajlar»a düşür."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <Panel title={editingId ? "Nəşri redaktə et" : "Yeni çap nəşri"}>
              <div className="space-y-5">
                <LocaleTabs active={activeLocale} onChange={setActiveLocale} filled={filled} />

                <Field label="Başlıq" hint="Məsələn: «Nesreen · Qış 2026»">
                  <input
                    type="text"
                    value={draft.title[activeLocale]}
                    onChange={(event) => setLocalized("title", event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Qısa təsvir" hint="Kartda başlığın altında 1–2 cümlə.">
                  <textarea
                    rows={2}
                    value={draft.description[activeLocale]}
                    onChange={(event) => setLocalized("description", event.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="Bu nömrədə (xülasə)" hint="Hər sətirə bir mövzu — saytda siyahı kimi görünür.">
                  <textarea
                    rows={5}
                    value={draft.highlights[activeLocale]}
                    onChange={(event) => setLocalized("highlights", event.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder={"Üz qabığı müsahibəsi: …\nQış trendləri: 15 obraz\nGözəllik: dəri baxımı rutini"}
                  />
                </Field>

                <Field label="Üz qabığı şəkli" hint="Şaquli (3:4), yüksək keyfiyyət. Dərc üçün mütləqdir.">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleCover(file);
                      event.target.value = "";
                    }}
                    className={fileInputClass}
                  />
                  {draft.coverImage && (
                    <div className="mt-3 w-32 border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={draft.coverImage} alt="" className="w-full" />
                    </div>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Qiymət (AZN)">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={draft.price}
                      onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) || 0 }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Kateqoriya">
                    <select
                      value={draft.category}
                      onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— ümumi —</option>
                      {EDITION_CATEGORIES.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Satışa çıxma tarixi">
                    <input
                      type="date"
                      value={draft.releaseDate}
                      onChange={(event) => setDraft((current) => ({ ...current, releaseDate: event.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Səhifə sayı">
                    <input
                      type="number"
                      min={0}
                      value={draft.pages}
                      onChange={(event) => setDraft((current) => ({ ...current, pages: Number(event.target.value) || 0 }))}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-3 font-ui text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={draft.inStock}
                    onChange={(event) => setDraft((current) => ({ ...current, inStock: event.target.checked }))}
                    className="h-4 w-4 accent-[#7b2233]"
                  />
                  Stokda var (söndürsəniz saytda «Tükənib» yazılır, sifariş bağlanır)
                </label>

                <Field label="Vəziyyət">
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, status: event.target.value as PrintEditionInput["status"] }))
                    }
                    className={inputClass}
                  >
                    <option value="draft">Qaralama (saytda görünmür)</option>
                    <option value="published">Saytda satışda</option>
                  </select>
                </Field>

                <div className="flex gap-3">
                  <Button onClick={() => void handleSubmit()} disabled={busy} className="flex-1">
                    {busy ? "Gözləyin…" : editingId ? "Dəyişiklikləri saxla" : "Nəşri əlavə et"}
                  </Button>
                  {editingId && (
                    <Button variant="ghost" onClick={resetForm} disabled={busy}>
                      Ləğv et
                    </Button>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-7">
            <Panel title="Nəşrlər">
              {!editions ? (
                <p className="py-10 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : editions.length === 0 ? (
                <Empty title="Hələ çap nəşri yoxdur" text="Soldakı formadan ilk nəşri əlavə edin." />
              ) : (
                <ul className="divide-y divide-line">
                  {editions.map((edition) => (
                    <li key={edition.id} className="flex flex-wrap items-start gap-4 py-4">
                      <div className="h-20 w-14 shrink-0 border border-line bg-cream-deep">
                        {edition.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={edition.coverImage} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[1.0625rem]">{edition.title.az || "—"}</p>
                        <p className="mt-1 font-ui text-[11.5px] text-muted">
                          {edition.releaseDate} · {edition.price} ₼
                          {edition.category &&
                            ` · ${EDITION_CATEGORIES.find((item) => item.slug === edition.category)?.name ?? edition.category}`}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <StatusPill status={edition.status} />
                          {!edition.inStock && (
                            <span className="font-ui text-[11px] uppercase tracking-[0.1em] text-bordo">Tükənib</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" onClick={() => startEdit(edition)}>
                          Redaktə
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            void quickUpdate(edition, { status: edition.status === "published" ? "draft" : "published" })
                          }
                        >
                          {edition.status === "published" ? "Satışdan çıxar" : "Satışa çıxar"}
                        </Button>
                        <Button variant="ghost" onClick={() => void quickUpdate(edition, { inStock: !edition.inStock })}>
                          {edition.inStock ? "Tükənib et" : "Stokda var"}
                        </Button>
                        {canDelete && (
                          <Button variant="danger" onClick={() => void handleRemove(edition.id)}>
                            Sil
                          </Button>
                        )}
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
