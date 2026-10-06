"use client";

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
import {
  addEjournal,
  listEjournals,
  removeEjournal,
  saveEjournal,
  uploadFile,
} from "@/lib/data/admin";
import { useAuth } from "@/lib/firebase/auth";
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
    publishedAt: new Date().toISOString().slice(0, 10),
    pages: 0,
  };
}

export default function EjournalsPage() {
  const { session } = useAuth();
  const [issues, setIssues] = useState<Ejournal[] | null>(null);
  const [draft, setDraft] = useState<EjournalInput>(emptyIssue);
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  async function refresh() {
    try {
      setIssues(await listEjournals());
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Nömrələr oxunmadı.",
      });
      setIssues([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filled = Object.fromEntries(
    locales.map((code) => [code, Boolean(draft.title[code]?.trim())]),
  ) as Record<Locale, boolean>;

  function setLocalized(field: "title" | "description", value: string) {
    setDraft((current) => ({
      ...current,
      [field]: { ...current[field], [activeLocale]: value },
    }));
  }

  async function handleUpload(file: File, target: "coverImage" | "pdfUrl") {
    setBusy(true);
    setMessage(null);
    try {
      const url = await uploadFile(file, target === "pdfUrl" ? "ejournals" : "ejournal-covers");
      setDraft((current) => ({ ...current, [target]: url }));
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Fayl yüklənmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (!draft.pdfUrl) {
      setMessage({ tone: "error", text: "PDF fayl mütləqdir." });
      return;
    }
    if (!draft.title.az.trim()) {
      setMessage({ tone: "error", text: "Azərbaycan dilində başlıq mütləqdir." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await addEjournal(draft);
      setDraft(emptyIssue());
      setActiveLocale("az");
      setMessage({ tone: "success", text: "Nömrə əlavə olundu." });
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

  if (!session) return null;

  return (
    <>
      <PageHeader
        title="E-jurnal"
        description="Jurnalın elektron nömrələri. PDF yüklənir, oxucu saytdan açıb oxuya və ya yükləyə bilir."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          {/* ------------------------- Yeni nömrə ------------------------- */}
          <div className="xl:col-span-5">
            <Panel title="Yeni nömrə">
              <div className="space-y-5">
                <LocaleTabs active={activeLocale} onChange={setActiveLocale} filled={filled} />

                <Field label="Başlıq" hint="Məsələn: «Sentyabr 2026»">
                  <input
                    type="text"
                    value={draft.title[activeLocale]}
                    onChange={(event) => setLocalized("title", event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Nömrədə nə var">
                  <textarea
                    rows={3}
                    value={draft.description[activeLocale]}
                    onChange={(event) => setLocalized("description", event.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="PDF fayl" hint="Oxucu bu faylı açır və ya yükləyir.">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file, "pdfUrl");
                    }}
                    className={fileInputClass}
                  />
                  {draft.pdfUrl && (
                    <p className="mt-2 truncate font-ui text-[11.5px] text-muted">
                      {draft.pdfUrl}
                    </p>
                  )}
                </Field>

                <Field label="Üz qabığı şəkli" hint="Boş qalsa naxışlı örtük göstərilir.">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file, "coverImage");
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
                  <Field label="Tarix">
                    <input
                      type="date"
                      value={draft.publishedAt}
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
                        setDraft((current) => ({
                          ...current,
                          pages: Number(event.target.value) || 0,
                        }))
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
                    <option value="draft">Qaralama</option>
                    <option value="published">Dərc olunub</option>
                  </select>
                </Field>

                <Button onClick={() => void handleAdd()} disabled={busy} className="w-full">
                  {busy ? "Gözləyin…" : "Nömrəni əlavə et"}
                </Button>
              </div>
            </Panel>
          </div>

          {/* ------------------------ Mövcud nömrələr --------------------- */}
          <div className="xl:col-span-7">
            <Panel title="Nömrələr">
              {!issues ? (
                <p className="py-10 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : issues.length === 0 ? (
                <Empty
                  title="Hələ nömrə yoxdur"
                  text="İlk PDF-i yükləyin — saytdakı «E-jurnal» bölməsi dərhal dolacaq."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {issues.map((issue) => (
                    <li key={issue.id} className="flex flex-wrap items-center gap-4 py-4">
                      <div className="h-20 w-14 shrink-0 border border-line bg-cream-deep">
                        {issue.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={issue.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[1.0625rem]">
                          {issue.title.az || "—"}
                        </p>
                        <p className="mt-1 font-ui text-[11.5px] text-muted">
                          {issue.publishedAt}
                          {issue.pages > 0 && ` · ${issue.pages} səhifə`}
                        </p>
                        <div className="mt-2">
                          <StatusPill status={issue.status} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            void saveEjournal(issue.id, {
                              status: issue.status === "published" ? "draft" : "published",
                            }).then(refresh)
                          }
                        >
                          {issue.status === "published" ? "Gizlət" : "Dərc et"}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            if (window.confirm("Nömrə silinsin?")) {
                              void removeEjournal(issue.id).then(refresh);
                            }
                          }}
                        >
                          Sil
                        </Button>
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
