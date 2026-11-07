"use client";

import { useLayoutEffect, useRef } from "react";

import type { EjBlock, EjPage } from "@/lib/types";

import { BlockView, type PageMode } from "./BlockView";

/** Bir A4 səhifə: ekranda redaktə, miniatürdə və çapda eyni render. */
export function PageCanvas({
  page,
  mode,
  selectedBlockId,
  onSelectBlock,
  onChangeBlock,
  onOverflow,
}: {
  page: EjPage;
  mode: PageMode;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onChangeBlock?: (next: EjBlock) => void;
  /** Məzmun səhifəyə sığmayanda true göndərilir (yalnız redaktə rejimində) */
  onOverflow?: (overflow: boolean) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const lastOverflow = useRef<boolean | null>(null);
  const editing = mode === "edit";

  // Hər renderdən sonra sığma yoxlanışı (scrollHeight > clientHeight)
  useLayoutEffect(() => {
    if (!editing || !onOverflow) return;
    const check = () => {
      const el = innerRef.current;
      if (!el) return;
      const overflow = el.scrollHeight - el.clientHeight > 2;
      if (lastOverflow.current !== overflow) {
        lastOverflow.current = overflow;
        onOverflow(overflow);
      }
    };
    check();
    const fonts = document.fonts;
    if (fonts) void fonts.ready.then(check);
  });

  return (
    <div
      className="ej-page"
      style={{ background: page.background }}
      onMouseDown={editing ? () => onSelectBlock?.(null) : undefined}
    >
      {page.backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.backgroundImage}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {page.backgroundImage && (page.overlay ?? 0) > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${page.overlay})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, padding: `${page.padding}mm` }}>
        <div
          ref={innerRef}
          style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "3mm" }}
        >
          {page.blocks.map((block) => {
            const selected = editing && block.id === selectedBlockId;
            return (
              <div
                key={block.id}
                style={{
                  flexShrink: 0,
                  position: "relative",
                  outline: selected ? "0.8mm solid #7b2233" : "none",
                  outlineOffset: "0.8mm",
                  cursor: editing ? "pointer" : "default",
                }}
                onMouseDown={
                  editing
                    ? (event) => {
                        event.stopPropagation();
                        onSelectBlock?.(block.id);
                      }
                    : undefined
                }
              >
                <BlockView block={block} mode={mode} onChange={(next) => onChangeBlock?.(next)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
