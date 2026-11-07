"use client";

/**
 * E-jurnal (PDF) — pulsuz elektron jurnal.
 * İş axını: nömrə yarat → Yaradıcıda səhifələri hazırla → PDF hazırla və bağla → saytda dərc et.
 * Hazır PDF-i (məs. InDesign-dan) birbaşa da yükləmək olar.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import {
  addEjournal,
  listEjournals,
  removeEjournal,
  saveEjournal,
  uploadFile,
} from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import { locales, type Locale } from "@/lib/i18n/config";
import { emptyLocalized, type Ejournal, type EjournalInput } from "@/lib/types";

const fileInputClass =
  "w-full font-ui text-[12px] text-ink-soft file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-ink hover:file:border-bordo";

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
  };
}

/** Saytdakı «E-jurnal» səhifəsini 5 dildə dərhal yenilə */
async function refreshSitePage() {
  await authorizedFetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: locales.map((code) => `/${code}/e-jurnal`) }),
  }).catch(() => undefined);
}

function publishProblem(issue: Pick<EjournalInput, "title" | "coverImage" | "pdfUrl">): string | null {
  if (!issue.title.az.trim()) return "Azərbaycan dilində başlıq mütləqdir.";
  if (!issue.pdfUrl) return "Dərc üçün PDF lazımdır — Yaradıcıda «PDF hazırla» edin və ya hazır PDF yükləyin.";
  if (!issue.coverImage) return "Dərc üçün üz qabığı şəkli lazımdır.";
  return null;
}

