"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  listAdOrders,
  addAdOrder,
  saveAdOrder,
  removeAdOrder,
  listCrmClients,
} from "@/lib/data/admin";
import type { AdOrder, AdOrderInput, AdFormat, PaymentStatus, MaterialStatus, CrmClient } from "@/lib/types";
import {
  adFormatLabels,
  paymentStatusLabels,
  materialStatusLabels,
} from "@/lib/types";
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
const paymentColors: Record<PaymentStatus, string> = {
  pending: "border-yellow-300 bg-yellow-50 text-yellow-700",
  partial: "border-blue-300 bg-blue-50 text-blue-700",
  paid: "border-green-300 bg-green-50 text-green-700",
  overdue: "border-red-300 bg-red-50 text-red-700",
  cancelled: "border-gray-200 bg-gray-100 text-gray-500",
};

const materialColors: Record<MaterialStatus, string> = {
  waiting: "text-gray-500",
  received: "text-blue-600",
  approved: "text-green-600",
  rejected: "text-red-600",
};

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "partial", "paid", "overdue", "cancelled"];
const MATERIAL_STATUSES: MaterialStatus[] = ["waiting", "received", "approved", "rejected"];
const AD_FORMATS: AdFormat[] = [
  "banner",
  "sponsored_article",
  "brand_interview",
  "social_package",
  "event_sponsorship",
  "newsletter",
  "custom",
];

/* ── köməkçi: tarix formatı ─────────────────────────────────────────────── */
function fmtDate(d?: string) {
  if (!d) return "—";
  return d.slice(0, 10);
}

/* ── köməkçi: vaxtı keçib? ──────────────────────────────────────────────── */
function isOverdue(order: AdOrder) {
  if (order.paymentStatus === "paid" || order.paymentStatus === "cancelled") return false;
  if (!order.endsAt) return false;
  return new Date(order.endsAt) < new Date();
}

