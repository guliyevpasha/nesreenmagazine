/**
 * Redaktor əməliyyatları: üslublar, hərf halı, sıralama, şrift ölçüsü addımları
 * və xüsusi üslubların saxlanması (Firestore `editorStyles`, ehtiyat — localStorage).
 */
import type { Editor } from "@tiptap/core";
import { Fragment, type Node as PMNode } from "@tiptap/pm/model";
import { TextSelection, type EditorState, type Transaction } from "@tiptap/pm/state";
import { selectedRect } from "@tiptap/pm/tables";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Lora (jurnal mətni)", value: "Lora, Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Inter", value: "Inter, Arial, sans-serif" },
  { label: "Aptos", value: "Aptos, 'Segoe UI', Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Roboto", value: "Roboto, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Garamond", value: "Garamond, 'EB Garamond', serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

export const LINE_SPACINGS = ["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"];

export const PALETTE = [
  "#000000", "#2a2a2a", "#6b6b6b", "#a3a3a3", "#d4d4d4", "#ffffff",
  "#7b2233", "#a83246", "#c9a227", "#e6c65c", "#b45309", "#ea580c",
  "#dc2626", "#db2777", "#9333ea", "#4f46e5", "#2563eb", "#0891b2",
  "#059669", "#16a34a", "#65a30d", "#ca8a04", "#78350f", "#1e3a8a",
];

export const HIGHLIGHTS = ["#fef08a", "#bbf7d0", "#bae6fd", "#fbcfe8", "#fed7aa", "#e9d5ff", "#f5e6c8", "#d4d4d4"];

export const SPECIAL_CHARS =
  "© ® ™ § ¶ † ‡ • … – — « » „ “ ” ‘ ’ ° ± × ÷ ≈ ≠ ≤ ≥ ∞ √ € £ ¥ ₼ ₺ ₽ $ ¢ ½ ⅓ ¼ ¾ ² ³ µ α β γ π Ω ← → ↑ ↓ ↔ ✓ ✗ ★ ☆ ♥ ♦ ♣ ♠ ✿ ❀ ☀ ☾ ♀ ♂ Ə ə Ğ ğ İ ı Ş ş Ç ç Ö ö Ü ü".split(
    " ",
  );

/* ──────────────── Üslublar ──────────────── */

export type BuiltinStyle =
  | "normal"
  | "nospacing"
  | "title"
  | "subtitle"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "quote"
  | "intense";

/**
 * Başlıqlar həqiqi HTML elementləridir: «H1» → <h1> … «H6» → <h6>.
 * Səhifədə məqalə başlığı artıq H1 olduğuna görə mətndə H1 SEO xəbərdarlığı ilə göstərilir.
 */
export const BUILTIN_STYLES: { key: BuiltinStyle; label: string; tag: string }[] = [
  { key: "normal", label: "Normal", tag: "p" },
  { key: "nospacing", label: "Boşluqsuz", tag: "p" },
  { key: "title", label: "Başlıq (Title)", tag: "p" },
  { key: "subtitle", label: "Alt başlıq", tag: "p" },
  { key: "h1", label: "Başlıq 1", tag: "H1" },
  { key: "h2", label: "Başlıq 2", tag: "H2" },
  { key: "h3", label: "Başlıq 3", tag: "H3" },
  { key: "h4", label: "Başlıq 4", tag: "H4" },
  { key: "h5", label: "Başlıq 5", tag: "H5" },
  { key: "h6", label: "Başlıq 6", tag: "H6" },
  { key: "quote", label: "Sitat", tag: "blockquote" },
  { key: "intense", label: "Vurğulu sitat", tag: "blockquote" },
];

/** Başlıq səviyyəsinin fərdi üslubunun id-si (Word «Modify Heading N»). */
export const headingStyleId = (level: number) => `h-${level}`;

export function applyBuiltinStyle(editor: Editor, key: BuiltinStyle, defs: CustomStyle[] = []) {
  const inQuote = editor.isActive("blockquote");
  let chain = editor.chain().focus();
  const wantsQuote = key === "quote" || key === "intense";
  if (inQuote && !wantsQuote) chain = chain.lift("blockquote");
  const reset = { blockStyle: null, customStyle: null };
  switch (key) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      chain = chain.setHeading({ level: Number(key[1]) as 1 | 2 | 3 | 4 | 5 | 6 }).updateAttributes("heading", reset);
      break;
    case "quote":
    case "intense":
      chain = chain.setParagraph().updateAttributes("paragraph", reset);
      if (!inQuote) chain = chain.wrapIn("blockquote");
      chain = chain.updateAttributes("blockquote", { blockStyle: key === "intense" ? "intense" : null });
      break;
    default:
      chain = chain
        .setParagraph()
        .updateAttributes("paragraph", { ...reset, blockStyle: key === "normal" ? null : key });
  }
  chain.run();
  // Başlığın fərdi üslubu varsa (məs. «H2: Playfair 24pt bordo») — seçilmiş başlığa tətbiq et.
  if (/^h[1-6]$/.test(key)) {
    const def = defs.find((d) => d.id === headingStyleId(Number(key[1])));
    if (def) applyCustomStyle(editor, def);
  }
}

