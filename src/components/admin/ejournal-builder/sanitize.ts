/** Mətn bloklarının HTML-ni təmizləyir: yalnız icazəli teqlər və təhlükəsiz linklər qalır. */

const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "A", "UL", "OL", "LI", "BR", "P", "DIV"]);
const DROP_TAGS = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "NOSCRIPT"]);

export function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:|\/)/i.test(url.trim());
}

function cleanNode(node: Node, out: Node, doc: Document): void {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out.appendChild(doc.createTextNode(child.textContent ?? ""));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    if (DROP_TAGS.has(el.tagName)) return;
    if (!ALLOWED_TAGS.has(el.tagName)) {
      // Naməlum teq — məzmunu saxlanılır, teqin özü atılır
      cleanNode(el, out, doc);
      return;
    }
    const copy = doc.createElement(el.tagName.toLowerCase());
    if (el.tagName === "A") {
      const href = el.getAttribute("href") ?? "";
      if (isSafeUrl(href)) {
        copy.setAttribute("href", href.trim());
        copy.setAttribute("target", "_blank");
        copy.setAttribute("rel", "noopener noreferrer");
      }
    }
    cleanNode(el, copy, doc);
    out.appendChild(copy);
  });
}

export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === "undefined") return "";
  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const wrapper = parsed.createElement("div");
  cleanNode(parsed.body, wrapper, parsed);
  return wrapper.innerHTML;
}
