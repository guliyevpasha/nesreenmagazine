"use client";

import { useEffect, useRef, useState } from "react";
import {
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  deleteObject,
  type StorageReference,
} from "firebase/storage";

import { uploadFile } from "@/lib/data/admin";
import { getFirebaseStorage } from "@/lib/firebase/client";
import { Alert, Button, Empty, PageHeader } from "@/components/admin/ui";

/* ── tiplər ─────────────────────────────────────────────────────────────── */
type MediaFile = {
  name: string;
  fullPath: string;
  url: string;
  size: number;
  contentType: string;
  timeCreated: string;
  folder: string;
};

/* ── köməkçi: fayl ölçüsü formatı ───────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/* ── köməkçi: tarix formatı ─────────────────────────────────────────────── */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("az-AZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ── şəkil thumbnail ────────────────────────────────────────────────────── */
function isImage(contentType: string): boolean {
  return contentType.startsWith("image/");
}

/* ── Media kartı ────────────────────────────────────────────────────────── */
function MediaCard({
  file,
  onDelete,
  onSelect,
}: {
  file: MediaFile;
  onDelete: (path: string) => void;
  onSelect?: (url: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group border border-line bg-paper overflow-hidden hover:border-bordo/40 transition-colors">
      {/* Şəkil preview */}
      <div className="aspect-square bg-cream/30 flex items-center justify-center overflow-hidden">
        {isImage(file.contentType) ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <span className="text-4xl">📄</span>
            <span className="font-ui text-[10px] uppercase tracking-[0.12em]">
              {file.contentType.split("/")[1] || "FILE"}
            </span>
          </div>
        )}
      </div>

      {/* Məlumat */}
      <div className="p-3">
        <p className="font-ui text-[12px] text-ink truncate" title={file.name}>
          {file.name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-ui text-[10px] text-muted">{formatBytes(file.size)}</span>
          <span className="font-ui text-[10px] text-muted">{formatDate(file.timeCreated)}</span>
        </div>

        {/* Düymələr */}
        <div className="mt-3 flex gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={copyUrl}
            className="flex-1 font-ui text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink transition-colors"
          >
            {copied ? "✓ Kopyalandı" : "URL"}
          </button>
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(file.url)}
              className="flex-1 font-ui text-[10px] uppercase tracking-[0.12em] text-bordo hover:underline"
            >
              Seç
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(file.fullPath)}
            className="font-ui text-[10px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Upload zona ────────────────────────────────────────────────────────── */
function UploadZone({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploads = Array.from(files).map((file) => uploadFile(file, "media"));
      await Promise.all(uploads);
      onUploaded();
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükləmə xətası");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      className={`border-2 border-dashed p-8 text-center transition-colors ${
        dragOver
          ? "border-bordo bg-bordo/5"
          : "border-line bg-paper hover:border-bordo/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => void handleDrop(e)}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
        disabled={uploading}
      />

      {uploading ? (
        <div className="space-y-2">
          <p className="font-ui text-[13px] text-muted">Yüklənir...</p>
          <div className="h-1 bg-line overflow-hidden">
            <div className="h-full bg-bordo animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      ) : (
        <>
          <div className="text-5xl mb-3">📤</div>
          <p className="font-display text-lg text-ink mb-2">
            Faylları bura sürüşdürün və ya klikləyin
          </p>
          <p className="font-ui text-[13px] text-muted mb-4">
            Şəkillər (JPG, PNG, WebP, GIF) və PDF
          </p>
          <Button onClick={() => inputRef.current?.click()}>Fayl seçin</Button>
        </>
      )}

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
    </div>
  );
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "images" | "documents">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  async function loadMedia() {
    setLoading(true);
    setError("");

    try {
      const storage = getFirebaseStorage();
      if (!storage) {
        setError("Firebase Storage qoşulmayıb.");
        setLoading(false);
        return;
      }

      const mediaRef = ref(storage, "media");
      const result = await listAll(mediaRef);

      const filePromises = result.items.map(async (itemRef: StorageReference) => {
        const [url, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef),
        ]);

        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url,
          size: metadata.size,
          contentType: metadata.contentType || "application/octet-stream",
          timeCreated: metadata.timeCreated,
          folder: "media",
        };
      });

      const loadedFiles = await Promise.all(filePromises);
      setFiles(loadedFiles.sort((a, b) => b.timeCreated.localeCompare(a.timeCreated)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMedia();
  }, []);

  async function handleDelete(path: string) {
    if (!confirm("Bu faylı silmək istəyirsiniz?")) return;

    try {
      const storage = getFirebaseStorage();
      if (!storage) return;

      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      setFiles((prev) => prev.filter((f) => f.fullPath !== path));
    } catch {
      alert("Silinmə xətası baş verdi.");
    }
  }

  const filtered = files.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "images" && isImage(f.contentType)) ||
      (typeFilter === "documents" && !isImage(f.contentType));
    return matchSearch && matchType;
  });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const imageCount = files.filter((f) => isImage(f.contentType)).length;

  return (
    <>
      <PageHeader
        title="Media Kitabxanası"
        description="Şəkillər, PDF fayllar və digər media materialları."
      />

      <div className="px-6 py-6 lg:px-10">
        {/* Upload zona */}
        <div className="mb-6">
          <UploadZone onUploaded={() => void loadMedia()} />
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: "Ümumi fayl", value: files.length },
            { label: "Şəkillər", value: imageCount },
            { label: "Sənədlər", value: files.length - imageCount },
            { label: "Ümumi həcm", value: formatBytes(totalSize) },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Axtarış + filter */}
        <div className="mb-5 flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[200px]"
            placeholder="Fayl adı axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink focus:border-bordo focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="all">Bütün fayllar</option>
            <option value="images">Yalnız şəkillər</option>
            <option value="documents">Yalnız sənədlər</option>
          </select>
          <div className="flex border border-line">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${
                view === "grid" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${
                view === "list" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"
              }`}
            >
              Siyahı
            </button>
          </div>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {loading && <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>}

        {/* Grid görünüşü */}
        {!loading && view === "grid" && (
          <>
            {filtered.length === 0 ? (
              <Empty
                title="Fayl tapılmadı"
                text="Yuxarıdakı sahəyə fayl yükləyin və ya axtarışı dəyişin."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((file) => (
                  <MediaCard key={file.fullPath} file={file} onDelete={(path) => void handleDelete(path)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Siyahı görünüşü */}
        {!loading && view === "list" && (
          <>
            {filtered.length === 0 ? (
              <Empty title="Fayl tapılmadı" text="Yuxarıdakı sahəyə fayl yükləyin və ya axtarışı dəyişin." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-line">
                  <thead className="bg-paper border-b border-line">
                    <tr>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted w-12">
                        Tip
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Ad
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Ölçü
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Tarix
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((file) => (
                      <tr key={file.fullPath} className="bg-paper hover:bg-cream/30">
                        <td className="px-4 py-3 text-2xl">
                          {isImage(file.contentType) ? "🖼️" : "📄"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-ui text-[13px] text-ink truncate max-w-xs">
                            {file.name}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-ui text-[12px] text-muted">
                          {formatBytes(file.size)}
                        </td>
                        <td className="px-4 py-3 font-ui text-[12px] text-muted">
                          {formatDate(file.timeCreated)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo hover:underline"
                            >
                              Aç
                            </a>
                            <button
                              type="button"
                              onClick={() => void handleDelete(file.fullPath)}
                              className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
