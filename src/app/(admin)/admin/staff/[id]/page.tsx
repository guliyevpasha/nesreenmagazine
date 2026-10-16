"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { listArticles, listStaff, saveStaff } from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import { categories } from "@/lib/categories";
import { formatDate } from "@/lib/i18n/config";
import type { Article, StaffMember, StaffRole } from "@/lib/types";
import { roleLabels } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  Panel,
  StatusPill,
  inputClass,
} from "@/components/admin/ui";

const ROLES: StaffRole[] = [
  "admin", "editor", "author", "seo", "sales", "finance", "analyst", "moderator",
];

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [member, setMember] = useState<StaffMember | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Redaktə forması */
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<StaffRole>("author");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [staff, allArticles] = await Promise.all([
          listStaff(),
          listArticles(),
        ]);
        const found = staff.find((s) => s.id === id);
        if (!found) { router.push("/admin/staff"); return; }
        setMember(found);
        setEditName(found.name);
        setEditRole(found.role);
        setEditActive(found.active);
        // Bu müəllifə aid məqalələr
        setArticles(allArticles.filter((a) => a.author === found.email || a.author === found.name));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklənmə xətası");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !isAdmin(session)) return;
    setSaving(true);
    setError("");
    try {
      await saveStaff(member.id, { name: editName, role: editRole, active: editActive });
      setMember((prev) => prev ? { ...prev, name: editName, role: editRole, active: editActive } : prev);
      setSuccess("Profil yeniləndi.");
      setEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlama xətası.");
    } finally {
      setSaving(false);
    }
  }

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.length - published;

  if (loading) return <div className="py-24 text-center font-ui text-[13px] text-muted">Yüklənir…</div>;
  if (!member) return null;

  return (
    <>
      <PageHeader
        title={member.name || member.email}
        description={`${roleLabels[member.role]} · ${member.email}`}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/staff"><Button variant="ghost">← Geri</Button></Link>
            {isAdmin(session) && (
              <Button onClick={() => setEditOpen(!editOpen)}>
                {editOpen ? "Ləğv et" : "Redaktə et"}
              </Button>
            )}
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {/* Redaktə forması */}
        {editOpen && isAdmin(session) && (
          <Panel title="Profili redaktə et">
            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Ad Soyad">
                  <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} />
                </Field>
                <Field label="Rol">
                  <select className={inputClass} value={editRole} onChange={(e) => setEditRole(e.target.value as StaffRole)}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <label className="flex items-center gap-2 font-ui text-[13px] text-ink mt-2 cursor-pointer">
                    <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="h-4 w-4 accent-bordo" />
                    Aktiv
                  </label>
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? "Saxlanılır…" : "Yadda saxla"}</Button>
              </div>
            </form>
          </Panel>
        )}

        {/* Profil məlumatları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ümumi məqalə", value: articles.length },
            { label: "Dərc olunmuş", value: published },
            { label: "Qaralama", value: drafts },
            { label: "Status", value: member.active ? "Aktiv" : "Deaktiv" },
          ].map((s) => (
            <div key={s.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Rol və kateqoriyalar */}
        <Panel title="İcazələr">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="font-ui text-[12px] text-muted w-24">Rol:</p>
              <span className="border border-line bg-cream-deep px-3 py-1 font-ui text-[12px] text-ink">
                {roleLabels[member.role]}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <p className="font-ui text-[12px] text-muted w-24 mt-0.5">Bölmələr:</p>
              {member.categories.length === 0 ? (
                <span className="font-ui text-[12px] text-muted">Bütün bölmələr</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {member.categories.map((cat) => (
                    <span key={cat} className="border border-line px-2 py-0.5 font-ui text-[11px] text-muted">
                      {categories.find((c) => c.slug === cat)?.name.az ?? cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Məqalələr */}
        <Panel title={`Məqalələr (${articles.length})`}>
          {articles.length === 0 ? (
            <p className="font-ui text-[13px] text-muted py-4">Bu müəllif hələ məqalə yazmayıb.</p>
          ) : (
            <div className="space-y-0">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center justify-between border-b border-line py-3 hover:text-bordo transition-colors last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15px] line-clamp-1">
                      {article.title.az || article.title.en || article.slug}
                    </p>
                    <p className="font-ui text-[11px] text-muted mt-0.5">
                      {categories.find((c) => c.slug === article.category)?.name.az} ·{" "}
                      {formatDate(article.publishedAt, "az")}
                    </p>
                  </div>
                  <StatusPill status={article.status} />
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
