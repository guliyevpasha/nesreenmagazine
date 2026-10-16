"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  addContentPlanItem,
  listContentPlan,
  removeContentPlanItem,
  saveContentPlanItem,
} from "@/lib/data/admin";
import { listStaff } from "@/lib/data/admin";
import type {
  ContentPlanItem,
  ContentPlanItemInput,
  ContentPlanStatus,
} from "@/lib/types";
import { contentPlanStatusLabels } from "@/lib/types";
import { categories } from "@/lib/categories";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Empty,
  Field,
  PageHeader,
  inputClass,
} from "@/components/admin/ui";
import type { StaffMember } from "@/lib/types";

/* ── sabit məlumatlar ────────────────────────────────────────────────────── */
const STATUSES: ContentPlanStatus[] = [
  "idea", "assigned", "writing", "review", "ready", "published",
];

const statusColors: Record<ContentPlanStatus, string> = {
  idea:      "bg-gray-100 border-gray-200 text-gray-600",
  assigned:  "bg-blue-50 border-blue-200 text-blue-700",
  writing:   "bg-yellow-50 border-yellow-200 text-yellow-700",
  review:    "bg-orange-50 border-orange-200 text-orange-700",
  ready:     "bg-purple-50 border-purple-200 text-purple-700",
  published: "bg-green-50 border-green-200 text-green-700",
};

const statusDot: Record<ContentPlanStatus, string> = {
  idea:      "bg-gray-400",
  assigned:  "bg-blue-400",
  writing:   "bg-yellow-400",
  review:    "bg-orange-400",
  ready:     "bg-purple-400",
  published: "bg-green-500",
};

/* ── köməkçilər ──────────────────────────────────────────────────────────── */
function isOverdue(item: ContentPlanItem): boolean {
  if (item.status === "published") return false;
  if (!item.dueDate) return false;
  return new Date(item.dueDate) < new Date();
}

