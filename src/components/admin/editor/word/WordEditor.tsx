"use client";

/**
 * Nesreen Magazine — Word səviyyəli məqalə redaktoru (Tiptap / ProseMirror).
 *
 * Lent (ribbon) qrupları: Mübadilə buferi · Şrift · Abzas · Üslublar · Daxil et · Tarixçə,
 * kontekst tabları: Cədvəl (kursor cədvəldə olanda) və Şəkil (şəkil seçiləndə).
 * Bütün formatlar semantik HTML kimi `body[locale]`-a yazılır.
 */
import { Extension, getHTMLFromFragment, type Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { NodeSelection } from "@tiptap/pm/state";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markdownToHtml } from "@/lib/markdown";
import { uploadMedia } from "@/lib/upload-client";
import {
  BlockFormat,
  FormattingMarks,
  Figure,
  ListStyle,
  TEXT_EFFECTS,
  TextEffect,
  VideoEmbed,
  WordBulletList,
  WordOrderedList,
  WordTextAlign,
  formattingMarksVisible,
  toEmbedUrl,
} from "./extensions";
import {
  BUILTIN_STYLES,
  FONT_FAMILIES,
  FONT_SIZES,
  LINE_SPACINGS,
  SPECIAL_CHARS,
  activeStyle,
  applyBuiltinStyle,
  applyCustomStyle,
  changeCase,
  computedFont,
  deleteCustomStyle,
  loadCustomStyles,
  reapplyCustomStyle,
  saveCustomStyle,
  serializeBlocks,
  sortSelection,
  stepFontSize,
  styleFromSelection,
  type BuiltinStyle,
  type CaseMode,
  type CustomStyle,
} from "./commands";
import { Btn, ColorGrid, Dropdown, Group, Icon, MenuItem, Modal, fieldCls, ghostBtn, labelCls, primaryBtn } from "./ui";

export interface WordEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  locale?: string;
  /** Status sətrində göstərilən əlavə məlumat (məs. avtomatik saxlama). */
  statusExtra?: React.ReactNode;
}

