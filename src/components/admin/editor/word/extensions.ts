/**
 * Word səviyyəli redaktor üçün xüsusi Tiptap genişlənmələri.
 *
 * Saxlanma formatı — təmiz, semantik HTML (Firestore `body[locale]` sahəsi):
 *   • abzas atributları  → inline `style` (margin, line-height, border, background) + `nm-s-*` sinfi
 *   • şrift atributları  → `<span style="font-family|font-size|color|...">`
 *   • şəkil              → `<figure class="nm-fig nm-fig-{align}"><img alt><figcaption>`
 *   • video              → `<div class="nm-video"><iframe|video></div>`
 * Saytda `sanitizeArticleHtml` yalnız bu formatı buraxır.
 */
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { BulletList, OrderedList } from "@tiptap/extension-list";
import TextAlign from "@tiptap/extension-text-align";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const BLOCK_TYPES = ["paragraph", "heading", "blockquote"] as const;

/** Word «Styles» qalereyasındakı daxili üslublar → CSS sinfi. */
export const BLOCK_STYLE_CLASSES = ["title", "subtitle", "nospacing", "intense"] as const;
export type BlockStyleClass = (typeof BLOCK_STYLE_CLASSES)[number];

const MAX_INDENT = 8;
const INDENT_EM = 2;

export type BorderKind = "none" | "box" | "top" | "bottom" | "left" | "right" | "topbottom";

function cssLength(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return /^\d+(\.\d+)?(pt|px|em)$/.test(value) ? value : null;
}

function readPt(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d+(\.\d+)?(pt|px|em)$/.test(v)) return v;
  return null;
}

function borderCss(kind: string, color: string): string {
  const line = `1px solid ${color}`;
  switch (kind) {
    case "box":
      return `border: ${line}; padding: 0.6em 0.9em`;
    case "top":
      return `border-top: ${line}; padding-top: 0.5em`;
    case "bottom":
      return `border-bottom: ${line}; padding-bottom: 0.5em`;
    case "left":
      return `border-left: 3px solid ${color}; padding-left: 0.8em`;
    case "right":
      return `border-right: 3px solid ${color}; padding-right: 0.8em`;
    case "topbottom":
      return `border-top: ${line}; border-bottom: ${line}; padding-block: 0.5em`;
    default:
      return "";
  }
}

function detectBorder(el: HTMLElement): { kind: BorderKind; color: string } | null {
  const s = el.style;
  const pick = (v: string) => v || "#7b2233";
  if (s.borderTopStyle && s.borderBottomStyle && s.borderLeftStyle && s.borderRightStyle)
    return { kind: "box", color: pick(s.borderTopColor) };
  if (s.borderTopStyle && s.borderBottomStyle) return { kind: "topbottom", color: pick(s.borderTopColor) };
  if (s.borderTopStyle) return { kind: "top", color: pick(s.borderTopColor) };
  if (s.borderBottomStyle) return { kind: "bottom", color: pick(s.borderBottomColor) };
  if (s.borderLeftStyle) return { kind: "left", color: pick(s.borderLeftColor) };
  if (s.borderRightStyle) return { kind: "right", color: pick(s.borderRightColor) };
  return null;
}

/** Seçimdəki bütün abzas/başlıqların atributlarını dəyişir. */
export function updateTextBlocks(
  state: import("@tiptap/pm/state").EditorState,
  tr: import("@tiptap/pm/state").Transaction,
  fn: (attrs: Record<string, unknown>) => Record<string, unknown>,
): boolean {
  const { from, to } = state.selection;
  let changed = false;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === "paragraph" || node.type.name === "heading") {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...fn(node.attrs) });
      changed = true;
      return false;
    }
    return true;
  });
  return changed;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockFormat: {
      setBlockAttr: (name: string, value: unknown) => ReturnType;
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
    listStyle: {
      setListStyle: (style: string | null) => ReturnType;
    };
    figure: {
      setFigure: (attrs: {
        src: string;
        alt?: string;
        caption?: string;
        width?: string;
        align?: string;
      }) => ReturnType;
    };
    videoEmbed: {
      setVideo: (attrs: { src: string; kind: "iframe" | "file" }) => ReturnType;
    };
    formattingMarks: {
      toggleFormattingMarks: () => ReturnType;
    };
  }
}

