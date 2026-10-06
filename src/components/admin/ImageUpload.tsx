"use client";

import { useState, useRef } from "react";
import { uploadFile, validateImageFile, getImageDimensions } from "@/lib/firebase/storage";

interface ImageUploadProps {
  onUpload: (url: string, width: number, height: number, storagePath: string) => void;
  currentImage?: string;
  folder: "articles" | "ejournals" | "ads" | "staff";
  recommendedSize?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onUpload,
  currentImage,
  folder,
  recommendedSize = "1200x675px",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      // Validate file
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation.error || "Fayl səhvdir");
        return;
      }

      // Get dimensions
      const { width, height } = await getImageDimensions(file);

      // Upload to Firebase
      const result = await uploadFile(file, folder);

      // Update preview
      setPreview(result.url);

      // Call parent callback
      onUpload(result.url, width, height, result.path);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Şəkil yüklənə bilmədi");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-bordo bg-bordo/5"
            : "border-line hover:border-bordo/50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-64 rounded border border-line"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-ghost !py-2 !text-xs"
            >
              {uploading ? "Yüklənir..." : "Şəkli Dəyişdir"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-muted"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-bordo hover:text-bordo-deep font-medium"
              >
                {uploading ? "Yüklənir..." : "Şəkil seçin"}
              </button>
              <span className="text-muted text-sm"> və ya buraya sürüşdürün</span>
            </div>
            <p className="text-xs text-muted">
              Tövsiyə olunan ölçü: {recommendedSize}
            </p>
            <p className="text-xs text-muted">
              PNG, JPG, WebP və ya GIF (max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