export function activeStyle(editor: Editor): string {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const n = $from.node(d);
    if (n.type.name === "blockquote") return n.attrs.blockStyle === "intense" ? "intense" : "quote";
  }
  const parent = $from.parent;
  if (parent.attrs.customStyle && !String(parent.attrs.customStyle).startsWith("h-"))
    return `custom:${parent.attrs.customStyle}`;
  if (parent.type.name === "heading") return `h${parent.attrs.level}`;
  if (parent.type.name === "paragraph" && parent.attrs.blockStyle) return String(parent.attrs.blockStyle);
  return "normal";
}

/* ──────────────── Xüsusi üslublar ──────────────── */

export interface CustomStyle {
  id: string;
  name: string;
  fontFamily?: string | null;
  fontSize?: string | null;
  color?: string | null;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: string | null;
  lineHeight?: string | null;
  spaceBefore?: string | null;
  spaceAfter?: string | null;
}

const LS_KEY = "nm-editor-custom-styles";

function readLocal(): CustomStyle[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]") as CustomStyle[];
  } catch {
    return [];
  }
}

function writeLocal(styles: CustomStyle[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(styles));
  } catch {
    /* gizli rejim */
  }
}

/** Firestore-dan (bütün redaksiya üçün ortaq) oxuyur; alınmasa localStorage. */
export async function loadCustomStyles(): Promise<CustomStyle[]> {
  const local = readLocal();
  const db = getDb();
  if (!db) return local;
  try {
    const snap = await getDocs(collection(db, "editorStyles"));
    const remote = snap.docs.map((d) => ({ ...(d.data() as CustomStyle), id: d.id }));
    const merged = new Map<string, CustomStyle>();
    for (const s of [...local, ...remote]) merged.set(s.id, s);
    const list = [...merged.values()];
    writeLocal(list);
    return list;
  } catch {
    return local;
  }
}

export async function saveCustomStyle(style: CustomStyle, all: CustomStyle[]): Promise<CustomStyle[]> {
  const next = [...all.filter((s) => s.id !== style.id), style];
  writeLocal(next);
  const db = getDb();
  if (db) {
    try {
      const clean = Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined));
      await setDoc(doc(db, "editorStyles", style.id), clean);
    } catch {
      /* qayda deploy olunmayıbsa — yerli nüsxə qalır */
    }
  }
  return next;
}

export async function deleteCustomStyle(id: string, all: CustomStyle[]): Promise<CustomStyle[]> {
  const next = all.filter((s) => s.id !== id);
  writeLocal(next);
  const db = getDb();
  if (db) {
    try {
      await deleteDoc(doc(db, "editorStyles", id));
    } catch {
      /* yerli */
    }
  }
  return next;
}

