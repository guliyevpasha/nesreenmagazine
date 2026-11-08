/**
 * Məqalə HTML-inin serverdə təhlükəsiz təmizlənməsi (XSS qoruması).
 *
 * `sanitize-html` htmlparser2 üzərində işləyir — jsdom lazım deyil, ona görə
 * Vercel-də (isomorphic-dompurify-dən fərqli olaraq) çökmür.
 * Yalnız Word redaktorunun yaratdığı teqlər, siniflər və CSS xassələri buraxılır;
 * `on*` atributları, `javascript:` linkləri, `<script>`, kənar iframe-lər silinir.
 */
import sanitizeHtml from "sanitize-html";

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*[\d.\s,%]+\)$/i, /^[a-z]+$/i];
const LENGTH = [/^-?\d+(\.\d+)?(px|pt|em|rem|%)?$/];
const LENGTHS = [/^(-?\d+(\.\d+)?(px|pt|em|rem|%)?\s*){1,4}$/];
const BORDER = [/^none$/, /^\d+(\.\d+)?px\s+(solid|dashed|dotted|double)\s+(#[0-9a-f]{3,8}|rgba?\([\d.\s,%]+\)|[a-z]+)$/i];

const STYLE_RULES: Record<string, RegExp[]> = {
  color: COLOR,
  "background-color": COLOR,
  "font-family": [/^[\w\s,'"-]+$/],
  "font-size": LENGTH,
  "font-weight": [/^(normal|bold|[1-9]00)$/],
  "font-style": [/^(normal|italic)$/],
  "text-align": [/^(left|right|center|justify|start|end)$/],
  "text-decoration": [/^[a-z\s-]+$/],
  "line-height": [/^\d+(\.\d+)?(px|pt|em|%)?$/],
  "margin-top": LENGTH,
  "margin-bottom": LENGTH,
  "margin-inline-start": LENGTH,
  "margin-left": LENGTH,
  padding: LENGTHS,
  "padding-top": LENGTH,
  "padding-bottom": LENGTH,
  "padding-left": LENGTH,
  "padding-right": LENGTH,
  "padding-block": LENGTHS,
  border: BORDER,
  "border-top": BORDER,
  "border-bottom": BORDER,
  "border-left": BORDER,
  "border-right": BORDER,
  width: [/^\d+(\.\d+)?(px|%)$/],
  "min-width": [/^\d+(\.\d+)?(px|%)$/],
  "list-style-type": [/^(disc|circle|square|decimal|lower-alpha|upper-alpha|lower-roman|upper-roman|none)$/],
  "text-shadow": [/^[-\d.\spx,#a-f()rgba]+$/i],
  "-webkit-text-stroke": [/^\d+(\.\d+)?px\s+(#[0-9a-f]{3,8}|[a-z]+)$/i],
  "vertical-align": [/^(sub|super|baseline|top|middle|bottom)$/],
  "letter-spacing": LENGTH,
  "word-spacing": LENGTH,
  "text-indent": LENGTH,
  "padding-inline-start": LENGTH,
  height: [/^\d+(\.\d+)?px$/],
};

const TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "br", "hr", "strong", "b", "em", "i", "u", "s", "del", "strike",
  "sub", "sup", "mark", "span", "a", "ul", "ol", "li", "blockquote", "pre", "code",
  "figure", "figcaption", "img", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "colgroup", "col",
  "div", "iframe", "video",
];

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: TAGS,
  allowedAttributes: {
    "*": ["style", "class", "data-style", "data-effect", "data-marker", "data-color", "data-border", "dir", "id"],
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "width", "height", "loading"],
    iframe: ["src", "title", "loading", "allow", "allowfullscreen"],
    video: ["src", "controls", "preload", "poster"],
    td: ["colspan", "rowspan", "colwidth"],
    th: ["colspan", "rowspan", "colwidth"],
    col: ["span"],
    ol: ["start", "type"],
  },
  allowedClasses: { "*": ["nm-*", "rule-gold", "my-10", "border-0"] },
  allowedStyles: { "*": STYLE_RULES },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"], video: ["https"], iframe: ["https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ["www.youtube-nocookie.com", "www.youtube.com", "player.vimeo.com"],
  transformTags: {
    font: "span",
    a: (tagName, attribs) => {
      const out: Record<string, string> = { ...attribs };
      if (out.target === "_blank") out.rel = "noopener noreferrer";
      else delete out.target;
      return { tagName, attribs: out };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  exclusiveFilter: (frame) =>
    // icazəsiz host-un src-i silinəndə boş iframe qalmasın
    (frame.tag === "iframe" && !frame.attribs.src) ||
    frame.tag === "img" &&!/^(https?:)?\/\//i.test(frame.attribs.src || "") && !(frame.attribs.src || "").startsWith("/"),
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return (
    text
      .toLocaleLowerCase("az")
      .replace(/ə/g, "e")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ı/g, "i")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "bolme"
  );
}

/** H2/H3 başlıqlarına `id` verir və məzmun cədvəli (TOC) üçün siyahı qaytarır. */
export function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
    if (!text) return _m;
    let id = slugify(text);
    let n = 2;
    while (used.has(id)) id = `${slugify(text)}-${n++}`;
    used.add(id);
    toc.push({ id, text, level: Number(lvl) as 2 | 3 });
    const cleanAttrs = (attrs || "").replace(/\sid="[^"]*"/, "");
    return `<h${lvl} id="${id}"${cleanAttrs}>${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}
