"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import {
  Alert,
  Button,
  Empty,
  Field,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";
import { provisionStaffLogin } from "@/lib/auth/staff-account";
import { categories, type CategorySlug } from "@/lib/categories";
import { addStaff, listStaff, removeStaff, saveStaff } from "@/lib/data/admin";
import { isAdmin, roleLabels, useAuth } from "@/lib/firebase/auth";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/config";
import { formatDate } from "@/lib/i18n/config";
import type { StaffMember, StaffRole } from "@/lib/types";

// Alt kateqoriyalar
const SUBCATEGORIES: Partial<Record<CategorySlug, string[]>> = {
  gundem: ["xəbərlər", "magazin", "mədəniyyət", "müsahibə"],
  moda: ["küçə modası", "aksesuar", "trend", "moda həftəsi"],
  gozellik: ["dəri qulluğu", "makiyaj", "saç", "wellness"],
  "heyat-terzi": ["səyahət", "yemək", "ev", "ailə", "qidalanma", "idman"],
  astrologiya: ["günlük", "həftəlik", "aylıq", "ulduz xəritəsi"],
  biznes: ["texnologiya", "karyera", "maliyyə", "startap"],
};

/** Bölmə məhdudiyyəti tətbiq olunan rollar (Firestore qaydası canWriteArticle ilə eyni) */
function usesCategories(role: StaffRole): boolean {
  return role === "author" || role === "editor";
}

const ROLE_HINTS: Record<StaffRole, string> = {
  admin:     "🔑 Tam icazə: işçilər, parametrlər, silmə, everything",
  editor:    "✍️ Seçilmiş bölmələrdə (boş qalsa hamısında) məqalə yazar və redaktə edir",
  author:    "📝 Yalnız təyin edilmiş bölmələrdə məqalə yazar",
  seo:       "🔍 SEO parametrləri, sitemap, redirects",
  sales:     "💼 CRM müştəriləri, reklam sifarişləri",
  finance:   "💰 Ödənişlər, invoice, gəlir hesabatları",
  analyst:   "📊 Analytics dashboard, hesabat ixracı",
  moderator: "🛡️ Məqalə və şərh moderasiyası",
};

const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  admin: ["Hamısı"],
  editor: ["Məqalələr", "Media", "E-jurnallar", "Bürc", "Content Plan"],
  author: ["Məqalələr (təyin edilmiş kateqoriyalar)", "Media"],
  seo: ["SEO Tools", "Analytics", "Redirects", "Sitemap"],
  sales: ["CRM", "Ad Orders", "Sales Forecast"],
  finance: ["Ad Orders (ödənişlər)", "Payments", "Invoices"],
  analyst: ["Analytics", "Subscribers", "Reports"],
  moderator: ["Məqalələr (moderasiya)", "Messages", "Comments"],
};

