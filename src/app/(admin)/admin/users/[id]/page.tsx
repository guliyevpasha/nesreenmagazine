"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";
import type { FrontendUser, UserReadingHistory, UserActivity } from "@/lib/types";
import {
  getFrontendUser,
  updateUserStatus,
  deleteFrontendUser,
  getUserReadingHistory,
  getUserActivities,
} from "@/lib/data/admin";
import { userStatusLabels } from "@/lib/types";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const userId = params.id as string;

  const [user, setUser] = useState<FrontendUser | null>(null);
  const [readingHistory, setReadingHistory] = useState<UserReadingHistory[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "reading" | "activity">("profile");

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [userData, historyData, activitiesData] = await Promise.all([
        getFrontendUser(userId),
        getUserReadingHistory(userId),
        getUserActivities(userId),
      ]);

      if (!userData) {
        setError("İstifadəçi tapılmadı");
        return;
      }

      setUser(userData);
      setReadingHistory(historyData);
      setActivities(activitiesData);
    } catch (err) {
      console.error(err);
      setError("Məlumatlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status: "active" | "suspended", reason?: string) {
    if (!session?.email || !user) return;

    const confirmed = confirm(
      `Bu istifadəçinin statusunu "${userStatusLabels[status]}" olaraq dəyişdirmək istədiyinizə əminsiniz?`
    );

    if (!confirmed) return;

    try {
      await updateUserStatus(user.id, status, session.email, reason);
      setSuccess(`İstifadəçi statusu "${userStatusLabels[status]}" olaraq dəyişdirildi`);
      loadData();
    } catch (err) {
      console.error(err);
      setError("Status dəyişdirilərkən xəta baş verdi");
    }
  }

  async function handleDelete() {
    if (!session?.email || !user) return;

    const confirmed = confirm(
      "Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz."
    );

    if (!confirmed) return;

    try {
      await deleteFrontendUser(user.id, session.email);
      setSuccess("İstifadəçi uğurla silindi");
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (err) {
      console.error(err);
      setError("İstifadəçi silinərkən xəta baş verdi");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader title="İstifadəçi profili" description="Yüklənir..." backHref="/admin/users" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <PageHeader title="İstifadəçi tapılmadı" backHref="/admin/users" />
        <Alert tone="error">İstifadəçi tapılmadı və ya silinib</Alert>
      </div>
    );
  }

  const statusColors = {
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
        title={user.name}
        description={user.email}
        backHref="/admin/users"
        actions={
          <div className="flex gap-2">
            {user.status === "active" && (
              <Button
                variant="ghost"
                onClick={() =>
                  handleStatusChange("suspended", prompt("Dayandırma səbəbi:") || undefined)
                }
                className="!text-orange-700 !border-orange-300"
              >
                🚫 Dayandır
              </Button>
            )}
            {user.status === "suspended" && (
              <Button
                variant="primary"
                onClick={() => handleStatusChange("active")}
                className="!text-green-700 !bg-green-50 !border-green-300"
              >
                ✓ Aktivləşdir
              </Button>
            )}
            <Button variant="danger" onClick={handleDelete}>
              🗑 Sil
            </Button>
          </div>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* User Info Card */}
      <Panel title="İstifadəçi məlumatları">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 col-span-full">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <Badge className={statusColors[user.status]}>{userStatusLabels[user.status]}</Badge>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Telefon</div>
            <div className="text-base text-gray-900">{user.phone || "—"}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Doğum tarixi</div>
            <div className="text-base text-gray-900">
              {user.birthDate
                ? new Date(user.birthDate).toLocaleDateString("az-AZ")
                : "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Cins</div>
            <div className="text-base text-gray-900">
              {user.gender === "male"
                ? "Kişi"
                : user.gender === "female"
                  ? "Qadın"
                  : user.gender === "other"
                    ? "Digər"
                    : "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Yer</div>
            <div className="text-base text-gray-900">
              {user.city && user.country
                ? `${user.city}, ${user.country}`
                : user.country || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Dil</div>
            <div className="text-base text-gray-900">
              {user.locale === "az"
                ? "Azərbaycanca"
                : user.locale === "en"
                  ? "English"
                  : user.locale === "ru"
                    ? "Русский"
                    : user.locale === "tr"
                      ? "Türkçe"
                      : "العربية"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Newsletter</div>
            <div className="text-base text-gray-900">
              {user.subscribedToNewsletter ? "✓ Abunə" : "✗ Abunə deyil"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Qeydiyyat tarixi</div>
            <div className="text-base text-gray-900">
              {new Date(user.createdAt).toLocaleDateString("az-AZ")}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Son giriş</div>
            <div className="text-base text-gray-900">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString("az-AZ")
                : "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Oxunan məqalələr</div>
            <div className="text-base text-gray-900 font-semibold">{user.articlesRead}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Yazılan şərhlər</div>
            <div className="text-base text-gray-900 font-semibold">{user.commentsCount}</div>
          </div>

          {user.interests && user.interests.length > 0 && (
            <div className="col-span-full">
              <div className="text-sm text-gray-600 mb-2">Maraq sahələri</div>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest} className="bg-blue-100 text-blue-800">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.status === "suspended" && user.suspendedReason && (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-red-800 mb-1">Dayandırılma səbəbi:</div>
              <div className="text-sm text-red-700">{user.suspendedReason}</div>
              {user.suspendedBy && (
                <div className="text-xs text-red-600 mt-2">
                  Dayandıran: {user.suspendedBy} ·{" "}
                  {user.suspendedAt && new Date(user.suspendedAt).toLocaleDateString("az-AZ")}
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["profile", "reading", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab === "profile" && "📋 Profil"}
            {tab === "reading" && `📖 Oxuma tarixçəsi (${readingHistory.length})`}
            {tab === "activity" && `📊 Aktivlik (${activities.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "reading" && (
        <Panel title="Oxuma tarixçəsi">
          {readingHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Hələ heç bir məqalə oxumayıb</div>
          ) : (
            <div className="space-y-3">
              {readingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.articleTitle}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <Badge className="bg-purple-100 text-purple-800">{item.category}</Badge>
                      {item.timeSpent && (
                        <span className="ml-2 text-xs text-gray-500">
                          {Math.round(item.timeSpent / 60)} dəqiqə
                        </span>
                      )}
                      {item.completed && (
                        <span className="ml-2 text-xs text-green-600">✓ Tamamlandı</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.readAt).toLocaleDateString("az-AZ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === "activity" && (
        <Panel title="Aktivlik jurnalı">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Hələ heç bir aktivlik yoxdur</div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-2xl">
                    {activity.type === "login" && "🔓"}
                    {activity.type === "logout" && "🔒"}
                    {activity.type === "article_read" && "📖"}
                    {activity.type === "comment_posted" && "💬"}
                    {activity.type === "profile_updated" && "✏️"}
                    {activity.type === "password_changed" && "🔑"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString("az-AZ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