/**
 * Abzas səviyyəli atributlar: girinti, sətirlərarası məsafə, əvvəl/sonra məsafə,
 * çərçivə, kölgələmə, üslub sinfi və xüsusi üslub adı.
 */
export const BlockFormat = Extension.create({
  name: "blockFormat",

  addGlobalAttributes() {
    return [
      {
        types: [...BLOCK_TYPES],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (el) => {
              const m = /^(\d+(?:\.\d+)?)em$/.exec(el.style.marginInlineStart || el.style.marginLeft || "");
              return m ? Math.min(MAX_INDENT, Math.round(Number(m[1]) / INDENT_EM)) : 0;
            },
            renderHTML: (attrs) =>
              attrs.indent ? { style: `margin-inline-start: ${attrs.indent * INDENT_EM}em` } : {},
          },
          lineHeight: {
            default: null,
            parseHTML: (el) => {
              const v = el.style.lineHeight;
              return /^\d+(\.\d+)?$/.test(v) ? v : null;
            },
            renderHTML: (attrs) => (attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {}),
          },
          spaceBefore: {
            default: null,
            parseHTML: (el) => readPt(el.style.marginTop),
            renderHTML: (attrs) => {
              const v = cssLength(attrs.spaceBefore);
              return v ? { style: `margin-top: ${v}` } : {};
            },
          },
          spaceAfter: {
            default: null,
            parseHTML: (el) => readPt(el.style.marginBottom),
            renderHTML: (attrs) => {
              const v = cssLength(attrs.spaceAfter);
              return v ? { style: `margin-bottom: ${v}` } : {};
            },
          },
          border: {
            default: null,
            parseHTML: (el) => detectBorder(el)?.kind ?? null,
            renderHTML: (attrs) =>
              attrs.border && attrs.border !== "none"
                ? { style: borderCss(attrs.border, attrs.borderColor || "#7b2233") }
                : {},
          },
          borderColor: {
            default: null,
            parseHTML: (el) => detectBorder(el)?.color ?? null,
            renderHTML: () => ({}),
          },
          shading: {
            default: null,
            parseHTML: (el) => el.style.backgroundColor || null,
            renderHTML: (attrs) =>
              attrs.shading ? { style: `background-color: ${attrs.shading}; padding: 0.35em 0.6em` } : {},
          },
          blockStyle: {
            default: null,
            parseHTML: (el) => {
              const cls = Array.from(el.classList).find((c) => c.startsWith("nm-s-"));
              const name = cls?.slice(5);
              return name && (BLOCK_STYLE_CLASSES as readonly string[]).includes(name) ? name : null;
            },
            renderHTML: (attrs) => (attrs.blockStyle ? { class: `nm-s-${attrs.blockStyle}` } : {}),
          },
          customStyle: {
            default: null,
            parseHTML: (el) => el.getAttribute("data-style"),
            renderHTML: (attrs) => (attrs.customStyle ? { "data-style": attrs.customStyle } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBlockAttr:
        (name: string, value: unknown) =>
        ({ tr, state }) =>
          updateTextBlocks(state, tr, () => ({ [name]: value })),
      indent:
        () =>
        ({ tr, state }) =>
          updateTextBlocks(state, tr, (a) => ({ indent: Math.min(MAX_INDENT, Number(a.indent || 0) + 1) })),
      outdent:
        () =>
        ({ tr, state }) =>
          updateTextBlocks(state, tr, (a) => ({ indent: Math.max(0, Number(a.indent || 0) - 1) })),
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const ed = this.editor;
        if (ed.isActive("listItem")) return ed.commands.sinkListItem("listItem");
        if (ed.isActive("table")) return false;
        if (ed.isActive("codeBlock")) return ed.commands.insertContent("  ");
        return ed.commands.indent();
      },
      "Shift-Tab": () => {
        const ed = this.editor;
        if (ed.isActive("listItem")) return ed.commands.liftListItem("listItem");
        if (ed.isActive("table")) return false;
        return ed.commands.outdent();
      },
    };
  },
});

const listStyleAttr = {
  listStyle: {
    default: null as string | null,
    parseHTML: (el: HTMLElement) => el.style.listStyleType || null,
    renderHTML: (attrs: Record<string, unknown>) =>
      attrs.listStyle
        ? { style: `list-style-type: ${attrs.listStyle}`, "data-marker": String(attrs.listStyle) }
        : {},
  },
};

/** Ctrl+Shift+8 Word-də «formatlaşdırma işarələri»dir — markerli siyahı Ctrl+Shift+L. */
export const WordBulletList = BulletList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...listStyleAttr };
  },
  addKeyboardShortcuts() {
    return { "Mod-Shift-l": () => this.editor.commands.toggleBulletList() };
  },
});

