"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Alert, Button, PageHeader } from "@/components/admin/ui";
import { useAuth } from "@/lib/firebase/auth";
import {
  getEjournal,
  getEjournalLayout,
  saveEjournal,
  saveEjournalLayout,
  setEjournalPrivatePdf,
} from "@/lib/data/admin";
import { uploadMedia } from "@/lib/upload-client";
import type { Ejournal, EjBlock, EjPage } from "@/lib/types";

import { Inspector } from "./Inspector";
import { PageCanvas } from "./PageCanvas";
import { isSafeUrl } from "./sanitize";
import { BUILDER_CSS } from "./styles";
import {
  MM_PX,
  PAGE_H_MM,
  PAGE_W_MM,
  TEMPLATE_LABEL,
  clonePage,
  createBlock,
  createDefaultPages,
  createPage,
  type TemplateKind,
} from "./templates";

const PAGE_W_PX = PAGE_W_MM * MM_PX;
const PAGE_H_PX = PAGE_H_MM * MM_PX;
const THUMB_W = 132;
const HISTORY_LIMIT = 50;
const AUTOSAVE_MS = 3000;

type Message = { tone: "info" | "error" | "success"; text: string };

const BLOCK_TOOLS: { type: EjBlock["type"]; label: string }[] = [
  { type: "heading", label: "Başlıq" },
  { type: "text", label: "Mətn" },
  { type: "image", label: "Şəkil" },
  { type: "quote", label: "Sitat" },
  { type: "divider", label: "Ayırıcı" },
  { type: "spacer", label: "Boşluq" },
];

const TEMPLATE_KINDS: TemplateKind[] = ["blank", "cover", "contents", "article", "fullImage", "quote"];

function isEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

function SmallButton({
  children,
  onClick,
  disabled,
  title,
  active,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // mousedown-un default-u söndürülür ki, mətn seçimi və fokus itməsin
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`border px-2.5 py-1.5 font-ui text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-bordo bg-bordo text-cream"
          : danger
            ? "border-bordo/40 text-bordo hover:bg-bordo hover:text-cream"
            : "border-line bg-paper text-ink hover:border-bordo hover:text-bordo"
      }`}
    >
      {children}
    </button>
  );
}

