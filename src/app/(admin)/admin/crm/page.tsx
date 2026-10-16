"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  addCrmClient,
  listCrmClients,
  removeCrmClient,
  saveCrmClient,
} from "@/lib/data/admin";
import type { CrmClient, CrmClientInput, DealStage } from "@/lib/types";
import {
  dealStageLabels,
} from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Empty,
  Field,
  PageHeader,
  inputClass,
  labelClass,
} from "@/components/admin/ui";

/* ── rəng xəritəsi ────────────────────────────────────────────────────── */
const stageColors: Record<DealStage, string> = {
  new:         "bg-blue-50 border-blue-200 text-blue-700",
  contacted:   "bg-yellow-50 border-yellow-200 text-yellow-700",
  proposal:    "bg-orange-50 border-orange-200 text-orange-700",
  negotiation: "bg-purple-50 border-purple-200 text-purple-700",
  won:         "bg-green-50 border-green-200 text-green-700",
  lost:        "bg-gray-100 border-gray-200 text-gray-500",
};

const stageDot: Record<DealStage, string> = {
  new:         "bg-blue-400",
  contacted:   "bg-yellow-400",
  proposal:    "bg-orange-400",
  negotiation: "bg-purple-400",
  won:         "bg-green-500",
  lost:        "bg-gray-400",
};

const STAGES: DealStage[] = ["new", "contacted", "proposal", "negotiation", "won", "lost"];

/* ── boş forma ──────────────────────────────────────────────────────────── */
function emptyForm(): Omit<CrmClientInput, "createdBy" | "createdAt"> {
  return {
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    notes: "",
    stage: "new",
  };
}

/* ── Müştəri kartı ──────────────────────────────────────────────────────── */
function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: CrmClient;
  onEdit: (c: CrmClient) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border border-line bg-paper p-4 hover:border-bordo/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/crm/${client.id}`}
            className="font-display text-[15px] text-ink hover:text-bordo transition-colors line-clamp-1"
          >
            {client.name}
          </Link>
          {client.contactPerson && (
            <p className="mt-0.5 font-ui text-[12px] text-muted truncate">{client.contactPerson}</p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${stageColors[client.stage]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${stageDot[client.stage]}`} />
          {dealStageLabels[client.stage]}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {client.email && (
          <p className="font-ui text-[12px] text-muted truncate">
            <span className="text-muted/60">@</span> {client.email}
          </p>
        )}
        {client.phone && (
          <p className="font-ui text-[12px] text-muted">
            <span className="text-muted/60">☎</span> {client.phone}
          </p>
        )}
        {client.industry && (
          <p className="font-ui text-[12px] text-muted">
            <span className="text-muted/60">◆</span> {client.industry}
          </p>
        )}
      </div>

      <div className="mt-3 flex gap-2 border-t border-line pt-3">
        <Link
          href={`/admin/crm/${client.id}`}
          className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo hover:underline"
        >
          Ətraflı bax
        </Link>
        <button
          type="button"
          onClick={() => onEdit(client)}
          className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink transition-colors"
        >
          Redaktə
        </button>
        <button
          type="button"
          onClick={() => onDelete(client.id)}
          className="ml-auto font-ui text-[11px] uppercase tracking-[0.12em] text-bordo/60 hover:text-bordo transition-colors"
        >
          Sil
        </button>
      </div>
    </div>
  );
}

