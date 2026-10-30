"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { PageHeader, Alert, Button, Field, inputClass } from "@/components/admin/ui";

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
      const response = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUid: session!.email, // staff collection-da email ID-dir
          subject,
          html: content,
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

      <div className="max-w-3xl space-y-6">
        <Field label="Başlıq" required>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Yeni məqalələr, təkliflər..."
            className={inputClass}
          />
        </Field>

        <Field label="Məzmun (HTML)" required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            placeholder="<h2>Salam!</h2><p>Yeni məqalələr...</p>"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-muted">
            HTML kod yaza bilərsiniz. İnline CSS istifadə edin.
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

        <div className="mt-8 rounded-lg border border-line bg-cream-deep p-6">
          <h3 className="font-ui text-sm font-semibold text-ink mb-4">
            📝 Nümunə Template
          </h3>
          <pre className="text-xs text-muted overflow-x-auto">
{`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8B1538;">Yeni Məqalələr 🌸</h2>
  <p>Salam! Bu həftə sizin üçün yeni məqalələr hazırladıq:</p>
  
  <div style="border-left: 3px solid #D4AF37; padding-left: 15px; margin: 20px 0;">
    <h3 style="margin: 0;">Məqalə başlığı</h3>
    <p style="color: #666;">Qısa təsvir...</p>
    <a href="https://nesreenmagazine.com/az/article-slug" 
       style="color: #8B1538;">Daha ətraflı →</a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="color: #666; font-size: 12px; text-align: center;">
    Nesreen Magazine © 2026<br>
    <a href="https://nesreenmagazine.com">nesreenmagazine.com</a>
  </p>
</div>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
