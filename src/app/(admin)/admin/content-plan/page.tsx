"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  listContentPlan,
  addContentPlanItem,
  saveContentPlanItem,
  removeContentPlanItem,
  listStaff,
} from "@/lib/data/admin";
import type { ContentPlanItem, ContentPlanItemInput, ContentPlanStatus, StaffMember } from "@/lib/types";
import { contentPlanStatusLabels } from "@/lib/types";
import { categories } from "@/lib/categories";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Empty,
  PageHeader,
  Field,
  inputClass,
} from "@/components/admin/ui";

/* ── rəng xəritəsi ────────────────────────────────────────────────────── */
const statusColors: Record<ContentPlanStatus, string> = {
  idea: "border-gray-300 bg-gray-50 text-gray-600",
  assigned: "border-blue-300 bg-blue-50 text-blue-700",
  writing: "border-yellow-300 bg-yellow-50 text-yellow-700",
  review: "border-orange-300 bg-orange-50 text-orange-700",
  ready: "border-green-300 bg-green-50 text-green-700",
  published: "border-green-500 bg-green-100 text-green-800",
};

const STATUSES: ContentPlanStatus[] = ["idea", "assigned", "writing", "review", "ready", "published"];

/* ── köməkçi: gecikib? ──────────────────────────────────────────────────── */
function isOverdue(item: ContentPlanItem) {
  if (item.status === "published") return false;
  if (!item.dueDate) return false;
  return new Date(item.dueDate) < new Date();
}