export default function StaffPage() {
  const { session, resetPassword } = useAuth();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  // Yeni işçi forması
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("author");
  const [allowed, setAllowed] = useState<CategorySlug[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Partial<Record<CategorySlug, string[]>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    try {
      setStaff(await listStaff());
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "İşçilər oxunmadı.",
      });
      setStaff([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (!isAdmin(session)) {
    return (
      <>
        <PageHeader title="İşçilər" />
        <div className="px-6 py-8 lg:px-10">
          <Empty
            title="Bu bölmə yalnız admin üçündür"
            text="İşçi əlavə etmək və rolları dəyişmək icazəsi yalnız admin hesabındadır."
          />
        </div>
      </>
    );
  }

  async function handleAdd() {
    if (!name.trim() || !email.trim()) {
      setMessage({ tone: "error", text: "Ad və e-poçt mütləqdir." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      // Mövcud sənədin üzərinə yazmamaq üçün yoxla
      const normalizedEmail = email.trim().toLowerCase();
      const db = getDb();
      if (db) {
        const existing = await getDoc(doc(db, COLLECTIONS.staff, normalizedEmail));
        if (existing.exists()) {
          setMessage({ tone: "error", text: "Bu e-poçt ilə işçi artıq mövcuddur." });
          return;
        }
      }
      await addStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        categories: usesCategories(role) ? allowed : [],
        subcategories: usesCategories(role) ? selectedSubcategories : {},
        active: true,
        createdAt: new Date().toISOString(),
        invitedBy: session?.email,
      });
      // Giriş hesabı panelin özündə yaradılır; işçiyə «şifrə təyin et» məktubu gedir
      let loginNote: string;
      try {
        const login = await provisionStaffLogin(normalizedEmail);
        loginNote =
          login === "created"
            ? `Giriş hesabı yaradıldı və ${normalizedEmail} ünvanına «şifrə təyin et» məktubu göndərildi.`
            : `Bu e-poçtla giriş hesabı artıq var — ${normalizedEmail} ünvanına şifrə yeniləmə məktubu göndərildi.`;
      } catch (loginError) {
        loginNote =
          "İşçi siyahıya əlavə olundu, amma giriş hesabı yaradılmadı: " +
          (loginError instanceof Error ? loginError.message : "naməlum xəta") +
          ". Siyahıdakı «Şifrə sıfırlama linki göndər» düyməsini sınayın.";
      }
      setName("");
      setEmail("");
      setRole("author");
      setAllowed([]);
      setSelectedSubcategories({});
      setMessage({
        tone: "success",
        text: `İşçi əlavə olundu. ${loginNote} Məktubdakı linklə şifrə qoyduqdan sonra daxil ola bilər.`,
      });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Əlavə olunmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  function startEdit(member: StaffMember) {
    setEditingId(member.id);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setAllowed(member.categories || []);
    setSelectedSubcategories(member.subcategories || {});
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("author");
    setAllowed([]);
    setSelectedSubcategories({});
  }

  async function handleUpdate() {
    if (!editingId) return;
    
    setBusy(true);
    setMessage(null);
    try {
      await saveStaff(editingId, {
        name: name.trim(),
        role,
        categories: usesCategories(role) ? allowed : [],
        subcategories: usesCategories(role) ? selectedSubcategories : {},
      });
      setMessage({ tone: "success", text: "Dəyişikliklər yadda saxlanıldı." });
      cancelEdit();
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Yenilənmədi.",
      });
    } finally {
      setBusy(false);
    }
  }

  function toggleCategory(cat: CategorySlug) {
    setAllowed((prev) => {
      const newAllowed = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      
      // Kateqoriya silinirsə, onun alt kateqoriyalarını da sil
      if (!newAllowed.includes(cat)) {
        setSelectedSubcategories((prevSub) => {
          const newSub = { ...prevSub };
          delete newSub[cat];
          return newSub;
        });
      }
      
      return newAllowed;
    });
  }

  function toggleSubcategory(cat: CategorySlug, sub: string) {
    setSelectedSubcategories((prev) => {
      const current = prev[cat] || [];
      const newSubs = current.includes(sub)
        ? current.filter((s) => s !== sub)
        : [...current, sub];
      
      return { ...prev, [cat]: newSubs };
    });
  }

  /** Admini (özünü və ya sonuncu aktiv admini) itirməmək üçün qoruma. */
  function adminGuardMessage(member: StaffMember, action: "deactivate" | "remove" | "demote"): string | null {
    const verb =
      action === "remove" ? "silə" : action === "deactivate" ? "dayandıra" : "rolunu dəyişə";
    if (member.email.toLowerCase() === session?.email.toLowerCase()) {
      return `Özünüzü ${verb} bilməzsiniz.`;
    }
    if (member.role === "admin" && member.active) {
      const activeAdmins = (staff ?? []).filter((m) => m.role === "admin" && m.active).length;
      if (activeAdmins <= 1) {
        return `Sonuncu aktiv admini ${verb} bilməzsiniz.`;
      }
    }
    return null;
  }

  async function handleResetPassword(member: StaffMember) {
    try {
      await resetPassword(member.email);
      setMessage({ tone: "success", text: `${member.email} ünvanına şifrə sıfırlama linki göndərildi.` });
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Şifrə sıfırlama linki göndərilmədi.",
      });
    }
  }

  async function toggleActive(member: StaffMember) {
    if (member.active) {
      const blocked = adminGuardMessage(member, "deactivate");
      if (blocked) {
        setMessage({ tone: "error", text: blocked });
        return;
      }
    }
    try {
      await saveStaff(member.id, { active: !member.active });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Dəyişiklik alınmadı.",
      });
    }
  }

  async function changeRole(member: StaffMember, nextRole: StaffRole) {
    if (member.role === "admin" && nextRole !== "admin") {
      const blocked = adminGuardMessage(member, "demote");
      if (blocked) {
        setMessage({ tone: "error", text: blocked });
        return;
      }
    }
    try {
      await saveStaff(member.id, {
        role: nextRole,
        categories: usesCategories(nextRole) ? member.categories : [],
      });
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Rol dəyişmədi.",
      });
    }
  }

  async function handleRemove(member: StaffMember) {
    const blocked = adminGuardMessage(member, "remove");
    if (blocked) {
      setMessage({ tone: "error", text: blocked });
      return;
    }
    if (!window.confirm(`${member.name} siyahıdan silinsin?`)) return;
    try {
      await removeStaff(member.id);
      await refresh();
    } catch (caught) {
      setMessage({
        tone: "error",
        text: caught instanceof Error ? caught.message : "Silinmədi.",
      });
    }
  }

  return (
    <>
      <PageHeader
        title="Yazarlar və İşçilər"
        description="Redaksiya heyəti, yazarlar və onların icazələri. Yazar buraya əlavə olunandan sonra Firebase-də hesabı yaradılır."
      />

      <div className="px-6 py-8 lg:px-10">
        {message && (
          <div className="mb-6">
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          {/* Yeni işçi */}
          <div className="xl:col-span-4">
            <Panel title={editingId ? "Yazarı redaktə et" : "Yeni yazar əlavə et"}>
              <div className="space-y-5">
                <Field label="Ad və soyad">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="E-poçt" hint={editingId ? "E-poçt dəyişdirilə bilməz" : "Panelə bu e-poçt ilə daxil olacaq."}>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                    placeholder="ad@nesreenmagazine.com"
                    disabled={!!editingId}
                  />
                </Field>

                <Field label="Rol" hint={ROLE_HINTS[role]}>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as StaffRole)}
                    className={inputClass}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Redaktor</option>
                    <option value="author">Yazar/Müəllif</option>
                  </select>
                </Field>

                {usesCategories(role) && (
                  <div className="space-y-4">
                    <Field
                      label="Hansı bölmələrdə yaza bilər"
                      hint="Heç biri seçilməsə, bütün bölmələr açıq olur."
                    >
                      <div className="space-y-3">
                        {categories.map((category) => (
                          <div key={category.slug} className="border border-line bg-cream-deep/30 p-3">
                            <label className="flex items-center gap-3 font-ui text-[13px] text-ink">
                              <input
                                type="checkbox"
                                checked={allowed.includes(category.slug)}
                                onChange={() => toggleCategory(category.slug)}
                                className="h-4 w-4 accent-bordo"
                              />
                              <span className="font-semibold">{category.name.az}</span>
                            </label>

                            {/* Alt kateqoriyalar */}
                            {allowed.includes(category.slug) && SUBCATEGORIES[category.slug] && SUBCATEGORIES[category.slug]!.length > 0 && (
                              <div className="ml-7 mt-2 space-y-2 border-l-2 border-gold/30 pl-3">
                                <p className="font-ui text-[11px] uppercase tracking-wide text-muted">
                                  Alt kateqoriyalar:
                                </p>
                                {SUBCATEGORIES[category.slug]!.map((sub) => (
                                  <label
                                    key={sub}
                                    className="flex items-center gap-2 font-ui text-[12px] text-ink-soft"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedSubcategories[category.slug]?.includes(sub)}
                                      onChange={() => toggleSubcategory(category.slug, sub)}
                                      className="h-3.5 w-3.5 accent-gold"
                                    />
                                    {sub}
                                  </label>
                                ))}
                                {selectedSubcategories[category.slug]?.length === 0 && (
                                  <p className="font-ui text-[11px] italic text-muted">
                                    Heç biri seçilməyibsə bütün alt kateqoriyalara icazə var
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                <div className="flex gap-2">
                  {editingId ? (
                    <>
                      <Button onClick={() => void handleUpdate()} disabled={busy} className="flex-1">
                        {busy ? "Yenilənir…" : "Dəyişiklikləri yadda saxla"}
                      </Button>
                      <Button variant="ghost" onClick={cancelEdit} disabled={busy}>
                        Ləğv et
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => void handleAdd()} disabled={busy} className="w-full">
                      {busy ? "Əlavə olunur…" : "Yazar əlavə et"}
                    </Button>
                  )}
                </div>
              </div>
            </Panel>

            <div className="mt-6">
              <Alert>
                <strong>Vacib:</strong> yazarı buraya əlavə etdikdən sonra Firebase konsolunda
                <em> Authentication → Users → Add user</em> bölməsindən eyni e-poçt üçün hesab
                yaradın və şifrəni ona göndərin. Şifrəni sonra özü dəyişə bilər.
              </Alert>
            </div>
          </div>

          {/* Siyahı */}
          <div className="xl:col-span-8">
            <Panel title="Redaksiya heyəti və yazarlar">
              {!staff ? (
                <p className="py-12 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : staff.length === 0 ? (
                <Empty
                  title="Hələ yazar əlavə edilməyib"
                  text="Siz .env.local faylındakı NEXT_PUBLIC_ADMIN_EMAILS siyahısı sayəsində admin kimi giriş etmisiniz."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {staff.map((member) => (
                    <li key={member.id} className="py-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg text-ink">{member.name}</p>
                          <p className="mt-0.5 font-ui text-[12.5px] text-muted">
                            {member.email}
                          </p>
                          
                          {/* Kateqoriyalar və alt kateqoriyalar */}
                          {member.categories && member.categories.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {member.categories.map((catSlug) => {
                                const cat = categories.find((c) => c.slug === catSlug);
                                const subs = member.subcategories?.[catSlug] || [];
                                
                                return (
                                  <div key={catSlug} className="border-l-2 border-gold/50 pl-3">
                                    <p className="font-ui text-[12px] font-semibold text-ink">
                                      {cat?.name.az || catSlug}
                                    </p>
                                    {subs.length > 0 && (
                                      <p className="mt-0.5 font-ui text-[11px] text-muted">
                                        Alt kateqoriyalar: {subs.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {(!member.categories || member.categories.length === 0) && usesCategories(member.role) && (
                            <p className="mt-2 font-ui text-[11.5px] text-muted">
                              Bütün bölmələr və kateqoriyalar
                            </p>
                          )}

                          <p className="mt-2 font-ui text-[11.5px] text-muted">
                            {member.createdAt &&
                              `Əlavə edildi: ${formatDate(member.createdAt.slice(0, 10), "az")}`}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(event) =>
                              void changeRole(member, event.target.value as StaffRole)
                            }
                            className="border border-line bg-paper px-3 py-2 font-ui text-[12px] text-ink focus:border-bordo focus:outline-none"
                            aria-label={`${member.name} rolu`}
                          >
                            <option value="admin">{roleLabels.admin}</option>
                            <option value="editor">{roleLabels.editor}</option>
                            <option value="author">{roleLabels.author}</option>
                          </select>

                          <Button
                            variant="ghost"
                            onClick={() => startEdit(member)}
                          >
                            Redaktə
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={() => void toggleActive(member)}
                          >
                            {member.active ? "Dayandır" : "Aktiv et"}
                          </Button>

                          <Button variant="ghost" onClick={() => void handleResetPassword(member)}>
                            Şifrə sıfırlama linki göndər
                          </Button>

                          <Button variant="danger" onClick={() => void handleRemove(member)}>
                            Sil
                          </Button>
                        </div>
                      </div>

                      {!member.active && (
                        <p className="mt-3 inline-block border border-line bg-cream-deep px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.14em] text-muted">
                          Dayandırılıb
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
