/**
 * Bülleten redaktorunun Markdown → e-poçt HTML çeviricisi.
 * Poçt proqramları (Gmail, Outlook) xarici CSS oxumur, ona görə hər teqə
 * inline üslub verilir. Admin paneldə həm önizləmə, həm göndərmə üçün işlənir.
 *
 * Bloklar boş sətirlə ayrılır:
 *   # / ## / ### başlıq · ![alt](url) şəkil · [![alt](şəkil)](link) linkli şəkil
 *   --- ayırıcı · "- " siyahı · qalan hər şey abzas (tək sətir keçidi = <br>)
 */

import { siteUrl } from "@/lib/firebase/config";

/** Məktubdakı linklər üçün sayt ünvanı (apex → www, yönləndirmə olmasın) */
export const newsletterSiteUrl = siteUrl.replace(
  "://nesreenmagazine.com",
  "://www.nesreenmagazine.com",
);

const LINK = "color:#5e1a2a;text-decoration:underline;";
const IMG = "display:block;width:100%;max-width:100%;height:auto;border:0;";

/** Cloudinary şəklini e-poçt üçün kiçildir (1200px, JPG — Outlook WebP göstərmir). */
export function emailImageUrl(url: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*w_\d+/.test(url)) return url;
  return url.replace("/upload/", "/upload/w_1200,c_limit,q_auto,f_jpg/");
}

function inline(text: string): string {
  return text
    .replace(
      /\[!\[([^\]]*)\]\(([^)\s]+)\)\]\(([^)\s]+)\)/g,
      (_m, alt: string, src: string, href: string) =>
        `<a href="${href}" style="text-decoration:none;"><img src="${emailImageUrl(src)}" alt="${alt.replace(/"/g, "&quot;")}" width="536" style="${IMG}"></a>`,
    )
    .replace(
      /!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_m, alt: string, src: string) => `<img src="${emailImageUrl(src)}" alt="${alt.replace(/"/g, "&quot;")}" width="536" style="${IMG}">`,
    )
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, `<a href="$2" style="${LINK}">$1</a>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

export function newsletterMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = /^(#{1,3})\s+(.+)$/.exec(block);
      if (heading && !block.includes("\n")) {
        const level = heading[1].length;
        const size = level === 1 ? 28 : level === 2 ? 23 : 19;
        return `<h${level} style="margin:28px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:${size}px;line-height:1.3;font-weight:normal;color:#1a1414;">${inline(heading[2])}</h${level}>`;
      }
      if (/^-{3,}$/.test(block)) {
        return `<hr style="border:none;border-top:1px solid #eadfd3;margin:28px 0;">`;
      }
      if (block.split("\n").every((line) => /^[-*]\s+/.test(line))) {
        const items = block
          .split("\n")
          .map((line) => `<li style="margin:0 0 6px;">${inline(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul style="margin:0 0 16px;padding-inline-start:22px;">${items}</ul>`;
      }
      return `<p style="margin:0 0 16px;">${inline(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}
