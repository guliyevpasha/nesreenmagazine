"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  addCrmActivity,
  addAdOrder,
  getCrmClient,
  listAdOrdersByClient,
  listCrmActivities,
  removeCrmActivity,
  removeAdOrder,
  saveCrmClient,
  saveAdOrder,
} from "@/lib/data/admin";
import type {
  AdFormat,
  AdOrder,
  AdOrderInput,
  CrmActivity,
  CrmActivityInput,
  CrmActivityType,
  CrmClient,
  DealStage,
  PaymentStatus,
} from "@/lib/types";
import {
  adFormatLabels,
  crmActivityLabels,
  dealStageLabels,
  paymentStatusLabels,
  materialStatusLabels,
} from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  inputClass,
} from "@/components/admin/ui";

/* ── rəng köməkçiləri ────────────────────────────────────────────────────── */
const paymentColors: Record<PaymentStatus, string> = {
  pending:   "bg-yellow-50 border-yellow-200 text-yellow-700",
  partial:   "bg-blue-50 border-blue-200 text-blue-700",
  paid:      "bg-green-50 border-green-200 text-green-700",
  overdue:   "bg-red-50 border-red-200 text-red-700",
  cancelled: "bg-gray-100 border-gray-200 text-gray-500",
};

const activityIcons: Record<CrmActivityType, string> = {
  call:    "📞",
  meeting: "🤝",
  email:   "✉️",
  note:    "📝",
  task:    "✅",
};

const STAGES: DealStage[] = ["new", "contacted", "proposal", "negotiation", "won", "lost"];
const AD_FORMATS: AdFormat[] = [
  "banner", "sponsored_article", "brand_interview",
  "social_package", "event_sponsorship", "newsletter", "custom",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "partial", "paid", "overdue", "cancelled"];
const ACTIVITY_TYPES: CrmActivityType[] = ["call", "meeting", "email", "note", "task"];

/* ── Boş reklam sifarişi forması ─────────────────────────────────────────── */
function emptyOrderForm(clientId: string, clientName: string): Omit<AdOrderInput, "createdBy" | "createdAt"> {
  return {
    clientId,
    clientName,
    title: "",
    format: "banner",
    placement: "",
    price: 0,
    paidAmount: 0,
    paymentStatus: "pending",
    materialStatus: "waiting",
    startsAt: "",
    endsAt: "",
    materialUrl: "",
    clicks: 0,
    impressions: 0,
    notes: "",
  };
}

