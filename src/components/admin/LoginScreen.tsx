"use client";

import { useState, type FormEvent } from "react";

import Logo, { RoseMark } from "@/components/Logo";
import { useAuth } from "@/lib/firebase/auth";

/** Firebase-in xəta kodlarını anlaşıqlı Azərbaycan dilinə çevirir. */
function readableError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "E-poçt ünvanı düzgün deyil.";
    case "auth/user-disabled":
      return "Bu hesab dayandırılıb.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-poçt və ya şifrə yanlışdır.";
    case "auth/too-many-requests":
      return "Çox sayda cəhd oldu. Bir az sonra yenidən yoxlayın.";
    case "auth/network-request-failed":
      return "İnternet bağlantısı ilə problem var.";
    default:
      return "Giriş alınmadı. Yenidən cəhd edin.";
  }
}

export default function LoginScreen({ unauthorized }: { unauthorized: boolean }) {
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full border border-line bg-paper px-4 py-3.5 font-ui text-sm text-ink transition-colors placeholder:text-muted/60 focus:border-bordo focus:outline-none";

  /* İstifadəçi giriş edib, amma işçi siyahısında yoxdur. */
  if (unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="w-full max-w-md border border-line bg-paper p-10 text-center">
          <RoseMark className="mx-auto h-10 w-10 text-bordo/70" strokeWidth={1} />
          <h1 className="mt-6 text-2xl">Giriş icazəniz yoxdur</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Hesabınız var, amma bu e-poçt redaksiya siyahısına əlavə olunmayıb.
            Admin sizi «İşçilər» bölməsindən əlavə etdikdən sonra panel açılacaq.
          </p>
          <button type="button" onClick={() => void signOut()} className="btn-ghost mt-8">
            Başqa hesabla gir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sol tərəf — brend */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-bordo-deep px-12 lg:flex">
        <RoseMark
          className="pointer-events-none absolute -start-20 -top-20 h-96 w-96 text-cream/[0.06]"
          strokeWidth={0.6}
        />
        <RoseMark
          className="pointer-events-none absolute -bottom-24 -end-16 h-80 w-80 text-cream/[0.05]"
          strokeWidth={0.6}
        />
        <div className="relative max-w-md text-cream">
          <Logo size="xl" className="text-cream" markClassName="text-gold" />
          <p className="mt-10 font-display text-2xl italic leading-relaxed text-cream/85">
            «Nesrin — yabanı gül deməkdir: qayğı göstərilmədən belə böyüyüb ən gözlənilməz yerdə çiçək açan.»
          </p>
          <span className="mt-8 block h-px w-16 bg-gold" aria-hidden="true" />
          <p className="mt-5 font-ui text-[11px] uppercase tracking-[0.22em] text-cream/55">
            Redaksiya idarə paneli
          </p>
        </div>
      </div>

      {/* Sağ tərəf — forma */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size="lg" className="text-ink" />
          </div>

          <h1 className="mt-8 text-3xl lg:mt-0">Panelə giriş</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Redaksiya hesabınızın e-poçtu və şifrəsi ilə daxil olun.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-email" className="eyebrow mb-2 block text-muted">
                E-poçt
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
                placeholder="ad@nesreenmagazine.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="eyebrow mb-2 block text-muted">
                Şifrə
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={fieldClass}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <p className="border-s-2 border-bordo bg-bordo/5 px-3 py-2 font-ui text-[13px] text-bordo" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="border-s-2 border-gold bg-gold/10 px-3 py-2 font-ui text-[13px] text-ink-soft" role="status">
                {notice}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? "Yoxlanılır…" : "Daxil ol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
