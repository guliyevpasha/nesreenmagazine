"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
import {
  addEjournal,
  getEjournalDetailStats,
  getEjournalPrivatePdf,
  getEjournalStats,
  listEjournals,
  removeEjournal,
  saveEjournal,
  setEjournalPrivatePdf,
  uploadFile,
} from "@/lib/data/admin";
import { categories } from "@/lib/categories";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import { locales, type Locale } from "@/lib/i18n/config";
import {
  emptyLocalized,
  SPECIAL_ISSUE_CATEGORY,
  type Ejournal,
  type EjournalInput,
  type EjournalStats,
} from "@/lib/types";

const fileInputClass =
  "w-full font-ui text-[12px] text-ink-soft file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-ink hover:file:border-bordo";

/** Nəşr kateqoriyaları: saytın bölmələri + «Xüsusi buraxılış» */
const ISSUE_CATEGORIES = [
  ...categories.map((category) => ({ slug: category.slug, name: category.name.az })),
  { slug: SPECIAL_ISSUE_CATEGORY, name: "Xüsusi buraxılış" },
];

function emptyIssue(): EjournalInput {
  return {
    status: "draft",
    coverImage: "",
    pdfUrl: "",
    title: emptyLocalized(),
    description: emptyLocalized(),
    highlights: emptyLocalized(),
    publishedAt: new Date().toISOString().slice(0, 10),
    pages: 0,
    price: 0,
    category: "",
  };
}

function isPaid(issue: Pick<EjournalInput, "price">): boolean {
  return (issue.price ?? 0) > 0;
}

