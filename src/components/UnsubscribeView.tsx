"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { RoseMark } from "@/components/Logo";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

type State = "working" | "done" | "error" | "resubscribing" | "resubscribed";

/**
 * Səhifə açılan kimi imtina sorğusu göndərilir (JS ilə — poçt skanerləri
 * linki yoxlayanda abunəçini təsadüfən çıxarmasın deyə serverdə GET yoxdur).
 */
export default function UnsubscribeView({
  locale,
  id,
  token,
}: {
  locale: Locale;
  id: string;
  token: string;
}) {
  const dict = getDictionary(locale);
  const t = dict.newsletter;
  const [state, setState] = useState<State>(id && token ? "working" : "error");
  const started = useRef(false);

  async function call(action: "unsubscribe" | "resubscribe") {
    const response = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, t: token, action, locale }),
    });
    return response.ok;
  }

  useEffect(() => {
    if (started.current || !id || !token) return;
    started.current = true;
    call("unsubscribe")
      .then((ok) => setState(ok ? "done" : "error"))
      .catch(() => setState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  async function resubscribe() {
    setState("resubscribing");
    const ok = await call("resubscribe").catch(() => false);
    setState(ok ? "resubscribed" : "error");
  }

  const title =
    state === "error" ? t.unsubErrorTitle : state === "resubscribed" ? t.title : t.unsubTitle;
  const text =
    state === "working"
      ? t.unsubWorking
      : state === "error"
        ? t.unsubErrorText
        : state === "resubscribed"
          ? t.resubscribed
          : t.unsubText;

  return (
    <section className="container-read py-20 text-center lg:py-28">
      <RoseMark className="mx-auto h-14 w-14 text-bordo/70" strokeWidth={1} />

      <h1 className="mt-8 text-4xl leading-tight sm:text-5xl">
        {state === "working" ? t.title : title}
      </h1>

      <p
        className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft"
        role="status"
      >
        {text}
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        {(state === "done" || state === "resubscribing") && (
          <button
            type="button"
            onClick={() => void resubscribe()}
            disabled={state === "resubscribing"}
            className="btn-primary disabled:opacity-60"
          >
            {state === "resubscribing" ? dict.contact.formSending : t.resubscribe}
          </button>
        )}
        <Link href={routes.home(locale)} className="btn-ghost">
          {dict.common.backHome}
        </Link>
      </div>
    </section>
  );
}
