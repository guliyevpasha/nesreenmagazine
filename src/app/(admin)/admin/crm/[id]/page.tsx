"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  addCrmActivity,
  getCrmClient,
  listAdOrdersByClient,
  listCrmActivities,
  removeCrmActivity,
  saveCrmClient,
} from "@/lib/data/admin";
import type {
  CrmActivity,
  CrmActivityInput,
  CrmActivityType,
  CrmClient,
  AdOrder,
  DealStage,
} from "@/lib/types";
import {
  crmActivityLabels,
  dealStageLabels,
  adFormatLabels,
  paymentStatusLabels,
} from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  Panel,
  inputClass,
  Empty,
} from "@/components/admin/ui";

/* ── rəng xəritələri ────────────────────────────────────────────────────── */
const stageColors: Record<DealStage, string> = {
  new: "bg-blue-50 border-blue-200 text-blue-700",
  contacted: "bg-yellow-50 border-yellow-200 text-yellow-700",
  proposal: "bg-orange-50 border-orange-200 text-orange-700",
  negotiation: "bg-purple-50 border-purple-200 text-purple-700",
  won: "bg-green-50 border-green-200 text-green-700",
  lost: "bg-gray-100 border-gray-200 text-gray-500",
};

const STAGES: DealStage[] = ["new", "contacted", "proposal", "negotiation", "won", "lost"];
const ACTIVITY_TYPES: CrmActivityType[] = ["call", "meeting", "email", "note", "task"];

