"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const NETWORKS = [
  {
    name: "Facebook",
    build: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.5-4.05 4.2v2.2H7.5V13h2.7v8h3.3Z",
  },
  {
    name: "X",
    build: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    path: "M17.53 3h3.02l-6.6 7.54L21.75 21h-5.9l-4.62-6.04L5.94 21H2.92l7.06-8.07L2.5 3h6.05l4.18 5.52L17.53 3Zm-1.06 16.2h1.67L7.62 4.72H5.83l10.64 14.48Z",
  },
  {
    name: "Pinterest",
    build: (url: string, title: string) =>
      `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
    path: "M12 2.2a9.8 9.8 0 0 0-3.6 18.9c-.08-.8-.15-2 .03-2.86.17-.78 1.1-4.7 1.1-4.7s-.28-.57-.28-1.4c0-1.32.76-2.3 1.72-2.3.8 0 1.2.6 1.2 1.34 0 .82-.52 2.04-.79 3.18-.22.95.48 1.73 1.42 1.73 1.7 0 3-1.8 3-4.38 0-2.29-1.65-3.9-4-3.9a4.15 4.15 0 0 0-4.32 4.16c0 .82.31 1.7.71 2.18.08.1.09.18.07.28l-.27 1.1c-.04.18-.14.22-.32.13-1.2-.56-1.95-2.3-1.95-3.72 0-3.02 2.2-5.8 6.34-5.8 3.33 0 5.92 2.37 5.92 5.54 0 3.3-2.08 5.96-4.97 5.96-.97 0-1.88-.5-2.19-1.1l-.6 2.28c-.22.83-.8 1.88-1.2 2.51A9.8 9.8 0 1 0 12 2.2Z",
  },
  {
    name: "WhatsApp",
    build: (url: string, title: string) => `https://wa.me/?text=${title}%20${url}`,
    path: "M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.03.79.81-2.95-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.14c-.25-.13-1.46-.72-1.68-.8-.23-.08-.4-.13-.56.13-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.26-.02-.4.1-.52.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.13.17 1.7 2.58 4.1 3.62.58.25 1.02.4 1.37.5.58.19 1.1.16 1.51.1.46-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.23-.17-.48-.29Z",
  },
];

export default function ShareButtons({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}) {
  const dict = getDictionary(locale);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="eyebrow text-muted">{dict.common.share}</span>

      {NETWORKS.map((network) => (
        <a
          key={network.name}
          href={url ? network.build(encodedUrl, encodedTitle) : "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={network.name}
          className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors duration-300 hover:border-bordo hover:bg-bordo hover:text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d={network.path} />
          </svg>
        </a>
      ))}

      <button
        type="button"
        onClick={copy}
        className="border border-line px-3.5 py-2 font-ui text-[10px] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-bordo hover:text-bordo"
      >
        {copied ? dict.common.copied : dict.common.copyLink}
      </button>
    </div>
  );
}
