"use client";

import { useState } from "react";
import { Button, Field, inputClass, Panel } from "./ui";
import type { MediaBlock, MediaBlockType, LocalizedText, Locale } from "@/lib/types";
import { emptyLocalized } from "@/lib/types";
import { locales } from "@/lib/i18n/config";

interface MediaBlockEditorProps {
  block: MediaBlock | null;
  onSave: (block: MediaBlock) => void;
  onCancel: () => void;
  activeLocale: Locale;
}

export default function MediaBlockEditor({
  block,
  onSave,
  onCancel,
  activeLocale,
}: MediaBlockEditorProps) {
  const [type, setType] = useState<MediaBlockType>(block?.type || "video");
  const [videoUrl, setVideoUrl] = useState(block?.videoUrl || "");
  const [images, setImages] = useState<{ url: string; caption: string }[]>(
    block?.images || [{ url: "", caption: "" }]
  );
  const [instagramUrl, setInstagramUrl] = useState(block?.instagramUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(block?.twitterUrl || "");
  const [quoteText, setQuoteText] = useState<LocalizedText>(
    block?.quoteText || emptyLocalized()
  );
  const [quoteAuthor, setQuoteAuthor] = useState(block?.quoteAuthor || "");
  const [html, setHtml] = useState(block?.html || "");
  const [dividerStyle, setDividerStyle] = useState<"solid" | "dashed" | "dotted" | "stars">(
    block?.dividerStyle || "solid"
  );

  function handleAddImage() {
    setImages([...images, { url: "", caption: "" }]);
  }

  function handleRemoveImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  function handleImageChange(index: number, field: "url" | "caption", value: string) {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
  }

  function handleSave() {
    const newBlock: MediaBlock = {
      id: block?.id || `block-${Date.now()}`,
      type,
      ...(type === "video" && { videoUrl }),
      ...(type === "gallery" && { images: images.filter((img) => img.url) }),
      ...(type === "instagram" && { instagramUrl }),
      ...(type === "twitter" && { twitterUrl }),
      ...(type === "quote" && { quoteText, quoteAuthor }),
      ...(type === "html" && { html }),
      ...(type === "divider" && { dividerStyle }),
    };

    onSave(newBlock);
  }

  return (
    <Panel title={block ? "Media Block-u redaktə et" : "Yeni Media Block"}>
      <div className="space-y-4">
        <Field label="Block tipi">
          <select value={type} onChange={(e) => setType(e.target.value as MediaBlockType)} className={inputClass}>
            <option value="video">🎥 Video (YouTube/Vimeo)</option>
            <option value="gallery">🖼️ Şəkil Qalereyası</option>
            <option value="instagram">📷 Instagram Post</option>
            <option value="twitter">🐦 Twitter/X Post</option>
            <option value="quote">💬 Sitat</option>
            <option value="html">💻 HTML</option>
            <option value="divider">➖ Ayırıcı xətt</option>
          </select>
        </Field>

        {type === "video" && (
          <Field label="Video URL" hint="YouTube və ya Vimeo linki">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={inputClass}
            />
            {videoUrl && (
              <div className="mt-3 text-xs text-gray-600">
                Preview: {getVideoEmbedUrl(videoUrl) ? "✓ Düzgün link" : "✗ Yanlış link"}
              </div>
            )}
          </Field>
        )}

        {type === "gallery" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Şəkillər</label>
            {images.map((image, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded space-y-2">
                <Field label={`Şəkil ${index + 1} URL`}>
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => handleImageChange(index, "url", e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
                <Field label="Açıqlama (caption)">
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                    placeholder="Şəkil açıqlaması"
                    className={inputClass}
                  />
                </Field>
                {images.length > 1 && (
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    🗑 Sil
                  </button>
                )}
              </div>
            ))}
            <Button variant="ghost" onClick={handleAddImage}>
              + Şəkil əlavə et
            </Button>
          </div>
        )}

        {type === "instagram" && (
          <Field label="Instagram Post URL" hint="Instagram post linki">
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
              className={inputClass}
            />
          </Field>
        )}

        {type === "twitter" && (
          <Field label="Twitter/X Post URL" hint="Tweet linki">
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/.../status/..."
              className={inputClass}
            />
          </Field>
        )}

        {type === "quote" && (
          <>
            <Field label="Sitat mətni">
              <textarea
                value={quoteText[activeLocale]}
                onChange={(e) =>
                  setQuoteText({ ...quoteText, [activeLocale]: e.target.value })
                }
                placeholder="Sitat mətni..."
                className={`${inputClass} resize-y`}
                rows={4}
              />
            </Field>
            <Field label="Müəllif">
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                placeholder="Müəllifin adı"
                className={inputClass}
              />
            </Field>
          </>
        )}

        {type === "html" && (
          <Field label="HTML kodu" hint="Öz HTML kodunuzu yazın">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<div>...</div>"
              className={`${inputClass} resize-y font-mono text-sm`}
              rows={8}
            />
          </Field>
        )}

        {type === "divider" && (
          <Field label="Xətt stili">
            <select
              value={dividerStyle}
              onChange={(e) => setDividerStyle(e.target.value as any)}
              className={inputClass}
            >
              <option value="solid">Bütöv xətt</option>
              <option value="dashed">Qırıq xətt</option>
              <option value="dotted">Nöqtəli xətt</option>
              <option value="stars">Ulduzlar</option>
            </select>
          </Field>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave}>
            {block ? "Yadda saxla" : "Əlavə et"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            İmtina
          </Button>
        </div>
      </div>
    </Panel>
  );
}

// Helper: Video URL-dən embed URL düzəlt
function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId = "";
      if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      } else {
        videoId = urlObj.searchParams.get("v") || "";
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // Vimeo
    if (urlObj.hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.split("/")[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    
    return null;
  } catch {
    return null;
  }
}
