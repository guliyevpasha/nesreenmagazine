"use client";

import { useLayoutEffect, useRef, type ClipboardEvent, type CSSProperties } from "react";

import type { EjBlock } from "@/lib/types";

import { sanitizeHtml } from "./sanitize";
import { PAGE_H_MM, textCss } from "./templates";

export type PageMode = "edit" | "thumb" | "print";

/**
 * contentEditable sahəsi. DOM-un məzmunu React tərəfindən yox, burada idarə olunur:
 * fokus zamanı DOM-a toxunulmur ki, kursor tullanmasın.
 */
function Editable({
  value,
  rich,
  placeholder,
  className = "",
  style,
  onChange,
}: {
  value: string;
  rich: boolean;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (rich) {
      if (sanitizeHtml(el.innerHTML) !== value) el.innerHTML = value;
    } else if (el.innerText !== value) {
      el.innerText = value;
    }
  }, [value, rich]);

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    onChange(rich ? sanitizeHtml(el.innerHTML) : el.innerText);
  };

  // Yapışdırma həmişə sadə mətn kimi — kənar stillər gəlməsin
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div
      ref={ref}
      className={`ej-editable ${className}`}
      style={style}
      contentEditable={rich ? true : "plaintext-only"}
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onInput={handleInput}
      onPaste={handlePaste}
    />
  );
}

export function BlockView({
  block,
  mode,
  onChange,
}: {
  block: EjBlock;
  mode: PageMode;
  onChange: (next: EjBlock) => void;
}) {
  const editing = mode === "edit";

  switch (block.type) {
    case "heading": {
      const css: CSSProperties = { ...textCss(block.style), whiteSpace: "pre-wrap", flexShrink: 0 };
      return editing ? (
        <Editable
          rich={false}
          value={block.text}
          placeholder="Başlıq"
          style={css}
          onChange={(text) => onChange({ ...block, text })}
        />
      ) : (
        <div style={css}>{block.text}</div>
      );
    }

    case "text": {
      const css: CSSProperties = {
        ...textCss(block.style),
        flexShrink: 0,
        columnCount: block.columns,
        columnGap: "6mm",
        overflowWrap: "break-word",
      };
      return editing ? (
        <Editable
          rich
          className="ej-text"
          value={block.html}
          placeholder="Mətn"
          style={css}
          onChange={(html) => onChange({ ...block, html })}
        />
      ) : (
        <div className="ej-text" style={css} dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.html) }} />
      );
    }

    case "quote": {
      const css = textCss(block.style);
      const authorCss: CSSProperties = {
        ...css,
        fontStyle: "normal",
        fontSize: `${Math.max(7, block.style.size * 0.55)}pt`,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginTop: "3mm",
      };
      return (
        <figure style={{ margin: 0, flexShrink: 0 }}>
          {editing ? (
            <Editable
              rich={false}
              value={block.text}
              placeholder="Sitat"
              style={{ ...css, whiteSpace: "pre-wrap" }}
              onChange={(text) => onChange({ ...block, text })}
            />
          ) : (
            <blockquote style={{ ...css, margin: 0, whiteSpace: "pre-wrap" }}>{block.text}</blockquote>
          )}
          {block.author && <figcaption style={authorCss}>{block.author}</figcaption>}
        </figure>
      );
    }

    case "image": {
      const heightMm = (PAGE_H_MM * block.height) / 100;
      return (
        <figure style={{ margin: 0, height: `${heightMm}mm`, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          {block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.url}
              alt={block.caption}
              style={{ width: "100%", flex: 1, minHeight: 0, objectFit: block.fit }}
            />
          ) : (
            mode !== "print" && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "0.4mm dashed #b9ada3",
                  background: "rgba(0,0,0,0.04)",
                  color: "#8a7f76",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "10pt",
                }}
              >
                Şəkil əlavə edin (sağ panel)
              </div>
            )
          )}
          {block.caption && (
            <figcaption
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "7.5pt",
                color: "#6b6159",
                paddingTop: "1.5mm",
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "divider":
      return <div style={{ height: "0.4mm", background: block.color, flexShrink: 0, margin: "1mm 0" }} />;

    case "spacer":
      return (
        <div
          style={{
            height: `${block.height}mm`,
            flexShrink: 0,
            ...(editing ? { background: "repeating-linear-gradient(45deg, rgba(123,34,51,0.06) 0 2mm, transparent 2mm 4mm)" } : {}),
          }}
        />
      );
  }
}
