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
    const url = prompt("Şəkil URL daxil edin:");
    if (url) {
      formatText("insertImage", url);
    }
  };

  const formatBlock = (tag: string) => {
    formatText("formatBlock", tag);
  };

  return (
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
