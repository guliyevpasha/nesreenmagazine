"use client";

/**
 * Nəşr sifarişi: «Sifariş et» → modal forma → Firestore `messages`
 * kolleksiyası (admin paneldə «Mesajlar» bölməsində canlı görünür).
 * Ödəniş sistemi yoxdur — redaksiya alıcı ilə əlaqə saxlayır.
 */
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Props = {
  locale: Locale;
  issueId: string;
  issueTitle: string;
  price: number;
};

export default function IssueOrderButton({ locale, issueId, issueTitle, price }: Props) {
  const t = getDictionary(locale).editions;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim().slice(0, 300);
    const quantity = Math.min(99, Math.max(1, Number(data.get("qty")) || 1));

    const payload = {
      type: "order",
      issueId,
      name: field("name"),
      email: field("email"),
      phone: field("phone"),
      subject: `Nəşr sifarişi: ${issueTitle} × ${quantity}`,
      message: [
        `Nəşr: ${issueTitle}`,
        `Say: ${quantity}`,
        `Qiymət: ${price} ₼ × ${quantity} = ${price * quantity} ₼`,
        `Telefon: ${field("phone")}`,
        field("note") ? `Qeyd: ${field("note")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      locale,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    setState("sending");
    try {
      const [{ getDb }, firestore, { COLLECTIONS }] = await Promise.all([
        import("@/lib/firebase/client"),
        import("firebase/firestore"),
        import("@/lib/firebase/config"),
      ]);
      const db = getDb();
      if (!db) throw new Error("Firebase qoşulmayıb");
      await firestore.addDoc(firestore.collection(db, COLLECTIONS.messages), payload);
      setState("done");
    } catch (error) {
      console.error("[nesreen] sifariş göndərilmədi:", error);
      setState("error");
    }
  }

  const fieldClass =
    "w-full border border-line bg-paper px-4 py-3 font-body text-[0.9375rem] text-ink placeholder:text-muted/60 focus:border-bordo focus:outline-none";
  const labelClass = "eyebrow mb-1.5 block text-muted";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setState("idle");
          setOpen(true);
        }}
        className="btn-primary !py-3 !text-[11px]"
      >
        {t.order}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] border border-line bg-cream p-0 text-ink backdrop:bg-ink/50"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">{t.orderTitle}</h2>
              <p className="mt-1 font-display text-lg text-bordo">
                {issueTitle} · {price} ₼
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="text-2xl leading-none text-muted hover:text-ink"
            >
              ×
            </button>
          </div>

          {state === "done" ? (
            <p className="mt-6 border border-gold/50 bg-cream-deep/50 px-5 py-6 text-center font-display text-lg text-bordo">
              {t.success}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{t.orderText}</p>
              <label className="block">
                <span className={labelClass}>{t.name}</span>
                <input name="name" required maxLength={120} className={fieldClass} autoComplete="name" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>{t.email}</span>
                  <input name="email" type="email" required maxLength={160} className={fieldClass} autoComplete="email" />
                </label>
                <label className="block">
                  <span className={labelClass}>{t.phone}</span>
                  <input name="phone" type="tel" required maxLength={40} className={fieldClass} autoComplete="tel" />
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>{t.qty}</span>
                <input name="qty" type="number" min={1} max={99} defaultValue={1} className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>{t.note}</span>
                <textarea name="note" rows={2} maxLength={300} className={`${fieldClass} resize-y`} />
              </label>
              {state === "error" && <p className="text-[0.875rem] text-bordo">{t.error}</p>}
              <button type="submit" disabled={state === "sending"} className="btn-primary w-full">
                {state === "sending" ? t.sending : t.send}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
