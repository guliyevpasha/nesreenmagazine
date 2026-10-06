"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Empty,
  Field,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";
import { categories, type CategorySlug } from "@/lib/categories";
import { addStaff, listStaff, removeStaff, saveStaff } from "@/lib/data/admin";
import { isAdmin, roleLabels, useAuth } from "@/lib/firebase/auth";
import { formatDate } from "@/lib/i18n/config";
import type { StaffMember, StaffRole } from "@/lib/types";

const ROLE_HINTS: Record<StaffRole, string> = {
  admin: "Hər şeyi görür və dəyişir: işçilər, bannerlər, silmə.",
  editor: "Bütün bölmələrdə məqalə yazır və redaktə edir.",
  author: "Yalnız ona açılan bölmələrdə yazır.",
};

export default function StaffPage() {
  const { session } = useAuth();
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
      await addStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        categories: role === "author" ? allowed : [],
        active: true,
        createdAt: new Date().toISOString(),
        invitedBy: session?.email,
      });
      setName("");
      setEmail("");
      setRole("author");
      setAllowed([]);
      setMessage({
        tone: "success",
        text: "İşçi əlavə olundu. İndi Firebase → Authentication → Users bölməsində həmin e-poçt üçün hesab yaradın və şifrəni ona göndərin.",
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

  async function toggleActive(member: StaffMember) {
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
    try {
      await saveStaff(member.id, {
        role: nextRole,
        categories: nextRole === "author" ? member.categories : [],
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
        title="İşçilər"
        description="Redaksiya heyəti və onların icazələri. İşçi buraya əlavə olunandan sonra Firebase-də hesabı yaradılır."
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
            <Panel title="Yeni işçi əlavə et">
              <div className="space-y-5">
                <Field label="Ad və soyad">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="E-poçt" hint="Panelə bu e-poçt ilə daxil olacaq.">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                    placeholder="ad@nesreenmagazine.com"
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
                    <option value="author">Müəllif</option>
                  </select>
                </Field>

                {role === "author" && (
                  <Field
                    label="Hansı bölmələrdə yaza bilər"
                    hint="Heç biri seçilməsə, bütün bölmələr açıq olur."
                  >
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label
                          key={category.slug}
                          className="flex items-center gap-3 font-ui text-[13px] text-ink"
                        >
                          <input
                            type="checkbox"
                            checked={allowed.includes(category.slug)}
                            onChange={(event) =>
                              setAllowed((current) =>
                                event.target.checked
                                  ? [...current, category.slug]
                                  : current.filter((slug) => slug !== category.slug),
                              )
                            }
                            className="h-4 w-4 accent-[#7b2233]"
                          />
                          {category.name.az}
                        </label>
                      ))}
                    </div>
                  </Field>
                )}

                <Button onClick={() => void handleAdd()} disabled={busy} className="w-full">
                  {busy ? "Əlavə olunur…" : "Əlavə et"}
                </Button>
              </div>
            </Panel>

            <div className="mt-6">
              <Alert>
                <strong>Vacib:</strong> işçini buraya əlavə etdikdən sonra Firebase konsolunda
                <em> Authentication → Users → Add user</em> bölməsindən eyni e-poçt üçün hesab
                yaradın və şifrəni ona göndərin. Şifrəni sonra özü dəyişə bilər.
              </Alert>
            </div>
          </div>

          {/* Siyahı */}
          <div className="xl:col-span-8">
            <Panel title="Redaksiya heyəti">
              {!staff ? (
                <p className="py-12 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
              ) : staff.length === 0 ? (
                <Empty
                  title="Hələ işçi əlavə edilməyib"
                  text="Siz .env.local faylındakı NEXT_PUBLIC_ADMIN_EMAILS siyahısı sayəsində admin kimi giriş etmisiniz."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {staff.map((member) => (
                    <li key={member.id} className="py-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-display text-lg text-ink">{member.name}</p>
                          <p className="mt-0.5 font-ui text-[12.5px] text-muted">
                            {member.email}
                          </p>
                          <p className="mt-2 font-ui text-[11.5px] text-muted">
                            {member.categories.length > 0
                              ? member.categories
                                  .map(
                                    (slug) =>
                                      categories.find((c) => c.slug === slug)?.name.az ?? slug,
                                  )
                                  .join(" · ")
                              : "Bütün bölmələr"}
                            {member.createdAt &&
                              ` · ${formatDate(member.createdAt.slice(0, 10), "az")}`}
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
                            onClick={() => void toggleActive(member)}
                          >
                            {member.active ? "Dayandır" : "Aktiv et"}
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
