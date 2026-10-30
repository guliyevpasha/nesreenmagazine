"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import type { CategorySlug } from "@/lib/categories";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import { COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase/config";
import type { StaffMember, StaffRole } from "@/lib/types";

/**
 * Admin panelin giriş sistemi.
 *
 * İşçi Firebase Authentication ilə daxil olur, icazələri isə Firestore-dakı
 * `staff` sənədindən oxunur: rol (admin / redaktor / müəllif) və hansı
 * bölmələrdə işləyə biləcəyi.
 *
 * İlk admini yaratmaq üçün .env.local faylında:
 *   NEXT_PUBLIC_ADMIN_EMAILS=sizin@mail.com
 * Bu siyahıdakı e-poçtlar `staff` sənədi olmasa da tam səlahiyyət alır.
 */

const BOOTSTRAP_ADMINS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export type AdminSession = {
  uid: string;
  email: string;
  name: string;
  role: StaffRole;
  /** Boş siyahı = bütün bölmələr. */
  categories: CategorySlug[];
};

type AuthState = {
  loading: boolean;
  configured: boolean;
  user: User | null;
  session: AdminSession | null;
  /** Giriş edib, amma `staff` siyahısında olmayan istifadəçi. */
  unauthorized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** İşçi sənədi e-poçt ID-si ilə saxlanılır: staff/ad@nesreenmagazine.com */
async function loadStaffRecord(email: string): Promise<StaffMember | null> {
  const db = getDb();
  if (!db) return null;

  const snapshot = await getDoc(doc(db, COLLECTIONS.staff, email.toLowerCase()));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<StaffMember, "id">), id: snapshot.id };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setUnauthorized(false);

      if (!nextUser?.email) {
        setSession(null);
        setLoading(false);
        return;
      }

      const email = nextUser.email.toLowerCase();

      if (BOOTSTRAP_ADMINS.includes(email)) {
        setSession({
          uid: nextUser.uid,
          email,
          name: nextUser.displayName ?? email,
          role: "admin",
          categories: [],
        });
        setLoading(false);
        return;
      }

      try {
        const staff = await loadStaffRecord(email);
        if (staff && staff.active) {
          setSession({
            uid: nextUser.uid,
            email,
            name: staff.name || email,
            role: staff.role,
            categories: staff.categories ?? [],
          });
        } else {
          setSession(null);
          setUnauthorized(true);
        }
      } catch (error) {
        console.error("[nesreen] icazələr oxunmadı:", error);
        setSession(null);
        setUnauthorized(true);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      configured: isFirebaseConfigured,
      user,
      session,
      unauthorized,
      async signIn(email, password) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase qoşulmayıb.");
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      async signOut() {
        const auth = getFirebaseAuth();
        if (auth) await firebaseSignOut(auth);
        setSession(null);
        setUnauthorized(false);
      },
      async resetPassword(email) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase qoşulmayıb.");
        await sendPasswordResetEmail(auth, email.trim());
      },
    }),
    [loading, user, session, unauthorized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth yalnız AuthProvider daxilində işləyir.");
  return context;
}

/** Bu istifadəçinin verilmiş bölmədə yaza biləcəyini yoxlayır. */
export function canEditCategory(session: AdminSession | null, category: CategorySlug): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  if (session.categories.length === 0) return true;
  return session.categories.includes(category);
}

/** Yalnız admin edə bilən işlər: işçi idarəçiliyi, banner, silmə. */
export function isAdmin(session: AdminSession | null): boolean {
  return session?.role === "admin";
}

export const roleLabels: Record<StaffRole, string> = {
  admin:     "Admin",
  editor:    "Redaktor",
  author:    "Müəllif",
  seo:       "SEO Mütəxəssisi",
  sales:     "Satış Meneceri",
  finance:   "Maliyyə Əməkdaşı",
  analyst:   "Analitik",
  moderator: "Moderator",
};

/** Rolun CRM və reklam sifarişlərinə çıxışı. */
export function canAccessCrm(session: AdminSession | null): boolean {
  if (!session) return false;
  return ["admin", "sales", "finance"].includes(session.role);
}

/** Rolun SEO idarəetməsinə çıxışı. */
export function canAccessSeo(session: AdminSession | null): boolean {
  if (!session) return false;
  return ["admin", "seo"].includes(session.role);
}

/** Rolun maliyyə məlumatlarına çıxışı. */
export function canAccessFinance(session: AdminSession | null): boolean {
  if (!session) return false;
  return ["admin", "finance"].includes(session.role);
}

/** Rolun analitika məlumatlarına çıxışı. */
export function canAccessAnalytics(session: AdminSession | null): boolean {
  if (!session) return false;
  return ["admin", "analyst", "editor"].includes(session.role);
}

/**
 * Sol menyuda hansı linkləri göstərəcəyimizi müəyyənləşdirir
 * Yazar və redaktorlar yalnız məqalələr və media görür
 */
export function getVisibleMenuItems(session: AdminSession | null): string[] {
  if (!session) return [];
  
  // Admin hər şeyi görür
  if (session.role === "admin") {
    return ["all"]; // "all" = bütün menyular görsənsin
  }
  
  // Yazar və redaktorlar üçün məhdud siyahı
  const limitedAccess = ["author", "editor", "moderator"];
  if (limitedAccess.includes(session.role)) {
    return [
      "dashboard",
      "articles",
      "media",
      "analytics-basic", // yalnız öz statistikaları
    ];
  }
  
  // SEO rolları
  if (session.role === "seo") {
    return [
      "dashboard",
      "articles",
      "media",
      "analytics",
      "seo",
    ];
  }
  
  // Satış və maliyyə
  if (["sales", "finance"].includes(session.role)) {
    return [
      "dashboard",
      "crm",
      "ad-orders",
      "analytics",
    ];
  }
  
  // Analyst
  if (session.role === "analyst") {
    return [
      "dashboard",
      "analytics",
      "subscribers",
    ];
  }
  
  return ["dashboard"];
}