export function Builder({ issueId }: { issueId: string }) {
  const { session } = useAuth();

  const [issue, setIssue] = useState<Ejournal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [pages, setPages] = useState<EjPage[]>([]);
  const pagesRef = useRef<EjPage[]>([]);
  const past = useRef<EjPage[][]>([]);
  const future = useRef<EjPage[][]>([]);
  const lastKey = useRef<string | null>(null);
  const lastTs = useRef(0);
  const versionRef = useRef(0);
  const [version, setVersion] = useState(0);
  const [historyTick, setHistoryTick] = useState(0);

  const [selPageId, setSelPageId] = useState<string | null>(null);
  const [selBlockId, setSelBlockId] = useState<string | null>(null);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState("");

  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [addMenu, setAddMenu] = useState(false);

  const [printOpen, setPrintOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  /* ------------------------------ Yükləmə ------------------------------ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedIssue, layout] = await Promise.all([getEjournal(issueId), getEjournalLayout(issueId)]);
        if (cancelled) return;
        if (!loadedIssue) {
          setLoadError("E-jurnal nömrəsi tapılmadı.");
          return;
        }
        setIssue(loadedIssue);
        const initial =
          layout && Array.isArray(layout.pages) && layout.pages.length > 0
            ? layout.pages
            : createDefaultPages(loadedIssue.title?.az || "Nesreen Magazine");
        pagesRef.current = initial;
        setPages(initial);
        setSelPageId(initial[0]?.id ?? null);
        if (layout?.updatedAt) setSavedAt(new Date(layout.updatedAt));
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Yüklənmə xətası.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  /* --------------------------- Dəyişiklik + tarixçə --------------------------- */

  const commit = useCallback((next: EjPage[], key?: string) => {
    const now = Date.now();
    const coalesce = key !== undefined && lastKey.current === key && now - lastTs.current < 1000;
    if (!coalesce) {
      past.current.push(pagesRef.current);
      if (past.current.length > HISTORY_LIMIT) past.current.shift();
    }
    lastKey.current = key ?? null;
    lastTs.current = now;
    future.current = [];
    pagesRef.current = next;
    versionRef.current += 1;
    setPages(next);
    setVersion(versionRef.current);
    setDirty(true);
    setHistoryTick((t) => t + 1);
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(pagesRef.current);
    pagesRef.current = prev;
    lastKey.current = null;
    versionRef.current += 1;
    setPages(prev);
    setVersion(versionRef.current);
    setDirty(true);
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(pagesRef.current);
    pagesRef.current = next;
    lastKey.current = null;
    versionRef.current += 1;
    setPages(next);
    setVersion(versionRef.current);
    setDirty(true);
    setHistoryTick((t) => t + 1);
  }, []);

  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selPageId) ?? pages[0] ?? null,
    [pages, selPageId],
  );
  const selectedBlock = useMemo(
    () => selectedPage?.blocks.find((b) => b.id === selBlockId) ?? null,
    [selectedPage, selBlockId],
  );

  const patchPage = useCallback(
    (pageId: string, patch: Partial<EjPage>, key?: string) => {
      commit(
        pagesRef.current.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
        key,
      );
    },
    [commit],
  );

  const changeBlock = useCallback(
    (pageId: string, next: EjBlock) => {
      commit(
        pagesRef.current.map((p) =>
          p.id === pageId ? { ...p, blocks: p.blocks.map((b) => (b.id === next.id ? next : b)) } : p,
        ),
        `block:${next.id}`,
      );
    },
    [commit],
  );

  /* ------------------------------ Saxlama ------------------------------ */

  const save = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) return false;
    savingRef.current = true;
    const startVersion = versionRef.current;
    setSaving(true);
    setSaveError("");
    try {
      await saveEjournalLayout({
        issueId,
        pages: pagesRef.current,
        updatedAt: new Date().toISOString(),
        ...(session?.email ? { updatedBy: session.email } : {}),
      });
      if (versionRef.current === startVersion) setDirty(false);
      setSavedAt(new Date());
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Saxlama alınmadı.");
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [issueId, session?.email]);

  // Avtomatik saxlama: son dəyişiklikdən ~3 san sonra
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [dirty, version, save]);

  // Saxlanmamış dəyişiklik varsa səhifədən çıxarkən xəbərdarlıq
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* ------------------------------ Klaviatura ------------------------------ */

  const removeSelectedBlock = useCallback(() => {
    if (!selectedPage || !selBlockId) return;
    commit(
      pagesRef.current.map((p) =>
        p.id === selectedPage.id ? { ...p, blocks: p.blocks.filter((b) => b.id !== selBlockId) } : p,
      ),
    );
    setSelBlockId(null);
  }, [commit, selectedPage, selBlockId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const editing = isEditingTarget(event.target);
      if (event.key === "Delete" && !editing && selBlockId) {
        event.preventDefault();
        removeSelectedBlock();
        return;
      }
      // Mətn yazarkən brauzerin öz geri-al mexanizmi işləyir
      if (editing || !(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [removeSelectedBlock, selBlockId, undo, redo]);

  /* ------------------------------ Miqyas ------------------------------ */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - 48;
      if (available > 0) setScale(Math.min(1.5, Math.max(0.2, available / PAGE_W_PX)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  /* ------------------------------ Səhifə əməliyyatları ------------------------------ */

  const selectPage = (id: string) => {
    setSelPageId(id);
    setSelBlockId(null);
    setOverflow(false);
  };

  const addPage = (kind: TemplateKind) => {
    const page = createPage(kind, issue?.title?.az || "Nesreen Magazine");
    const index = selectedPage ? pagesRef.current.findIndex((p) => p.id === selectedPage.id) + 1 : pagesRef.current.length;
    const next = [...pagesRef.current];
    next.splice(index, 0, page);
    commit(next);
    selectPage(page.id);
    setAddMenu(false);
  };

  const duplicatePage = (id: string) => {
    const index = pagesRef.current.findIndex((p) => p.id === id);
    if (index < 0) return;
    const copy = clonePage(pagesRef.current[index]);
    const next = [...pagesRef.current];
    next.splice(index + 1, 0, copy);
    commit(next);
    selectPage(copy.id);
  };

  const deletePage = (id: string) => {
    if (pagesRef.current.length <= 1) {
      setMessage({ tone: "error", text: "Son səhifəni silmək olmaz." });
      return;
    }
    if (!window.confirm("Bu səhifə silinsin?")) return;
    const index = pagesRef.current.findIndex((p) => p.id === id);
    const next = pagesRef.current.filter((p) => p.id !== id);
    commit(next);
    selectPage(next[Math.min(index, next.length - 1)].id);
  };

  const movePage = (id: string, dir: -1 | 1) => {
    const index = pagesRef.current.findIndex((p) => p.id === id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= pagesRef.current.length) return;
    const next = [...pagesRef.current];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  /* ------------------------------ Blok əməliyyatları ------------------------------ */

  const addBlock = (type: EjBlock["type"]) => {
    if (!selectedPage) return;
    const block = createBlock(type);
    const at = selectedBlock ? selectedPage.blocks.findIndex((b) => b.id === selectedBlock.id) + 1 : selectedPage.blocks.length;
    const blocks = [...selectedPage.blocks];
    blocks.splice(at, 0, block);
    patchPage(selectedPage.id, { blocks });
    setSelBlockId(block.id);
  };

  const moveBlock = (dir: -1 | 1) => {
    if (!selectedPage || !selBlockId) return;
    const blocks = [...selectedPage.blocks];
    const index = blocks.findIndex((b) => b.id === selBlockId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    patchPage(selectedPage.id, { blocks });
  };

  /* ------------------------------ Şəkil yükləmə ------------------------------ */

  const uploadImage = async (file: File): Promise<string | null> => {
    setBusy(true);
    setMessage(null);
    try {
      const uploaded = await uploadMedia(file, "ejournal-covers");
      return uploaded.url;
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Şəkil yüklənmədi." });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const uploadPageBackground = async (file: File) => {
    if (!selectedPage) return;
    const url = await uploadImage(file);
    if (url) {
      patchPage(selectedPage.id, {
        backgroundImage: url,
        overlay: selectedPage.overlay ?? 0.25,
      });
    }
  };

  const uploadBlockImage = async (file: File) => {
    if (!selectedPage || !selectedBlock || selectedBlock.type !== "image") return;
    const url = await uploadImage(file);
    if (url) changeBlock(selectedPage.id, { ...selectedBlock, url });
  };

  /* ------------------------------ Mətn alətləri ------------------------------ */

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const addLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    const host = (range.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement
    )?.closest<HTMLElement>("[contenteditable]");
    if (!host) return;
    const url = window.prompt("Link ünvanı (https://…)");
    if (!url || !isSafeUrl(url)) return;
    host.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    exec("createLink", url.trim());
  };

  /* ------------------------------ Üz qabığı ------------------------------ */

  const coverCandidate = pages[0]?.backgroundImage;

  const assignCover = async () => {
    if (!coverCandidate) return;
    try {
      await saveEjournal(issueId, { coverImage: coverCandidate });
      setIssue((prev) => (prev ? { ...prev, coverImage: coverCandidate } : prev));
      setMessage({ tone: "success", text: "Üz qabığı nömrəyə təyin edildi." });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Üz qabığı təyin olunmadı." });
    }
  };

  /* ------------------------------ PDF ------------------------------ */

  const openPrintModal = async () => {
    setPdfDone(false);
    setPdfError("");
    if (dirty) await save();
    setPrintOpen(true);
  };

  const runPrint = async () => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("#ej-print-root img"));
    await Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
      ),
    );
    if (document.fonts) await document.fonts.ready;
    window.print();
  };

  const handlePdfFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !issue) return;
    if (file.type !== "application/pdf") {
      setPdfError("Yalnız PDF faylı seçin.");
      return;
    }
    setPdfBusy(true);
    setPdfError("");
    try {
      const uploaded = await uploadMedia(file, "ejournals");
      const count = pagesRef.current.length;
      if ((issue.price ?? 0) > 0) {
        // Pullu nömrə: PDF linki yalnız staff-a açıq sənəddə saxlanılır
        await setEjournalPrivatePdf(issueId, uploaded.url);
        await saveEjournal(issueId, { pdfUrl: "", pages: count });
      } else {
        await saveEjournal(issueId, { pdfUrl: uploaded.url, pages: count });
      }
      setPdfDone(true);
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : "PDF yüklənmədi.");
    } finally {
      setPdfBusy(false);
    }
  };

  /* ------------------------------ Render ------------------------------ */

  if (loading) {
    return <PageHeader title="E-jurnal yaradıcısı" description="Yüklənir…" backHref="/admin/ejournals" />;
  }
  if (loadError || !issue || !selectedPage) {
    return (
      <>
        <PageHeader title="E-jurnal yaradıcısı" backHref="/admin/ejournals" />
        <div className="p-6">
          <Alert tone="error">{loadError || "E-jurnal nömrəsi tapılmadı."}</Alert>
        </div>
      </>
    );
  }

  const pageIndex = pages.findIndex((p) => p.id === selectedPage.id);
  const blockIndex = selectedBlock ? selectedPage.blocks.findIndex((b) => b.id === selectedBlock.id) : -1;
  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;
  void historyTick;

  const statusText = saving
    ? "Saxlanılır…"
    : saveError
      ? saveError
      : dirty
        ? "Saxlanılmamış dəyişikliklər"
        : savedAt
          ? `Saxlanılıb · ${formatTime(savedAt)}`
          : "Hələ saxlanılmayıb";

  return (
    <>
      <style>{BUILDER_CSS}</style>

      <PageHeader
        title="E-jurnal yaradıcısı"
        description={issue.title?.az || "Adsız nömrə"}
        backHref="/admin/ejournals"
        actions={
          <>
            <span className={`font-ui text-[12px] ${saveError ? "text-bordo" : "text-muted"}`}>{statusText}</span>
            <Button variant="ghost" onClick={undo} disabled={!canUndo}>
              Geri al
            </Button>
            <Button variant="ghost" onClick={redo} disabled={!canRedo}>
              Təkrarla
            </Button>
            {coverCandidate && (
              <Button variant="ghost" onClick={() => void assignCover()}>
                Üz qabığını nömrəyə təyin et
              </Button>
            )}
            <Button onClick={() => void save()} disabled={saving || !dirty}>
              Yadda saxla
            </Button>
            <Button onClick={() => void openPrintModal()}>PDF hazırla</Button>
          </>
        }
      />

      <div className="space-y-2 px-4 pt-3">
        <div className="lg:hidden">
          <Alert tone="info">E-jurnal yaradıcısı kompüterdə daha rahat işləyir.</Alert>
        </div>
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
      </div>

      <div className="flex flex-col lg:h-[calc(100vh-190px)] lg:min-h-[560px] lg:flex-row">
        {/* ------------------------- Sol: səhifələr ------------------------- */}
        <aside className="w-full shrink-0 overflow-y-auto border-b border-line bg-cream-deep/40 p-3 lg:w-[190px] lg:border-b-0 lg:border-e">
          <div className="relative mb-3">
            <Button className="w-full" variant="ghost" onClick={() => setAddMenu((v) => !v)}>
              + Səhifə əlavə et
            </Button>
            {addMenu && (
              <div className="absolute inset-x-0 top-full z-20 mt-1 border border-line bg-paper shadow-lg">
                {TEMPLATE_KINDS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addPage(kind)}
                    className="block w-full px-3 py-2 text-start font-ui text-[13px] text-ink hover:bg-cream-deep"
                  >
                    {TEMPLATE_LABEL[kind]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ol className="flex gap-3 overflow-x-auto lg:block lg:space-y-4 lg:overflow-visible">
            {pages.map((page, index) => {
              const active = page.id === selectedPage.id;
              return (
                <li key={page.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => selectPage(page.id)}
                    className={`block border-2 ${active ? "border-bordo" : "border-line hover:border-bordo-soft"}`}
                    style={{ width: THUMB_W, height: (THUMB_W * PAGE_H_MM) / PAGE_W_MM }}
                    aria-label={`Səhifə ${index + 1}`}
                  >
                    <div style={{ width: THUMB_W, height: (THUMB_W * PAGE_H_MM) / PAGE_W_MM, overflow: "hidden", pointerEvents: "none" }}>
                      <div style={{ transform: `scale(${THUMB_W / PAGE_W_PX})`, transformOrigin: "top left", width: PAGE_W_PX }}>
                        <PageCanvas page={page} mode="thumb" />
                      </div>
                    </div>
                  </button>
                  <div className="mt-1 flex items-center justify-between" style={{ width: THUMB_W }}>
                    <span className="font-ui text-[11px] text-muted">{index + 1}</span>
                    <span className="flex gap-1">
                      <SmallButton title="Yuxarı" disabled={index === 0} onClick={() => movePage(page.id, -1)}>
                        ↑
                      </SmallButton>
                      <SmallButton title="Aşağı" disabled={index === pages.length - 1} onClick={() => movePage(page.id, 1)}>
                        ↓
                      </SmallButton>
                      <SmallButton title="Kopyala" onClick={() => duplicatePage(page.id)}>
                        ⧉
                      </SmallButton>
                      <SmallButton title="Sil" danger onClick={() => deletePage(page.id)}>
                        ×
                      </SmallButton>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ------------------------- Mərkəz: səhifə ------------------------- */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#e9e4dd]">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-paper px-3 py-2">
            {BLOCK_TOOLS.map((tool) => (
              <SmallButton key={tool.type} onClick={() => addBlock(tool.type)}>
                + {tool.label}
              </SmallButton>
            ))}
            <span className="mx-2 h-5 w-px bg-line" />
            <SmallButton title="Blokları yuxarı apar" disabled={!selectedBlock || blockIndex <= 0} onClick={() => moveBlock(-1)}>
              Blok ↑
            </SmallButton>
            <SmallButton
              title="Blokları aşağı apar"
              disabled={!selectedBlock || blockIndex === selectedPage.blocks.length - 1}
              onClick={() => moveBlock(1)}
            >
              Blok ↓
            </SmallButton>
            <SmallButton danger disabled={!selectedBlock} onClick={removeSelectedBlock}>
              Bloku sil
            </SmallButton>
            {selectedBlock?.type === "text" && (
              <>
                <span className="mx-2 h-5 w-px bg-line" />
                <SmallButton title="Qalın" onClick={() => exec("bold")}>
                  <b>B</b>
                </SmallButton>
                <SmallButton title="Kursiv" onClick={() => exec("italic")}>
                  <i>I</i>
                </SmallButton>
                <SmallButton title="Altdan xətt" onClick={() => exec("underline")}>
                  <u>U</u>
                </SmallButton>
                <SmallButton title="Link" onClick={addLink}>
                  Link
                </SmallButton>
                <SmallButton title="Nöqtəli siyahı" onClick={() => exec("insertUnorderedList")}>
                  • Siyahı
                </SmallButton>
                <SmallButton title="Nömrəli siyahı" onClick={() => exec("insertOrderedList")}>
                  1. Siyahı
                </SmallButton>
              </>
            )}
          </div>

          {overflow && (
            <div className="border-b border-red-300 bg-red-50 px-4 py-2 font-ui text-[13px] text-red-700">
              Mətn səhifəyə sığmır — yeni səhifə əlavə edin
            </div>
          )}

          <div ref={scrollRef} className="min-h-[400px] flex-1 overflow-auto p-6">
            <div
              className="mx-auto"
              style={{
                width: PAGE_W_PX * scale,
                height: PAGE_H_PX * scale,
              }}
            >
              <div
                className="shadow-xl"
                style={{
                  width: PAGE_W_PX,
                  height: PAGE_H_PX,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  outline: overflow ? "3px solid #dc2626" : "none",
                }}
              >
                <PageCanvas
                  key={selectedPage.id}
                  page={selectedPage}
                  mode="edit"
                  selectedBlockId={selBlockId}
                  onSelectBlock={setSelBlockId}
                  onChangeBlock={(next) => changeBlock(selectedPage.id, next)}
                  onOverflow={setOverflow}
                />
              </div>
            </div>
            <p className="mt-3 text-center font-ui text-[11.5px] text-muted">
              Səhifə {pageIndex + 1} / {pages.length}
            </p>
          </div>
        </section>

        {/* ------------------------- Sağ: inspektor ------------------------- */}
        <aside className="w-full shrink-0 overflow-y-auto border-t border-line bg-paper p-4 lg:w-[290px] lg:border-s lg:border-t-0">
          <Inspector
            page={selectedPage}
            block={selectedBlock}
            busy={busy}
            onChangePage={(patch) => patchPage(selectedPage.id, patch, `page:${selectedPage.id}`)}
            onChangeBlock={(next) => changeBlock(selectedPage.id, next)}
            onUploadPageBackground={(file) => void uploadPageBackground(file)}
            onUploadBlockImage={(file) => void uploadBlockImage(file)}
          />
        </aside>
      </div>

      {/* ------------------------- PDF modalı ------------------------- */}
      {printOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="max-h-full w-full max-w-lg overflow-y-auto border border-line bg-paper p-6 shadow-2xl">
            <h2 className="font-display text-2xl text-ink">PDF hazırla</h2>

            <ol className="mt-4 list-decimal space-y-2 ps-5 font-ui text-[13.5px] text-ink-soft">
              <li>
                «Çap pəncərəsini aç» düyməsini basın. Chrome-da <b>Təyinat: PDF kimi saxla</b> seçin.
              </li>
              <li>
                <b>Kənar boşluqlar: Yoxdur</b> seçin.
              </li>
              <li>
                «Digər parametrlər» bölməsində <b>Fon qrafikası</b> xanasını aktiv edin.
              </li>
              <li>PDF-i kompüterə saxlayın, sonra aşağıdan yükləyin.</li>
            </ol>

            <div className="mt-5">
              <Button onClick={() => void runPrint()}>Çap pəncərəsini aç ({pages.length} səhifə)</Button>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="eyebrow mb-2 text-muted">Hazır PDF-i yüklə</p>
              <input
                type="file"
                accept="application/pdf"
                disabled={pdfBusy}
                onChange={(e) => void handlePdfFile(e)}
                className="block w-full font-ui text-[13px]"
              />
              <p className="mt-1.5 font-ui text-[11.5px] text-muted">
                PDF faylı ən çox 10 MB ola bilər (Cloudinary pulsuz limiti).
              </p>
              {pdfBusy && <p className="mt-2 font-ui text-[13px] text-muted">Yüklənir…</p>}
              {pdfError && (
                <Alert tone="error" className="mt-3">
                  {pdfError}
                </Alert>
              )}
              {pdfDone && (
                <Alert tone="success" className="mt-3">
                  PDF yükləndi və nömrəyə bağlandı.{" "}
                  <a href="/admin/ejournals" className="underline">
                    E-jurnallar siyahısına qayıt
                  </a>
                </Alert>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={() => setPrintOpen(false)}>
                Bağla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Çap konteyneri: ekranda gizlidir, çapda yalnız bu görünür */}
      {printOpen &&
        createPortal(
          <div id="ej-print-root">
            {pages.map((page) => (
              <PageCanvas key={page.id} page={page} mode="print" />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
