"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useEffect } from "react";

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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Şəkil URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Link URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b-2 border-slate-200 p-3 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Qalın (Ctrl+B)"
          >
            <strong className="text-sm">B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Maili (Ctrl+I)"
          >
            <em className="text-sm font-serif">I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Altdan xətt (Ctrl+U)"
          >
            <u className="text-sm">U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Üstündən xətt"
          >
            <s className="text-sm">S</s>
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Başlıq 1"
          >
            <span className="text-sm font-bold">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Başlıq 2"
          >
            <span className="text-sm font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Başlıq 3"
          >
            <span className="text-sm font-bold">H3</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            isActive={editor.isActive("heading", { level: 4 })}
            title="Başlıq 4"
          >
            <span className="text-sm font-bold">H4</span>
          </ToolbarButton>
        </div>

        {/* Text Align */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Sola doğru"
          >
            <span className="text-lg">⬅</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Mərkəzə"
          >
            <span className="text-lg">↔</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Sağa doğru"
          >
            <span className="text-lg">➡</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="İki tərəfə"
          >
            <span className="text-sm">⬌</span>
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Nöqtəli siyahı"
          >
            <span className="text-lg">•</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Nömrəli siyahı"
          >
            <span className="text-sm font-bold">1.</span>
          </ToolbarButton>
        </div>

        {/* Quote & Code */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Sitat"
          >
            <span className="text-lg">"</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Kod"
          >
            <span className="text-xs font-mono">{"<>"}</span>
          </ToolbarButton>
        </div>

        {/* Links & Images */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link əlavə et">
            <span className="text-base">🔗</span>
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="Şəkil əlavə et">
            <span className="text-base">🖼️</span>
          </ToolbarButton>
        </div>

        {/* Divider */}
        <div className="flex gap-1 border-r-2 border-slate-300 pr-3">
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Ayırıcı xətt"
          >
            <span className="text-xl">—</span>
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Geri al"
          >
            <span className="text-lg">↶</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Təkrar et"
          >
            <span className="text-lg">↷</span>
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        px-3 py-2 rounded-md font-ui text-sm
        transition-all duration-200
        ${
          isActive
            ? "bg-bordo text-white shadow-sm"
            : "bg-white hover:bg-slate-100 text-slate-700 hover:text-bordo border border-slate-200 hover:border-bordo"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
      `}
    >
      {children}
    </button>
  );
}
