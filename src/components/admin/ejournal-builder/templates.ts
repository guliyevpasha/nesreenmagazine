import type { CSSProperties } from "react";

import type { EjBlock, EjFont, EjPage, EjTextStyle } from "@/lib/types";

/** A4 ölçüləri */
export const PAGE_W_MM = 210;
export const PAGE_H_MM = 297;
/** 96 dpi-də 1 mm */
export const MM_PX = 96 / 25.4;

export const FONT_VAR: Record<EjFont, string> = {
  display: "var(--font-playfair), Georgia, serif",
  serif: "var(--font-lora), Georgia, serif",
  sans: "var(--font-sans), system-ui, sans-serif",
};

export const FONT_LABEL: Record<EjFont, string> = {
  display: "Playfair (başlıq)",
  serif: "Lora (mətn)",
  sans: "Inter (sadə)",
};

export const BORDO = "#7b2233";
export const GOLD = "#c9a227";
export const CREAM = "#fbf8f4";
export const INK = "#1a1614";

export type TemplateKind = "blank" | "cover" | "contents" | "article" | "fullImage" | "quote";

export const TEMPLATE_LABEL: Record<TemplateKind, string> = {
  blank: "Boş səhifə",
  cover: "Üz qabığı",
  contents: "Mündəricat",
  article: "Məqalə",
  fullImage: "Tam səhifə şəkil",
  quote: "Sitat səhifəsi",
};

export function newId(): string {
  return crypto.randomUUID();
}

export function textCss(s: EjTextStyle): CSSProperties {
  return {
    fontFamily: FONT_VAR[s.font],
    fontSize: `${s.size}pt`,
    color: s.color,
    textAlign: s.align,
    fontWeight: s.bold ? 600 : 400,
    fontStyle: s.italic ? "italic" : "normal",
    lineHeight: s.lineHeight ?? 1.4,
    letterSpacing: `${s.letterSpacing ?? 0}em`,
    textTransform: s.uppercase ? "uppercase" : "none",
  };
}

function style(partial: Partial<EjTextStyle> & Pick<EjTextStyle, "font" | "size">): EjTextStyle {
  return { color: INK, align: "left", ...partial };
}

export function heading(text: string, partial?: Partial<EjTextStyle>): EjBlock {
  return {
    id: newId(),
    type: "heading",
    text,
    style: style({ font: "display", size: 28, bold: true, lineHeight: 1.15, ...partial }),
  };
}

export function textBlock(html: string, columns: 1 | 2 = 1, partial?: Partial<EjTextStyle>): EjBlock {
  return {
    id: newId(),
    type: "text",
    html,
    columns,
    style: style({ font: "serif", size: 10.5, lineHeight: 1.55, align: "justify", ...partial }),
  };
}

export function imageBlock(height = 35): EjBlock {
  return { id: newId(), type: "image", url: "", caption: "", height, fit: "cover" };
}

export function quoteBlock(
  text = "Sitat mətnini bura yazın.",
  author = "Müəllif",
  partial?: Partial<EjTextStyle>,
): EjBlock {
  return {
    id: newId(),
    type: "quote",
    text,
    author,
    style: style({
      font: "display",
      size: 20,
      italic: true,
      color: BORDO,
      align: "center",
      lineHeight: 1.35,
      ...partial,
    }),
  };
}

export function divider(color = GOLD): EjBlock {
  return { id: newId(), type: "divider", color };
}

/** Boşluq — hündürlük mm ilə */
export function spacer(height = 10): EjBlock {
  return { id: newId(), type: "spacer", height };
}

export function createBlock(kind: EjBlock["type"]): EjBlock {
  switch (kind) {
    case "heading":
      return heading("Yeni başlıq");
    case "text":
      return textBlock("<p>Mətni bura yazın…</p>");
    case "image":
      return imageBlock();
    case "quote":
      return quoteBlock();
    case "divider":
      return divider();
    case "spacer":
      return spacer();
  }
}

const SAMPLE =
  "<p>Mətni bura yazın. Bu, jurnal məqaləsinin əsas hissəsidir; sətirlər iki sütunda axır. Başlığı, şəkli və sitatları alətlər panelindən əlavə edə bilərsiniz.</p><p>Hər paraqraf ayrıca yazılır. Mətn səhifəyə sığmasa, qırmızı xəbərdarlıq görünəcək və yeni səhifə əlavə etmək lazım olacaq.</p>";

export function createPage(kind: TemplateKind, issueTitle = "Nesreen Magazine"): EjPage {
  const base = { id: newId(), background: CREAM, padding: 18 };
  switch (kind) {
    case "blank":
      return { ...base, blocks: [] };
    case "cover":
      return {
        ...base,
        background: BORDO,
        overlay: 0.35,
        padding: 20,
        blocks: [
          textBlock("<p>NESREEN MAGAZINE</p>", 1, {
            font: "sans",
            size: 11,
            color: GOLD,
            align: "center",
            letterSpacing: 0.4,
            bold: true,
          }),
          spacer(150),
          heading(issueTitle, { size: 54, color: "#ffffff", align: "center" }),
          divider(GOLD),
          textBlock("<p>Qadın, moda və həyat tərzi jurnalı</p>", 1, {
            font: "serif",
            size: 13,
            color: "#ffffff",
            align: "center",
            italic: true,
          }),
        ],
      };
    case "contents":
      return {
        ...base,
        blocks: [
          heading("Bu nömrədə", { size: 34, color: BORDO }),
          divider(GOLD),
          spacer(6),
          textBlock(
            "<p><b>03</b> — Birinci məqalənin adı</p><p><b>08</b> — İkinci məqalənin adı</p><p><b>14</b> — Üçüncü məqalənin adı</p><p><b>20</b> — Dördüncü məqalənin adı</p>",
            1,
            { size: 13, align: "left", lineHeight: 2 },
          ),
        ],
      };
    case "article":
      return {
        ...base,
        blocks: [
          textBlock("<p>MODA</p>", 1, {
            font: "sans",
            size: 8.5,
            color: BORDO,
            bold: true,
            letterSpacing: 0.3,
          }),
          heading("Məqalənin başlığı"),
          divider(GOLD),
          textBlock(SAMPLE, 2),
          imageBlock(30),
        ],
      };
    case "fullImage":
      return { ...base, background: "#000000", padding: 0, blocks: [imageBlock(100)] };
    case "quote":
      return {
        ...base,
        padding: 25,
        blocks: [
          spacer(80),
          divider(GOLD),
          spacer(8),
          quoteBlock("Zərif olmaq üçün səs-küylü olmaq lazım deyil.", "Müəllif", { size: 26 }),
          spacer(8),
          divider(GOLD),
        ],
      };
  }
}

/** Nömrə üçün başlanğıc 3 səhifəlik şablon */
export function createDefaultPages(issueTitle: string): EjPage[] {
  return [createPage("cover", issueTitle), createPage("contents"), createPage("article")];
}

export function clonePage(page: EjPage): EjPage {
  const copy = JSON.parse(JSON.stringify(page)) as EjPage;
  return { ...copy, id: newId(), blocks: copy.blocks.map((b) => ({ ...b, id: newId() })) };
}