/* ── boş forma ──────────────────────────────────────────────────────────── */
function emptyForm(): Omit<ContentPlanItemInput, "createdBy" | "createdAt"> {
  return {
    title: "",
    category: "",
    assignedTo: "",
    status: "idea",
    dueDate: "",
    notes: "",
  };
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
function PlanModal({
  editing,
  staff,
  onClose,
  onSaved,
  userEmail,
}: {
  editing: ContentPlanItem | null;
  staff: StaffMember[];
  onClose: () => void;
  onSaved: () => void;
  userEmail: string;
}) {
  const [form, setForm] = useState(editing ? { ...editing } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Başlıq mütləqdir.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await saveContentPlanItem(editing.id, form as Partial<ContentPlanItemInput>);
      } else {
        await addContentPlanItem({
          ...(form as Omit<ContentPlanItemInput, "createdBy" | "createdAt">),
          createdBy: userEmail,
          createdAt: new Date().toISOString(),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-paper border border-line shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-xl">
            {editing ? "Tapşırığı redaktə et" : "Yeni tapşırıq"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-6 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <Field label="Başlıq *">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Məqalənin mövzusu..."
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kateqoriya">
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name.az}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {contentPlanStatusLabels[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Məsul şəxs">
              <select className={inputClass} value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
                <option value="">Təyin edilməyib</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.email}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Son tarix">
              <input
                className={inputClass}
                type="date"
                value={form.dueDate?.slice(0, 10) || ""}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Qeydlər">
            <textarea
              className={inputClass}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Açar sözlər, məqsəd, mənbələr..."
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saxlanılır…" : editing ? "Yadda saxla" : "Əlavə et"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function ContentPlanPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<ContentPlanItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPlanItem | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentPlanStatus | "all">("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  async function load() {
    setLoading(true);
    try {
      const [i, s] = await Promise.all([listContentPlan(), listStaff()]);
      setItems(i);
      setStaff(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu tapşırığı silmək istəyirsiniz?")) return;
    try {
      await removeContentPlanItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Silinmə xətası baş verdi.");
    }
  }

  function openEdit(item: ContentPlanItem) {
    setEditingItem(item);
    setModal(true);
  }

  function openNew() {
    setEditingItem(null);
    setModal(true);
  }

  function handleSaved() {
    setModal(false);
    setEditingItem(null);
    void load();
  }

  const filtered = items.filter((i) => {
    const matchSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Statuslara görə qrup
  const byStatus = STATUSES.reduce<Record<ContentPlanStatus, ContentPlanItem[]>>(
    (acc, s) => {
      acc[s] = filtered.filter((i) => i.status === s);
      return acc;
    },
    {} as Record<ContentPlanStatus, ContentPlanItem[]>
  );

  // Statistika
  const overdueCount = items.filter(isOverdue).length;
  const readyCount = items.filter((i) => i.status === "ready").length;

  return (
    <>
      <PageHeader
        title="Kontent Planı"
        description="Redaksiya təqvimi və tapşırıq idarəetməsi."
        actions={<Button onClick={openNew}>+ Yeni tapşırıq</Button>}
      />

      <div className="px-6 py-6 lg:px-10">
        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: "Ümumi tapşırıq", value: items.length },
            { label: "Dərcə hazır", value: readyCount },
            { label: "Yazılır", value: items.filter((i) => i.status === "writing").length },
            {
              label: "Gecikmiş",
              value: overdueCount,
              warn: overdueCount > 0,
            },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className={`mt-1 font-display text-3xl ${stat.warn ? "text-bordo" : "text-ink"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Xəbərdarlıq */}
        {overdueCount > 0 && (
          <Alert tone="error" className="mb-5">
            ⚠️ <strong>{overdueCount}</strong> tapşırığın son tarixi keçib.
          </Alert>
        )}

        {/* Axtarış + filter */}
        <div className="mb-5 flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[200px]"
            placeholder="Başlıq, məsul şəxs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink focus:border-bordo focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentPlanStatus | "all")}
          >
            <option value="all">Bütün statuslar</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {contentPlanStatusLabels[s]}
              </option>
            ))}
          </select>
          <div className="flex border border-line">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${view === "list" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"}`}
            >
              Siyahı
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${view === "calendar" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"}`}
            >
              Kanban
            </button>
          </div>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {loading && <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>}

        {/* Siyahı görünüşü */}
        {!loading && view === "list" && (
          <>
            {filtered.length === 0 ? (
              <Empty title="Tapşırıq tapılmadı" text="Yeni tapşırıq əlavə edin və ya axtarışı dəyişin." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-line">
                  <thead className="bg-paper border-b border-line">
                    <tr>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Başlıq
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Kateqoriya
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Məsul
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Son tarix
                      </th>
                      <th className="px-4 py-3 text-center font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Status
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((item) => {
                      const overdue = isOverdue(item);
                      const cat = categories.find((c) => c.slug === item.category);
                      return (
                        <tr key={item.id} id={item.id} className="bg-paper hover:bg-cream/30">
                          <td className="px-4 py-3">
                            <p className="font-display text-[14px] text-ink">{item.title}</p>
                            {item.articleId && (
                              <Link
                                href={`/admin/articles/${item.articleId}`}
                                className="font-ui text-[11px] text-bordo hover:underline"
                              >
                                → Məqaləyə keç
                              </Link>
                            )}
                          </td>
                          <td className="px-4 py-3 font-ui text-[13px] text-muted">
                            {cat?.name.az || "—"}
                          </td>
                          <td className="px-4 py-3 font-ui text-[13px] text-muted">
                            {item.assignedTo || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {item.dueDate ? (
                              <p
                                className={`font-ui text-[13px] ${overdue ? "text-red-600 font-semibold" : "text-muted"}`}
                              >
                                {new Date(item.dueDate).toLocaleDateString("az-AZ")}
                                {overdue && " ⚠️"}
                              </p>
                            ) : (
                              <span className="font-ui text-[13px] text-muted">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${statusColors[item.status]}`}
                            >
                              {contentPlanStatusLabels[item.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                              >
                                Redaktə
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(item.id)}
                                className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo"
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Kanban görünüşü */}
        {!loading && view === "calendar" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUSES.map((status) => (
              <div key={status} className="shrink-0 w-72">
                <div className={`mb-3 flex items-center gap-2 border px-3 py-2 ${statusColors[status]}`}>
                  <span className="font-ui text-[11px] uppercase tracking-[0.12em] font-semibold">
                    {contentPlanStatusLabels[status]}
                  </span>
                  <span className="ml-auto font-ui text-[11px]">{byStatus[status].length}</span>
                </div>
                <div className="space-y-3">
                  {byStatus[status].length === 0 && (
                    <p className="border border-dashed border-line px-4 py-6 text-center font-ui text-[12px] text-muted">
                      Boşdur
                    </p>
                  )}
                  {byStatus[status].map((item) => {
                    const overdue = isOverdue(item);
                    const cat = categories.find((c) => c.slug === item.category);
                    return (
                      <div key={item.id} className="border border-line bg-paper p-4 hover:border-bordo/40 transition-colors">
                        <p className="font-display text-[15px] text-ink line-clamp-2">{item.title}</p>
                        {cat && (
                          <p className="mt-1 font-ui text-[11px] text-muted">{cat.name.az}</p>
                        )}
                        {item.assignedTo && (
                          <p className="mt-2 font-ui text-[12px] text-muted">👤 {item.assignedTo}</p>
                        )}
                        {item.dueDate && (
                          <p className={`mt-1 font-ui text-[12px] ${overdue ? "text-red-600 font-semibold" : "text-muted"}`}>
                            📅 {new Date(item.dueDate).toLocaleDateString("az-AZ")}
                            {overdue && " ⚠️"}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2 border-t border-line pt-3">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                          >
                            Redaktə
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item.id)}
                            className="ml-auto font-ui text-[11px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <PlanModal
          editing={editingItem}
          staff={staff}
          onClose={() => {
            setModal(false);
            setEditingItem(null);
          }}
          onSaved={handleSaved}
          userEmail={session?.email ?? ""}
        />
      )}
    </>
  );
}