export default function EjournalsPage() {
  const { session } = useAuth();
  const [issues, setIssues] = useState<Ejournal[] | null>(null);
  const [stats, setStats] = useState<EjournalStats | null>(null);
  const [issueStats, setIssueStats] = useState<
    Record<string, { orders: number; revenue: number; downloads: number }>
  >({});
  const [draft, setDraft] = useState<EjournalInput>(emptyIssue);
  /** Redaktə olunan nömrə (null = yeni nömrə) */
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Pullu nömrənin gizli PDF linki (açıq sənəddə saxlanılmır) */
  const [privatePdf, setPrivatePdf] = useState("");
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  const canDelete = isAdmin(session);
  const paid = isPaid(draft);
  const pdfForDraft = paid ? privatePdf : draft.pdfUrl;

  async function refresh() {
    let issuesData: Ejournal[] = [];
    try {
      issuesData = await listEjournals();
      setIssues(issuesData);
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Nömrələr oxunmadı.",
      });
      setIssues([]);
      setStats(null);
      return;
    }

    // Statistika uğursuz olsa belə siyahı qalır
    try {
      setStats(await getEjournalStats());
    } catch {
      setStats(null);
    }

    const entries = await Promise.allSettled(
      issuesData.map(async (issue) => [issue.id, await getEjournalDetailStats(issue.id)] as const),
    );
    setIssueStats(
      Object.fromEntries(
        entries.flatMap((entry) => (entry.status === "fulfilled" ? [entry.value] : [])),
      ),
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filled = Object.fromEntries(
    locales.map((code) => [code, Boolean(draft.title[code]?.trim())]),
  ) as Record<Locale, boolean>;

  function setLocalized(field: "title" | "description" | "highlights", value: string) {
    setDraft((current) => ({
      ...current,
      [field]: { ...(current[field] ?? emptyLocalized()), [activeLocale]: value },
    }));
  }

  function resetForm() {
    setDraft(emptyIssue());
    setEditingId(null);
    setPrivatePdf("");
    setActiveLocale("az");
  }

  async function startEdit(issue: Ejournal) {
    const { id, ...rest } = issue;
    setDraft({
      ...emptyIssue(),
      ...rest,
      highlights: rest.highlights ?? emptyLocalized(),
      price: rest.price ?? 0,
      category: rest.category ?? "",
    });
    setEditingId(id);
    setActiveLocale("az");
    setMessage(null);
    setPrivatePdf(isPaid(rest) ? await getEjournalPrivatePdf(id).catch(() => "") : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleUpload(file: File, target: "coverImage" | "pdf") {
    setBusy(true);
    setMessage(null);
    try {
      const url = await uploadFile(file, target === "pdf" ? "ejournals" : "ejournal-covers");
      if (target === "coverImage") {
        setDraft((current) => ({ ...current, coverImage: url }));
      } else if (paid) {
        setPrivatePdf(url);
      } else {
        setDraft((current) => ({ ...current, pdfUrl: url }));
      }
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Fayl yüklənmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  /** Dərc üçün minimum tələblər */
  function publishProblem(issue: EjournalInput, pdf: string): string | null {
    if (!issue.title.az.trim()) return "Azərbaycan dilində başlıq mütləqdir.";
    if (!issue.coverImage) return "Dərc etmək üçün üz qabığı şəkli lazımdır.";
    if (!isPaid(issue) && !pdf) return "Pulsuz nömrəni dərc etmək üçün PDF lazımdır.";
    return null;
  }

  async function handleSubmit() {
    if (!draft.title.az.trim()) {
      setMessage({ tone: "error", text: "Azərbaycan dilində başlıq mütləqdir." });
      setActiveLocale("az");
      return;
    }
    if (draft.status === "published") {
      const problem = publishProblem(draft, pdfForDraft);
      if (problem) {
        setMessage({ tone: "error", text: problem });
        return;
      }
    }

    // Pullu nömrədə PDF açıq sənədə yazılmır
    const payload: EjournalInput = {
      ...draft,
      price: Math.max(0, Number(draft.price) || 0),
      pdfUrl: paid ? "" : draft.pdfUrl,
    };

    setBusy(true);
    setMessage(null);
    try {
      const id = editingId ?? (await addEjournal(payload));
      if (editingId) await saveEjournal(editingId, payload);
      if (paid && privatePdf) await setEjournalPrivatePdf(id, privatePdf);

      setMessage({
        tone: "success",
        text: editingId ? "Nömrə yeniləndi." : "Nömrə əlavə olundu.",
      });
      resetForm();
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Yadda saxlanılmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(issue: Ejournal) {
    setMessage(null);
    try {
      if (issue.status !== "published") {
        const pdf = isPaid(issue) ? await getEjournalPrivatePdf(issue.id).catch(() => "") : issue.pdfUrl;
        const problem = publishProblem(issue, pdf);
        if (problem) {
          setMessage({ tone: "error", text: `«${issue.title.az}»: ${problem}` });
          return;
        }
      }
      await saveEjournal(issue.id, {
        status: issue.status === "published" ? "draft" : "published",
      });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Status dəyişmədi.",
      });
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Nömrə həmişəlik silinsin?")) return;
    try {
      await removeEjournal(id);
      if (editingId === id) resetForm();
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Nömrə silinmədi.",
      });
    }
  }

  if (!session) return null;

  return (
    <>
      <PageHeader
        title="E-jurnal və nəşrlər"
        description="Pulsuz e-jurnal nömrələri (/e-jurnal) və satışdakı nəşrlər (/jurnallar). Nömrəni yaradıcıda hazırlayıb PDF kimi bağlaya bilərsiniz."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatBox label="Cəmi nömrə" value={stats.totalIssues} />
            <StatBox label="Dərc olunub" value={stats.publishedIssues} />
            <StatBox label="Satış" value={stats.totalSales} />
            <StatBox label="Gəlir" value={`${stats.totalRevenue} ₼`} />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          {/* ---------------------- Nömrə forması ---------------------- */}
          <div className="xl:col-span-5">
            <Panel title={editingId ? "Nömrəni redaktə et" : "Yeni nömrə"}>
              <div className="space-y-5">
                <LocaleTabs active={activeLocale} onChange={setActiveLocale} filled={filled} />

                <Field label="Başlıq" hint="Məsələn: «Sentyabr 2026 · Payız modası»">
                  <input
                    type="text"
                    value={draft.title[activeLocale]}
                    onChange={(event) => setLocalized("title", event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Qısa təsvir" hint="Kartda başlığın altında görünən 1–2 cümlə.">
                  <textarea
                    rows={2}
                    value={draft.description[activeLocale]}
                    onChange={(event) => setLocalized("description", event.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="Bu nömrədə" hint="Hər sətirə bir mövzu yazın — saytda siyahı kimi görünür.">
                  <textarea
                    rows={4}
                    value={draft.highlights?.[activeLocale] ?? ""}
                    onChange={(event) => setLocalized("highlights", event.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder={"Payız trendləri: 12 əsas obraz\nMüsahibə: …\nGözəllik: …"}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Qiymət (AZN)" hint="0 = pulsuz e-jurnal">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={draft.price ?? 0}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, price: Number(event.target.value) || 0 }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Kateqoriya">
                    <select
                      value={draft.category ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, category: event.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">— ümumi —</option>
                      {ISSUE_CATEGORIES.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="border border-line bg-cream/50 px-4 py-3 font-ui text-[12px] text-ink-soft">
                  {paid ? (
                    <>
                      <strong>Satışdakı nəşr.</strong> Saytda «Nəşrlər» kataloqunda qiymət və «Sifariş et»
                      düyməsi ilə görünür. PDF oxuculara açıq verilmir — sifarişlər «Mesajlar» bölməsinə
                      düşür, ödənişdən sonra PDF-i alıcıya göndərirsiniz.
                    </>
                  ) : (
                    <>
                      <strong>Pulsuz e-jurnal.</strong> Saytda «E-jurnal» səhifəsində PDF hər kəs üçün açıq olur.
                    </>
                  )}
                </div>

                <Field
                  label="PDF fayl"
                  hint="Maks. 10 MB. PDF-i «Yaradıcı»da hazırlaya və ya hazır faylı yükləyə bilərsiniz."
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file, "pdf");
                      event.target.value = "";
                    }}
                    className={fileInputClass}
                  />
                  {pdfForDraft && (
                    <a
                      href={pdfForDraft}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block truncate font-ui text-[11.5px] text-bordo underline"
                    >
                      Yüklənmiş PDF-ə bax
                    </a>
                  )}
                </Field>

                <Field label="Üz qabığı şəkli" hint="Dərc üçün mütləqdir. Şaquli (3:4) şəkil seçin.">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file, "coverImage");
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
                  <Field label="Buraxılış tarixi">
                    <input
                      type="date"
                      value={draft.publishedAt.slice(0, 10)}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, publishedAt: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Səhifə sayı">
                    <input
                      type="number"
                      min={0}
                      value={draft.pages}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, pages: Number(event.target.value) || 0 }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Vəziyyət">
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as EjournalInput["status"],
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="draft">Qaralama (saytda görünmür)</option>
                    <option value="published">Dərc olunub</option>
                  </select>
                </Field>

                <div className="flex gap-3">
                  <Button onClick={() => void handleSubmit()} disabled={busy} className="flex-1">
                    {busy ? "Gözləyin…" : editingId ? "Dəyişiklikləri saxla" : "Nömrəni əlavə et"}
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

          {/* ---------------------- Mövcud nömrələr ---------------------- */}
          <div className="xl:col-span-7">
            <Panel title="Nömrələr">
              {!issues ? (
                <p className="py-10 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : issues.length === 0 ? (
                <Empty
                  title="Hələ nömrə yoxdur"
                  text="Soldakı formadan ilk nömrəni yaradın, sonra «Yaradıcı» ilə səhifələrini hazırlayın."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {issues.map((issue) => {
                    const detail = issueStats[issue.id] ?? { orders: 0, revenue: 0, downloads: 0 };
                    const issuePaid = isPaid(issue);
                    return (
                      <li key={issue.id} className="py-4">
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="h-20 w-14 shrink-0 border border-line bg-cream-deep">
                            {issue.coverImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={issue.coverImage} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-display text-[1.0625rem]">{issue.title.az || "—"}</p>
                            <p className="mt-1 font-ui text-[11.5px] text-muted">
                              {issue.publishedAt.slice(0, 10)}
                              {issue.pages > 0 && ` · ${issue.pages} səhifə`}
                              {" · "}
                              {issuePaid ? `${issue.price} ₼` : "Pulsuz"}
                              {issue.category &&
                                ` · ${ISSUE_CATEGORIES.find((item) => item.slug === issue.category)?.name ?? issue.category}`}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <StatusPill status={issue.status} />
                              {issue.status === "published" && issuePaid && (
                                <span className="font-ui text-[11px] text-muted">
                                  {detail.orders} sifariş · {detail.revenue} ₼
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/ejournals/builder/${issue.id}`}>
                              <Button variant="ghost">Yaradıcı</Button>
                            </Link>
                            <Button variant="ghost" onClick={() => void startEdit(issue)}>
                              Redaktə
                            </Button>
                            <Button variant="ghost" onClick={() => void togglePublish(issue)}>
                              {issue.status === "published" ? "Gizlət" : "Dərc et"}
                            </Button>
                            {issuePaid && (
                              <Link href={`/admin/ejournals/${issue.id}`}>
                                <Button variant="ghost">Satış</Button>
                              </Link>
                            )}
                            {canDelete && (
                              <Button variant="danger" onClick={() => void handleRemove(issue.id)}>
                                Sil
                              </Button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-line bg-paper px-4 py-3">
      <p className="font-ui text-[10.5px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
