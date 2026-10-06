"use client";

import { useEffect, useState } from "react";

import ZodiacIcon from "@/components/ZodiacIcon";
import {
  Alert,
  Button,
  Field,
  LocaleTabs,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";
import { getHoroscope, horoscopePeriods, type HoroscopePeriod } from "@/lib/content/horoscopes";
import { getHoroscopeDoc, saveHoroscopeDoc, type HoroscopeDoc } from "@/lib/data/admin";
import { locales, type Locale } from "@/lib/i18n/config";
import { emptyLocalized } from "@/lib/types";
import { zodiac, zodiacDateRange, zodiacName, type ZodiacKey } from "@/lib/zodiac";

const PERIOD_LABELS: Record<HoroscopePeriod, string> = {
  daily: "Günlük",
  weekly: "Həftəlik",
  monthly: "Aylıq",
};

/** Firestore-da hələ sənəd yoxdursa, saytdakı hazır mətnlərlə başlayır. */
function fallbackDoc(sign: ZodiacKey): HoroscopeDoc {
  return {
    daily: Object.fromEntries(
      locales.map((code) => [code, getHoroscope(sign, "daily", code)]),
    ) as HoroscopeDoc["daily"],
    weekly: Object.fromEntries(
      locales.map((code) => [code, getHoroscope(sign, "weekly", code)]),
    ) as HoroscopeDoc["weekly"],
    monthly: Object.fromEntries(
      locales.map((code) => [code, getHoroscope(sign, "monthly", code)]),
    ) as HoroscopeDoc["monthly"],
  };
}

export default function AstrologyAdminPage() {
  const [activeSign, setActiveSign] = useState<ZodiacKey>("aries");
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [doc, setDoc] = useState<HoroscopeDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setMessage(null);

    getHoroscopeDoc(activeSign)
      .then((found) => {
        if (!cancelled) setDoc(found ?? fallbackDoc(activeSign));
      })
      .catch((caught) => {
        if (!cancelled) {
          setDoc(fallbackDoc(activeSign));
          setMessage({
            tone: "error",
            text: caught instanceof Error ? caught.message : "Şərhlər oxunmadı.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeSign]);

  function update(period: HoroscopePeriod, value: string) {
    setDoc((current) =>
      current
        ? {
            ...current,
            [period]: { ...(current[period] ?? emptyLocalized()), [activeLocale]: value },
          }
        : current,
    );
  }

  async function handleSave() {
    if (!doc) return;
    setBusy(true);
    setMessage(null);
    try {
      await saveHoroscopeDoc(activeSign, doc);
      setMessage({ tone: "success", text: "Şərhlər yadda saxlanıldı." });
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Yadda saxlanılmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  const sign = zodiac.find((item) => item.key === activeSign)!;

  const filled = Object.fromEntries(
    locales.map((code) => [code, Boolean(doc?.daily?.[code]?.trim())]),
  ) as Record<Locale, boolean>;

  return (
    <>
      <PageHeader
        title="Bürc şərhləri"
        description="Bürcü seçin, günlük / həftəlik / aylıq şərhi beş dildə yazın. Saytda dərhal görünür."
        actions={
          <Button onClick={() => void handleSave()} disabled={busy || !doc}>
            {busy ? "Saxlanılır…" : "Yadda saxla"}
          </Button>
        }
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        {/* Bürc seçimi */}
        <div className="mb-8 grid grid-cols-4 gap-x-4 gap-y-6 border border-line bg-paper px-5 py-6 sm:grid-cols-6 lg:grid-cols-12">
          {zodiac.map((item) => {
            const selected = item.key === activeSign;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSign(item.key)}
                className="group flex flex-col items-center text-center"
                aria-pressed={selected}
              >
                <span
                  className={`block w-full transition-all duration-300 ${
                    selected
                      ? "scale-105 opacity-100"
                      : "opacity-55 group-hover:opacity-90"
                  }`}
                >
                  <ZodiacIcon sign={item.key} element={item.element} className="w-full" />
                </span>
                <span
                  className={`mt-2 font-display text-[13px] ${
                    selected ? "text-bordo" : "text-ink"
                  }`}
                >
                  {zodiacName(item.key, "az")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Redaktor */}
        <Panel
          title={`${zodiacName(activeSign, "az")} · ${zodiacDateRange(sign, "az")}`}
          description="Qızılı nöqtə həmin dildə günlük şərhin dolu olduğunu göstərir."
        >
          <LocaleTabs active={activeLocale} onChange={setActiveLocale} filled={filled} />

          {!doc ? (
            <p className="py-12 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
          ) : (
            <div className="mt-6 space-y-6">
              {horoscopePeriods.map((period) => (
                <Field
                  key={period}
                  label={PERIOD_LABELS[period]}
                  hint={
                    period === "daily"
                      ? "Ana səhifədə və astrologiya bölməsində göstərilir — 2–3 cümlə."
                      : undefined
                  }
                >
                  <textarea
                    rows={period === "daily" ? 4 : 3}
                    value={doc[period]?.[activeLocale] ?? ""}
                    onChange={(event) => update(period, event.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder={`${zodiacName(activeSign, "az")} üçün ${PERIOD_LABELS[
                      period
                    ].toLowerCase()} şərh…`}
                  />
                </Field>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