/** Köhnə Markdown və ya köhnə redaktor HTML-ini redaktor üçün hazırlayır. */
export function normalizeIncoming(content: string): string {
  if (!content) return "";
  const html = content.trim().startsWith("<") || /<(p|div|h\d)[\s>]/i.test(content) ? content : markdownToHtml(content);
  return html
    .replace(/<h1(\s|>)/gi, "<h2$1")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<img[^>]+src=["']data:[^>]*>/gi, ""); // base64 şəkillər Firestore limitini aşır
}

type Tab = "home" | "insert" | "table" | "image";

export default function WordEditor({ content, onChange, placeholder = "Məqalənin mətni…", locale = "az", statusExtra }: WordEditorProps) {
  const [tab, setTab] = useState<Tab>("home");
  const [, setTick] = useState(0);
  const [dialog, setDialog] = useState<null | "link" | "image" | "video" | "style" | "spacing">(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null);
  const lastEmitted = useRef<string>(content);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openLinkRef = useRef<() => void>(() => {});
  const fontRef = useRef<(dir: 1 | -1) => void>(() => {});

  const flush = useCallback((ed: Editor) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const html = serializeBlocks(ed, (f) => getHTMLFromFragment(f, ed.schema));
    lastEmitted.current = html;
    onChangeRef.current(html);
  }, []);

  const shortcuts = useMemo(
    () =>
      Extension.create({
        name: "wordShortcuts",
        addKeyboardShortcuts() {
          return {
            "Mod-k": () => {
              openLinkRef.current();
              return true;
            },
            "Mod-]": () => {
              fontRef.current(1);
              return true;
            },
            "Mod-[": () => {
              fontRef.current(-1);
              return true;
            },
            "Mod-Shift-.": () => {
              fontRef.current(1);
              return true;
            },
            "Mod-Shift-,": () => {
              fontRef.current(-1);
              return true;
            },
            "Mod-y": () => this.editor.commands.redo(),
            "Mod-Space": () => this.editor.chain().unsetAllMarks().run(),
          };
        },
      }),
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5] },
        bulletList: false,
        orderedList: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      WordBulletList,
      WordOrderedList,
      ListStyle,
      TextStyleKit,
      TextEffect,
      Highlight.configure({ multicolor: true }),
      // Word kimi: aşağı və yuxarı indeks eyni anda ola bilməz.
      Subscript.extend({ excludes: "superscript" }),
      Superscript.extend({ excludes: "subscript" }),
      WordTextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: false } }),
      BlockFormat,
      Figure,
      VideoEmbed,
      FormattingMarks,
      CharacterCount,
      Placeholder.configure({ placeholder }),
      shortcuts,
    ],
    content: normalizeIncoming(content),
    editorProps: {
      attributes: {
        class: "prose-mag nm-word-doc min-h-[520px] px-5 py-6 sm:px-10 sm:py-8 focus:outline-none",
        dir: locale === "ar" ? "rtl" : "ltr",
        lang: locale,
        "data-testid": "word-editor",
        spellcheck: "true",
      },
      transformPastedHTML: (html) => normalizeIncoming(html),
      // Şəkil/video ilk klikdə seçilsin (yalnız fokus deyil) — kontekst tabı açılır.
      handleClickOn: (view, _pos, node, nodePos) => {
        if (node.type.name !== "figure" && node.type.name !== "videoEmbed") return false;
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)));
        view.focus();
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        void uploadImages(files);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        void uploadImages(files);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => flush(ed), 250);
    },
    onBlur: ({ editor: ed }) => {
      if (timer.current) flush(ed);
    },
  });

  // Toolbar vəziyyətini kadr başına bir dəfə yenilə (uzun məqalələrdə performans).
  useEffect(() => {
    if (!editor) return;
    let raf = 0;
    const rerender = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTick((t) => t + 1));
    };
    editor.on("transaction", rerender);
    return () => {
      editor.off("transaction", rerender);
      cancelAnimationFrame(raf);
      if (timer.current) flush(editor);
    };
  }, [editor, flush]);

  // Xaricdən gələn məzmun dəyişikliyi (bərpa, AI köməkçi və s.)
  useEffect(() => {
    if (!editor || content === lastEmitted.current) return;
    lastEmitted.current = content;
    editor.commands.setContent(normalizeIncoming(content), { emitUpdate: false });
  }, [content, editor]);

  useEffect(() => {
    void loadCustomStyles().then(setCustomStyles);
  }, []);

  // Kontekst tablarına avtomatik keçid
  const inTable = editor?.isActive("table") ?? false;
  const sel = editor?.state.selection;
  const imageSelected = Boolean(sel instanceof NodeSelection && sel.node.type.name === "figure");
  const lastCtx = useRef({ inTable: false, imageSelected: false });
  /* eslint-disable react-hooks/set-state-in-effect -- kontekst tabı seçimə görə avtomatik açılır */
  useEffect(() => {
    if (imageSelected && !lastCtx.current.imageSelected) setTab("image");
    else if (!imageSelected && tab === "image") setTab(inTable ? "table" : "home");
    else if (inTable && !lastCtx.current.inTable) setTab("table");
    else if (!inTable && tab === "table") setTab("home");
    lastCtx.current = { inTable, imageSelected };
  }, [inTable, imageSelected, tab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  async function uploadImages(files: File[]) {
    if (!editor) return;
    setNotice("Şəkil yüklənir…");
    try {
      for (const file of files) {
        const media = await uploadMedia(file, "inline-images");
        editor.chain().focus().setFigure({ src: media.url, alt: file.name.replace(/\.[^.]+$/, ""), width: "100%", align: "center" }).run();
      }
      setNotice("Şəkil əlavə olundu.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Şəkil yüklənmədi.");
    }
  }

  const font = editor ? computedFont(editor) : { sizePt: 0, family: "" };
  const currentSize = font.sizePt;
  useEffect(() => {
    fontRef.current = (dir) => {
      if (!editor) return;
      const next = stepFontSize(currentSize || 13, dir);
      editor.chain().focus().setFontSize(`${next}pt`).run();
    };
    openLinkRef.current = () => setDialog("link");
  }, [editor, currentSize]);

  if (!editor) {
    return <div className="min-h-[600px] animate-pulse rounded border border-line bg-cream" />;
  }

  const ts = editor.getAttributes("textStyle");
  const styleKey = activeStyle(editor);
  const align = (["left", "center", "right", "justify"] as const).find((a) => editor.isActive({ textAlign: a })) ?? "left";
  const block = editor.state.selection.$from.parent.attrs as Record<string, unknown>;
  const marksOn = formattingMarksVisible(editor.state);
  const words = editor.storage.characterCount?.words?.() ?? 0;
  const chars = editor.storage.characterCount?.characters?.() ?? 0;
  const ch = () => editor.chain().focus();
  const familyLabel =
    FONT_FAMILIES.find((f) => ts.fontFamily && f.value === ts.fontFamily)?.label.replace(/ \(.*\)$/, "") || font.family || "Lora";

  function clipboard(action: "cut" | "copy") {
    editor!.commands.focus();
    const ok = document.execCommand(action);
    if (!ok) setNotice(`Brauzer icazə vermədi — Ctrl+${action === "cut" ? "X" : "C"} istifadə edin.`);
  }

  async function paste() {
    try {
      if ("read" in navigator.clipboard) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const img = item.types.find((t) => t.startsWith("image/"));
          if (img) {
            const blob = await item.getType(img);
            await uploadImages([new File([blob], "yapisdirilan-sekil", { type: img })]);
            return;
          }
          if (item.types.includes("text/html")) {
            const html = await (await item.getType("text/html")).text();
            ch().insertContent(normalizeIncoming(html)).run();
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      ch().insertContent(text).run();
    } catch {
      setNotice("Brauzer buferə giriş icazəsi vermədi — Ctrl+V istifadə edin.");
    }
  }

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "home", label: "Əsas", show: true },
    { key: "insert", label: "Daxil et", show: true },
    { key: "table", label: "Cədvəl", show: inTable },
    { key: "image", label: "Şəkil", show: imageSelected },
  ];

  const sizeLabel = font.sizePt ? String(font.sizePt).replace(/\.0$/, "") : "—";

  return (
    <div className="nm-word rounded border border-line bg-white" data-testid="word-editor-root">
      {/* ── Lent ── */}
      <div className="sticky top-0 z-30 border-b border-line bg-[#fbf8f4]">
        <div className="flex items-center gap-1 border-b border-line/70 px-2">
          <Btn title="Geri al (Ctrl+Z)" testId="tb-undo" onClick={() => ch().undo().run()} disabled={!editor.can().undo()}>
            <Icon name="undo" />
          </Btn>
          <Btn title="Təkrarla (Ctrl+Y)" testId="tb-redo" onClick={() => ch().redo().run()} disabled={!editor.can().redo()}>
            <Icon name="redo" />
          </Btn>
          <span className="mx-1 h-5 w-px bg-line" />
          <div role="tablist" className="flex overflow-x-auto scrollbar-none">
            {tabs
              .filter((t) => t.show)
              .map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  data-testid={`tab-${t.key}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 px-3 py-2 font-ui text-[12px] tracking-wide ${
                    tab === t.key ? "border-b-2 border-bordo font-semibold text-bordo" : "text-ink-soft hover:text-bordo"
                  } ${t.key === "table" || t.key === "image" ? "text-gold" : ""}`}
                >
                  {t.label}
                </button>
              ))}
          </div>
          {notice && (
            <span role="status" className="ms-auto truncate px-2 font-ui text-[11.5px] text-bordo">
              {notice}
            </span>
          )}
        </div>

        <div className="flex items-stretch overflow-x-auto scrollbar-none py-1" data-testid={`ribbon-${tab}`}>
          {tab === "home" && (
            <>
              <Group label="Bufer">
                <Btn title="Yapışdır (Ctrl+V)" testId="tb-paste" onClick={() => void paste()}>
                  <Icon name="paste" />
                </Btn>
                <Btn title="Kəs (Ctrl+X)" testId="tb-cut" onClick={() => clipboard("cut")}>
                  <Icon name="cut" />
                </Btn>
                <Btn title="Kopyala (Ctrl+C)" testId="tb-copy" onClick={() => clipboard("copy")}>
                  <Icon name="copy" />
                </Btn>
              </Group>

              <Group label="Şrift">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <Dropdown title="Şrift ailəsi" testId="tb-font-family" width={230} label={<span className="w-[104px] truncate text-left">{familyLabel}</span>}>
                      {(close) => (
                        <>
                          <MenuItem onClick={() => { ch().unsetFontFamily().run(); close(); }}>Standart (mövzu şrifti)</MenuItem>
                          {FONT_FAMILIES.map((f) => (
                            <MenuItem key={f.value} active={ts.fontFamily === f.value} testId={`font-${f.label.split(" ")[0]}`} onClick={() => { ch().setFontFamily(f.value).run(); close(); }}>
                              <span style={{ fontFamily: f.value }}>{f.label}</span>
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Dropdown>
                    <Dropdown title="Şrift ölçüsü (pt)" testId="tb-font-size" width={130} label={<span className="w-7 text-left" data-testid="font-size-value">{sizeLabel}</span>}>
                      {(close) => (
                        <>
                          <form
                            className="mb-1 flex gap-1 p-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const v = Number(new FormData(e.currentTarget).get("size"));
                              if (v >= 1 && v <= 400) { ch().setFontSize(`${v}pt`).run(); close(); }
                            }}
                          >
                            <input name="size" type="number" min={1} max={400} step={0.5} placeholder="pt" aria-label="Xüsusi ölçü" data-testid="font-size-input" className="h-7 w-full rounded border border-line px-1.5 text-[12px]" />
                            <button type="submit" className="h-7 rounded bg-bordo px-2 text-[11px] text-white">OK</button>
                          </form>
                          <MenuItem onClick={() => { ch().unsetFontSize().run(); close(); }}>Standart</MenuItem>
                          {FONT_SIZES.map((s) => (
                            <MenuItem key={s} testId={`size-${s}`} active={font.sizePt === s} onClick={() => { ch().setFontSize(`${s}pt`).run(); close(); }}>
                              {s}
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Dropdown>
                    <Btn title="Şrifti böyüt (Ctrl+])" testId="tb-grow" onClick={() => fontRef.current(1)}>
                      <Icon name="growFont" />
                    </Btn>
                    <Btn title="Şrifti kiçilt (Ctrl+[)" testId="tb-shrink" onClick={() => fontRef.current(-1)}>
                      <Icon name="shrinkFont" />
                    </Btn>
                    <Dropdown title="Hərf halını dəyiş" testId="tb-case" width={200} label={<span className="text-[13px]">Aa</span>}>
                      {(close) =>
                        ([
                          ["sentence", "Cümlə halı."],
                          ["lower", "kiçik hərflər"],
                          ["upper", "BÖYÜK HƏRFLƏR"],
                          ["title", "Hər Sözün İlk Hərfi"],
                          ["toggle", "hƏRF hALINI çEVİR"],
                        ] as [CaseMode, string][]).map(([m, l]) => (
                          <MenuItem key={m} testId={`case-${m}`} onClick={() => { if (!changeCase(editor, m, locale)) setNotice("Əvvəlcə mətni seçin."); close(); }}>
                            {l}
                          </MenuItem>
                        ))
                      }
                    </Dropdown>
                    <Btn title="Formatı təmizlə (Ctrl+Boşluq)" testId="tb-clear" onClick={() => ch().unsetAllMarks().run()}>
                      <Icon name="clear" />
                    </Btn>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Btn title="Qalın (Ctrl+B)" testId="tb-bold" active={editor.isActive("bold")} onClick={() => ch().toggleBold().run()}>
                      <b className="font-ui">B</b>
                    </Btn>
                    <Btn title="Kursiv (Ctrl+I)" testId="tb-italic" active={editor.isActive("italic")} onClick={() => ch().toggleItalic().run()}>
                      <i className="font-display">I</i>
                    </Btn>
                    <Btn title="Altından xətt (Ctrl+U)" testId="tb-underline" active={editor.isActive("underline")} onClick={() => ch().toggleUnderline().run()}>
                      <u className="font-ui">U</u>
                    </Btn>
                    <Btn title="Üzərindən xətt" testId="tb-strike" active={editor.isActive("strike")} onClick={() => ch().toggleStrike().run()}>
                      <s className="font-ui">ab</s>
                    </Btn>
                    <Btn title="Aşağı indeks (Ctrl+,)" testId="tb-sub" active={editor.isActive("subscript")} onClick={() => ch().toggleSubscript().run()}>
                      <span className="font-ui text-[12px]">x<sub>2</sub></span>
                    </Btn>
                    <Btn title="Yuxarı indeks (Ctrl+.)" testId="tb-sup" active={editor.isActive("superscript")} onClick={() => ch().toggleSuperscript().run()}>
                      <span className="font-ui text-[12px]">x<sup>2</sup></span>
                    </Btn>
                    <Dropdown title="Mətn effektləri" testId="tb-effects" width={170} active={Boolean(ts.textEffect)} label={<span className="font-display text-[15px]" style={{ textShadow: "1px 1px 2px rgba(0,0,0,.35)" }}>A</span>}>
                      {(close) => (
                        <>
                          <MenuItem onClick={() => { ch().setMark("textStyle", { textEffect: null }).removeEmptyTextStyle().run(); close(); }}>Effektsiz</MenuItem>
                          {Object.entries(TEXT_EFFECTS).map(([k, v]) => (
                            <MenuItem key={k} testId={`effect-${k}`} active={ts.textEffect === k} onClick={() => { ch().setMark("textStyle", { textEffect: k }).run(); close(); }}>
                              <span style={Object.fromEntries(v.css.split(";").map((d) => { const [p, ...r] = d.split(":"); return [p.trim().replace(/^-webkit-/, "Webkit-").replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase()), r.join(":").trim()]; }))}>
                                {v.label}
                              </span>
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Dropdown>
                    <Dropdown title="Mətnin vurğulanma rəngi" testId="tb-highlight" width={220} active={editor.isActive("highlight")} label={<span className="font-ui text-[12px] font-semibold" style={{ background: editor.getAttributes("highlight").color || "#fef08a", padding: "0 3px" }}>ab</span>}>
                      {(close) => (
                        <ColorGrid highlight testId="highlight-grid" resetLabel="Vurğusuz" onReset={() => { ch().unsetHighlight().run(); close(); }} onPick={(c) => { ch().setHighlight({ color: c }).run(); close(); }} />
                      )}
                    </Dropdown>
                    <Dropdown title="Şrift rəngi" testId="tb-color" width={220} active={Boolean(ts.color)} label={<span className="font-ui text-[14px] font-semibold" style={{ borderBottom: `3px solid ${ts.color || "#2a2a2a"}`, lineHeight: 1 }}>A</span>}>
                      {(close) => (
                        <ColorGrid testId="color-grid" onReset={() => { ch().unsetColor().run(); close(); }} onPick={(c) => { ch().setColor(c).run(); close(); }} />
                      )}
                    </Dropdown>
                  </div>
                </div>
              </Group>

              <Group label="Abzas">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <Dropdown title="Markerli siyahı (Ctrl+Shift+L)" testId="tb-bullets" width={190} active={editor.isActive("bulletList")} label={<Icon name="bullets" />}>
                      {(close) => (
                        <>
                          <MenuItem testId="bullets-toggle" active={editor.isActive("bulletList")} onClick={() => { ch().toggleBulletList().run(); close(); }}>
                            {editor.isActive("bulletList") ? "Siyahını sil" : "Markerli siyahı"}
                          </MenuItem>
                          {[["disc", "● Dolu dairə"], ["circle", "○ Boş dairə"], ["square", "■ Kvadrat"], [null, "◆ Jurnal markeri"]].map(([v, l]) => (
                            <MenuItem key={String(v)} testId={`marker-${v}`} onClick={() => { if (!editor.isActive("bulletList")) editor.chain().focus().toggleBulletList().run(); editor.commands.setListStyle(v); close(); }}>
                              {l}
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Dropdown>
                    <Dropdown title="Nömrələnmiş siyahı (Ctrl+Shift+7)" testId="tb-numbers" width={190} active={editor.isActive("orderedList")} label={<Icon name="numbers" />}>
                      {(close) => (
                        <>
                          <MenuItem testId="numbers-toggle" active={editor.isActive("orderedList")} onClick={() => { ch().toggleOrderedList().run(); close(); }}>
                            {editor.isActive("orderedList") ? "Siyahını sil" : "Nömrələnmiş siyahı"}
                          </MenuItem>
                          {[["decimal", "1. 2. 3."], ["lower-alpha", "a. b. c."], ["upper-alpha", "A. B. C."], ["lower-roman", "i. ii. iii."], ["upper-roman", "I. II. III."]].map(([v, l]) => (
                            <MenuItem key={v} testId={`numbering-${v}`} onClick={() => { if (!editor.isActive("orderedList")) editor.chain().focus().toggleOrderedList().run(); editor.commands.setListStyle(v); close(); }}>
                              {l}
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Dropdown>
                    <Dropdown title="Çoxsəviyyəli siyahı" testId="tb-multilevel" width={220} label={<Icon name="multilevel" />}>
                      {(close) => (
                        <>
                          <MenuItem testId="multi-ordered" onClick={() => { if (!editor.isActive("orderedList")) ch().toggleOrderedList().run(); close(); }}>1. → a. → i. (nömrəli)</MenuItem>
                          <MenuItem testId="multi-bullets" onClick={() => { if (!editor.isActive("bulletList")) ch().toggleBulletList().run(); close(); }}>● → ○ → ■ (markerli)</MenuItem>
                          <MenuItem testId="multi-sink" onClick={() => { ch().sinkListItem("listItem").run(); close(); }}>→ Alt səviyyəyə keç (Tab)</MenuItem>
                          <MenuItem testId="multi-lift" onClick={() => { ch().liftListItem("listItem").run(); close(); }}>← Yuxarı səviyyəyə qayıt (Shift+Tab)</MenuItem>
                        </>
                      )}
                    </Dropdown>
                    <Btn title="Girintini azalt (Shift+Tab)" testId="tb-outdent" onClick={() => (editor.isActive("listItem") ? ch().liftListItem("listItem").run() : ch().outdent().run())}>
                      <Icon name="outdent" />
                    </Btn>
                    <Btn title="Girintini artır (Tab)" testId="tb-indent" onClick={() => (editor.isActive("listItem") ? ch().sinkListItem("listItem").run() : ch().indent().run())}>
                      <Icon name="indent" />
                    </Btn>
                    <Dropdown title="Sırala" testId="tb-sort" width={180} label={<Icon name="sort" />}>
                      {(close) => (
                        <>
                          <MenuItem testId="sort-asc" onClick={() => { if (!sortSelection(editor, "asc", locale)) setNotice("Sıralamaq üçün bir neçə abzas seçin və ya siyahıya klikləyin."); close(); }}>A → Z (artan)</MenuItem>
                          <MenuItem testId="sort-desc" onClick={() => { if (!sortSelection(editor, "desc", locale)) setNotice("Sıralamaq üçün bir neçə abzas seçin və ya siyahıya klikləyin."); close(); }}>Z → A (azalan)</MenuItem>
                        </>
                      )}
                    </Dropdown>
                    <Btn title="Formatlaşdırma işarələri ¶ (Ctrl+Shift+8)" testId="tb-marks" active={marksOn} onClick={() => ch().toggleFormattingMarks().run()}>
                      <Icon name="pilcrow" />
                    </Btn>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Btn title="Sola düzləndir (Ctrl+L)" testId="tb-align-left" active={align === "left"} onClick={() => ch().setTextAlign("left").run()}>
                      <Icon name="alignLeft" />
                    </Btn>
                    <Btn title="Mərkəzə (Ctrl+E)" testId="tb-align-center" active={align === "center"} onClick={() => ch().setTextAlign("center").run()}>
                      <Icon name="alignCenter" />
                    </Btn>
                    <Btn title="Sağa düzləndir (Ctrl+R)" testId="tb-align-right" active={align === "right"} onClick={() => ch().setTextAlign("right").run()}>
                      <Icon name="alignRight" />
                    </Btn>
                    <Btn title="Hər iki tərəfə (Ctrl+J)" testId="tb-align-justify" active={align === "justify"} onClick={() => ch().setTextAlign("justify").run()}>
                      <Icon name="justify" />
                    </Btn>
                    <Dropdown title="Sətir və abzas aralığı" testId="tb-spacing" width={230} active={Boolean(block.lineHeight || block.spaceBefore || block.spaceAfter)} label={<Icon name="lineSpacing" />}>
                      {(close) => (
                        <>
                          <div className="px-2 pb-1 pt-0.5 font-ui text-[10px] uppercase tracking-[0.12em] text-muted">Sətirlərarası</div>
                          {LINE_SPACINGS.map((v) => (
                            <MenuItem key={v} testId={`lh-${v}`} active={block.lineHeight === v} onClick={() => { ch().setBlockAttr("lineHeight", v).run(); close(); }}>
                              {v}
                            </MenuItem>
                          ))}
                          <MenuItem onClick={() => { ch().setBlockAttr("lineHeight", null).run(); close(); }}>Standart</MenuItem>
                          <div className="my-1 border-t border-line" />
                          <div className="px-2 pb-1 font-ui text-[10px] uppercase tracking-[0.12em] text-muted">Abzas aralığı</div>
                          {[
                            ["Boşluqsuz", "0pt", "0pt"],
                            ["Sıx", "0pt", "6pt"],
                            ["Açıq", "6pt", "12pt"],
                            ["Geniş", "12pt", "24pt"],
                          ].map(([l, b, a]) => (
                            <MenuItem key={l} testId={`ps-${l}`} onClick={() => { ch().setBlockAttr("spaceBefore", b).setBlockAttr("spaceAfter", a).run(); close(); }}>
                              {l} <span className="ms-auto text-[11px] text-muted">{b} / {a}</span>
                            </MenuItem>
                          ))}
                          <MenuItem testId="spacing-custom" onClick={() => { setDialog("spacing"); close(); }}>Xüsusi aralıq…</MenuItem>
                        </>
                      )}
                    </Dropdown>
                    <Dropdown title="Abzas çərçivəsi" testId="tb-borders" width={200} active={Boolean(block.border)} label={<Icon name="borders" />}>
                      {(close) =>
                        ([
                          ["bottom", "Alt çərçivə"],
                          ["top", "Üst çərçivə"],
                          ["left", "Sol xətt"],
                          ["right", "Sağ xətt"],
                          ["topbottom", "Üst və alt"],
                          ["box", "Tam çərçivə"],
                          [null, "Çərçivəsiz"],
                        ] as [string | null, string][]).map(([v, l]) => (
                          <MenuItem key={String(v)} testId={`border-${v}`} active={block.border === v} onClick={() => { ch().setBlockAttr("border", v).setBlockAttr("borderColor", v ? "#7b2233" : null).run(); close(); }}>
                            {l}
                          </MenuItem>
                        ))
                      }
                    </Dropdown>
                    <Dropdown title="Abzas fonu (kölgələmə)" testId="tb-shading" width={220} active={Boolean(block.shading)} label={<Icon name="shading" />}>
                      {(close) => (
                        <ColorGrid highlight testId="shading-grid" resetLabel="Fonsuz" onReset={() => { ch().setBlockAttr("shading", null).run(); close(); }} onPick={(c) => { ch().setBlockAttr("shading", c).run(); close(); }} />
                      )}
                    </Dropdown>
                  </div>
                </div>
              </Group>

              <Group label="Üslublar">
                <div className="flex max-w-[460px] items-center gap-1 overflow-x-auto scrollbar-none">
                  {BUILTIN_STYLES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      title={`${s.label} — <${s.tag}>`}
                      data-testid={`style-${s.key}`}
                      aria-pressed={styleKey === s.key}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyBuiltinStyle(editor, s.key as BuiltinStyle)}
                      className={`nm-style-chip nm-style-${s.key} h-[58px] w-[78px] shrink-0 overflow-hidden rounded-[3px] border px-1.5 text-left ${
                        styleKey === s.key ? "border-bordo bg-bordo/5" : "border-line bg-white hover:border-bordo/50"
                      }`}
                    >
                      <span className="block truncate">AaBbCc</span>
                      <span className="block truncate font-ui text-[10px] not-italic text-muted" style={{ fontSize: 10, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>{s.label}</span>
                    </button>
                  ))}
                  {customStyles.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      title={`Xüsusi üslub: ${s.name}`}
                      data-testid={`custom-style-${s.name}`}
                      aria-pressed={styleKey === `custom:${s.id}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyCustomStyle(editor, s)}
                      className={`h-[58px] w-[78px] shrink-0 overflow-hidden rounded-[3px] border px-1.5 text-left ${
                        styleKey === `custom:${s.id}` ? "border-bordo bg-bordo/5" : "border-line bg-white hover:border-bordo/50"
                      }`}
                    >
                      <span className="block truncate" style={{ fontFamily: s.fontFamily || undefined, color: s.color || undefined, fontWeight: s.bold ? 700 : 400, fontStyle: s.italic ? "italic" : undefined }}>AaBbCc</span>
                      <span className="block truncate font-ui text-[10px] text-muted">{s.name}</span>
                    </button>
                  ))}
                </div>
                <Dropdown title="Üslubları idarə et" testId="tb-styles-menu" width={240} label={<span className="text-[12px]">⋯</span>}>
                  {(close) => (
                    <>
                      <MenuItem testId="style-create" onClick={() => { setEditingStyle(styleFromSelection(editor, "")); setDialog("style"); close(); }}>
                        ＋ Seçimdən yeni üslub yarat
                      </MenuItem>
                      {customStyles.map((s) => (
                        <div key={s.id} className="flex items-center gap-1">
                          <MenuItem testId={`style-edit-${s.name}`} onClick={() => { setEditingStyle(s); setDialog("style"); close(); }}>
                            ✎ {s.name}
                          </MenuItem>
                          <button type="button" title="Seçimə uyğun yenilə" className="px-1 text-[12px] text-muted hover:text-bordo" onClick={async () => { const upd = { ...styleFromSelection(editor, s.name), id: s.id }; setCustomStyles(await saveCustomStyle(upd, customStyles)); reapplyCustomStyle(editor, upd); close(); }}>⟳</button>
                          <button type="button" title="Sil" className="px-1 text-[12px] text-muted hover:text-red-600" onClick={async () => { setCustomStyles(await deleteCustomStyle(s.id, customStyles)); close(); }}>×</button>
                        </div>
                      ))}
                    </>
                  )}
                </Dropdown>
              </Group>
            </>
          )}

          {tab === "insert" && (
            <>
              <Group label="Keçid">
                <Btn wide title="Hiperlink (Ctrl+K)" testId="tb-link" active={editor.isActive("link")} onClick={() => setDialog("link")}>
                  <Icon name="link" /> <span className="hidden text-[12px] sm:inline">Link</span>
                </Btn>
                <Btn title="Linki sil" testId="tb-unlink" disabled={!editor.isActive("link")} onClick={() => ch().extendMarkRange("link").unsetLink().run()}>
                  <Icon name="unlink" />
                </Btn>
              </Group>
              <Group label="Media">
                <Btn wide title="Şəkil əlavə et" testId="tb-image" onClick={() => setDialog("image")}>
                  <Icon name="image" /> <span className="hidden text-[12px] sm:inline">Şəkil</span>
                </Btn>
                <Btn wide title="Video əlavə et" testId="tb-video" onClick={() => setDialog("video")}>
                  <Icon name="video" /> <span className="hidden text-[12px] sm:inline">Video</span>
                </Btn>
              </Group>
              <Group label="Cədvəl">
                <Dropdown title="Cədvəl əlavə et" testId="tb-table" width={232} label={<><Icon name="table" /><span className="hidden text-[12px] sm:inline">Cədvəl</span></>}>
                  {(close) => <TablePicker onPick={(r, c) => { ch().insertTable({ rows: r, cols: c, withHeaderRow: true }).run(); close(); }} />}
                </Dropdown>
              </Group>
              <Group label="Bloklar">
                <Btn title="Üfüqi xətt" testId="tb-hr" onClick={() => ch().setHorizontalRule().run()}>
                  <Icon name="hr" />
                </Btn>
                <Btn title="Sitat bloku" testId="tb-blockquote" active={editor.isActive("blockquote")} onClick={() => ch().toggleBlockquote().run()}>
                  <Icon name="quote" />
                </Btn>
                <Btn title="Kod bloku" testId="tb-codeblock" active={editor.isActive("codeBlock")} onClick={() => ch().toggleCodeBlock().run()}>
                  <Icon name="code" />
                </Btn>
                <Dropdown title="Xüsusi simvollar" testId="tb-special" width={300} label={<Icon name="omega" />}>
                  {(close) => (
                    <div className="grid grid-cols-8 gap-1 p-1">
                      {SPECIAL_CHARS.map((c) => (
                        <button key={c} type="button" data-testid={`char-${c}`} onClick={() => { ch().insertContent(c).run(); close(); }} className="h-8 rounded border border-line text-[15px] hover:bg-cream-deep">
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </Dropdown>
              </Group>
            </>
          )}

          {tab === "table" && inTable && (
            <>
              <Group label="Sətirlər">
                <Btn wide title="Yuxarıya sətir" testId="tbl-row-before" onClick={() => ch().addRowBefore().run()}>↑ Sətir</Btn>
                <Btn wide title="Aşağıya sətir" testId="tbl-row-after" onClick={() => ch().addRowAfter().run()}>↓ Sətir</Btn>
                <Btn wide title="Sətri sil" testId="tbl-row-delete" onClick={() => ch().deleteRow().run()}>✕ Sətir</Btn>
              </Group>
              <Group label="Sütunlar">
                <Btn wide title="Sola sütun" testId="tbl-col-before" onClick={() => ch().addColumnBefore().run()}>← Sütun</Btn>
                <Btn wide title="Sağa sütun" testId="tbl-col-after" onClick={() => ch().addColumnAfter().run()}>→ Sütun</Btn>
                <Btn wide title="Sütunu sil" testId="tbl-col-delete" onClick={() => ch().deleteColumn().run()}>✕ Sütun</Btn>
              </Group>
              <Group label="Xanalar">
                <Btn wide title="Xanaları birləşdir" testId="tbl-merge" disabled={!editor.can().mergeCells()} onClick={() => ch().mergeCells().run()}>Birləşdir</Btn>
                <Btn wide title="Xananı ayır" testId="tbl-split" disabled={!editor.can().splitCell()} onClick={() => ch().splitCell().run()}>Ayır</Btn>
                <Btn wide title="Başlıq sətri" testId="tbl-header" onClick={() => ch().toggleHeaderRow().run()}>Başlıq sətri</Btn>
              </Group>
              <Group label="Cədvəl">
                <Btn wide title="Cədvəli sil" testId="tbl-delete" onClick={() => ch().deleteTable().run()}>
                  <Icon name="trash" /> Sil
                </Btn>
              </Group>
            </>
          )}

          {tab === "image" && imageSelected && <ImageRibbon editor={editor} />}
        </div>
      </div>

      {/* ── Sənəd ── */}
      <div className="bg-[#f3efe9] p-2 sm:p-6">
        <div className="mx-auto max-w-[820px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ── Status sətri ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-[#fbf8f4] px-3 py-1.5 font-ui text-[11.5px] text-muted">
        <span data-testid="word-count">{words} söz</span>
        <span>{chars} simvol</span>
        <span>Üslub: {styleKey.startsWith("custom:") ? customStyles.find((s) => `custom:${s.id}` === styleKey)?.name : BUILTIN_STYLES.find((s) => s.key === styleKey)?.label}</span>
        <span className="ms-auto">{statusExtra}</span>
      </div>

      {dialog === "link" && <LinkDialog editor={editor} onClose={() => setDialog(null)} />}
      {dialog === "image" && <ImageDialog editor={editor} onClose={() => setDialog(null)} />}
      {dialog === "video" && <VideoDialog editor={editor} onClose={() => setDialog(null)} />}
      {dialog === "spacing" && <SpacingDialog editor={editor} onClose={() => setDialog(null)} />}
      {dialog === "style" && editingStyle && (
        <StyleDialog
          initial={editingStyle}
          onClose={() => setDialog(null)}
          onSave={async (s) => {
            const next = await saveCustomStyle(s, customStyles);
            setCustomStyles(next);
            const isNew = !customStyles.some((x) => x.id === s.id);
            if (isNew) applyCustomStyle(editor, s);
            else reapplyCustomStyle(editor, s);
            setDialog(null);
          }}
        />
      )}
    </div>
  );
}

function TablePicker({ onPick }: { onPick: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  return (
    <div className="p-1">
      <div className="mb-1 text-center font-ui text-[12px] text-muted" data-testid="table-size">
        {hover.r ? `${hover.r} × ${hover.c}` : "Ölçünü seçin"}
      </div>
      <div className="grid grid-cols-8 gap-[3px]" onMouseLeave={() => setHover({ r: 0, c: 0 })}>
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8) + 1;
          const c = (i % 8) + 1;
          const on = r <= hover.r && c <= hover.c;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${r} sətir, ${c} sütun`}
              data-testid={`table-cell-${r}x${c}`}
              onMouseEnter={() => setHover({ r, c })}
              onClick={() => onPick(r, c)}
              className={`h-[22px] w-[22px] border ${on ? "border-bordo bg-bordo/20" : "border-line bg-white"}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function ImageRibbon({ editor }: { editor: Editor }) {
  const attrs = editor.getAttributes("figure") as { width?: string; align?: string; alt?: string; caption?: string };
  const set = (a: Record<string, string>) => editor.chain().focus().updateAttributes("figure", a).run();
  return (
    <>
      <Group label="Ölçü">
        {["25%", "33%", "50%", "75%", "100%"].map((w) => (
          <Btn wide key={w} title={`En ${w}`} testId={`img-w-${parseInt(w)}`} active={attrs.width === w} onClick={() => set({ width: w })}>
            {w}
          </Btn>
        ))}
      </Group>
      <Group label="Düzləndirmə">
        <Btn title="Sola (mətn sağdan axır)" testId="img-left" active={attrs.align === "left"} onClick={() => set({ align: "left" })}>
          <Icon name="alignLeft" />
        </Btn>
        <Btn title="Mərkəzə" testId="img-center" active={attrs.align === "center"} onClick={() => set({ align: "center" })}>
          <Icon name="alignCenter" />
        </Btn>
        <Btn title="Sağa (mətn soldan axır)" testId="img-right" active={attrs.align === "right"} onClick={() => set({ align: "right" })}>
          <Icon name="alignRight" />
        </Btn>
      </Group>
      <Group label="ALT və başlıq">
        <input
          key={`alt-${attrs.alt}`}
          defaultValue={attrs.alt}
          placeholder="ALT mətn (SEO)"
          aria-label="ALT mətn"
          data-testid="img-alt"
          onBlur={(e) => set({ alt: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), set({ alt: (e.target as HTMLInputElement).value }))}
          className="h-8 w-40 rounded border border-line px-2 text-[12px]"
        />
        <input
          key={`cap-${attrs.caption}`}
          defaultValue={attrs.caption}
          placeholder="Şəkil başlığı (caption)"
          aria-label="Şəkil başlığı"
          data-testid="img-caption"
          onBlur={(e) => set({ caption: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), set({ caption: (e.target as HTMLInputElement).value }))}
          className="h-8 w-48 rounded border border-line px-2 text-[12px]"
        />
      </Group>
      <Group label="Şəkil">
        <Btn wide title="Şəkli sil" testId="img-delete" onClick={() => editor.chain().focus().deleteSelection().run()}>
          <Icon name="trash" /> Sil
        </Btn>
      </Group>
    </>
  );
}

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const existing = editor.getAttributes("link") as { href?: string; target?: string };
  const empty = editor.state.selection.empty && !existing.href;
  const [href, setHref] = useState(existing.href || "");
  const [text, setText] = useState("");
  const [newTab, setNewTab] = useState(existing.href ? existing.target === "_blank" : true);
  const valid = /^(https?:\/\/|\/|mailto:|#)/i.test(href.trim()) || /^[\w-]+(\.[\w-]+)+/.test(href.trim());

  function apply() {
    let url = href.trim();
    if (!/^(https?:\/\/|\/|mailto:|#)/i.test(url)) url = `https://${url}`;
    const attrs = { href: url, target: newTab ? "_blank" : null, rel: newTab ? "noopener noreferrer" : null };
    if (empty) {
      editor.chain().focus().insertContent({ type: "text", text: text.trim() || url, marks: [{ type: "link", attrs }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attrs as { href: string; target?: string | null; rel?: string | null }).run();
    }
    onClose();
  }

  return (
    <Modal title={existing.href ? "Linki redaktə et" : "Hiperlink əlavə et"} onClose={onClose} testId="link-dialog">
      <form onSubmit={(e) => { e.preventDefault(); if (valid) apply(); }} className="space-y-3">
        {empty && (
          <label className="block">
            <span className={labelCls}>Göstəriləcək mətn</span>
            <input value={text} onChange={(e) => setText(e.target.value)} className={fieldCls} data-testid="link-text" />
          </label>
        )}
        <label className="block">
          <span className={labelCls}>Ünvan (URL)</span>
          <input autoFocus value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://" className={fieldCls} data-testid="link-url" />
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} data-testid="link-newtab" />
          Yeni pəncərədə aç
        </label>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {existing.href && (
            <button type="button" className={ghostBtn} data-testid="link-remove" onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); onClose(); }}>
              Linki sil
            </button>
          )}
          <button type="button" className={ghostBtn} onClick={onClose}>Ləğv et</button>
          <button type="submit" className={primaryBtn} disabled={!valid} data-testid="link-apply">Tətbiq et</button>
        </div>
      </form>
    </Modal>
  );
}

function ImageDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [width, setWidth] = useState("100%");
  const [align, setAlign] = useState("center");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const media = await uploadMedia(file, "inline-images");
      setSrc(media.url);
      if (!alt) setAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Şəkil yüklənmədi.");
    } finally {
      setBusy(false);
    }
  }

  const ok = /^(https:\/\/|\/)/i.test(src.trim());
  return (
    <Modal title="Şəkil əlavə et" onClose={onClose} testId="image-dialog">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          editor.chain().focus().setFigure({ src: src.trim(), alt: alt.trim(), caption: caption.trim(), width, align }).run();
          onClose();
        }}
      >
        <label className="block">
          <span className={labelCls}>Fayl yüklə (maks. 10 MB)</span>
          <input type="file" accept="image/*" disabled={busy} data-testid="image-file" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} className="text-[13px]" />
        </label>
        <label className="block">
          <span className={labelCls}>və ya şəklin ünvanı (https://)</span>
          <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://" className={fieldCls} data-testid="image-url" />
        </label>
        {src && ok && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="max-h-40 rounded border border-line object-contain" />
        )}
        <label className="block">
          <span className={labelCls}>ALT mətn (SEO və əlçatanlıq)</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={fieldCls} data-testid="image-alt" />
        </label>
        <label className="block">
          <span className={labelCls}>Başlıq (caption)</span>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} className={fieldCls} data-testid="image-caption" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>En</span>
            <select value={width} onChange={(e) => setWidth(e.target.value)} className={fieldCls} data-testid="image-width">
              {["25%", "33%", "50%", "75%", "100%"].map((w) => <option key={w}>{w}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Yerləşmə</span>
            <select value={align} onChange={(e) => setAlign(e.target.value)} className={fieldCls} data-testid="image-align">
              <option value="left">Sola</option>
              <option value="center">Mərkəzə</option>
              <option value="right">Sağa</option>
            </select>
          </label>
        </div>
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={ghostBtn} onClick={onClose}>Ləğv et</button>
          <button type="submit" className={primaryBtn} disabled={!ok || busy} data-testid="image-insert">{busy ? "Yüklənir…" : "Əlavə et"}</button>
        </div>
      </form>
    </Modal>
  );
}

function VideoDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const embed = toEmbedUrl(url);
  return (
    <Modal title="Video əlavə et" onClose={onClose} testId="video-dialog">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!embed) return setError("YouTube və ya Vimeo linki daxil edin.");
          editor.chain().focus().setVideo({ src: embed, kind: "iframe" }).run();
          onClose();
        }}
      >
        <label className="block">
          <span className={labelCls}>YouTube / Vimeo linki</span>
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={fieldCls} data-testid="video-url" />
        </label>
        <label className="block">
          <span className={labelCls}>və ya video faylı yüklə (MP4, maks. 100 MB)</span>
          <input
            type="file"
            accept="video/*"
            disabled={busy}
            className="text-[13px]"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                const media = await uploadMedia(file, "media");
                editor.chain().focus().setVideo({ src: media.url, kind: "file" }).run();
                onClose();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Video yüklənmədi.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={ghostBtn} onClick={onClose}>Ləğv et</button>
          <button type="submit" className={primaryBtn} disabled={!embed || busy} data-testid="video-insert">{busy ? "Yüklənir…" : "Əlavə et"}</button>
        </div>
      </form>
    </Modal>
  );
}

function SpacingDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const a = editor.state.selection.$from.parent.attrs as Record<string, string | null>;
  const num = (v: string | null) => (v ? parseFloat(v) : "");
  const [line, setLine] = useState<string | number>(a.lineHeight || "");
  const [before, setBefore] = useState<string | number>(num(a.spaceBefore));
  const [after, setAfter] = useState<string | number>(num(a.spaceAfter));
  return (
    <Modal title="Abzas aralığı" onClose={onClose} testId="spacing-dialog">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const lh = line === "" ? null : String(Math.max(0.5, Math.min(5, Number(line))));
          editor
            .chain()
            .focus()
            .setBlockAttr("lineHeight", lh)
            .setBlockAttr("spaceBefore", before === "" ? null : `${Math.max(0, Number(before))}pt`)
            .setBlockAttr("spaceAfter", after === "" ? null : `${Math.max(0, Number(after))}pt`)
            .run();
          onClose();
        }}
      >
        <label className="block">
          <span className={labelCls}>Sətirlərarası (məs. 1.15)</span>
          <input type="number" step={0.05} min={0.5} max={5} value={line} onChange={(e) => setLine(e.target.value)} className={fieldCls} data-testid="spacing-line" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Əvvəl (pt)</span>
            <input type="number" min={0} max={200} value={before} onChange={(e) => setBefore(e.target.value)} className={fieldCls} data-testid="spacing-before" />
          </label>
          <label className="block">
            <span className={labelCls}>Sonra (pt)</span>
            <input type="number" min={0} max={200} value={after} onChange={(e) => setAfter(e.target.value)} className={fieldCls} data-testid="spacing-after" />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={ghostBtn} onClick={onClose}>Ləğv et</button>
          <button type="submit" className={primaryBtn} data-testid="spacing-apply">Tətbiq et</button>
        </div>
      </form>
    </Modal>
  );
}

function StyleDialog({ initial, onClose, onSave }: { initial: CustomStyle; onClose: () => void; onSave: (s: CustomStyle) => void }) {
  const [s, setS] = useState<CustomStyle>(initial);
  const up = (patch: Partial<CustomStyle>) => setS((x) => ({ ...x, ...patch }));
  const sizeNum = s.fontSize ? parseFloat(s.fontSize) : "";
  return (
    <Modal title={initial.name ? `Üslub: ${initial.name}` : "Yeni üslub"} onClose={onClose} testId="style-dialog">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (s.name.trim()) onSave({ ...s, name: s.name.trim() }); }}>
        <label className="block">
          <span className={labelCls}>Ad</span>
          <input autoFocus value={s.name} onChange={(e) => up({ name: e.target.value })} className={fieldCls} data-testid="style-name" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Şrift</span>
            <select value={s.fontFamily || ""} onChange={(e) => up({ fontFamily: e.target.value || null })} className={fieldCls} data-testid="style-font">
              <option value="">Standart</option>
              {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Ölçü (pt)</span>
            <input type="number" min={6} max={96} value={sizeNum} onChange={(e) => up({ fontSize: e.target.value ? `${e.target.value}pt` : null })} className={fieldCls} data-testid="style-size" />
          </label>
          <label className="block">
            <span className={labelCls}>Rəng</span>
            <input type="color" value={s.color || "#2a2a2a"} onChange={(e) => up({ color: e.target.value })} className="h-10 w-full cursor-pointer rounded border border-line" data-testid="style-color" />
          </label>
          <label className="block">
            <span className={labelCls}>Düzləndirmə</span>
            <select value={s.align || ""} onChange={(e) => up({ align: e.target.value || null })} className={fieldCls}>
              <option value="">Standart</option>
              <option value="left">Sola</option>
              <option value="center">Mərkəz</option>
              <option value="right">Sağa</option>
              <option value="justify">İki tərəfə</option>
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Sətir aralığı</span>
            <select value={s.lineHeight || ""} onChange={(e) => up({ lineHeight: e.target.value || null })} className={fieldCls}>
              <option value="">Standart</option>
              {LINE_SPACINGS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Sonra (pt)</span>
            <input type="number" min={0} max={96} value={s.spaceAfter ? parseFloat(s.spaceAfter) : ""} onChange={(e) => up({ spaceAfter: e.target.value ? `${e.target.value}pt` : null })} className={fieldCls} />
          </label>
        </div>
        <div className="flex gap-4 text-[13px]">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!s.bold} onChange={(e) => up({ bold: e.target.checked })} data-testid="style-bold" /> Qalın</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!s.italic} onChange={(e) => up({ italic: e.target.checked })} /> Kursiv</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!s.underline} onChange={(e) => up({ underline: e.target.checked })} /> Altıxətli</label>
        </div>
        <p
          className="rounded border border-line bg-cream px-3 py-2"
          style={{ fontFamily: s.fontFamily || undefined, fontSize: s.fontSize || undefined, color: s.color || undefined, fontWeight: s.bold ? 700 : 400, fontStyle: s.italic ? "italic" : undefined, textDecoration: s.underline ? "underline" : undefined, textAlign: (s.align as "left") || undefined }}
        >
          Nümunə mətn — Ə ə Ş ş Ç ç İ ı
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={ghostBtn} onClick={onClose}>Ləğv et</button>
          <button type="submit" className={primaryBtn} disabled={!s.name.trim()} data-testid="style-save">Saxla</button>
        </div>
      </form>
    </Modal>
  );
}
