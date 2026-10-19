"use client";

import { useState } from "react";
import {
  PageHeader,
  Panel,
  Alert,
  Button,
  Field,
  inputClass,
  Empty,
} from "@/components/admin/ui";
import { categories } from "@/lib/categories";

/* ── block types ────────────────────────────────────────────────────────── */
type BlockType =
  | "hero"
  | "article-grid"
  | "category-featured"
  | "trending"
  | "newsletter"
  | "ad-banner"
  | "zodiac"
  | "html";

type Block = {
  id: string;
  type: BlockType;
  order: number;
  active: boolean;
  config: Record<string, any>;
};

const blockTypeLabels: Record<BlockType, string> = {
  hero: "🎯 Hero Carousel",
  "article-grid": "📰 Məqalə Grid",
  "category-featured": "📂 Kateqoriya Featured",
  trending: "🔥 Trending Məqalələr",
  newsletter: "📧 Newsletter Signup",
  "ad-banner": "💰 Reklam Banner",
  zodiac: "♈ Bürc Strip",
  html: "💻 HTML Block",
};

const blockTypeDescriptions: Record<BlockType, string> = {
  hero: "Böyük slider - ən son və featured məqalələr",
  "article-grid": "Grid formatında məqalə siyahısı (2, 3, 4 sütun)",
  "category-featured": "Müəyyən kateqoriyadan featured məqalələr",
  trending: "Ən çox oxunan məqalələr",
  newsletter: "Email abunəlik formu",
  "ad-banner": "Reklam banner sahəsi",
  zodiac: "12 bürc strip horizontal scroll",
  html: "Custom HTML/CSS kodu",
};

/* ── mock blocks ────────────────────────────────────────────────────────── */
const initialBlocks: Block[] = [
  {
    id: "1",
    type: "hero",
    order: 1,
    active: true,
    config: { limit: 5, autoRotate: true, interval: 5000 },
  },
  {
    id: "2",
    type: "trending",
    order: 2,
    active: true,
    config: { limit: 6, columns: 3 },
  },
  {
    id: "3",
    type: "category-featured",
    order: 3,
    active: true,
    config: { category: "moda", limit: 4 },
  },
  {
    id: "4",
    type: "zodiac",
    order: 4,
    active: true,
    config: {},
  },
  {
    id: "5",
    type: "newsletter",
    order: 5,
    active: true,
    config: { title: "Xəbərlərdən geri qalmayın", subtitle: "Həftəlik email ilə" },
  },
];

/* ── block config modal ─────────────────────────────────────────────────── */
function BlockConfigModal({
  block,
  onClose,
  onSave,
}: {
  block: Block;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
}) {
  const [config, setConfig] = useState(block.config);

  function set(key: string, value: any) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-paper border border-line shadow-xl">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-xl">
            {blockTypeLabels[block.type]} - Ayarlar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6 space-y-4">
          <p className="font-ui text-[13px] text-muted">
            {blockTypeDescriptions[block.type]}
          </p>

          {/* Hero Config */}
          {block.type === "hero" && (
            <>
              <Field label="Məqalə sayı">
                <input
                  className={inputClass}
                  type="number"
                  min="3"
                  max="10"
                  value={config.limit || 5}
                  onChange={(e) => set("limit", parseInt(e.target.value))}
                />
              </Field>
              <Field label="Avtomatik keçid">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.autoRotate || false}
                    onChange={(e) => set("autoRotate", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="font-ui text-[13px] text-ink">
                    {config.interval || 5000}ms interval
                  </span>
                </label>
              </Field>
            </>
          )}

          {/* Article Grid Config */}
          {(block.type === "article-grid" || block.type === "trending") && (
            <>
              <Field label="Məqalə sayı">
                <input
                  className={inputClass}
                  type="number"
                  min="2"
                  max="12"
                  value={config.limit || 6}
                  onChange={(e) => set("limit", parseInt(e.target.value))}
                />
              </Field>
              <Field label="Sütun sayı">
                <select
                  className={inputClass}
                  value={config.columns || 3}
                  onChange={(e) => set("columns", parseInt(e.target.value))}
                >
                  <option value={2}>2 sütun</option>
                  <option value={3}>3 sütun</option>
                  <option value={4}>4 sütun</option>
                </select>
              </Field>
            </>
          )}

          {/* Category Featured Config */}
          {block.type === "category-featured" && (
            <>
              <Field label="Kateqoriya">
                <select
                  className={inputClass}
                  value={config.category || ""}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name.az}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Məqalə sayı">
                <input
                  className={inputClass}
                  type="number"
                  min="2"
                  max="8"
                  value={config.limit || 4}
                  onChange={(e) => set("limit", parseInt(e.target.value))}
                />
              </Field>
            </>
          )}

          {/* Newsletter Config */}
          {block.type === "newsletter" && (
            <>
              <Field label="Başlıq">
                <input
                  className={inputClass}
                  value={config.title || ""}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Xəbərlərdən geri qalmayın"
                />
              </Field>
              <Field label="Alt başlıq">
                <input
                  className={inputClass}
                  value={config.subtitle || ""}
                  onChange={(e) => set("subtitle", e.target.value)}
                  placeholder="Həftəlik email ilə"
                />
              </Field>
            </>
          )}

          {/* HTML Block Config */}
          {block.type === "html" && (
            <Field label="HTML kodu">
              <textarea
                className={inputClass}
                rows={8}
                value={config.html || ""}
                onChange={(e) => set("html", e.target.value)}
                placeholder="<div>Custom content...</div>"
              />
            </Field>
          )}
        </div>
        <div className="border-t border-line px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Ləğv et
          </Button>
          <Button
            onClick={() => {
              onSave(config);
              onClose();
            }}
          >
            Yadda saxla
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── add block modal ────────────────────────────────────────────────────── */
function AddBlockModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (type: BlockType) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-paper border border-line shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-xl">Blok əlavə et</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(blockTypeLabels) as BlockType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onAdd(type);
                  onClose();
                }}
                className="border border-line bg-paper p-4 text-left hover:border-bordo hover:bg-cream/30 transition-colors"
              >
                <h3 className="font-display text-[15px] text-ink mb-1">
                  {blockTypeLabels[type]}
                </h3>
                <p className="font-ui text-[12px] text-muted">
                  {blockTypeDescriptions[type]}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────────────────── */
