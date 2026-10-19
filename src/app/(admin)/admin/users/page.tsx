"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";
import type { FrontendUser, UserStats, UserStatus } from "@/lib/types";
import {
  listFrontendUsers,
  updateUserStatus,
  deleteFrontendUser,
  bulkUpdateUserStatus,
  getUserStats,
} from "@/lib/data/admin";
import { userStatusLabels } from "@/lib/types";
import Link from "next/link";

export default function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [usersData, statsData] = await Promise.all([
        listFrontendUsers(selectedStatus === "all" ? undefined : selectedStatus),
        getUserStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError("İstifadəçilər yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: UserStatus, reason?: string) {
    if (!session?.email) return;

    const confirmed = confirm(
      `Bu istifadəçinin statusunu "${userStatusLabels[status]}" olaraq dəyişdirmək istədiyinizə əminsiniz?`
    );

    if (!confirmed) return;

    try {
      await updateUserStatus(id, status, session.email, reason);
      setSuccess(`İstifadəçi statusu "${userStatusLabels[status]}" olaraq dəyişdirildi`);
      loadData();
    } catch (err) {
      console.error(err);
      setError("Status dəyişdirilərkən xəta baş verdi");
    }
  }

  async function handleDelete(id: string) {
    if (!session?.email) return;

    const confirmed = confirm(
      "Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz."
    );

    if (!confirmed) return;

    try {
      await deleteFrontendUser(id, session.email);
      setSuccess("İstifadəçi uğurla silindi");
      loadData();
    } catch (err) {
      console.error(err);
      setError("İstifadəçi silinərkən xəta baş verdi");
    }
  }

  async function handleBulkAction(action: UserStatus | "delete") {
    if (!session?.email || selectedIds.size === 0) return;

    const confirmed = confirm(
      `Seçilmiş ${selectedIds.size} istifadəçini ${action === "delete" ? "silmək" : `"${userStatusLabels[action as UserStatus]}" etmək`} istədiyinizə əminsiniz?`
    );

    if (!confirmed) return;

    try {
      if (action === "delete") {
        await Promise.all(
          Array.from(selectedIds).map((id) => deleteFrontendUser(id, session.email))
        );
      } else {
        await bulkUpdateUserStatus(Array.from(selectedIds), action, session.email);
      }
      setSuccess(
        `${selectedIds.size} istifadəçi uğurla ${action === "delete" ? "silindi" : "yeniləndi"}`
      );
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      console.error(err);
      setError("Bulk əməliyyat zamanı xəta baş verdi");
    }
  }

  function toggleSelect(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function selectAll() {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
    }
  }

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader title="İstifadəçilər" description="Yüklənir..." />
      </div>
    );
  }

  const statusColors: Record<UserStatus, string> = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    deleted: "bg-gray-100 text-gray-800",
  };

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

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="İstifadəçilər"
        description="Registered istifadəçilərin profilləri, aktivlikləri və oxuma tarixçəsi"
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Cəmi</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-700">Aktiv</div>
            <div className="text-2xl font-bold text-green-800">{stats.active}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-red-700">Dayandırılıb</div>
            <div className="text-2xl font-bold text-red-800">{stats.suspended}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-700">Silinib</div>
            <div className="text-2xl font-bold text-gray-800">{stats.deleted}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">Bu gün</div>
            <div className="text-2xl font-bold text-blue-800">{stats.todayCount}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700">Aylıq artım</div>
            <div className="text-2xl font-bold text-purple-800">+{stats.monthlyGrowth}</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="text-sm text-indigo-700">Ort. oxuma</div>
            <div className="text-2xl font-bold text-indigo-800">{stats.avgArticlesRead}</div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {(["all", "active", "suspended", "deleted"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                selectedStatus === status
                  ? "bg-white border-b-2 border-blue-500 text-blue-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "Hamısı" : userStatusLabels[status]}
              {status !== "all" && stats && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {status === "active" && stats.active}
                  {status === "suspended" && stats.suspended}
                  {status === "deleted" && stats.deleted}
                </span>
              )}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İstifadəçi axtar (ad, email, telefon)..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-blue-800 font-medium">{selectedIds.size} istifadəçi seçildi</div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => handleBulkAction("active")}
              className="!text-green-700 !bg-green-50 !border-green-300 hover:!bg-green-100"
            >
              ✓ Aktivləşdir
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleBulkAction("suspended")}
              className="!text-orange-700 !bg-orange-50 !border-orange-300"
            >
              🚫 Dayandır
            </Button>
            <Button variant="danger" onClick={() => handleBulkAction("delete")}>
              🗑 Sil
            </Button>
            <Button variant="ghost" onClick={() => setSelectedIds(new Set())}>
              İmtina
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Panel title="İstifadəçilər" className="overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery
              ? `"${searchQuery}" üçün nəticə tapılmadı`
              : selectedStatus === "all"
                ? "Hələ heç bir istifadəçi yoxdur"
                : `"${userStatusLabels[selectedStatus as UserStatus]}" statusunda istifadəçi yoxdur`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">İstifadəçi</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Əlaqə</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Aktivlik</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Qeydiyyat</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.has(user.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.city && user.country
                              ? `${user.city}, ${user.country}`
                              : user.country || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone || "—"}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">{user.articlesRead} məqalə</div>
                      <div className="text-xs text-gray-500">{user.commentsCount} şərh</div>
                      {user.lastLoginAt && (
                        <div className="text-xs text-gray-400">
                          Son: {new Date(user.lastLoginAt).toLocaleDateString("az-AZ")}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[user.status]}>
                        {userStatusLabels[user.status]}
                      </Badge>
                      {user.status === "suspended" && user.suspendedReason && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs">
                          {user.suspendedReason}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("az-AZ")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleTimeString("az-AZ")}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          👤 Profil
                        </Link>
                        {user.status === "active" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                user.id,
                                "suspended",
                                prompt("Dayandırma səbəbi:") || undefined
                              )
                            }
                            className="text-xs text-orange-600 hover:text-orange-800 hover:underline text-left"
                          >
                            🚫 Dayandır
                          </button>
                        )}
                        {user.status === "suspended" && (
                          <button
                            onClick={() => handleStatusChange(user.id, "active")}
                            className="text-xs text-green-600 hover:text-green-800 hover:underline text-left"
                          >
                            ✓ Aktivləşdir
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline text-left"
                        >
                          🗑 Sil
                        </button>
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
