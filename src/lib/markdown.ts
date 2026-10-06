/**
 * Kiçik və təhlükəsiz Markdown çevirici.
 *
 * Admin paneldən gələn mətn əvvəlcə tam şəkildə HTML-dən təmizlənir,
 * sonra yalnız icazə verilən nişanlar geri qaytarılır. Beləliklə redaktorun
 * yazdığı mətn səhifəyə skript yeridə bilmir.
 *
 * Dəstəklənən sintaksis:
 *   ## Başlıq          ### Alt başlıq
 *   **qalın**          *maili*
 *   > sitat
 *   - siyahı           1. nömrəli siyahı
 *   [mətn](ünvan)      ![izah](şəkil.jpg)
 *   ---                (ayırıcı xətt)
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Yalnız http(s), köklü daxili yollar və mailto icazəlidir. */
function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|mailto:|#)/i.test(trimmed)) return trimmed;
  return "#";
}

function inline(text: string): string {
  let out = escapeHtml(text);

  // Şəkil — linkdən əvvəl işlənməlidir.
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, src: string) => {
    return `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy" />`;
  });

  // Link
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    const url = safeUrl(href);
    const external = /^https?:\/\//i.test(url);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${url}"${attrs}>${label}</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");

  return out;
}

export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];

  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  };

  const flushQuote = () => {
    if (quote.length === 0) return;
    html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      flushAll();
      html.push('<hr class="rule-gold my-10 border-0" />');
      continue;
    }

    const quoteMatch = /^>\s?(.*)$/.exec(line);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quote.push(quoteMatch[1]);
      continue;
    }
    flushQuote();

    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      if (listType !== "ol") {
        flushList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushAll();
  return html.join("\n");
}

/** Mətndən nişanları çıxarıb təmiz mətn qaytarır — meta təsvirlər üçün. */
export function markdownToPlainText(markdown: string, maxLength = 200): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
