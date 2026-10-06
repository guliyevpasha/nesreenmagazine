"use client";

import { useState, type FormEvent } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Əlaqə forması.
 * Firebase qoşulubsa mesaj `messages` kolleksiyasına düşür və admin paneldə görünür.
 */
export default function ContactForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const subjects = [
    dict.contact.subjects.general,
    dict.contact.subjects.editorial,
    dict.contact.subjects.advertising,
    dict.contact.subjects.subscription,
    dict.contact.subjects.press,
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      locale,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    setState("sending");
    try {
      const { isFirebaseConfigured, COLLECTIONS } = await import("@/lib/firebase/config");
      if (isFirebaseConfigured) {
        const [{ getDb }, firestore] = await Promise.all([
          import("@/lib/firebase/client"),
          import("firebase/firestore"),
        ]);
        const db = getDb();
        if (db) {
          await firestore.addDoc(firestore.collection(db, COLLECTIONS.messages), payload);
        }
      }
      setState("done");
      form.reset();
    } catch (error) {
      console.error("[nesreen] mesaj göndərilmədi:", error);
      setState("error");
    }
  }

  const fieldClass =
    "w-full border border-line bg-paper px-4 py-3.5 font-body text-[0.9375rem] text-ink transition-colors placeholder:text-muted/60 focus:border-bordo focus:outline-none";
  const labelClass = "eyebrow mb-2 block text-muted";

  if (state === "done") {
    return (
      <div className="border border-gold/50 bg-cream-deep/50 px-8 py-12 text-center">
        <p className="font-display text-2xl text-bordo">{dict.contact.formSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {dict.contact.formName}
          </label>
          <input id="name" name="name" type="text" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {dict.contact.formEmail}
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          {dict.contact.formSubject}
        </label>
        <select id="subject" name="subject" required className={fieldClass}>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {dict.contact.formMessage}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" disabled={state === "sending"} className="btn-primary disabled:opacity-60">
          {state === "sending" ? dict.contact.formSending : dict.contact.formSend}
        </button>
        {state === "error" && (
          <p className="font-ui text-sm text-bordo" role="alert">
            {dict.contact.formError}
          </p>
        )}
      </div>
    </form>
  );
}