export default function EjournalsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [issues, setIssues] = useState<Ejournal[] | null>(null);
  const [draft, setDraft] = useState<EjournalInput>(emptyIssue);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const canDelete = isAdmin(session);

  async function refresh() {
    try {
      setIssues(await listEjournals());
    } catch (caught) {
      setIssues([]);
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Nömrələr oxunmadı." });
    }
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
    setActiveLocale("az");
  }

  function startEdit(issue: Ejournal) {
    const { id, ...rest } = issue;
    setDraft({ ...emptyIssue(), ...rest, highlights: rest.highlights ?? emptyLocalized() });
    setEditingId(id);
    setActiveLocale("az");
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleUpload(file: File, target: "coverImage" | "pdfUrl") {
    setBusy(true);
    setMessage(null);
    try {
      const url = await uploadFile(file, target === "pdfUrl" ? "ejournals" : "ejournal-covers");
      setDraft((current) => ({ ...current, [target]: url }));
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Fayl yüklənmədi." });
    } finally {
      setBusy(false);
    }
  }

  /** «Yaradıcıda aç» = yarat/saxla və yaradıcıya keç; «Saxla» = yalnız saxla */
  async function handleSubmit(openBuilder: boolean) {
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

    setBusy(true);
    setMessage(null);
    try {
      const id = editingId ?? (await addEjournal(draft));
      if (editingId) await saveEjournal(editingId, draft);
      if (draft.status === "published") await refreshSitePage();

      if (openBuilder) {
        router.push(`/admin/ejournals/builder/${id}`);
        return;
      }
      setMessage({ tone: "success", text: editingId ? "Nömrə yeniləndi." : "Nömrə yaradıldı." });
      resetForm();
      await refresh();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Yadda saxlanılmadı." });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(issue: Ejournal) {
    setMessage(null);
    if (issue.status !== "published") {
      const problem = publishProblem(issue);
      if (problem) {
        setMessage({ tone: "error", text: `«${issue.title.az}»: ${problem}` });
        return;
      }
    }
    try {
      await saveEjournal(issue.id, { status: issue.status === "published" ? "draft" : "published" });
      await refreshSitePage();
      await refresh();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Status dəyişmədi." });
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Nömrə və onun yaradıcı səhifələri həmişəlik silinsin?")) return;
    try {
      await removeEjournal(id);
      if (editingId === id) resetForm();
      await refreshSitePage();
      await refresh();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "Nömrə silinmədi." });
    }
  }

  if (!session) return null;

  return (
    <>
      <PageHeader
        title="E-jurnal (PDF)"
        description="Pulsuz elektron jurnal: nömrəni Yaradıcıda Word kimi hazırlayın, PDF edin və saytda dərc edin."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <ol className="mb-6 grid gap-3 font-ui text-[12px] text-ink-soft sm:grid-cols-4">
          {[
            "1. Nömrə yaradın (başlıq və tarix)",
            "2. Yaradıcıda səhifələri hazırlayın",
            "3. «PDF hazırla» → PDF-i yükləyin",
            "4. «Saytda dərc et»",
          ].map((step) => (
            <li key={step} className="border border-line bg-paper px-4 py-3">
              {step}
            </li>
          ))}
        </ol>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <Panel title={editingId ? "Nömrəni redaktə et" : "Yeni e-jurnal nömrəsi"}>
              <div className="space-y-5">
                <LocaleTabs active={activeLocale} onChange={setActiveLocale} filled={filled} />

                <Field label="Başlıq" hint="Məsələn: «Noyabr 2026»">
                  <input
                    type="text"
                    value={draft.title[activeLocale]}
                    onChange={(event) => setLocalized("title", event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Qısa təsvir" hint="Saytda kartın altında görünən 1–2 cümlə.">
                  <textarea
                    rows={2}
                    value={draft.description[activeLocale]}
                    onChange={(event) => setLocalized("description", event.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="Bu nömrədə" hint="Hər sətirə bir mövzu — saytda siyahı kimi görünür.">
                  <textarea
                    rows={4}
                    value={draft.highlights?.[activeLocale] ?? ""}
                    onChange={(event) => setLocalized("highlights", event.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="Tarix">
                  <input
                    type="date"
                    value={draft.publishedAt.slice(0, 10)}
                    onChange={(event) => setDraft((current) => ({ ...current, publishedAt: event.target.value }))}
                    className={inputClass}
                  />
                </Field>

                <details className="border border-line px-4 py-3">
                  <summary className="cursor-pointer font-ui text-[12px] text-ink">
                    Hazır PDF və üz qabığı yükləmək (Yaradıcısız)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <Field label="PDF fayl" hint="Maks. 10 MB.">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void handleUpload(file, "pdfUrl");
                          event.target.value = "";
                        }}
                        className={fileInputClass}
                      />
                      {draft.pdfUrl && (
                        <a href={draft.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block font-ui text-[11.5px] text-bordo underline">
                          Yüklənmiş PDF-ə bax
                        </a>
                      )}
                    </Field>
                    <Field label="Üz qabığı şəkli" hint="Şaquli (3:4). Yaradıcıda 1-ci səhifədən də təyin etmək olar.">
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
                        <div className="mt-3 w-28 border border-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={draft.coverImage} alt="" className="w-full" />
                        </div>
                      )}
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
                    <Field label="Vəziyyət">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, status: event.target.value as EjournalInput["status"] }))
                        }
                        className={inputClass}
                      >
                        <option value="draft">Qaralama (saytda görünmür)</option>
                        <option value="published">Saytda dərc olunub</option>
                      </select>
                    </Field>
                  </div>
                </details>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void handleSubmit(true)} disabled={busy} className="flex-1">
                    {busy ? "Gözləyin…" : editingId ? "Saxla və Yaradıcıda aç" : "Yarat və Yaradıcıda aç"}
                  </Button>
                  <Button variant="ghost" onClick={() => void handleSubmit(false)} disabled={busy}>
                    Yalnız saxla
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
            <Panel title="E-jurnal nömrələri">
              {!issues ? (
                <p className="py-10 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : issues.length === 0 ? (
                <Empty title="Hələ nömrə yoxdur" text="Soldan ilk nömrəni yaradın — Yaradıcı avtomatik açılacaq." />
              ) : (
                <ul className="divide-y divide-line">
                  {issues.map((issue) => (
                    <li key={issue.id} className="flex flex-wrap items-start gap-4 py-4">
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
                          {issue.pdfUrl ? "PDF hazırdır" : "PDF yoxdur"}
                        </p>
                        <div className="mt-2">
                          <StatusPill status={issue.status} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/ejournals/builder/${issue.id}`}>
                          <Button>Yaradıcı</Button>
                        </Link>
                        <Button variant="ghost" onClick={() => startEdit(issue)}>
                          Redaktə
                        </Button>
                        <Button variant="ghost" onClick={() => void togglePublish(issue)}>
                          {issue.status === "published" ? "Saytdan gizlət" : "Saytda dərc et"}
                        </Button>
                        {issue.pdfUrl && (
                          <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost">PDF</Button>
                          </a>
                        )}
                        {canDelete && (
                          <Button variant="danger" onClick={() => void handleRemove(issue.id)}>
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