export default function HomepageBuilderPage() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [configModal, setConfigModal] = useState<Block | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  function moveBlock(id: string, direction: "up" | "down") {
    const index = blocks.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    )
      return;

    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    
    // Update order
    newBlocks.forEach((b, i) => (b.order = i + 1));
    setBlocks(newBlocks);
  }

  function toggleActive(id: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  }

  function deleteBlock(id: string) {
    if (!confirm("Bu bloku silmək istəyirsiniz?")) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function updateConfig(id: string, config: Record<string, any>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, config } : b))
    );
  }

  function addBlock(type: BlockType) {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      order: blocks.length + 1,
      active: true,
      config: {},
    };
    setBlocks((prev) => [...prev, newBlock]);
  }

  function saveChanges() {
    alert("✓ Ana səhifə layoutu saxlanıldı! (Demo: real save Firebase-ə)");
  }

  const activeBlocks = blocks.filter((b) => b.active);

  return (
    <>
      <PageHeader
        title="Ana Səhifə Builder"
        description="Ana səhifənin blok strukturunu idarə edin."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? "✏️ Edit" : "👁️ Preview"}
            </Button>
            <Button onClick={saveChanges}>💾 Saxla</Button>
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Ümumi blok", value: blocks.length },
            { label: "Aktiv blok", value: activeBlocks.length },
            { label: "Deaktiv", value: blocks.length - activeBlocks.length },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Preview Mode */}
        {previewMode ? (
          <Panel title="Preview - Ana Səhifə">
            <div className="space-y-6">
              {activeBlocks.map((block) => (
                <div
                  key={block.id}
                  className="border-2 border-dashed border-bordo/30 bg-cream/20 p-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {blockTypeLabels[block.type].split(" ")[0]}
                    </span>
                    <div>
                      <h3 className="font-display text-[15px] text-ink">
                        {blockTypeLabels[block.type]}
                      </h3>
                      <p className="font-ui text-[11px] text-muted">
                        {JSON.stringify(block.config)}
                      </p>
                    </div>
                  </div>
                  <div className="border border-line bg-paper p-4 font-ui text-[13px] text-muted text-center">
                    Block content burda render olunacaq...
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setAddModal(true)}>+ Yeni blok</Button>
            </div>

            {blocks.length === 0 ? (
              <Empty
                title="Blok yoxdur"
                text="Ana səhifə üçün bloklar əlavə edin."
              />
            ) : (
              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`border bg-paper p-5 ${
                      block.active ? "border-line" : "border-dashed border-line opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Order controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, "up")}
                            disabled={index === 0}
                            className="h-6 w-6 border border-line bg-paper text-muted hover:text-ink hover:border-bordo disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, "down")}
                            disabled={index === blocks.length - 1}
                            className="h-6 w-6 border border-line bg-paper text-muted hover:text-ink hover:border-bordo disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            ↓
                          </button>
                        </div>

                        {/* Block info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-display text-[17px]">
                              {block.order}.
                            </span>
                            <h3 className="font-display text-[17px] text-ink">
                              {blockTypeLabels[block.type]}
                            </h3>
                            {!block.active && (
                              <span className="inline-block border border-line px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] text-muted">
                                Deaktiv
                              </span>
                            )}
                          </div>
                          <p className="font-ui text-[13px] text-muted mb-2">
                            {blockTypeDescriptions[block.type]}
                          </p>
                          {Object.keys(block.config).length > 0 && (
                            <p className="font-ui text-[11px] text-muted">
                              ⚙️ {JSON.stringify(block.config)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfigModal(block)}
                          className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                        >
                          ⚙️ Ayarlar
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(block.id)}
                          className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                        >
                          {block.active ? "❌ Deaktiv et" : "✓ Aktiv et"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(block.id)}
                          className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Alert tone="info">
              ℹ️ <strong>Demo sistem:</strong> Blok layoutu Firebase-ə saxlanır və 
              frontend kod avtomatik bu layoutu oxuyub render edir. Full drag & drop 
              növbəti versiyada əlavə olunacaq.
            </Alert>
          </div>
        )}
      </div>

      {/* Modals */}
      {configModal && (
        <BlockConfigModal
          block={configModal}
          onClose={() => setConfigModal(null)}
          onSave={(config) => updateConfig(configModal.id, config)}
        />
      )}

      {addModal && (
        <AddBlockModal onClose={() => setAddModal(false)} onAdd={addBlock} />
      )}
    </>
  );
}