/* ── Müştəri forması modal ───────────────────────────────────────────────── */
function ClientModal({
  editing,
  onClose,
  onSaved,
  userEmail,
}: {
  editing: CrmClient | null;
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
    if (!form.name.trim()) { setError("Müştəri adı mütləqdir."); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await saveCrmClient(editing.id, form as Partial<CrmClientInput>);
      } else {
        await addCrmClient({
          ...(form as Omit<CrmClientInput, "createdBy" | "createdAt">),
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
            {editing ? "Müştəri redaktə et" : "Yeni müştəri"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink text-xl leading-none">×</button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-6 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Şirkət / Ad *">
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Şirkətin adı" required />
            </Field>
            <Field label="Əlaqə şəxsi">
              <input className={inputClass} value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Ad Soyad" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="E-poçt">
              <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@shirket.az" />
            </Field>
            <Field label="Telefon">
              <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+994 50 000 00 00" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fəaliyyət sahəsi">
              <input className={inputClass} value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Moda, Gözəllik..." />
            </Field>
            <Field label="Mərhələ">
              <select className={inputClass} value={form.stage} onChange={(e) => set("stage", e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{dealStageLabels[s]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Qeydlər">
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Əlavə məlumat..." />
          </Field>

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
export default function CrmPage() {
  const { session } = useAuth();
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editingClient, setEditingClient] = useState<CrmClient | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const [view, setView] = useState<"list" | "kanban">("list");

  async function load() {
    setLoading(true);
    try {
      setClients(await listCrmClients());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu müştərini silmək istəyirsiniz?")) return;
    try {
      await removeCrmClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Silinmə xətası baş verdi.");
    }
  }

  function openEdit(client: CrmClient) {
    setEditingClient(client);
    setModal(true);
  }

  function openNew() {
    setEditingClient(null);
    setModal(true);
  }

  function handleSaved() {
    setModal(false);
    setEditingClient(null);
    void load();
  }

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || c.stage === stageFilter;
    return matchSearch && matchStage;
  });

  /* Kanban üçün mərhələ üzrə qrup */
  const byStage = STAGES.reduce<Record<DealStage, CrmClient[]>>(
    (acc, s) => {
      acc[s] = filtered.filter((c) => c.stage === s);
      return acc;
    },
    {} as Record<DealStage, CrmClient[]>,
  );

  /* Statistika */
  const wonClients = clients.filter((c) => c.stage === "won").length;
  const activeClients = clients.filter((c) => !["won", "lost"].includes(c.stage)).length;

  return (
    <>
      <PageHeader
        title="CRM — Müştərilər"
        description="Reklam müştəriləri, əməkdaşlıq mərhələləri və satış izləmə."
        actions={
          <Button onClick={openNew}>+ Yeni müştəri</Button>
        }
      />

      <div className="px-6 py-6 lg:px-10">

        {/* Statistika kartları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: "Ümumi müştəri", value: clients.length },
            { label: "Aktiv", value: activeClients },
            { label: "Müqavilə bağlandı", value: wonClients },
            { label: "Rədd edildi", value: clients.filter((c) => c.stage === "lost").length },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">{stat.label}</p>
              <p className="mt-1 font-display text-3xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Axtarış + filter + görünüş */}
        <div className="mb-5 flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[200px]"
            placeholder="Şirkət, əlaqə şəxsi, e-poçt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink focus:border-bordo focus:outline-none"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as DealStage | "all")}
          >
            <option value="all">Bütün mərhələlər</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{dealStageLabels[s]}</option>
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
              onClick={() => setView("kanban")}
              className={`px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${view === "kanban" ? "bg-bordo text-cream" : "bg-paper text-muted hover:text-ink"}`}
            >
              Kanban
            </button>
          </div>
        </div>

        {/* Xəta */}
        {error && <Alert tone="error">{error}</Alert>}

        {/* Yüklənmə */}
        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {/* Siyahı görünüşü */}
        {!loading && view === "list" && (
          <>
            {filtered.length === 0 ? (
              <Empty
                title="Müştəri tapılmadı"
                text="Yeni müştəri əlavə edin və ya axtarışı dəyişin."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={openEdit}
                    onDelete={(id) => void handleDelete(id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Kanban görünüşü */}
        {!loading && view === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <div key={stage} className="shrink-0 w-64">
                <div className={`mb-3 flex items-center gap-2 border px-3 py-2 ${stageColors[stage]}`}>
                  <span className={`h-2 w-2 rounded-full ${stageDot[stage]}`} />
                  <span className="font-ui text-[11px] uppercase tracking-[0.12em] font-semibold">
                    {dealStageLabels[stage]}
                  </span>
                  <span className="ml-auto font-ui text-[11px]">{byStage[stage].length}</span>
                </div>
                <div className="space-y-3">
                  {byStage[stage].length === 0 && (
                    <p className="border border-dashed border-line px-4 py-6 text-center font-ui text-[12px] text-muted">
                      Boşdur
                    </p>
                  )}
                  {byStage[stage].map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onEdit={openEdit}
                      onDelete={(id) => void handleDelete(id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ClientModal
          editing={editingClient}
          onClose={() => { setModal(false); setEditingClient(null); }}
          onSaved={handleSaved}
          userEmail={session?.email ?? ""}
        />
      )}
    </>
  );
}