export const WordOrderedList = OrderedList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...listStyleAttr };
  },
});

export const ListStyle = Extension.create({
  name: "listStyle",
  addCommands() {
    return {
      setListStyle:
        (style) =>
        ({ state, tr }) => {
          // Seçimdəki (Ctrl+A daxil) ən xarici siyahıları tapır.
          const { from, to, $from } = state.selection;
          let found = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === "bulletList" || node.type.name === "orderedList") {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, listStyle: style });
              found = true;
              return false;
            }
            return true;
          });
          if (found) return true;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === "bulletList" || node.type.name === "orderedList") {
              tr.setNodeMarkup($from.before(d), undefined, { ...node.attrs, listStyle: style });
              return true;
            }
          }
          return false;
        },
    };
  },
});

/** Word düzləndirmə qısayolları: Ctrl+L/E/R/J (Ctrl+Shift+L markerli siyahıya verildi). */
export const WordTextAlign = TextAlign.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-l": () => this.editor.commands.setTextAlign("left"),
      "Mod-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-r": () => this.editor.commands.setTextAlign("right"),
      "Mod-j": () => this.editor.commands.setTextAlign("justify"),
      "Mod-Shift-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-r": () => this.editor.commands.setTextAlign("right"),
      "Mod-Shift-j": () => this.editor.commands.setTextAlign("justify"),
    };
  },
});

/** Mətn effektləri (kölgə, parıltı, kontur, relyef) — textStyle işarəsinə atribut. */
export const TEXT_EFFECTS: Record<string, { label: string; css: string }> = {
  shadow: { label: "Kölgə", css: "text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.35)" },
  glow: { label: "Parıltı", css: "text-shadow: 0 0 6px rgba(201, 162, 39, 0.9)" },
  outline: { label: "Kontur", css: "-webkit-text-stroke: 1px #7b2233" },
  emboss: { label: "Relyef", css: "text-shadow: 1px 1px 0 #ffffff, -1px -1px 0 rgba(0, 0, 0, 0.25)" },
};

export const TextEffect = Extension.create({
  name: "textEffect",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          textEffect: {
            default: null,
            parseHTML: (el) => {
              const v = el.getAttribute("data-effect");
              return v && TEXT_EFFECTS[v] ? v : null;
            },
            renderHTML: (attrs) =>
              attrs.textEffect && TEXT_EFFECTS[attrs.textEffect as string]
                ? { "data-effect": attrs.textEffect, style: TEXT_EFFECTS[attrs.textEffect as string].css }
                : {},
          },
        },
      },
    ];
  },
});

const SAFE_SRC = /^(https:\/\/|\/)/i;

