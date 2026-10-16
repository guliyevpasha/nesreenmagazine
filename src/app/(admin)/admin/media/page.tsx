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
import {
  Alert,
  Button,
  Empty,
  PageHeader,
} from "@/components/admin/ui";

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

type ViewMode = "grid" | "list";
type SortKey = "name" | "size" | "date";

/* ── köməkçilər ─────────────────────────────────────────────────────────── */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(contentType: string): boolean {
  return contentType.startsWith("image/");
}

function isPdf(contentType: string): boolean {
  return contentType === "application/pdf";
}

function fileIcon(contentType: string): string {
  if (isImage(contentType)) return "🖼️";
  if (isPdf(contentType)) return "📄";
  return "📁";
}

const FOLDERS = ["covers", "banners", "ejournals", "ejournal-covers", "ebook"];

/* ── Fayl kartı ─────────────────────────────────────────────────────────── */
function FileCard({
  file,
  selected,
  onSelect,
  onDelete,
  onCopyUrl,
}: {
  file: MediaFile;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
}) {
  return (
    <div
      className={`group relative border bg-paper transition-colors cursor-pointer ${
        selected ? "border-bordo bg-bordo/5" : "border-line hover:border-bordo/40"
      }`}
      onClick={onSelect}
    >
      {/* Şəkil önizləmə */}
      <div className="relative aspect-square overflow-hidden bg-cream-deep">
        {isImage(file.contentType) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {fileIcon(file.contentType)}
          </div>
        )}

        {/* Seçim checkbox */}
        <div className={`absolute top-2 left-2 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
          <span className={`flex h-5 w-5 items-center justify-center border-2 ${selected ? "border-bordo bg-bordo" : "border-white bg-white/80"}`}>
            {selected && <span className="text-white text-xs font-bold">✓</span>}
          </span>
        </div>

        {/* Qovluq badge */}
        <span className="absolute bottom-1 right-1 border border-white/30 bg-ink/60 px-1.5 py-0.5 font-ui text-[9px] text-white">
          {file.folder}
        </span>
      </div>

      {/* Məlumat */}
      <div className="p-2">
        <p className="font-ui text-[11px] text-ink line-clamp-1" title={file.name}>
          {file.name}
        </p>
        <p className="font-ui text-[10px] text-muted">{formatSize(file.size)}</p>
      </div>

      {/* Əməliyyatlar */}
      <div className={`absolute inset-x-0 bottom-0 flex gap-1 bg-paper/95 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity border-t border-line`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCopyUrl(); }}
          className="flex-1 font-ui text-[9px] uppercase tracking-[0.1em] text-muted hover:text-ink transition-colors"
        >
          URL Kopyala
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex-1 font-ui text-[9px] uppercase tracking-[0.1em] text-bordo/60 hover:text-bordo transition-colors"
        >
          Sil
        </button>
      </div>
    </div>
  );
}

/* ── Əsas səhifə ─────────────────────────────────────────────────────────── */
export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterFolder, setFilterFolder] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "pdf">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Storage-dan faylları yüklə */
  async function loadFiles() {
    const storage = getFirebaseStorage();
    if (!storage) {
      setError("Firebase Storage qoşulmayıb.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const allFiles: MediaFile[] = [];

      // Hər qovluqdan faylları al
      await Promise.all(
        FOLDERS.map(async (folder) => {
          try {
            const folderRef = ref(storage, folder);
            const result = await listAll(folderRef);
            await Promise.all(
              result.items.map(async (itemRef: StorageReference) => {
                try {
                  const [url, meta] = await Promise.all([
                    getDownloadURL(itemRef),
                    getMetadata(itemRef),
                  ]);
                  allFiles.push({
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    url,
                    size: meta.size,
                    contentType: meta.contentType ?? "application/octet-stream",
                    timeCreated: meta.timeCreated,
                    folder,
                  });
                } catch {
                  // Bəzi fayllar əlçatmaz ola bilər
                }
              }),
            );
          } catch {
            // Boş qovluq
          }
        }),
      );

      setFiles(allFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadFiles(); }, []);

  /* Fayl sil */
  async function handleDelete(fullPath: string) {
    if (!confirm("Bu faylı silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.")) return;
    const storage = getFirebaseStorage();
    if (!storage) return;
    try {
      await deleteObject(ref(storage, fullPath));
      setFiles((prev) => prev.filter((f) => f.fullPath !== fullPath));
      setSelected((prev) => { const n = new Set(prev); n.delete(fullPath); return n; });
      setSuccess("Fayl silindi.");
    } catch {
      setError("Silinmə xətası baş verdi.");
    }
  }

  /* Kütləvi sil */
  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} faylı silmək istəyirsiniz?`)) return;
    const storage = getFirebaseStorage();
    if (!storage) return;
    try {
      await Promise.all(
        [...selected].map((path) => deleteObject(ref(storage, path))),
      );
      setFiles((prev) => prev.filter((f) => !selected.has(f.fullPath)));
      setSelected(new Set());
      setSuccess(`${selected.size} fayl silindi.`);
    } catch {
      setError("Kütləvi silmə xətası.");
    }
  }

  /* URL kopyala */
  function handleCopyUrl(url: string) {
    void navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setSuccess("URL panoya kopyalandı.");
    setTimeout(() => setCopiedUrl(""), 2000);
  }

  /* Fayl yüklə */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const folder = filterFolder || "covers";
      const results = await Promise.all(
        Array.from(uploadFiles).map((file) => uploadFile(file, folder)),
      );
      setSuccess(`${results.length} fayl yükləndi.`);
      void loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükləmə xətası.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* Seçim toggle */
  function toggleSelect(fullPath: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(fullPath)) n.delete(fullPath);
      else n.add(fullPath);
      return n;
    });
  }

  /* Filtr + sort */
  const filtered = files
    .filter((f) => {
      const q = search.toLowerCase();
      const matchSearch = !search || f.name.toLowerCase().includes(q);
      const matchFolder = !filterFolder || f.folder === filterFolder;
      const matchType =
        filterType === "all" ||
        (filterType === "image" && isImage(f.contentType)) ||
        (filterType === "pdf" && isPdf(f.contentType));
      return matchSearch && matchFolder && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.size - a.size;
      return b.timeCreated.localeCompare(a.timeCreated);
    });

  /* Statistika */
  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const imageCount = files.filter((f) => isImage(f.contentType)).length;
  const pdfCount = files.filter((f) => isPdf(f.contentType)).length;

  return (
    <>
      <PageHeader
        title="Media Kitabxanası"
        description="Firebase Storage-dakı bütün şəkillər, PDFlər və fayllar."
        actions={
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => void handleUpload(e)}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Yüklənir…" : "+ Fayl yüklə"}
            </Button>
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ümumi fayl", value: files.length },
            { label: "Şəkillər", value: imageCount },
            { label: "PDFlər", value: pdfCount },
            { label: "Ümumi həcm", value: formatSize(totalSize) },
          ].map((s) => (
            <div key={s.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {/* Kütləvi əməliyyatlar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 border border-gold/30 bg-gold/10 px-4 py-3">
            <span className="font-ui text-[13px] text-ink">{selected.size} fayl seçilib</span>
            <Button variant="danger" onClick={() => void handleBulkDelete()} className="py-1.5">
              Seçilənləri sil
            </Button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-auto font-ui text-[11px] text-muted hover:text-ink"
            >
              Seçimi ləğv et
            </button>
          </div>
        )}

        {/* Filtrlər */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[180px]"
            placeholder="Fayl adı axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:outline-none"
            value={filterFolder}
            onChange={(e) => setFilterFolder(e.target.value)}
          >
            <option value="">Bütün qovluqlar</option>
            {FOLDERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "image" | "pdf")}
          >
            <option value="all">Hamısı</option>
            <option value="image">Şəkillər</option>
            <option value="pdf">PDFlər</option>
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="date">Tarixə görə</option>
            <option value="name">Ada görə</option>
            <option value="size">Ölçüyə görə</option>
          </select>
          <div className="flex border border-line">
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewMode(v)}
                className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  viewMode === v ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"
                }`}
              >
                {v === "grid" ? "Grid" : "Siyahı"}
              </button>
            ))}
          </div>
        </div>

        <p className="font-ui text-[12px] text-muted">
          {filtered.length} fayl göstərilir (ümumi {files.length})
        </p>

        {/* Yüklənmə */}
        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">
            Fayllar yüklənir…
          </div>
        )}

        {/* Boş */}
        {!loading && filtered.length === 0 && (
          <Empty
            title="Fayl tapılmadı"
            text="Yuxarıdan fayl yükləyin və ya axtarışı dəyişin."
          />
        )}

        {/* Grid görünüşü */}
        {!loading && viewMode === "grid" && filtered.length > 0 && (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filtered.map((file) => (
              <FileCard
                key={file.fullPath}
                file={file}
                selected={selected.has(file.fullPath)}
                onSelect={() => toggleSelect(file.fullPath)}
                onDelete={() => void handleDelete(file.fullPath)}
                onCopyUrl={() => handleCopyUrl(file.url)}
              />
            ))}
          </div>
        )}

        {/* Siyahı görünüşü */}
        {!loading && viewMode === "list" && filtered.length > 0 && (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-line bg-cream-deep">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={() => {
                        if (selected.size === filtered.length) {
                          setSelected(new Set());
                        } else {
                          setSelected(new Set(filtered.map((f) => f.fullPath)));
                        }
                      }}
                      className="h-4 w-4 accent-bordo"
                    />
                  </th>
                  {["Fayl", "Qovluq", "Tip", "Ölçü", "Tarix", "Əməliyyat"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-ui text-[10px] uppercase tracking-[0.14em] text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => (
                  <tr
                    key={file.fullPath}
                    className={`border-b border-line transition-colors hover:bg-cream-deep/40 ${selected.has(file.fullPath) ? "bg-gold/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(file.fullPath)}
                        onChange={() => toggleSelect(file.fullPath)}
                        className="h-4 w-4 accent-bordo"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isImage(file.contentType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={file.url} alt="" className="h-8 w-8 object-cover border border-line" loading="lazy" />
                        ) : (
                          <span className="text-xl">{fileIcon(file.contentType)}</span>
                        )}
                        <span className="font-ui text-[12px] text-ink max-w-[200px] truncate">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-ui text-[12px] text-muted">{file.folder}</td>
                    <td className="px-4 py-3 font-ui text-[11px] text-muted">{file.contentType.split("/")[1]?.toUpperCase()}</td>
                    <td className="px-4 py-3 font-ui text-[12px] text-muted">{formatSize(file.size)}</td>
                    <td className="px-4 py-3 font-ui text-[11px] text-muted">{file.timeCreated.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(file.url)}
                          className="font-ui text-[11px] text-muted hover:text-ink transition-colors"
                        >
                          {copiedUrl === file.url ? "✓ Kopyalandı" : "URL"}
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-ui text-[11px] text-bordo hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Aç
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleDelete(file.fullPath)}
                          className="font-ui text-[11px] text-bordo/60 hover:text-bordo transition-colors"
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
      </div>
    </>
  );
}
