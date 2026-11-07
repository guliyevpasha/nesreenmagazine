"use client";

/**
 * E-poçt təsdiqi ekranı.
 *
 * Təhlükəsizlik: staff icazəsi e-poçta görə verilir. Təsdiq tələb olunmasa,
 * başqası işçinin e-poçtu ilə qeydiyyatdan keçib onun icazələrini ala bilərdi.
 * Firestore qaydaları da təsdiqlənməmiş hesabı rədd edir.
 */
import { useState } from "react";

import { useAuth } from "@/lib/firebase/auth";

export default function VerifyEmailScreen() {
  const { user, sendVerification, recheckVerification, signOut } = useAuth();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "checking">("idle");
  const [message, setMessage] = useState("");

  async function send() {
    setState("sending");
    setMessage("");
    try {
      await sendVerification();
      setState("sent");
      setMessage(`Təsdiq məktubu ${user?.email} ünvanına göndərildi. «Spam» qovluğunu da yoxlayın.`);
    } catch (error) {
      setState("idle");
      const code = (error as { code?: string }).code;
      setMessage(
        code === "auth/too-many-requests"
          ? "Çox tez-tez göndərildi. Bir neçə dəqiqə sonra yenidən cəhd edin."
          : "Məktub göndərilmədi. Bir az sonra yenidən cəhd edin.",
      );
    }
  }

  async function check() {
    setState("checking");
    const verified = await recheckVerification().catch(() => false);
    if (!verified) {
      setState("sent");
      setMessage("Hələ təsdiqlənməyib. Məktubdakı linkə klikləyin, sonra yenidən yoxlayın.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md border border-line bg-paper p-8 text-center">
        <h1 className="font-display text-2xl text-ink">E-poçtunuzu təsdiqləyin</h1>
        <p className="mt-3 font-ui text-[13px] leading-relaxed text-ink-soft">
          Hesabınızın təhlükəsizliyi üçün admin panelə girməzdən əvvəl{" "}
          <strong>{user?.email}</strong> ünvanını bir dəfə təsdiqləmək lazımdır.
        </p>

        {message && (
          <p className="mt-5 border border-line bg-cream px-4 py-3 font-ui text-[12.5px] text-ink">{message}</p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void send()}
            disabled={state === "sending" || state === "checking"}
            className="btn-primary w-full disabled:opacity-60"
          >
            {state === "sending" ? "Göndərilir…" : state === "sent" ? "Məktubu yenidən göndər" : "Təsdiq məktubunu göndər"}
          </button>
          <button
            type="button"
            onClick={() => void check()}
            disabled={state === "checking"}
            className="btn-ghost w-full"
          >
            {state === "checking" ? "Yoxlanılır…" : "Təsdiqlədim — davam et"}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="font-ui text-[12px] text-muted underline hover:text-ink"
          >
            Başqa hesabla daxil ol
          </button>
        </div>
      </div>
    </div>
  );
}