function daysLeft(dueDate: string): number {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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

/* ── Plan kartı ─────────────────────────────────────────────────────────── */
function PlanCard({
  item,
  staffMap,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  item: ContentPlanItem;
  staffMap: Record<string, string>;
  onStatusChange: (id: string, status: ContentPlanStatus) => void;
  onEdit: (item: ContentPlanItem) => void;
  onDelete: (id: string) => void;
}) {
  const overdue = isOverdue(item);
  const days = item.dueDate ? daysLeft(item.dueDate) : null;
  const catLabel = categories.find((c) => c.slug === item.category)?.name.az ?? item.category;

  return (
    <div className={`border bg-paper p-4 transition-colors ${overdue ? "border-red-300 bg-red-50/20" : "border-line hover:border-bordo/30"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] text-ink line-clamp-2">{item.title}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {item.category && (
              <span className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted bg-cream-deep border border-line px-2 py-0.5">
                {catLabel}
              </span>
            )}
            {item.assignedTo && (
              <span className="font-ui text-[11px] text-muted">
                👤 {staffMap[item.assignedTo] ?? item.assignedTo}
              </span>
            )}
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${statusColors[item.status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[item.status]}`} />
          {contentPlanStatusLabels[item.status]}
        </span>
      </div>

      {/* Son tarix */}
      {item.dueDate && (
        <div className={`mt-2 font-ui text-[11px] ${overdue ? "text-red-600 font-semibold" : days !== null && days <= 3 ? "text-orange-600" : "text-muted"}`}>
          {overdue
            ? `⚠ Gecikib (${item.dueDate.slice(0, 10)})`
            : days !== null && days <= 3
            ? `⏰ ${days} gün qaldı`
            : `📅 ${item.dueDate.slice(0, 10)}`}
        </div>
      )}

      {item.notes && (
        <p className="mt-2 font-ui text-[12px] text-ink-soft line-clamp-2">{item.notes}</p>
      )}

      {/* Əməliyyatlar */}
      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
        <select
          className={`border px-2 py-1 font-ui text-[10px] focus:outline-none ${statusColors[item.status]}`}
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as ContentPlanStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{contentPlanStatusLabels[s]}</option>
          ))}
        </select>
        {item.articleId && (
          <Link
            href={`/admin/articles/${item.articleId}`}
            className="font-ui text-[11px] text-bordo hover:underline"
          >
            Məqaləyə bax
          </Link>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="font-ui text-[11px] text-muted hover:text-ink transition-colors"
          >
            Redaktə
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="font-ui text-[11px] text-bordo/60 hover:text-bordo transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Plan forması modal ──────────────────────────────────────────────────── */
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
  const [form, setForm] = useState<Omit<ContentPlanItemInput, "createdBy" | "createdAt">>(
    editing
      ? {
          title: editing.title,
          category: editing.category,
          assignedTo: editing.assignedTo,
          status: editing.status,
          dueDate: editing.dueDate,
          notes: editing.notes,
          articleId: editing.articleId,
        }
      : emptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Başlıq mütləqdir."); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await saveContentPlanItem(editing.id, form);
      } else {
        await addContentPlanItem({
          ...form,
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
            {editing ? "Tapşırığı redaktə et" : "Yeni kontent tapşırığı"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink text-xl leading-none">×</button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-6 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <Field label="Başlıq *">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Məqalə başlığı və ya mövzu..."
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kateqoriya">
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Seçin...</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name.az}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value as ContentPlanStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{contentPlanStatusLabels[s]}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Müəllif">
              <select
                className={inputClass}
                value={form.assignedTo}
                onChange={(e) => set("assignedTo", e.target.value)}
              >
                <option value="">Seçin...</option>
                {staff.map((s) => (
                  <option key={s.email} value={s.email}>{s.name || s.email}</option>
                ))}
              </select>
            </Field>
            <Field label="Son tarix">
              <input
                className={inputClass}
                type="date"
                value={form.dueDate}
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
              placeholder="Mövzu haqqında qeydlər, mənbələr..."
            />
          </Field>

          {editing && (
            <Field label="Məqalə ID (dərc olunandan sonra)">
              <input
                className={inputClass}
                value={form.articleId ?? ""}
                onChange={(e) => set("articleId", e.target.value || undefined)}
                placeholder="Firestore məqalə ID-si"
              />
            </Field>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Ləğv et</Button>
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
  const [editing, setEditing] = useState<ContentPlanItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContentPlanStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [view, setView] = useState<"board" | "list">("board");

  async function load() {
    setLoading(true);
    try {
      const [planItems, staffList] = await Promise.all([
        listContentPlan(),
        listStaff(),
      ]);
      setItems(planItems);
      setStaff(staffList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  /* Müəllif adı xəritəsi */
  const staffMap = Object.fromEntries(
    staff.map((s) => [s.email, s.name || s.email]),
  );

  async function handleStatusChange(id: string, status: ContentPlanStatus) {
    await saveContentPlanItem(id, { status });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu tapşırığı silmək istəyirsiniz?")) return;
    await removeContentPlanItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function openEdit(item: ContentPlanItem) {
    setEditing(item);
    setModal(true);
  }

  function openNew() {
    setEditing(null);
    setModal(true);
  }

  function handleSaved() {
    setModal(false);
    setEditing(null);
    void load();
  }

  /* Filtr */
  const filtered = items.filter((item) => {
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchCat = !filterCategory || item.category === filterCategory;
    const matchAssigned = !filterAssigned || item.assignedTo === filterAssigned;
    return matchStatus && matchCat && matchAssigned;
  });

  /* Board görünüşü üçün status qruplaşması */
  const byStatus = STATUSES.reduce<Record<ContentPlanStatus, ContentPlanItem[]>>(
    (acc, s) => {
      acc[s] = filtered.filter((i) => i.status === s);
      return acc;
    },
    {} as Record<ContentPlanStatus, ContentPlanItem[]>,
  );

  /* Statistika */
  const overdueCount = items.filter(isOverdue).length;
  const dueSoon = items.filter((i) => {
    if (i.status === "published" || !i.dueDate) return false;
    const d = daysLeft(i.dueDate);
    return d >= 0 && d <= 3;
  }).length;

  return (
    <>
      <PageHeader
        title="Kontent Planı"
        description="Redaksiya tapşırıqları, dərc cədvəli və müəllif iş axını."
        actions={<Button onClick={openNew}>+ Yeni tapşırıq</Button>}
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* Xülasə kartları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ümumi tapşırıq", value: items.length },
            { label: "Hazır / Dərc", value: items.filter((i) => i.status === "ready" || i.status === "published").length },
            { label: "Son gün (3 gün)", value: dueSoon, warn: dueSoon > 0 },
            { label: "Gecikmiş", value: overdueCount, warn: overdueCount > 0 },
          ].map((stat) => (
            <div key={stat.label} className={`border px-5 py-4 bg-paper ${stat.warn ? "border-red-300 bg-red-50/30" : "border-line"}`}>
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{stat.label}</p>
              <p className={`mt-1 font-display text-3xl ${stat.warn ? "text-red-600" : "text-ink"}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {/* Filtrlər + görünüş */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ContentPlanStatus | "all")}
          >
            <option value="all">Bütün statuslar</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{contentPlanStatusLabels[s]}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Bütün kateqoriyalar</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name.az}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterAssigned}
            onChange={(e) => setFilterAssigned(e.target.value)}
          >
            <option value="">Bütün müəlliflər</option>
            {staff.map((s) => (
              <option key={s.email} value={s.email}>{s.name || s.email}</option>
            ))}
          </select>
          <div className="ml-auto flex border border-line">
            <button
              type="button"
              onClick={() => setView("board")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${view === "board" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"}`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${view === "list" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"}`}
            >
              Siyahı
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {/* Board görünüşü */}
        {!loading && view === "board" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUSES.map((status) => (
              <div key={status} className="shrink-0 w-64">
                <div className={`mb-3 flex items-center gap-2 border px-3 py-2 ${statusColors[status]}`}>
                  <span className={`h-2 w-2 rounded-full ${statusDot[status]}`} />
                  <span className="font-ui text-[11px] uppercase tracking-[0.12em] font-semibold flex-1">
                    {contentPlanStatusLabels[status]}
                  </span>
                  <span className="font-ui text-[11px]">{byStatus[status].length}</span>
                </div>
                <div className="space-y-3">
                  {byStatus[status].length === 0 ? (
                    <p className="border border-dashed border-line px-4 py-6 text-center font-ui text-[12px] text-muted">Boşdur</p>
                  ) : (
                    byStatus[status].map((item) => (
                      <PlanCard
                        key={item.id}
                        item={item}
                        staffMap={staffMap}
                        onStatusChange={(id, s) => void handleStatusChange(id, s)}
                        onEdit={openEdit}
                        onDelete={(id) => void handleDelete(id)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Siyahı görünüşü */}
        {!loading && view === "list" && (
          <>
            {filtered.length === 0 ? (
              <Empty title="Tapşırıq tapılmadı" text="Yeni kontent tapşırığı əlavə edin." />
            ) : (
              <div className="border border-line bg-paper overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-line bg-cream-deep">
                      {["Başlıq", "Kateqoriya", "Müəllif", "Status", "Son tarix", "Əməliyyat"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-ui text-[10px] uppercase tracking-[0.14em] text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const overdue = isOverdue(item);
                      const days = item.dueDate ? daysLeft(item.dueDate) : null;
                      return (
                        <tr key={item.id} className={`border-b border-line hover:bg-cream-deep/40 transition-colors ${overdue ? "bg-red-50/20" : ""}`}>
                          <td className="px-4 py-3">
                            <p className="font-ui text-[13px] text-ink font-medium line-clamp-1">{item.title}</p>
                            {item.notes && <p className="font-ui text-[11px] text-muted line-clamp-1">{item.notes}</p>}
                          </td>
                          <td className="px-4 py-3 font-ui text-[12px] text-muted">
                            {categories.find((c) => c.slug === item.category)?.name.az ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-ui text-[12px] text-muted">
                            {staffMap[item.assignedTo] ?? item.assignedTo ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className={`border px-2 py-1 font-ui text-[10px] focus:outline-none ${statusColors[item.status]}`}
                              value={item.status}
                              onChange={(e) => void handleStatusChange(item.id, e.target.value as ContentPlanStatus)}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{contentPlanStatusLabels[s]}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-ui text-[12px] ${overdue ? "text-red-600 font-semibold" : days !== null && days <= 3 ? "text-orange-600" : "text-muted"}`}>
                              {item.dueDate ? (overdue ? `⚠ ${item.dueDate.slice(0, 10)}` : item.dueDate.slice(0, 10)) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => openEdit(item)} className="font-ui text-[11px] text-muted hover:text-ink transition-colors">Redaktə</button>
                              <button type="button" onClick={() => void handleDelete(item.id)} className="font-ui text-[11px] text-bordo/60 hover:text-bordo transition-colors">Sil</button>
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
      </div>

      {modal && (
        <PlanModal
          editing={editing}
          staff={staff}
          onClose={() => { setModal(false); setEditing(null); }}
          onSaved={handleSaved}
          userEmail={session?.email ?? ""}
        />
      )}
    </>
  );
}
