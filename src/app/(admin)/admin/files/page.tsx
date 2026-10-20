"use client";

import { useEffect, useState } from "react";
import {
  listMediaFolders,
  listMediaFiles,
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
  createMediaFile,
  updateMediaFile,
  deleteMediaFile,
  bulkDeleteMediaFiles,
  moveFilesToFolder,
  listMediaFilesByFolder,
  searchMediaFiles,
  findUnusedMediaFiles,
  getStorageStats,
  getMediaFolderTree,
} from "@/lib/data/admin";
import type { MediaFolder, MediaFile, StorageStats } from "@/lib/types";

export default function FileManagerPage() {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "audio" | "document">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUnusedFiles, setShowUnusedFiles] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedFolder, filterType, showUnusedFiles]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [foldersData, statsData] = await Promise.all([
        listMediaFolders(),
        getStorageStats(),
      ]);

      setFolders(foldersData);
      setStats(statsData);

      // Load files based on filters
      let filesData: MediaFile[];
      
      if (showUnusedFiles) {
        filesData = await findUnusedMediaFiles();
      } else if (searchQuery) {
        filesData = await searchMediaFiles(searchQuery);
      } else {
        filesData = await listMediaFilesByFolder(selectedFolder);
      }

      // Apply type filter
      if (filterType !== "all") {
        filesData = filesData.filter((f) => f.type === filterType);
      }

      setFiles(filesData);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Create folder
  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;

    try {
      await createMediaFolder({
        name: newFolderName,
        slug: newFolderName.toLowerCase().replace(/\s+/g, "-"),
        parentId: selectedFolder,
        storagePath: `/media/${newFolderName}`,
        createdAt: new Date().toISOString(),
      });

      setNewFolderName("");
      setShowNewFolderDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert("Folder yaradıla bilmədi");
    }
  }

  // Delete folder
  async function handleDeleteFolder(id: string) {
    if (!confirm("Bu folderi silmək istədiyinizə əminsiniz?")) return;

    try {
      await deleteMediaFolder(id);
      loadData();
    } catch (error: any) {
      alert(error.message || "Folder silinə bilmədi");
    }
  }

  // Delete files
  async function handleDeleteFiles() {
    if (!confirm(`${selectedFiles.length} fayl silinəcək. Əminsiniz?`)) return;

    try {
      await bulkDeleteMediaFiles(selectedFiles);
      setSelectedFiles([]);
      loadData();
    } catch (error) {
      alert("Fayllar silinə bilmədi");
    }
  }

  // Move files
  async function handleMoveFiles(targetFolderId: string | null) {
    try {
      await moveFilesToFolder(selectedFiles, targetFolderId);
      setSelectedFiles([]);
      loadData();
    } catch (error) {
      alert("Fayllar köçürülə bilmədi");
    }
  }

  // File selection
  function toggleFileSelection(fileId: string) {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }

  // Format file size
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media İdarəetməsi</h1>
          <p className="text-muted-foreground">
            Faylları və qovluqları idarə edin
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            + Yeni Qovluq
          </button>
          <button
            onClick={() => document.getElementById("file-upload")?.click()}
            className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/80"
          >
            📤 Fayl Yüklə
          </button>
        </div>
      </div>

      {/* Storage Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">İstifadə olunan</div>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalUsed)}</div>
            <div className="text-xs text-muted-foreground">
              {stats.usagePercentage.toFixed(1)}% / {formatFileSize(stats.totalLimit)}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Şəkillər</div>
            <div className="text-2xl font-bold">{stats.byType.image.count}</div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(stats.byType.image.size)}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Videolar</div>
            <div className="text-2xl font-bold">{stats.byType.video.count}</div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(stats.byType.video.size)}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Sənədlər</div>
            <div className="text-2xl font-bold">{stats.byType.document.count}</div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(stats.byType.document.size)}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Fayl axtar..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) {
              searchMediaFiles(e.target.value).then(setFiles);
            } else {
              loadData();
            }
          }}
          className="px-4 py-2 border rounded-lg flex-1 min-w-[200px]"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Bütün növlər</option>
          <option value="image">Şəkillər</option>
          <option value="video">Videolar</option>
          <option value="audio">Audio</option>
          <option value="document">Sənədlər</option>
        </select>

        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          {viewMode === "grid" ? "📋 Siyahı" : "🔲 Grid"}
        </button>

        <button
          onClick={() => {
            setShowUnusedFiles(!showUnusedFiles);
            loadData();
          }}
          className={`px-4 py-2 border rounded-lg ${
            showUnusedFiles ? "bg-primary text-white" : "hover:bg-gray-50"
          }`}
        >
          🗑️ İstifadəsiz fayllar
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-4">
          <span className="font-medium">{selectedFiles.length} fayl seçildi</span>
          
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleMoveFiles(e.target.value === "root" ? null : e.target.value);
                e.target.value = "";
              }
            }}
            className="px-3 py-1 border rounded"
          >
            <option value="">Köçür...</option>
            <option value="root">Root</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDeleteFiles}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sil
          </button>

          <button
            onClick={() => setSelectedFiles([])}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Ləğv et
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Folders */}
        <div className="lg:col-span-1 border rounded-lg p-4 h-fit">
          <div className="font-semibold mb-3">Qovluqlar</div>
          
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full text-left px-3 py-2 rounded mb-1 ${
              selectedFolder === null ? "bg-primary/10" : "hover:bg-gray-50"
            }`}
          >
            📁 Bütün fayllar
          </button>

          {folders
            .filter((f) => f.parentId === null)
            .map((folder) => (
              <div key={folder.id} className="mb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`flex-1 text-left px-3 py-2 rounded ${
                      selectedFolder === folder.id ? "bg-primary/10" : "hover:bg-gray-50"
                    }`}
                  >
                    {folder.icon || "📂"} {folder.name}
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Main Area: Files */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">Yüklənir...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Fayl tapılmadı
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors ${
                    selectedFiles.includes(file.id) ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                    {file.type === "image" ? (
                      <img src={file.url} alt={file.alt || file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl">
                        {file.type === "video" && "🎬"}
                        {file.type === "audio" && "🎵"}
                        {file.type === "document" && "📄"}
                        {file.type === "other" && "📎"}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                  {file.usageCount > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      ✓ {file.usageCount} yerdə istifadə
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors ${
                    selectedFiles.includes(file.id) ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {file.type === "image" ? (
                        <img src={file.url} alt={file.alt || file.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="text-2xl">
                          {file.type === "video" && "🎬"}
                          {file.type === "audio" && "🎵"}
                          {file.type === "document" && "📄"}
                          {file.type === "other" && "📎"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {file.mimeType}
                      </div>
                      {file.dimensions && (
                        <div className="text-xs text-muted-foreground">
                          {file.dimensions.width} × {file.dimensions.height}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleDateString("az-AZ")}
                      </div>
                      {file.usageCount > 0 && (
                        <div className="text-xs text-green-600">
                          ✓ {file.usageCount} yerdə
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Qovluq</h2>
            
            <input
              type="text"
              placeholder="Qovluq adı"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Ləğv et
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Yarat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={async (e) => {
          const uploadedFiles = e.target.files;
          if (!uploadedFiles || uploadedFiles.length === 0) return;

          setIsLoading(true);
          
          try {
            // Her faylı Cloudinary-a yüklə
            const uploadPromises = Array.from(uploadedFiles).map(async (file) => {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('folder', selectedFolder || 'general');

              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`${file.name} yüklənmədi`);
              }

              const result = await response.json();
              
              // Firestore-a fayl məlumatını əlavə et
              const fileType = file.type.startsWith('image/') ? 'image' :
                             file.type.startsWith('video/') ? 'video' :
                             file.type.startsWith('audio/') ? 'audio' : 'document';

              await createMediaFile({
                name: file.name,
                url: result.url,
                publicId: result.publicId,
                storagePath: result.publicId || '', // Cloudinary uses publicId as identifier
                type: fileType,
                mimeType: file.type,
                size: file.size,
                folderId: selectedFolder,
                dimensions: result.width && result.height ? {
                  width: result.width,
                  height: result.height
                } : undefined,
                alt: file.name.replace(/\.[^/.]+$/, ''), // Extension-sız ad
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'admin', // TODO: Real user email
                usageCount: 0,
                tags: [],
              });

              return result;
            });

            await Promise.all(uploadPromises);
            
            alert(`${uploadedFiles.length} fayl uğurla yükləndi`);
            loadData(); // Siyahını yenilə
          } catch (error) {
            console.error('Upload xətası:', error);
            alert(error instanceof Error ? error.message : 'Fayllar yüklənmədi');
          } finally {
            setIsLoading(false);
            // Input-u sıfırla
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
