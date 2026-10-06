"use client";

import { useState, type FormEvent } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Məktub abunəliyi.
 * Firebase qoşulubsa e-poçt `subscribers` kolleksiyasına yazılır;
 * qoşulmayıbsa yalnız təsdiq mesajı göstərilir.
 */
export default function NewsletterForm({
  locale,
  variant = "light",
}: {
  locale: Locale;
  variant?: "light" | "dark";
}) {
  const dict = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const dark = variant === "dark";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || state === "sending") return;

    setState("sending");
    try {
      const { isFirebaseConfigured } = await import("@/lib/firebase/config");
      if (isFirebaseConfigured) {
        const [{ getDb }, { COLLECTIONS }, firestore] = await Promise.all([
          import("@/lib/firebase/client"),
          import("@/lib/firebase/config"),
          import("firebase/firestore"),
        ]);
        const db = getDb();
        if (db) {
          await firestore.addDoc(firestore.collection(db, COLLECTIONS.subscribers), {
            email: email.trim().toLowerCase(),
            locale,
            createdAt: new Date().toISOString(),
          });
        }
      }
      setState("done");
      setEmail("");
    } catch (error) {
      console.error("[nesreen] abunəlik yazıla bilmədi:", error);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p
        className={`font-ui text-sm ${dark ? "text-gold-soft" : "text-bordo"}`}
        role="status"
      >
        {dict.home.newsletterSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-0 ${
          dark ? "" : ""
        }`}
      >
        <label htmlFor={`newsletter-${variant}`} className="sr-only">
          {dict.home.newsletterPlaceholder}
        </label>
        <input
          id={`newsletter-${variant}`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={dict.home.newsletterPlaceholder}
          className={`min-w-0 flex-1 border px-4 py-3.5 font-ui text-sm transition-colors focus:outline-none ${
            dark
              ? "border-cream/25 bg-transparent text-cream placeholder:text-cream/45 focus:border-gold"
              : "border-line bg-paper text-ink placeholder:text-muted/70 focus:border-bordo"
          }`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className={`shrink-0 border px-7 py-3.5 font-ui text-[11px] uppercase tracking-[0.18em] transition-colors disabled:opacity-60 ${
            dark
              ? "border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
              : "border-bordo bg-bordo text-cream hover:bg-bordo-deep hover:border-bordo-deep"
          }`}
        >
          {state === "sending" ? dict.contact.formSending : dict.home.newsletterCta}
        </button>
      </div>

      <p
        className={`mt-3 font-ui text-[11px] ${
          dark ? "text-cream/55" : "text-muted"
        }`}
      >
        {state === "error" ? dict.contact.formError : dict.home.newsletterNote}
      </p>
    </form>
  );
}
