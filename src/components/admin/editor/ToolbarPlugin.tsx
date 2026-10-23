"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const insertLink = () => {
    const url = prompt("Link URL daxil edin:");
    if (url) {
      // Link functionality will be added later
      console.log("Link:", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Şəkil URL daxil edin:");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const img = document.createElement("img");
          img.src = url;
          img.style.maxWidth = "100%";
          img.style.height = "auto";
        }
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border-b-2 border-slate-200">
      {/* Text Format */}
      <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          isActive={isBold}
          title="Qalın (Ctrl+B)"
        >
          <strong className="text-base">B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          isActive={isItalic}
          title="Maili (Ctrl+I)"
        >
          <em className="text-base font-serif">I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          isActive={isUnderline}
          title="Altdan xətt (Ctrl+U)"
        >
          <u className="text-base">U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
          isActive={isStrikethrough}
          title="Üstündən xətt"
        >
          <s className="text-base">S</s>
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
        <select
          className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm font-medium hover:bg-slate-50 cursor-pointer"
          onChange={(e) => {
            const value = e.target.value;
            if (value === "paragraph") formatParagraph();
            else if (value.startsWith("h")) formatHeading(value as HeadingTagType);
            else if (value === "quote") formatQuote();
          }}
          value={blockType}
        >
          <option value="paragraph">Normal</option>
          <option value="h1">Başlıq 1</option>
          <option value="h2">Başlıq 2</option>
          <option value="h3">Başlıq 3</option>
          <option value="h4">Başlıq 4</option>
          <option value="h5">Başlıq 5</option>
          <option value="h6">Başlıq 6</option>
          <option value="quote">Sitat</option>
        </select>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r-2 border-slate-300 pr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          title="Nöqtəli siyahı"
        >
          <span className="text-lg">•</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          title="Nömrəli siyahı"
        >
          <span className="text-sm font-bold">1.</span>
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
        <ToolbarButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Geri al (Ctrl+Z)"
        >
          <span className="text-lg">↶</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Təkrar et (Ctrl+Y)"
        >
          <span className="text-lg">↷</span>
        </ToolbarButton>
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
        px-3 py-1.5 rounded-md font-ui text-sm min-w-[38px]
        transition-all duration-150
        ${
          isActive
            ? "bg-bordo text-white shadow-sm"
            : "bg-white hover:bg-slate-100 text-slate-700 hover:text-bordo border border-slate-200 hover:border-bordo"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    >
      {children}
    </button>
  );
}
