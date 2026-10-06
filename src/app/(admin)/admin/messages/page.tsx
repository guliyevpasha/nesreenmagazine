"use client";

import { useEffect, useState } from "react";

import { Alert, Button, Empty, PageHeader, Panel } from "@/components/admin/ui";
import { listMessages, removeMessage, type ContactMessage } from "@/lib/data/admin";
import { formatDate, localeNames, isLocale } from "@/lib/i18n/config";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  async function refresh() {
    try {
      setMessages(await listMessages());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Mesajlar oxunmadı.");
      setMessages([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <>
      <PageHeader
        title="Mesajlar"
        description="Saytdakı əlaqə formasından gələn müraciətlər."
      />

      <div className="px-6 py-8 lg:px-10">
        {error && (
          <div className="mb-6">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <Panel>
          {!messages ? (
            <p className="py-12 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
          ) : messages.length === 0 ? (
            <Empty
              title="Hələ mesaj yoxdur"
              text="Oxucular əlaqə formasını doldurduqca müraciətlər burada görünəcək."
            />
          ) : (
            <ul className="divide-y divide-line">
              {messages.map((message) => {
                const open = openId === message.id;
                return (
                  <li key={message.id} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : message.id)}
                      className="flex w-full items-start justify-between gap-4 text-start"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-lg text-ink">{message.name}</p>
                        <p className="mt-0.5 font-ui text-[12.5px] text-muted">
                          {message.email} · {message.subject}
                        </p>
                        {!open && (
                          <p className="clamp-2 mt-2 text-[13.5px] text-ink-soft">
                            {message.message}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 font-ui text-[11.5px] text-muted">
                        {formatDate(message.createdAt.slice(0, 10), "az")}
                      </span>
                    </button>

                    {open && (
                      <div className="mt-4 border-s-2 border-gold ps-4">
                        <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-soft">
                          {message.message}
                        </p>
                        <p className="mt-3 font-ui text-[11.5px] text-muted">
                          Sayt dili:{" "}
                          {isLocale(message.locale) ? localeNames[message.locale] : message.locale}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                              `Re: ${message.subject}`,
                            )}`}
                            className="btn-ghost !py-2 !text-[11px]"
                          >
                            Cavab yaz
                          </a>
                          <Button
                            variant="danger"
                            onClick={() => {
                              if (window.confirm("Mesaj silinsin?")) {
                                void removeMessage(message.id).then(refresh);
                              }
                            }}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
