"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { PageHeader, Panel, Alert, Button, Field, inputClass } from "@/components/admin/ui";
import type { Ejournal, EjournalOrder, EjournalOrderInput } from "@/lib/types";
import {
  getEjournal,
  listEjournalOrdersByIssue,
  addEjournalOrder,
  updateEjournalOrderStatus,
  getEjournalDetailStats,
} from "@/lib/data/admin";
import { ejournalOrderStatusLabels } from "@/lib/types";

export default function EjournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const ejournalId = params.id as string;

  const [ejournal, setEjournal] = useState<Ejournal | null>(null);
  const [orders, setOrders] = useState<EjournalOrder[]>([]);
  const [stats, setStats] = useState<{ orders: number; revenue: number; downloads: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<EjournalOrderInput>>({
    buyerEmail: "",
    buyerName: "",
    price: 0,
    status: "pending",
    paymentMethod: "card",
  });

  useEffect(() => {
    loadData();
  }, [ejournalId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [ejournalData, ordersData, statsData] = await Promise.all([
        getEjournal(ejournalId),
        listEjournalOrdersByIssue(ejournalId),
        getEjournalDetailStats(ejournalId),
      ]);

      if (!ejournalData) {
        setError("E-jurnal tapılmadı");
        return;
      }

      setEjournal(ejournalData);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError("Məlumatlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOrder() {
    if (!session?.email || !ejournal) return;

    if (!newOrder.buyerEmail || !newOrder.buyerName || !newOrder.price) {
      setError("Bütün xanaları doldurun");
      return;
    }

    try {
      await addEjournalOrder({
        ejournalId: ejournal.id,
        ejournalTitle: ejournal.title.az,
        buyerEmail: newOrder.buyerEmail,
        buyerName: newOrder.buyerName,
        price: newOrder.price,
        status: newOrder.status || "pending",
        paymentMethod: newOrder.paymentMethod || "card",
        createdAt: new Date().toISOString(),
      });

      setSuccess("Sifariş əlavə edildi");
      setShowAddOrder(false);
      setNewOrder({
        buyerEmail: "",
        buyerName: "",
        price: 0,
        status: "pending",
        paymentMethod: "card",
      });
      loadData();
    } catch (err) {
      console.error(err);
      setError("Sifariş əlavə edilərkən xəta baş verdi");
    }
  }

  async function handleUpdateStatus(orderId: string, status: "paid" | "failed" | "refunded") {
    try {
      await updateEjournalOrderStatus(orderId, status);
      setSuccess(`Sifariş statusu "${ejournalOrderStatusLabels[status]}" olaraq dəyişdirildi`);
      loadData();
    } catch (err) {
      console.error(err);
      setError("Status dəyişdirilərkən xəta baş verdi");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader title="E-jurnal statistikası" description="Yüklənir..." backHref="/admin/ejournals" />
      </div>
    );
  }

  if (!ejournal) {
    return (
      <div className="p-8">
        <PageHeader title="E-jurnal tapılmadı" backHref="/admin/ejournals" />
        <Alert tone="error">E-jurnal tapılmadı və ya silinib</Alert>
      </div>
    );
  }

  const Badge = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title={ejournal.title.az || "E-jurnal"}
        description={`Satış və download statistikası`}
        backHref="/admin/ejournals"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowAddOrder(!showAddOrder)}
          >
            {showAddOrder ? "İmtina" : "+ Yeni sifariş"}
          </Button>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">Cəmi satış</div>
            <div className="text-3xl font-bold text-blue-800">{stats.orders}</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="text-sm text-green-700">Cəmi gəlir</div>
            <div className="text-3xl font-bold text-green-800">{stats.revenue} ₼</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700">Downloads</div>
            <div className="text-3xl font-bold text-purple-800">{stats.downloads}</div>
          </div>
        </div>
      )}

      {/* Add Order Form */}
      {showAddOrder && (
        <Panel title="Yeni sifariş əlavə et">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Alıcının adı">
              <input
                type="text"
                value={newOrder.buyerName}
                onChange={(e) => setNewOrder({ ...newOrder, buyerName: e.target.value })}
                className={inputClass}
                placeholder="Ad Soyad"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={newOrder.buyerEmail}
                onChange={(e) => setNewOrder({ ...newOrder, buyerEmail: e.target.value })}
                className={inputClass}
                placeholder="email@example.com"
              />
            </Field>
            <Field label="Qiymət (AZN)">
              <input
                type="number"
                value={newOrder.price}
                onChange={(e) => setNewOrder({ ...newOrder, price: Number(e.target.value) })}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Ödəniş növü">
              <select
                value={newOrder.paymentMethod}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, paymentMethod: e.target.value as any })
                }
                className={inputClass}
              >
                <option value="card">Kart</option>
                <option value="bank_transfer">Bank köçürməsi</option>
                <option value="cash">Nağd</option>
                <option value="other">Digər</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={newOrder.status}
                onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as any })}
                className={inputClass}
              >
                <option value="pending">Gözlənilir</option>
                <option value="paid">Ödənilib</option>
                <option value="failed">Uğursuz</option>
              </select>
            </Field>
            <div className="flex items-end">
              <Button onClick={handleAddOrder} className="w-full">
                Əlavə et
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Orders List */}
      <Panel title={`Sifarişlər (${orders.length})`}>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hələ heç bir sifariş yoxdur
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Alıcı</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Qiymət</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Ödəniş</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Tarix</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{order.buyerName}</div>
                      <div className="text-xs text-gray-500">{order.buyerEmail}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{order.price} ₼</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">
                        {order.paymentMethod === "card" && "Kart"}
                        {order.paymentMethod === "bank_transfer" && "Bank köçürməsi"}
                        {order.paymentMethod === "cash" && "Nağd"}
                        {order.paymentMethod === "other" && "Digər"}
                      </div>
                      {order.transactionId && (
                        <div className="text-xs text-gray-500">ID: {order.transactionId}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[order.status]}>
                        {ejournalOrderStatusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString("az-AZ")}
                      </div>
                      {order.paidAt && (
                        <div className="text-xs text-green-600">
                          Ödənilib: {new Date(order.paidAt).toLocaleDateString("az-AZ")}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, "paid")}
                              className="text-xs text-green-600 hover:text-green-800 hover:underline text-left"
                            >
                              ✓ Ödənilib et
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, "failed")}
                              className="text-xs text-red-600 hover:text-red-800 hover:underline text-left"
                            >
                              ✗ Uğursuz et
                            </button>
                          </>
                        )}
                        {order.status === "paid" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "refunded")}
                            className="text-xs text-orange-600 hover:text-orange-800 hover:underline text-left"
                          >
                            ↩ Geri qaytarıldı
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