function styleToBlock(tr: Transaction, node: PMNode, pos: number, style: CustomStyle) {
  const schema = tr.doc.type.schema;
  // Başlıq üslubu (h-N) başlığın özünü saxlayır, digər üslublar abzasa çevirir.
  const keepHeading = node.type.name === "heading" && style.id.startsWith("h-");
  const paragraph = keepHeading ? node.type : schema.nodes.paragraph;
  const attrs = {
    ...(node.type === paragraph ? node.attrs : {}),
    textAlign: style.align || null,
    lineHeight: style.lineHeight || null,
    spaceBefore: style.spaceBefore || null,
    spaceAfter: style.spaceAfter || null,
    blockStyle: null,
    customStyle: style.id,
  };
  tr.setNodeMarkup(pos, paragraph, attrs);
  const from = pos + 1;
  const to = pos + node.nodeSize - 1;
  if (to <= from) return;
  const { textStyle, bold, italic, underline } = schema.marks;
  tr.removeMark(from, to, textStyle);
  const tsAttrs = {
    fontFamily: style.fontFamily || null,
    fontSize: style.fontSize || null,
    color: style.color || null,
  };
  if (tsAttrs.fontFamily || tsAttrs.fontSize || tsAttrs.color) tr.addMark(from, to, textStyle.create(tsAttrs));
  for (const [mark, on] of [
    [bold, style.bold],
    [italic, style.italic],
    [underline, style.underline],
  ] as const) {
    if (!mark) continue;
    if (on) tr.addMark(from, to, mark.create());
    else tr.removeMark(from, to, mark);
  }
}

/** Seçimdəki abzaslara xüsusi üslub tətbiq edir. */
export function applyCustomStyle(editor: Editor, style: CustomStyle) {
  const { state, view } = editor;
  const tr = state.tr;
  const { from, to } = state.selection;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === "paragraph" || node.type.name === "heading") {
      styleToBlock(tr, node, pos, style);
      return false;
    }
    return true;
  });
  view.dispatch(tr);
  editor.commands.focus();
}

/** Üslub dəyişəndə həmin üslubdakı bütün abzasları yeniləyir (Word davranışı). */
export function reapplyCustomStyle(editor: Editor, style: CustomStyle) {
  const { state, view } = editor;
  const tr = state.tr;
  const level = style.id.startsWith("h-") ? Number(style.id.slice(2)) : 0;
  state.doc.descendants((node, pos) => {
    const match = level
      ? node.type.name === "heading" && node.attrs.level === level
      : node.isTextblock && node.attrs.customStyle === style.id;
    if (match) {
      styleToBlock(tr, node, pos, style);
      return false;
    }
    return true;
  });
  if (tr.docChanged) view.dispatch(tr);
}

/** Cari seçimin formatından yeni üslub yaradır («Seçimdən üslub yarat»). */
export function styleFromSelection(editor: Editor, name: string): CustomStyle {
  const ts = editor.getAttributes("textStyle");
  const block = editor.state.selection.$from.parent.attrs;
  return {
    id: `s-${Date.now().toString(36)}`,
    name,
    fontFamily: ts.fontFamily || null,
    fontSize: ts.fontSize || null,
    color: ts.color || null,
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    align: block.textAlign || null,
    lineHeight: block.lineHeight || null,
    spaceBefore: block.spaceBefore || null,
    spaceAfter: block.spaceAfter || null,
  };
}

/* ──────────────── Hərf halı (Change Case) ──────────────── */

export type CaseMode = "sentence" | "lower" | "upper" | "title" | "toggle";