/* ── Aktivlik kartı ─────────────────────────────────────────────────────── */
function ActivityItem({
  activity,
  onDelete,
}: {
  activity: CrmActivity;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 border-b border-line pb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-cream-deep text-base">
        {activityIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted">
              {crmActivityLabels[activity.type]}
            </span>
            <p className="mt-0.5 font-ui text-[13px] text-ink font-medium">{activity.title}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-ui text-[11px] text-muted">
              {activity.createdAt.slice(0, 10)}
            </span>
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              className="font-ui text-[11px] text-bordo/60 hover:text-bordo transition-colors"
            >
              Sil
            </button>
          </div>
        </div>
        {activity.body && (
          <p className="mt-1 font-ui text-[12px] text-ink-soft leading-relaxed">{activity.body}</p>
        )}
        {activity.dueAt && (
          <p className="mt-1 font-ui text-[11px] text-muted">Son tarix: {activity.dueAt.slice(0, 10)}</p>
        )}
      </div>
    </div>
  );
}

/* ── Reklam sifarişi sıra ─────────────────────────────────────────────────── */
function OrderRow({
  order,
  onDelete,
  onStatusChange,
}: {
  order: AdOrder;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PaymentStatus) => void;
}) {
  return (
    <div className="border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[15px] text-ink">{order.title}</p>
          <p className="mt-0.5 font-ui text-[12px] text-muted">
            {adFormatLabels[order.format]} · {order.placement || "Yer göstərilməyib"}
          </p>
        </div>
        <span className={`shrink-0 border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${paymentColors[order.paymentStatus]}`}>
          {paymentStatusLabels[order.paymentStatus]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted">Qiymət</p>
          <p className="mt-0.5 font-display text-lg text-ink">{order.price} ₼</p>
        </div>
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted">Ödənilib</p>
          <p className="mt-0.5 font-display text-lg text-green-600">{order.paidAmount} ₼</p>
        </div>
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted">Borc</p>
          <p className="mt-0.5 font-display text-lg text-bordo">
            {Math.max(0, order.price - order.paidAmount)} ₼
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
        <span className="font-ui text-[11px] text-muted">
          {order.startsAt ? order.startsAt.slice(0, 10) : "—"} → {order.endsAt ? order.endsAt.slice(0, 10) : "—"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            className="border border-line bg-paper px-2 py-1 font-ui text-[11px] focus:outline-none"
            value={order.paymentStatus}
            onChange={(e) => onStatusChange(order.id, e.target.value as PaymentStatus)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{paymentStatusLabels[s]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onDelete(order.id)}
            className="font-ui text-[11px] text-bordo/60 hover:text-bordo transition-colors"
          >
            Sil
          </button>
        </div>
      </div>

      {(order.clicks > 0 || order.impressions > 0) && (
        <div className="mt-2 flex gap-4">
          <span className="font-ui text-[11px] text-muted">Klik: {order.clicks}</span>
          <span className="font-ui text-[11px] text-muted">Göstərilmə: {order.impressions}</span>
        </div>
      )}
    </div>
  );
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function CrmClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [client, setClient] = useState<CrmClient | null>(null);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Redaktə panel */
  const [editOpen, setEditOpen] = useState(false);
  const [editStage, setEditStage] = useState<DealStage>("new");
  const [editNotes, setEditNotes] = useState("");
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  /* Yeni aktivlik */
  const [actType, setActType] = useState<CrmActivityType>("note");
  const [actTitle, setActTitle] = useState("");
  const [actBody, setActBody] = useState("");
  const [actDue, setActDue] = useState("");
  const [actSaving, setActSaving] = useState(false);

  /* Yeni reklam sifarişi */
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<Omit<AdOrderInput, "createdBy" | "createdAt">>(
    emptyOrderForm(id, ""),
  );
  const [orderSaving, setOrderSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, acts, ords] = await Promise.all([
        getCrmClient(id),
        listCrmActivities(id),
        listAdOrdersByClient(id),
      ]);
      if (!c) { router.push("/admin/crm"); return; }
      setClient(c);
      setActivities(acts);
      setOrders(ords);
      setEditStage(c.stage);
      setEditNotes(c.notes);
      setEditName(c.name);
      setEditContact(c.contactPerson);
      setEditEmail(c.email);
      setEditPhone(c.phone);
      setEditIndustry(c.industry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  /* Müştərini yenilə */
  async function handleSaveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    try {
      await saveCrmClient(client.id, {
        name: editName,
        contactPerson: editContact,
        email: editEmail,
        phone: editPhone,
        industry: editIndustry,
        stage: editStage,
        notes: editNotes,
      });
      setEditOpen(false);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlama xətası");
    } finally {
      setSaving(false);
    }
  }

  /* Aktivlik əlavə et */
  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!actTitle.trim() || !client) return;
    setActSaving(true);
    try {
      const input: CrmActivityInput = {
        clientId: client.id,
        type: actType,
        title: actTitle,
        body: actBody,
        dueAt: actDue || undefined,
        createdAt: new Date().toISOString(),
        createdBy: session?.email ?? "",
      };
      await addCrmActivity(input);
      setActTitle("");
      setActBody("");
      setActDue("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktivlik əlavə edilmədi");
    } finally {
      setActSaving(false);
    }
  }

  async function handleDeleteActivity(actId: string) {
    if (!confirm("Bu aktivliyi silmək istəyirsiniz?")) return;
    await removeCrmActivity(actId);
    setActivities((prev) => prev.filter((a) => a.id !== actId));
  }

  /* Reklam sifarişi əlavə et */
  async function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderForm.title.trim() || !client) return;
    setOrderSaving(true);
    try {
      await addAdOrder({
        ...orderForm,
        clientId: client.id,
        clientName: client.name,
        createdBy: session?.email ?? "",
        createdAt: new Date().toISOString(),
      });
      setOrderFormOpen(false);
      setOrderForm(emptyOrderForm(id, client.name));
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sifariş əlavə edilmədi");
    } finally {
      setOrderSaving(false);
    }
  }

  async function handleDeleteOrder(ordId: string) {
    if (!confirm("Bu sifarişi silmək istəyirsiniz?")) return;
    await removeAdOrder(ordId);
    setOrders((prev) => prev.filter((o) => o.id !== ordId));
  }

  async function handleOrderStatusChange(ordId: string, status: PaymentStatus) {
    await saveAdOrder(ordId, { paymentStatus: status });
    setOrders((prev) => prev.map((o) => o.id === ordId ? { ...o, paymentStatus: status } : o));
  }

  /* Ümumi gəlir hesabı */
  const totalRevenue = orders.reduce((s, o) => s + (o.paidAmount || 0), 0);
  const totalDebt = orders.reduce((s, o) => s + Math.max(0, o.price - o.paidAmount), 0);

  if (loading) return (
    <div className="py-24 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
  );

  if (!client) return null;

  return (
    <>
      <PageHeader
        title={client.name}
        description={client.contactPerson ? `Əlaqə: ${client.contactPerson}` : undefined}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/crm">
              <Button variant="ghost">← Geri</Button>
            </Link>
            <Button onClick={() => setEditOpen(!editOpen)}>
              {editOpen ? "Ləğv et" : "Redaktə et"}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="px-6 pt-4 lg:px-10">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* Redaktə paneli */}
        {editOpen && (
          <div className="border border-bordo/30 bg-paper p-6">
            <h2 className="font-display text-xl mb-4">Müştəri məlumatlarını redaktə et</h2>
            <form onSubmit={(e) => void handleSaveClient(e)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Şirkət / Ad">
                  <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </Field>
                <Field label="Əlaqə şəxsi">
                  <input className={inputClass} value={editContact} onChange={(e) => setEditContact(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="E-poçt">
                  <input className={inputClass} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </Field>
                <Field label="Telefon">
                  <input className={inputClass} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fəaliyyət sahəsi">
                  <input className={inputClass} value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} />
                </Field>
                <Field label="Mərhələ">
                  <select className={inputClass} value={editStage} onChange={(e) => setEditStage(e.target.value as DealStage)}>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{dealStageLabels[s]}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Qeydlər">
                <textarea className={inputClass} rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saxlanılır…" : "Yadda saxla"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Məlumat kartları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Mərhələ", value: dealStageLabels[client.stage] },
            { label: "Ümumi sifariş", value: orders.length },
            { label: "Ödənilib", value: `${totalRevenue} ₼` },
            { label: "Borc", value: `${totalDebt} ₼` },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{stat.label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sol — Aktivliklər */}
          <div className="space-y-4">
            <h2 className="font-display text-xl">Aktivliklər tarixçəsi</h2>

            {/* Yeni aktivlik forması */}
            <form onSubmit={(e) => void handleAddActivity(e)} className="border border-line bg-paper p-4 space-y-3">
              <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">Yeni qeyd əlavə et</p>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={inputClass}
                  value={actType}
                  onChange={(e) => setActType(e.target.value as CrmActivityType)}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>{crmActivityLabels[t]}</option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  type="date"
                  value={actDue}
                  onChange={(e) => setActDue(e.target.value)}
                  placeholder="Son tarix (optional)"
                />
              </div>
              <input
                className={inputClass}
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="Başlıq *"
                required
              />
              <textarea
                className={inputClass}
                rows={2}
                value={actBody}
                onChange={(e) => setActBody(e.target.value)}
                placeholder="Ətraflı qeyd..."
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={actSaving}>
                  {actSaving ? "Əlavə edilir…" : "Əlavə et"}
                </Button>
              </div>
            </form>

            {/* Aktivliklər siyahısı */}
            <div className="space-y-4">
              {activities.length === 0 && (
                <p className="border border-dashed border-line px-6 py-8 text-center font-ui text-[13px] text-muted">
                  Hələ heç bir aktivlik yoxdur.
                </p>
              )}
              {activities.map((act) => (
                <ActivityItem
                  key={act.id}
                  activity={act}
                  onDelete={(actId) => void handleDeleteActivity(actId)}
                />
              ))}
            </div>
          </div>

          {/* Sağ — Reklam sifarişləri */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Reklam sifarişləri</h2>
              <Button onClick={() => setOrderFormOpen(!orderFormOpen)}>
                {orderFormOpen ? "Ləğv et" : "+ Yeni sifariş"}
              </Button>
            </div>

            {/* Yeni sifariş forması */}
            {orderFormOpen && (
              <form onSubmit={(e) => void handleAddOrder(e)} className="border border-line bg-paper p-4 space-y-3">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">Yeni reklam sifarişi</p>
                <input
                  className={inputClass}
                  value={orderForm.title}
                  onChange={(e) => setOrderForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Kampaniya adı *"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className={inputClass}
                    value={orderForm.format}
                    onChange={(e) => setOrderForm((p) => ({ ...p, format: e.target.value as AdFormat }))}
                  >
                    {AD_FORMATS.map((f) => (
                      <option key={f} value={f}>{adFormatLabels[f]}</option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    value={orderForm.placement}
                    onChange={(e) => setOrderForm((p) => ({ ...p, placement: e.target.value }))}
                    placeholder="Yerləşdirmə bölməsi"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Qiymət (₼)">
                    <input
                      className={inputClass}
                      type="number"
                      min={0}
                      value={orderForm.price}
                      onChange={(e) => setOrderForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    />
                  </Field>
                  <Field label="Ödənilib (₼)">
                    <input
                      className={inputClass}
                      type="number"
                      min={0}
                      value={orderForm.paidAmount}
                      onChange={(e) => setOrderForm((p) => ({ ...p, paidAmount: Number(e.target.value) }))}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Başlama tarixi">
                    <input
                      className={inputClass}
                      type="date"
                      value={orderForm.startsAt}
                      onChange={(e) => setOrderForm((p) => ({ ...p, startsAt: e.target.value }))}
                    />
                  </Field>
                  <Field label="Bitmə tarixi">
                    <input
                      className={inputClass}
                      type="date"
                      value={orderForm.endsAt}
                      onChange={(e) => setOrderForm((p) => ({ ...p, endsAt: e.target.value }))}
                    />
                  </Field>
                </div>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Qeydlər..."
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={orderSaving}>
                    {orderSaving ? "Əlavə edilir…" : "Sifarişi əlavə et"}
                  </Button>
                </div>
              </form>
            )}

            {/* Sifarişlər siyahısı */}
            <div className="space-y-3">
              {orders.length === 0 && (
                <p className="border border-dashed border-line px-6 py-8 text-center font-ui text-[13px] text-muted">
                  Hələ heç bir reklam sifarişi yoxdur.
                </p>
              )}
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onDelete={(ordId) => void handleDeleteOrder(ordId)}
                  onStatusChange={(ordId, status) => void handleOrderStatusChange(ordId, status)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Əlaqə məlumatları */}
        {(client.email || client.phone || client.notes) && (
          <div className="border border-line bg-paper p-6">
            <h2 className="font-display text-xl mb-4">Əlaqə məlumatları</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {client.email && (
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">E-poçt</p>
                  <a href={`mailto:${client.email}`} className="mt-1 font-ui text-[13px] text-bordo hover:underline block">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">Telefon</p>
                  <a href={`tel:${client.phone}`} className="mt-1 font-ui text-[13px] text-ink block">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.industry && (
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">Sahə</p>
                  <p className="mt-1 font-ui text-[13px] text-ink">{client.industry}</p>
                </div>
              )}
            </div>
            {client.notes && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted mb-2">Qeydlər</p>
                <p className="font-ui text-[13px] text-ink-soft leading-relaxed whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