/** Şəkil: ölçü, düzləndirmə, ALT və başlıq (caption) ilə `<figure>`. */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      width: { default: "100%" },
      align: { default: "center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const img = node.querySelector("img");
          const src = img?.getAttribute("src") || "";
          if (!img || !SAFE_SRC.test(src)) return false;
          const align = (Array.from(node.classList).find((c) => /^nm-fig-(left|right|center)$/.test(c)) || "nm-fig-center").slice(7);
          return {
            src,
            alt: img.getAttribute("alt") || "",
            caption: node.querySelector("figcaption")?.textContent || "",
            width: node.style.width || "100%",
            align,
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const src = node.getAttribute("src") || "";
          // base64 şəkillər Firestore limitini aşır — qəbul edilmir.
          if (!SAFE_SRC.test(src)) return false;
          return { src, alt: node.getAttribute("alt") || "", caption: "", width: "100%", align: "center" };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, caption, width, align } = node.attrs as Record<string, string>;
    const children: unknown[] = [["img", { src, alt, loading: "lazy" }]];
    if (caption) children.push(["figcaption", {}, caption]);
    return [
      "figure",
      { class: `nm-fig nm-fig-${align || "center"}`, style: `width: ${width || "100%"}` },
      ...children,
    ] as unknown as import("@tiptap/pm/model").DOMOutputSpec;
  },

  addCommands() {
    return {
      setFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export function toEmbedUrl(input: string): string | null {
  const url = input.trim();
  const yt =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/i.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Video: YouTube/Vimeo (iframe) və ya yüklənmiş fayl (Cloudinary, `<video>`). */
export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { src: { default: "" }, kind: { default: "iframe" } };
  },

  parseHTML() {
    return [
      {
        tag: "div.nm-video",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const iframe = node.querySelector("iframe");
          if (iframe) {
            const src = toEmbedUrl(iframe.getAttribute("src") || "");
            return src ? { src, kind: "iframe" } : false;
          }
          const video = node.querySelector("video");
          const src = video?.getAttribute("src") || "";
          return /^https:\/\//i.test(src) ? { src, kind: "file" } : false;
        },
      },
      {
        tag: "iframe[src]",
        getAttrs: (el) => {
          const src = toEmbedUrl((el as HTMLElement).getAttribute("src") || "");
          return src ? { src, kind: "iframe" } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, kind } = node.attrs as { src: string; kind: string };
    if (kind === "file") {
      return ["div", { class: "nm-video nm-video-file" }, ["video", { src, controls: "true", preload: "metadata" }]];
    }
    return [
      "div",
      { class: "nm-video" },
      [
        "iframe",
        {
          src,
          loading: "lazy",
          allowfullscreen: "true",
          allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen",
          title: "Video",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

const marksKey = new PluginKey<boolean>("formattingMarks");

/** Show/Hide ¶ — boşluqları (·) və abzas sonlarını (¶) dekorasiya ilə göstərir. */
export const FormattingMarks = Extension.create({
  name: "formattingMarks",

  addCommands() {
    return {
      toggleFormattingMarks:
        () =>
        ({ tr, state, dispatch }) => {
          if (dispatch) tr.setMeta(marksKey, !marksKey.getState(state));
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return { "Mod-Shift-8": () => this.editor.commands.toggleFormattingMarks() };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<boolean>({
        key: marksKey,
        state: {
          init: () => false,
          apply: (tr, value) => {
            const meta = tr.getMeta(marksKey);
            return typeof meta === "boolean" ? meta : value;
          },
        },
        props: {
          decorations(state) {
            if (!marksKey.getState(state)) return null;
            const decos: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                const text = node.text;
                for (let i = 0; i < text.length; i++) {
                  if (text[i] === " ") decos.push(Decoration.inline(pos + i, pos + i + 1, { class: "nm-mark-space" }));
                }
              } else if (node.isTextblock) {
                decos.push(
                  Decoration.widget(pos + node.nodeSize - 1, () => {
                    const span = document.createElement("span");
                    span.className = "nm-mark-para";
                    span.textContent = "¶";
                    return span;
                  }, { side: 1, ignoreSelection: true }),
                );
              }
              return true;
            });
            return DecorationSet.create(state.doc, decos);
          },
          attributes(state): Record<string, string> {
            return marksKey.getState(state) ? { class: "nm-show-marks" } : {};
          },
        },
      }),
    ];
  },
});

export function formattingMarksVisible(state: import("@tiptap/pm/state").EditorState): boolean {
  return Boolean(marksKey.getState(state));
}

export { mergeAttributes };