/* ── boş forma ──────────────────────────────────────────────────────────── */
function emptyForm(): Omit<AdOrderInput, "createdBy" | "createdAt"> {
  return {
    clientId: "",
    clientName: "",
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

/* ── Sifariş Modal ─────────────────────────────────────────────────────── */
function OrderModal({
  editing,
  clients,
  onClose,
  onSaved,
  userEmail,
}: {
  editing: AdOrder | null;
  clients: CrmClient[];
  onClose: () => void;
  onSaved: () => void;
  userEmail: string;
}) {
  const [form, setForm] = useState(editing ? { ...editing } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, val: string | number) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  // Client seçildikdə adını avtomatik doldur
  function handleClientChange(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    setForm((prev) => ({
      ...prev,
      clientId,
      clientName: client?.name ?? "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId || !form.title.trim() || !form.startsAt || !form.endsAt) {
      setError("Müştəri, başlıq və tarixlər mütləqdir.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await saveAdOrder(editing.id, form as Partial<AdOrderInput>);
      } else {
        await addAdOrder({
          ...(form as Omit<AdOrderInput, "createdBy" | "createdAt">),
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
      <div className="relative w-full max-w-2xl bg-paper border border-line shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between sticky top-0 bg-paper z-10">
          <h2 className="font-display text-xl">
            {editing ? "Sifarişi redaktə et" : "Yeni reklam sifarişi"}
          </h2>
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Müştəri *">
              <select
                className={inputClass}
                value={form.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                required
              >
                <option value="">Seçin</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kampaniya adı *">
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Yaz kolleksiyası 2026"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Format">
              <select
                className={inputClass}
                value={form.format}
                onChange={(e) => set("format", e.target.value)}
              >
                {AD_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {adFormatLabels[f]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Yerləşmə">
              <input
                className={inputClass}
                value={form.placement}
                onChange={(e) => set("placement", e.target.value)}
                placeholder="Ana səhifə, Sidebar, Məqalə arası"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Qiymət (AZN) *">
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                required
              />
            </Field>
            <Field label="Ödənildi (AZN)">
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={form.paidAmount}
                onChange={(e) => set("paidAmount", parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Ödəniş statusu">
              <select
                className={inputClass}
                value={form.paymentStatus}
                onChange={(e) => set("paymentStatus", e.target.value)}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {paymentStatusLabels[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Başlama tarixi *">
              <input
                className={inputClass}
                type="date"
                value={form.startsAt.slice(0, 10)}
                onChange={(e) => set("startsAt", e.target.value)}
                required
              />
            </Field>
            <Field label="Bitmə tarixi *">
              <input
                className={inputClass}
                type="date"
                value={form.endsAt.slice(0, 10)}
                onChange={(e) => set("endsAt", e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Material statusu">
              <select
                className={inputClass}
                value={form.materialStatus}
                onChange={(e) => set("materialStatus", e.target.value)}
              >
                {MATERIAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {materialStatusLabels[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Material URL">
              <input
                className={inputClass}
                value={form.materialUrl}
                onChange={(e) => set("materialUrl", e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Klik sayı">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.clicks}
                onChange={(e) => set("clicks", parseInt(e.target.value) || 0)}
              />
            </Field>
            <Field label="Göstərilmə sayı">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.impressions}
                onChange={(e) => set("impressions", parseInt(e.target.value) || 0)}
              />
            </Field>
          </div>

          <Field label="Qeydlər">
            <textarea
              className={inputClass}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Əlavə məlumat..."
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
export default function AdOrdersPage() {
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [orders, setOrders] = useState<AdOrder[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AdOrder | null>(null);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");

  async function load() {
    setLoading(true);
    try {
      const [o, c] = await Promise.all([listAdOrders(), listCrmClients()]);
      setOrders(o);
      setClients(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // URL-dən client filter
  useEffect(() => {
    const clientId = searchParams.get("client");
    if (clientId && clients.length > 0) {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setSearch(client.name);
      }
    }
  }, [searchParams, clients]);

  async function handleDelete(id: string) {
    if (!confirm("Bu sifarişi silmək istəyirsiniz?")) return;
    try {
      await removeAdOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Silinmə xətası baş verdi.");
    }
  }

  function openEdit(order: AdOrder) {
    setEditingOrder(order);
    setModal(true);
  }

  function openNew() {
    setEditingOrder(null);
    setModal(true);
  }

  function handleSaved() {
    setModal(false);
    setEditingOrder(null);
    void load();
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.title.toLowerCase().includes(search.toLowerCase());
    const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    return matchSearch && matchPayment;
  });

  // Statistika
  const totalRevenue = orders.reduce((s, o) => s + o.paidAmount, 0);
  const totalDebt = orders.reduce((s, o) => s + Math.max(0, o.price - o.paidAmount), 0);
  const overdueCount = orders.filter(isOverdue).length;
  const activeCount = orders.filter(
    (o) => o.paymentStatus !== "cancelled" && (!o.endsAt || new Date(o.endsAt) >= new Date())
  ).length;

  return (
    <>
      <PageHeader
        title="Reklam Sifarişləri"
        description="Kampaniyalar, ödənişlər və material tracking."
        actions={<Button onClick={openNew}>+ Yeni sifariş</Button>}
      />

      <div className="px-6 py-6 lg:px-10">
        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: "Ümumi sifariş", value: orders.length },
            { label: "Aktiv", value: activeCount },
            { label: "Gəlir", value: `${totalRevenue} ₼` },
            { label: "Borc", value: `${totalDebt} ₼`, warn: totalDebt > 0 },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p
                className={`mt-1 font-display text-3xl ${stat.warn ? "text-bordo" : "text-ink"}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Xəbərdarlıq */}
        {overdueCount > 0 && (
          <Alert tone="error" className="mb-5">
            ⚠️ <strong>{overdueCount}</strong> sifarişin ödəniş müddəti keçib.
          </Alert>
        )}

        {/* Axtarış + filter */}
        <div className="mb-5 flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[200px]"
            placeholder="Müştəri, kampaniya adı..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] text-ink focus:border-bordo focus:outline-none"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | "all")}
          >
            <option value="all">Bütün ödənişlər</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {paymentStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Xəta */}
        {error && <Alert tone="error">{error}</Alert>}

        {/* Yüklənmə */}
        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {/* Cədvəl */}
        {!loading && (
          <>
            {filtered.length === 0 ? (
              <Empty title="Sifariş tapılmadı" text="Yeni sifariş əlavə edin və ya axtarışı dəyişin." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-line">
                  <thead className="bg-paper border-b border-line">
                    <tr>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Müştəri
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Kampaniya
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Format
                      </th>
                      <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Tarixlər
                      </th>
                      <th className="px-4 py-3 text-right font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Ödəniş
                      </th>
                      <th className="px-4 py-3 text-center font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                        Material
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((order) => {
                      const debt = order.price - order.paidAmount;
                      const overdue = isOverdue(order);
                      return (
                        <tr key={order.id} id={order.id} className="bg-paper hover:bg-cream/30">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/crm/${order.clientId}`}
                              className="font-ui text-[13px] text-ink hover:text-bordo"
                            >
                              {order.clientName}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-display text-[14px] text-ink">{order.title}</p>
                            {order.placement && (
                              <p className="font-ui text-[11px] text-muted">{order.placement}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-ui text-[12px] text-muted">
                            {adFormatLabels[order.format]}
                          </td>
                          <td className="px-4 py-3 font-ui text-[12px] text-muted">
                            {fmtDate(order.startsAt)} →<br />
                            {fmtDate(order.endsAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-display text-[14px] text-ink">
                              {order.paidAmount} / {order.price} ₼
                            </p>
                            {debt > 0 && (
                              <p className="font-ui text-[11px] text-bordo">Borc: {debt} ₼</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${paymentColors[order.paymentStatus]}`}
                            >
                              {paymentStatusLabels[order.paymentStatus]}
                            </span>
                            {overdue && (
                              <p className="mt-1 font-ui text-[10px] text-red-600">⚠️ Gecikdi</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-ui text-[11px] ${materialColors[order.materialStatus]}`}>
                              {materialStatusLabels[order.materialStatus]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(order)}
                                className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink"
                              >
                                Redaktə
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(order.id)}
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
      </div>

      {/* Modal */}
      {modal && (
        <OrderModal
          editing={editingOrder}
          clients={clients}
          onClose={() => {
            setModal(false);
            setEditingOrder(null);
          }}
          onSaved={handleSaved}
          userEmail={session?.email ?? ""}
        />
      )}
    </>
  );
}
