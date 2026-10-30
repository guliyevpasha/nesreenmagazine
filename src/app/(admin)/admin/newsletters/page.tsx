"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { useAuth } from "@/lib/firebase/auth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { PageHeader, Alert, Button, Field, inputClass } from "@/components/admin/ui";
import 'react-markdown-editor-lite/lib/index.css';

// Markdown editor (client-side only)
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), { ssr: false });

// Markdown to HTML converter
const markdownToHtml = (markdown: string): string => {
  // Sadə markdown → HTML converter
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
};

export default function NewslettersPage() {
  const { session } = useAuth();
  const { hasAccess, loading: accessLoading } = useRoleAccess('/admin/newsletters');

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  if (accessLoading || !hasAccess) return null;

  async function handleSend() {
    if (!subject.trim() || !content.trim()) {
      setMessage({ tone: "error", text: "Başlıq və məzmun tələb olunur" });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      // Markdown-ı HTML-ə çevir
      const htmlContent = markdownToHtml(content);
      
      // Email template-ə sar
      const finalHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B1538; margin: 0;">NESREEN</h1>
            <p style="color: #D4AF37; font-size: 12px; letter-spacing: 2px; margin: 5px 0;">MAGAZINE</p>
          </div>
          
          <div style="line-height: 1.6; color: #333;">
            ${htmlContent}
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Nesreen Magazine © ${new Date().getFullYear()}<br>
            <a href="https://nesreenmagazine.com" style="color: #8B1538;">nesreenmagazine.com</a>
          </p>
        </div>
      `;

      const response = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUid: session!.email,
          subject,
          html: finalHtml,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Newsletter göndərilmədi');
      }

      setMessage({
        tone: "success",
        text: `✅ Newsletter göndərildi: ${data.sent} abunəçi`,
      });
      setSubject("");
      setContent("");
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Xəta baş verdi",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Email Bülten"
        subtitle="Abunəçilərə email göndər"
      />

      {message && (
        <Alert tone={message.tone}>
          {message.text}
        </Alert>
      )}

      <div className="max-w-4xl space-y-6">
        <Field label="Başlıq" required>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Yeni məqalələr, təkliflər..."
            className={inputClass}
          />
        </Field>

        <Field label="Məzmun" required>
          <div className="border border-line rounded-lg overflow-hidden">
            <MdEditor
              value={content}
              style={{ height: '500px' }}
              onChange={({ text }) => setContent(text)}
              renderHTML={(text) => markdownToHtml(text)}
              config={{
                view: { menu: true, md: true, html: true },
                canView: { menu: true, md: true, html: true, fullScreen: true, hideMenu: true },
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Markdown formatında yazın: **bold**, *italic*, [link](url)
          </p>
        </Field>

        <div className="flex gap-4">
          <Button
            onClick={handleSend}
            disabled={busy || !subject.trim() || !content.trim()}
          >
            {busy ? "Göndərilir..." : "Abunəçilərə göndər"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setSubject("");
              setContent("");
              setMessage(null);
            }}
            className="px-4 py-2 text-sm text-muted hover:text-ink"
          >
            Təmizlə
          </button>
        </div>
      </div>
    </div>
  );
}
