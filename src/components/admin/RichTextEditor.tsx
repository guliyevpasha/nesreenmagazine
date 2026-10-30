"use client";

import { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Məzmun daxil edin...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Link URL daxil edin:");
    if (url) {
      formatText("createLink", url);
    }
  };

  const insertImage = () => {
    setShowImageDialog(true);
  };

  const handleInsertImageUrl = () => {
    if (imageUrl) {
      // Create optimized image HTML with alt text
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = imageAlt || "Image";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      
      // Insert at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        
        // Add a line break after image
        const br = document.createElement("br");
        range.collapse(false);
        range.insertNode(br);
      }
      
      handleInput();
      setShowImageDialog(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Yalnız şəkil faylları yükləyə bilərsiniz.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Şəkil ölçüsü 10MB-dan çox ola bilməz.");
      return;
    }

    setUploadingImage(true);

    try {
      // Upload to Cloudinary via API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Şəkil yüklənmədi");
      }

      const data = await response.json();
      
      // Use Cloudinary auto-optimization URL
      // f_auto = automatic format (WebP, AVIF)
      // q_auto = automatic quality
      // w_1200 = max width 1200px
      let optimizedUrl = data.url;
      if (optimizedUrl.includes("cloudinary.com")) {
        optimizedUrl = optimizedUrl.replace("/upload/", "/upload/f_auto,q_auto,w_1200/");
      }

      // Insert the uploaded image
      const img = document.createElement("img");
      img.src = optimizedUrl;
      img.alt = imageAlt || file.name;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        
        const br = document.createElement("br");
        range.collapse(false);
        range.insertNode(br);
      }
      
      handleInput();
      setShowImageDialog(false);
      setImageAlt("");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Şəkil yüklənərkən xəta: " + (error instanceof Error ? error.message : "Xəta"));
    } finally {
      setUploadingImage(false);
    }
  };

  const formatBlock = (tag: string) => {
    formatText("formatBlock", tag);
  };

  return (
    <>
      <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-b-2 border-slate-200">
          {/* Text Format */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <ToolbarButton onClick={() => formatText("bold")} title="Qalın (Ctrl+B)">
              <strong className="text-base">B</strong>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("italic")} title="Maili (Ctrl+I)">
              <em className="text-base font-serif">I</em>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("underline")} title="Altdan xətt (Ctrl+U)">
              <u className="text-base">U</u>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("strikeThrough")}
              title="Üstündən xətt"
            >
              <s className="text-base">S</s>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("superscript")} title="Üst indeks (x²)">
              <span className="text-xs">x<sup>2</sup></span>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("subscript")} title="Alt indeks (H₂O)">
              <span className="text-xs">H<sub>2</sub></span>
            </ToolbarButton>
          </div>

          {/* Font Size */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <select
              className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm font-medium hover:bg-slate-50 cursor-pointer"
              onChange={(e) => formatText("fontSize", e.target.value)}
              defaultValue="3"
            >
              <option value="1">Çox kiçik</option>
              <option value="2">Kiçik</option>
              <option value="3">Normal</option>
              <option value="4">Böyük</option>
              <option value="5">Çox böyük</option>
              <option value="6">Ən böyük</option>
              <option value="7">Nəhəng</option>
            </select>
          </div>

          {/* Text Color & Highlight */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <ToolbarButton onClick={() => {
              const color = prompt("Rəng kodu (məs: #ff0000, red):");
              if (color) formatText("foreColor", color);
            }} title="Mətn rəngi">
              <span className="text-base">A</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => {
              const color = prompt("Fon rəngi (məs: #ffff00, yellow):");
              if (color) formatText("hiliteColor", color);
            }} title="Fon rəngi">
              <span className="text-base" style={{background: '#ffeb3b', padding: '2px 4px'}}>H</span>
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <select
              className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm font-medium hover:bg-slate-50 cursor-pointer"
              onChange={(e) => formatBlock(e.target.value)}
              defaultValue="p"
            >
              <option value="p">Normal</option>
              <option value="h1">Başlıq 1</option>
              <option value="h2">Başlıq 2</option>
              <option value="h3">Başlıq 3</option>
              <option value="h4">Başlıq 4</option>
              <option value="h5">Başlıq 5</option>
              <option value="h6">Başlıq 6</option>
            </select>
          </div>

          {/* Text Align */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <ToolbarButton onClick={() => formatText("justifyLeft")} title="Sola">
              <span className="text-lg">⬅</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("justifyCenter")} title="Mərkəzə">
              <span className="text-lg">↔</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("justifyRight")} title="Sağa">
              <span className="text-lg">➡</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("justifyFull")} title="İki tərəfə">
              <span className="text-sm">⬌</span>
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <ToolbarButton onClick={() => formatText("insertUnorderedList")} title="Nöqtəli siyahı">
              <span className="text-lg">•</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("insertOrderedList")} title="Nömrəli siyahı">
              <span className="text-sm font-bold">1.</span>
            </ToolbarButton>
          </div>

          {/* Quote */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <ToolbarButton onClick={() => formatBlock("blockquote")} title="Sitat">
              <span className="text-lg">"</span>
            </ToolbarButton>
          </div>

          {/* Link & Image */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
            <ToolbarButton onClick={insertLink} title="Link əlavə et">
              <span className="text-base">🔗</span>
            </ToolbarButton>
            <ToolbarButton onClick={insertImage} title="Şəkil əlavə et">
              <span className="text-base">🖼️</span>
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <ToolbarButton onClick={() => formatText("undo")} title="Geri al">
              <span className="text-lg">↶</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("redo")} title="Təkrar et">
              <span className="text-lg">↷</span>
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <div className="relative bg-white p-6">
          {!isFocused && !content && (
            <div className="absolute top-6 left-6 text-slate-400 pointer-events-none">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="min-h-[450px] outline-none prose prose-slate max-w-none focus:outline-none"
            style={{
              caretColor: "#7b2233",
              fontSize: "16px",
              lineHeight: "1.7",
            }}
          />
        </div>
      </div>

      {/* Image Insert Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-line bg-paper p-6 shadow-xl">
            <h2 className="mb-4 font-display text-xl text-ink">Şəkil əlavə et</h2>

            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b border-line">
              <button
                className="border-b-2 border-bordo px-4 py-2 font-ui text-sm text-bordo"
              >
                URL
              </button>
            </div>

            {/* URL Input */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                  Şəkil URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-line bg-paper px-3 py-2 font-ui text-[14px] text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                  Alt text (izahat)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Şəklin qısa izahatı"
                  className="w-full border border-line bg-paper px-3 py-2 font-ui text-[14px] text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="border-t border-line pt-4">
                <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                  və ya komputerdən yüklə
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="w-full font-ui text-sm text-ink file:mr-4 file:rounded file:border file:border-line file:bg-cream file:px-4 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.12em] file:text-ink hover:file:border-bordo hover:file:bg-bordo hover:file:text-cream disabled:opacity-50"
                />
                {uploadingImage && (
                  <p className="mt-2 font-ui text-[12px] text-blue-600">
                    Şəkil yüklənir...
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl("");
                  setImageAlt("");
                }}
                disabled={uploadingImage}
                className="border border-line px-4 py-2 font-ui text-[11px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:text-bordo disabled:opacity-50"
              >
                Ləğv et
              </button>
              <button
                onClick={handleInsertImageUrl}
                disabled={!imageUrl || uploadingImage}
                className="border border-bordo bg-bordo px-4 py-2 font-ui text-[11px] uppercase tracking-[0.12em] text-cream hover:bg-bordo-deep disabled:opacity-50"
              >
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-3 py-1.5 rounded-md font-ui text-sm min-w-[38px] bg-white hover:bg-slate-100 text-slate-700 hover:text-bordo border border-slate-200 hover:border-bordo cursor-pointer active:scale-95 transition-all duration-150"
    >
      {children}
    </button>
  );
}