/* ── Aktivlik kartı ─────────────────────────────────────────────────────── */
function ActivityCard({
  activity,
  onDelete,
}: {
  activity: CrmActivity;
  onDelete: (id: string) => void;
}) {
  const date = new Date(activity.createdAt);
  return (
    <div className="border-l-2 border-bordo/30 pl-4 pb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block border border-line bg-paper px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.12em] text-muted">
              {crmActivityLabels[activity.type]}
            </span>
            <span className="font-ui text-[11px] text-muted">
              {date.toLocaleDateString("az-AZ")} · {date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h4 className="mt-1 font-display text-[15px] text-ink">{activity.title}</h4>
          {activity.body && (
            <p className="mt-1 font-ui text-[13px] text-muted whitespace-pre-wrap">{activity.body}</p>
          )}
          {activity.dueAt && (
            <p className="mt-2 font-ui text-[12px] text-muted">
              ⏰ Tarixi: {new Date(activity.dueAt).toLocaleString("az-AZ")}
              {activity.completedAt && (
                <span className="ml-2 text-green-600">✓ Tamamlandı</span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          className="text-muted hover:text-bordo text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ── Aktivlik modal ─────────────────────────────────────────────────────── */
function ActivityModal({
  clientId,
  onClose,
  onSaved,
  userEmail,
}: {
  clientId: string;
  onClose: () => void;
  onSaved: () => void;
  userEmail: string;
}) {
  const [type, setType] = useState<CrmActivityType>("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Başlıq mütləqdir.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addCrmActivity({
        clientId,
        type,
        title,
        body,
        dueAt: dueAt || undefined,
        createdAt: new Date().toISOString(),
        createdBy: userEmail,
      });
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
      <div className="relative w-full max-w-md bg-paper border border-line shadow-xl">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-xl">Yeni aktivlik</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-6 space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <Field label="Növ">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as CrmActivityType)}>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {crmActivityLabels[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Başlıq *">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Qısa başlıq..."
              required
            />
          </Field>

          <Field label="Təsvir">
            <textarea
              className={inputClass}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ətraflı məlumat..."
            />
          </Field>

          {type === "task" && (
            <Field label="Son tarix">
              <input
                className={inputClass}
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </Field>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saxlanılır…" : "Əlavə et"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const clientId = params.id as string;

  const [client, setClient] = useState<CrmClient | null>(null);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityModal, setActivityModal] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state for editing
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    notes: "",
    stage: "new" as DealStage,
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [c, a, o] = await Promise.all([
        getCrmClient(clientId),
        listCrmActivities(clientId),
        listAdOrdersByClient(clientId),
      ]);
      if (!c) {
        setError("Müştəri tapılmadı.");
        return;
      }
      setClient(c);
      setActivities(a);
      setOrders(o);
      setForm({
        name: c.name,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        industry: c.industry,
        notes: c.notes,
        stage: c.stage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [clientId]);

  async function handleSave() {
    if (!client) return;
    try {
      await saveCrmClient(client.id, form);
      setClient({ ...client, ...form });
      setEditing(false);
    } catch {
      alert("Saxlanma xətası");
    }
  }

  async function handleDeleteActivity(id: string) {
    if (!confirm("Bu aktivliyi silmək istəyirsiniz?")) return;
    try {
      await removeCrmActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Silinmə xətası");
    }
  }

  function handleActivitySaved() {
    setActivityModal(false);
    void load();
  }

  if (loading) {
    return (
      <div className="px-6 py-16 lg:px-10 text-center font-ui text-[13px] text-muted">
        Yüklənir…
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <Alert tone="error">{error || "Müştəri tapılmadı"}</Alert>
        <Button onClick={() => router.push("/admin/crm")} className="mt-4">
          ← CRM-ə qayıt
        </Button>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalDebt = orders.reduce((sum, o) => sum + Math.max(0, o.price - o.paidAmount), 0);

  return (
    <>
      <PageHeader
        title={client.name}
        description={client.contactPerson || "Müştəri detallı məlumatı"}
        backHref="/admin/crm"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push("/admin/ad-orders?client=" + clientId)}>
              + Yeni sifariş
            </Button>
            <Button onClick={() => setActivityModal(true)}>+ Aktivlik</Button>
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ümumi sifariş", value: orders.length },
            { label: "Gəlir", value: `${totalRevenue} ₼` },
            { label: "Borc", value: `${totalDebt} ₼` },
            { label: "Aktivlik", value: activities.length },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sol panel - Müştəri məlumatları */}
          <div className="lg:col-span-5">
            <Panel
              title="Müştəri məlumatları"
              actions={
                editing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                    >
                      Ləğv et
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo hover:underline"
                    >
                      Yadda saxla
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo hover:underline"
                  >
                    Redaktə et
                  </button>
                )
              }
            >
              {editing ? (
                <div className="space-y-4">
                  <Field label="Şirkət / Ad">
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Field>
                  <Field label="Əlaqə şəxsi">
                    <input
                      className={inputClass}
                      value={form.contactPerson}
                      onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    />
                  </Field>
                  <Field label="E-poçt">
                    <input
                      className={inputClass}
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Telefon">
                    <input
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </Field>
                  <Field label="Fəaliyyət sahəsi">
                    <input
                      className={inputClass}
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    />
                  </Field>
                  <Field label="Mərhələ">
                    <select
                      className={inputClass}
                      value={form.stage}
                      onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {dealStageLabels[s]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Qeydlər">
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </Field>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Mərhələ
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1.5 border px-2 py-1 font-ui text-[11px] uppercase tracking-[0.1em] ${stageColors[client.stage]}`}
                    >
                      {dealStageLabels[client.stage]}
                    </span>
                  </div>
                  {client.contactPerson && (
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Əlaqə şəxsi
                      </p>
                      <p className="mt-1 font-ui text-[14px] text-ink">{client.contactPerson}</p>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        E-poçt
                      </p>
                      <p className="mt-1 font-ui text-[14px] text-ink">
                        <a href={`mailto:${client.email}`} className="hover:text-bordo">
                          {client.email}
                        </a>
                      </p>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Telefon
                      </p>
                      <p className="mt-1 font-ui text-[14px] text-ink">
                        <a href={`tel:${client.phone}`} className="hover:text-bordo">
                          {client.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {client.industry && (
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Fəaliyyət sahəsi
                      </p>
                      <p className="mt-1 font-ui text-[14px] text-ink">{client.industry}</p>
                    </div>
                  )}
                  {client.notes && (
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Qeydlər
                      </p>
                      <p className="mt-1 font-ui text-[14px] text-muted whitespace-pre-wrap">
                        {client.notes}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-line">
                    <p className="font-ui text-[11px] text-muted">
                      Yaradılıb: {new Date(client.createdAt).toLocaleDateString("az-AZ")}
                    </p>
                  </div>
                </div>
              )}
            </Panel>
          </div>

          {/* Sağ panel - Aktivliklər və sifarişlər */}
          <div className="lg:col-span-7 space-y-6">
            {/* Aktivliklər */}
            <Panel title="Aktivlik Tarixçəsi" description="Zənglər, görüşlər, qeydlər">
              {activities.length === 0 ? (
                <Empty
                  title="Aktivlik yoxdur"
                  text="Yeni aktivlik əlavə edin."
                />
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onDelete={(id) => void handleDeleteActivity(id)}
                    />
                  ))}
                </div>
              )}
            </Panel>

            {/* Reklam sifarişləri */}
            <Panel title="Reklam Sifarişləri">
              {orders.length === 0 ? (
                <Empty
                  title="Sifariş yoxdur"
                  text="Bu müştəri üçün hələ reklam sifarişi əlavə edilməyib."
                />
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/ad-orders#${order.id}`}
                      className="block border border-line bg-paper p-4 hover:border-bordo/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display text-[15px] text-ink line-clamp-1">
                            {order.title}
                          </p>
                          <p className="mt-0.5 font-ui text-[12px] text-muted">
                            {adFormatLabels[order.format]} · {order.placement}
                          </p>
                        </div>
                        <span className="shrink-0 font-display text-[15px] text-ink">
                          {order.paidAmount} / {order.price} ₼
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block border border-line px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] text-muted">
                          {paymentStatusLabels[order.paymentStatus]}
                        </span>
                        <span className="font-ui text-[11px] text-muted">
                          {new Date(order.startsAt).toLocaleDateString("az-AZ")} →{" "}
                          {new Date(order.endsAt).toLocaleDateString("az-AZ")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>

      {/* Aktivlik modal */}
      {activityModal && (
        <ActivityModal
          clientId={clientId}
          onClose={() => setActivityModal(false)}
          onSaved={handleActivitySaved}
          userEmail={session?.email ?? ""}
        />
      )}
    </>
  );
}