export function changeCase(editor: Editor, mode: CaseMode, locale: string) {
  const { state, view } = editor;
  const { from, to, empty } = state.selection;
  if (empty) return false;
  const lc = locale === "az" || locale === "tr" ? locale : undefined;
  const up = (s: string) => (lc ? s.toLocaleUpperCase(lc) : s.toUpperCase());
  const low = (s: string) => (lc ? s.toLocaleLowerCase(lc) : s.toLowerCase());

  const parts: { from: number; to: number; text: string; marks: PMNode["marks"] }[] = [];
  let startOfSentence = true;
  let startOfWord = true;
  let prevBlock = -1;

  state.doc.nodesBetween(from, to, (node, pos, parent) => {
    if (!node.isText || !node.text) return true;
    const blockPos = parent ? state.doc.resolve(pos).before() : -1;
    if (blockPos !== prevBlock) {
      startOfSentence = true;
      startOfWord = true;
      prevBlock = blockPos;
    }
    const s = Math.max(from, pos);
    const e = Math.min(to, pos + node.text.length);
    const original = node.text.slice(s - pos, e - pos);
    let out = "";
    for (const ch of original) {
      let next = ch;
      if (mode === "upper") next = up(ch);
      else if (mode === "lower") next = low(ch);
      else if (mode === "toggle") next = ch === up(ch) ? low(ch) : up(ch);
      else if (mode === "title") next = startOfWord ? up(ch) : low(ch);
      else if (mode === "sentence") next = startOfSentence && /\p{L}/u.test(ch) ? up(ch) : low(ch);
      if (/\p{L}/u.test(ch)) startOfSentence = false;
      if (/[.!?]/.test(ch)) startOfSentence = true;
      startOfWord = /\s|[-–—"«(]/.test(ch);
      out += next;
    }
    parts.push({ from: s, to: e, text: out, marks: node.marks });
    return false;
  });

  const tr = state.tr;
  for (const p of parts.reverse()) {
    if (!p.text) continue;
    tr.replaceWith(p.from, p.to, state.schema.text(p.text, p.marks));
  }
  view.dispatch(tr);
  return true;
}

/* ──────────────── Sıralama (Sort) ──────────────── */

export function sortSelection(editor: Editor, direction: "asc" | "desc", locale: string): boolean {
  const { state, view } = editor;
  const { $from, $to } = state.selection;
  const cmp = (a: PMNode, b: PMNode) => {
    const r = a.textContent.trim().localeCompare(b.textContent.trim(), locale, { sensitivity: "base", numeric: true });
    return direction === "asc" ? r : -r;
  };

  // 1) Siyahının içindədirsə — siyahı elementlərini sırala.
  for (let d = $from.depth; d > 0; d--) {
    const n = $from.node(d);
    if (n.type.name === "bulletList" || n.type.name === "orderedList") {
      const items: PMNode[] = [];
      n.forEach((child) => items.push(child));
      items.sort(cmp);
      const start = $from.before(d) + 1;
      const tr = state.tr.replaceWith(start, start + n.content.size, Fragment.fromArray(items));
      // Kursor siyahıda qalsın ki, ardıcıl sıralama (A→Z, sonra Z→A) işləsin.
      tr.setSelection(TextSelection.near(tr.doc.resolve(start + 1)));
      view.dispatch(tr);
      return true;
    }
  }

  // 2) Seçilmiş üst səviyyəli abzaslar.
  const fromIdx = Math.min($from.index(0), state.doc.childCount - 1);
  // Ctrl+A (AllSelection) zamanı $to.index(0) === childCount olur.
  const toIdx = Math.min($to.index(0), state.doc.childCount - 1);
  if (toIdx <= fromIdx) return false;
  const blocks: PMNode[] = [];
  for (let i = fromIdx; i <= toIdx; i++) {
    const child = state.doc.child(i);
    if (!child.isTextblock) return false;
    blocks.push(child);
  }
  let start = 0;
  for (let i = 0; i < fromIdx; i++) start += state.doc.child(i).nodeSize;
  const size = blocks.reduce((sum, b) => sum + b.nodeSize, 0);
  const sorted = [...blocks].sort(cmp);
  view.dispatch(state.tr.replaceWith(start, start + size, Fragment.fromArray(sorted)));
  return true;
}

/* ──────────────── Şrift ölçüsü ──────────────── */

export function stepFontSize(current: number, dir: 1 | -1): number {
  if (dir > 0) return FONT_SIZES.find((s) => s > current) ?? Math.min(current + 12, 400);
  return [...FONT_SIZES].reverse().find((s) => s < current) ?? Math.max(1, current - 1);
}

/** Seçimdəki mətnin real (hesablanmış) şrift ölçüsü (pt) və ailəsi. */
export function computedFont(editor: Editor): { sizePt: number; family: string } {
  try {
    const { from, empty } = editor.state.selection;
    const ts = editor.getAttributes("textStyle") as { fontSize?: string; fontFamily?: string };
    // Seçimin əvvəli span-ın kənarındadırsa domAtPos valideyn <p>-ni qaytarır — ona görə +1.
    const { node } = editor.view.domAtPos(empty ? from : from + 1);
    const el = (node.nodeType === 1 ? node : node.parentElement) as HTMLElement | null;
    if (!el) return { sizePt: 0, family: "" };
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize) || 0;
    const family = (ts.fontFamily || cs.fontFamily).split(",")[0].replace(/["']/g, "").trim();
    // Seçimin öz textStyle ölçüsü varsa, o əsasdır.
    const m = ts.fontSize ? /^(\d+(?:\.\d+)?)(pt|px)$/.exec(ts.fontSize) : null;
    if (m) return { sizePt: m[2] === "pt" ? Number(m[1]) : Math.round(Number(m[1]) * 0.75 * 2) / 2, family };
    return { sizePt: Math.round(px * 0.75 * 2) / 2, family };
  } catch {
    return { sizePt: 0, family: "" };
  }
}

/** Saxlama üçün HTML: hər üst səviyyəli blok ayrı sətirdə (saytda reklam bölgüsü üçün). */
export function serializeBlocks(editor: Editor, getHTML: (fragment: Fragment) => string): string {
  const parts: string[] = [];
  editor.state.doc.forEach((node) => parts.push(getHTML(Fragment.from(node))));
  // atributsuz <span> (boş textStyle qalığı) təmizlənir
  const html = parts.join("\n").replace(/<span>([^<]*)<\/span>/g, "$1");
  return html === "<p></p>" ? "" : html;
}

export type { EditorState };

/* ──────────────── Cədvəl düzülüşü ──────────────── */

/** Seçilmiş sütun(lar)ın bütün xanalarına en verir (px); null — avtomatik. */
export function setColumnWidth(editor: Editor, px: number | null): boolean {
  const { state, view } = editor;
  let rect;
  try {
    rect = selectedRect(state);
  } catch {
    return false;
  }
  const { map, table, tableStart, left, right } = rect;
  const tr = state.tr;
  const seen = new Set<number>();
  for (let row = 0; row < map.height; row++) {
    for (let col = left; col < right; col++) {
      const cellPos = map.map[row * map.width + col];
      if (seen.has(cellPos)) continue;
      seen.add(cellPos);
      const cell = table.nodeAt(cellPos);
      if (!cell) continue;
      const span = Number(cell.attrs.colspan) || 1;
      tr.setNodeMarkup(tableStart + cellPos, undefined, {
        ...cell.attrs,
        colwidth: px ? Array.from({ length: span }, () => Math.round(px / span)) : null,
      });
    }
  }
  view.dispatch(tr);
  return true;
}

/** Seçimdəki sətirlərin hündürlüyü (px); null — avtomatik. */
export function setRowHeight(editor: Editor, px: number | null): boolean {
  const { state, view } = editor;
  const { from, to, $from } = state.selection;
  const tr = state.tr;
  let changed = false;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === "tableRow") {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, rowHeight: px ? `${px}px` : null });
      changed = true;
      return false;
    }
    return true;
  });
  if (!changed) {
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === "tableRow") {
        tr.setNodeMarkup($from.before(d), undefined, { ...$from.node(d).attrs, rowHeight: px ? `${px}px` : null });
        changed = true;
        break;
      }
    }
  }
  if (changed) view.dispatch(tr);
  return changed;
}
