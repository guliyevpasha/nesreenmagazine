"use client";

import { useRef, type ChangeEvent, type ReactNode } from "react";

import { Button, Field, inputClass } from "@/components/admin/ui";
import type { EjAlign, EjBlock, EjFont, EjPage, EjTextStyle } from "@/lib/types";

import { FONT_LABEL } from "./templates";

const ALIGNS: { value: EjAlign; label: string }[] = [
  { value: "left", label: "Sol" },
  { value: "center", label: "Mərkəz" },
  { value: "right", label: "Sağ" },
  { value: "justify", label: "Tam" },
];

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 border px-2 py-1.5 font-ui text-[12px] transition-colors ${
        active ? "border-bordo bg-bordo text-cream" : "border-line text-ink hover:border-bordo"
      }`}
    >
      {children}
    </button>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer border border-line bg-paper p-0.5"
      />
      <span className="font-ui text-[12px] text-muted">{value}</span>
    </div>
  );
}

function NumberInput({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      className={inputClass}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
      }}
    />
  );
}

function ImageUpload({
  label,
  hasImage,
  busy,
  onPick,
  onRemove,
}: {
  label: string;
  hasImage: boolean;
  busy: boolean;
  onPick: (file: File) => void;
  onRemove?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onPick(file);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
      <Button variant="ghost" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? "Yüklənir…" : hasImage ? `${label} dəyiş` : `${label} yüklə`}
      </Button>
      {hasImage && onRemove && (
        <Button variant="danger" disabled={busy} onClick={onRemove}>
          Sil
        </Button>
      )}
    </div>
  );
}

function TextStyleFields({ style, onChange }: { style: EjTextStyle; onChange: (patch: Partial<EjTextStyle>) => void }) {
  return (
    <>
      <Field label="Şrift">
        <select
          className={inputClass}
          value={style.font}
          onChange={(e) => onChange({ font: e.target.value as EjFont })}
        >
          {(Object.keys(FONT_LABEL) as EjFont[]).map((f) => (
            <option key={f} value={f}>
              {FONT_LABEL[f]}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ölçü (pt)">
          <NumberInput value={style.size} min={5} max={120} step={0.5} onChange={(size) => onChange({ size })} />
        </Field>
        <Field label="Sətir hündürlüyü">
          <NumberInput
            value={style.lineHeight ?? 1.4}
            min={0.8}
            max={3}
            step={0.05}
            onChange={(lineHeight) => onChange({ lineHeight })}
          />
        </Field>
      </div>
      <Field label="Hərf aralığı (em)">
        <NumberInput
          value={style.letterSpacing ?? 0}
          min={-0.1}
          max={1}
          step={0.01}
          onChange={(letterSpacing) => onChange({ letterSpacing })}
        />
      </Field>
      <Field label="Rəng">
        <ColorInput value={style.color} onChange={(color) => onChange({ color })} />
      </Field>
      <Field label="Hizalama">
        <div className="flex gap-1">
          {ALIGNS.map((a) => (
            <Toggle key={a.value} active={style.align === a.value} onClick={() => onChange({ align: a.value })}>
              {a.label}
            </Toggle>
          ))}
        </div>
      </Field>
      <Field label="Üslub">
        <div className="flex gap-1">
          <Toggle active={!!style.bold} onClick={() => onChange({ bold: !style.bold })}>
            <b>B</b>
          </Toggle>
          <Toggle active={!!style.italic} onClick={() => onChange({ italic: !style.italic })}>
            <i>I</i>
          </Toggle>
          <Toggle active={!!style.uppercase} onClick={() => onChange({ uppercase: !style.uppercase })}>
            AA
          </Toggle>
        </div>
      </Field>
    </>
  );
}

export function Inspector({
  page,
  block,
  busy,
  onChangePage,
  onChangeBlock,
  onUploadPageBackground,
  onUploadBlockImage,
}: {
  page: EjPage;
  block: EjBlock | null;
  busy: boolean;
  onChangePage: (patch: Partial<EjPage>) => void;
  onChangeBlock: (next: EjBlock) => void;
  onUploadPageBackground: (file: File) => void;
  onUploadBlockImage: (file: File) => void;
}) {
  if (!block) {
    return (
      <div className="space-y-5">
        <h3 className="font-display text-lg text-ink">Səhifə</h3>
        <Field label="Fon rəngi">
          <ColorInput value={page.background} onChange={(background) => onChangePage({ background })} />
        </Field>
        <Field label="Fon şəkli">
          <ImageUpload
            label="Şəkil"
            hasImage={!!page.backgroundImage}
            busy={busy}
            onPick={onUploadPageBackground}
            onRemove={() => onChangePage({ backgroundImage: undefined, overlay: undefined })}
          />
        </Field>
        {page.backgroundImage && (
          <Field label={`Qaralma: ${Math.round((page.overlay ?? 0) * 100)}%`}>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.05}
              value={page.overlay ?? 0}
              onChange={(e) => onChangePage({ overlay: Number(e.target.value) })}
              className="w-full accent-[#7b2233]"
            />
          </Field>
        )}
        <Field label="Kənar boşluq (mm)">
          <NumberInput value={page.padding} min={0} max={60} onChange={(padding) => onChangePage({ padding })} />
        </Field>
        <p className="font-ui text-[11.5px] text-muted">
          Blok seçmək üçün səhifədəki elementin üzərinə klikləyin.
        </p>
      </div>
    );
  }

  const typeLabel: Record<EjBlock["type"], string> = {
    heading: "Başlıq",
    text: "Mətn",
    image: "Şəkil",
    quote: "Sitat",
    divider: "Ayırıcı",
    spacer: "Boşluq",
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg text-ink">{typeLabel[block.type]}</h3>

      {(block.type === "heading" || block.type === "text" || block.type === "quote") && (
        <TextStyleFields
          style={block.style}
          onChange={(patch) => onChangeBlock({ ...block, style: { ...block.style, ...patch } })}
        />
      )}

      {block.type === "text" && (
        <Field label="Sütun sayı">
          <div className="flex gap-1">
            <Toggle active={block.columns === 1} onClick={() => onChangeBlock({ ...block, columns: 1 })}>
              1 sütun
            </Toggle>
            <Toggle active={block.columns === 2} onClick={() => onChangeBlock({ ...block, columns: 2 })}>
              2 sütun
            </Toggle>
          </div>
        </Field>
      )}

      {block.type === "quote" && (
        <Field label="Müəllif">
          <input
            className={inputClass}
            value={block.author}
            onChange={(e) => onChangeBlock({ ...block, author: e.target.value })}
          />
        </Field>
      )}

      {block.type === "image" && (
        <>
          <Field label="Şəkil">
            <ImageUpload
              label="Şəkil"
              hasImage={!!block.url}
              busy={busy}
              onPick={onUploadBlockImage}
              onRemove={() => onChangeBlock({ ...block, url: "" })}
            />
          </Field>
          <Field label="Açıqlama (caption)">
            <input
              className={inputClass}
              value={block.caption}
              onChange={(e) => onChangeBlock({ ...block, caption: e.target.value })}
            />
          </Field>
          <Field label={`Hündürlük: səhifənin ${block.height}%`}>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={block.height}
              onChange={(e) => onChangeBlock({ ...block, height: Number(e.target.value) })}
              className="w-full accent-[#7b2233]"
            />
          </Field>
          <Field label="Yerləşmə">
            <div className="flex gap-1">
              <Toggle active={block.fit === "cover"} onClick={() => onChangeBlock({ ...block, fit: "cover" })}>
                Doldur (cover)
              </Toggle>
              <Toggle active={block.fit === "contain"} onClick={() => onChangeBlock({ ...block, fit: "contain" })}>
                Sığdır (contain)
              </Toggle>
            </div>
          </Field>
        </>
      )}

      {block.type === "divider" && (
        <Field label="Xəttin rəngi">
          <ColorInput value={block.color} onChange={(color) => onChangeBlock({ ...block, color })} />
        </Field>
      )}

      {block.type === "spacer" && (
        <Field label="Hündürlük (mm)">
          <NumberInput value={block.height} min={1} max={290} onChange={(height) => onChangeBlock({ ...block, height })} />
        </Field>
      )}
    </div>
  );
}
