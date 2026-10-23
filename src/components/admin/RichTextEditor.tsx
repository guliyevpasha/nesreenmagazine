"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ToolbarPlugin from "./editor/ToolbarPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot } from "lexical";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Theme configuration
const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
  heading: {
    h1: "text-4xl font-bold mb-4 mt-6",
    h2: "text-3xl font-bold mb-3 mt-5",
    h3: "text-2xl font-bold mb-2 mt-4",
    h4: "text-xl font-semibold mb-2 mt-3",
    h5: "text-lg font-semibold mb-1 mt-2",
    h6: "text-base font-semibold mb-1 mt-2",
  },
  list: {
    ul: "list-disc list-inside ml-4 mb-2",
    ol: "list-decimal list-inside ml-4 mb-2",
    listitem: "mb-1",
  },
  link: "text-bordo underline hover:text-bordo-deep cursor-pointer",
  quote: "border-l-4 border-bordo pl-4 italic text-ink-soft my-4",
};

// Initial content loader
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content && content.trim()) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        // Content will be loaded here
      });
    }
  }, [editor, content]);

  return null;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Məzmun daxil edin...",
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "NesreenEditor",
    theme,
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  };

  function handleChange(editorState: any) {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editorState._editorState._nodeMap);
      onChange(htmlString);
    });
  }

  return (
    <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <LexicalComposer initialConfig={initialConfig}>
        {/* Toolbar */}
        <ToolbarPlugin />

        {/* Editor Container */}
        <div className="relative bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[450px] p-6 outline-none prose prose-slate max-w-none focus:outline-none"
                style={{ caretColor: "#7b2233" }}
              />
            }
            placeholder={
              <div className="absolute top-6 left-6 text-slate-400 pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          {/* Plugins */}
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <OnChangePlugin onChange={handleChange} />
          <InitialContentPlugin content={content} />
        </div>
      </LexicalComposer>
    </div>
  );
}
