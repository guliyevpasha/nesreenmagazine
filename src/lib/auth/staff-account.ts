/**
 * Yeni işçi üçün giriş hesabı (Firebase Authentication) — admin paneldən.
 *
 * Adminin öz sessiyası pozulmasın deyə hesab AYRICA Firebase tətbiq nüsxəsində
 * yaradılır. Şifrə təsadüfidir və heç kimə göstərilmir: işçiyə «şifrə təyin et»
 * məktubu göndərilir. Məktubdakı linklə şifrə qoyan işçi e-poçtunu da təsdiqləmiş
 * olur — Firestore qaydaları yalnız təsdiqlənmiş e-poçtları qəbul edir.
 */
import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { firebaseConfig } from "@/lib/firebase/config";

export type StaffLoginResult = "created" | "existing";

function randomPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("") + "Aa1!";
}

/**
 * Hesabı yaradır (və ya artıq varsa toxunmur) və şifrə təyin etmə məktubu göndərir.
 */
export async function provisionStaffLogin(email: string): Promise<StaffLoginResult> {
  const normalized = email.trim().toLowerCase();
  const secondary = initializeApp(firebaseConfig, `staff-provisioning-${Date.now()}`);
  let result: StaffLoginResult = "created";
  try {
    const auth = getAuth(secondary);
    try {
      await createUserWithEmailAndPassword(auth, normalized, randomPassword());
      await signOut(auth);
    } catch (error) {
      if ((error as { code?: string }).code === "auth/email-already-in-use") {
        result = "existing";
      } else {
        throw error;
      }
    }
  } finally {
    await deleteApp(secondary).catch(() => undefined);
  }

  const primary = getFirebaseAuth();
  if (!primary) throw new Error("Firebase qoşulmayıb.");
  await sendPasswordResetEmail(primary, normalized, {
    url: `${window.location.origin}/admin`,
  });
  return result;
}
