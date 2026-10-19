"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  listPushCampaigns,
  createPushCampaign,
  updatePushCampaign,
  deletePushCampaign,
  sendPushCampaign,
  getPushNotificationStats,
  listPushTemplates,
  createPushTemplate,
  getAudienceSize,
} from "@/lib/data/admin";
import {
  emptyLocalized,
  type PushNotificationCampaign,
  type PushNotificationCampaignInput,
  type PushNotificationTemplate,
  type PushNotificationTemplateInput,
  type PushNotificationStats,
  type PushAudience,
  type Locale,
} from "@/lib/types";
import { locales } from "@/lib/i18n/config";
import { categories } from "@/lib/categories";

/**
 * Push Notifications Manager
 * 
 * Features:
 * - Create & send push campaigns
 * - Audience segmentation (all, subscribers, premium, category)
 * - Notification templates
 * - Schedule sending
 * - Statistics dashboard (sent, opened, clicked)
 */
export default function PushNotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [campaigns, setCampaigns] = useState<PushNotificationCampaign[]>([]);
  const [templates, setTemplates] = useState<PushNotificationTemplate[]>([]);
  const [stats, setStats] = useState<PushNotificationStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PushNotificationCampaign | null>(null);
  
  const [campaignFormData, setCampaignFormData] = useState<PushNotificationCampaignInput>({
    name: "",
    type: "custom",
    status: "draft",
    title: emptyLocalized(),
    body: emptyLocalized(),
    audience: "all",
    stats: {
      totalRecipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
    },
    createdAt: "",
    createdBy: "",
  });

  const [templateFormData, setTemplateFormData] = useState<PushNotificationTemplateInput>({
    name: "",
    type: "custom",
    title: emptyLocalized(),
    body: emptyLocalized(),
    active: true,
    createdAt: "",
    createdBy: "",
  });

  const [audienceSize, setAudienceSize] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "stats">("campaigns");

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin");
    }
  }, [user, authLoading, router]);

  // Load data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [campaignsData, templatesData, statsData] = await Promise.all([
        listPushCampaigns(),
        listPushTemplates(),
        getPushNotificationStats(),
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (err) {
      console.error("Məlumat yüklənmədi:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate audience size when audience type changes
  useEffect(() => {
    if (campaignFormData.audience) {
      getAudienceSize(
        campaignFormData.audience,
        campaignFormData.categorySlug,
        campaignFormData.subscriptionPlan
      ).then(setAudienceSize);
    }
  }, [campaignFormData.audience, campaignFormData.categorySlug, campaignFormData.subscriptionPlan]);

  function openCampaignForm() {
    setEditingCampaign(null);
    setCampaignFormData({
      name: "",
      type: "custom",
      status: "draft",
      title: emptyLocalized(),
      body: emptyLocalized(),
      audience: "all",
      stats: {
        totalRecipients: 0,
        sent: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
      },
      createdAt: new Date().toISOString(),
      createdBy: user?.email || "",
    });
    setShowCampaignForm(true);
  }

  function openEditCampaignForm(campaign: PushNotificationCampaign) {
    setEditingCampaign(campaign);
    setCampaignFormData({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      title: campaign.title,
      body: campaign.body,
      imageUrl: campaign.imageUrl,
      clickUrl: campaign.clickUrl,
      audience: campaign.audience,
      categorySlug: campaign.categorySlug,
      subscriptionPlan: campaign.subscriptionPlan,
      scheduledAt: campaign.scheduledAt,
      stats: campaign.stats,
      createdAt: campaign.createdAt,
      createdBy: campaign.createdBy,
    });
    setShowCampaignForm(true);
  }

  async function handleCampaignSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await updatePushCampaign(editingCampaign.id, campaignFormData);
      } else {
        await createPushCampaign(campaignFormData);
      }
      setShowCampaignForm(false);
      loadData();
    } catch (err) {
      console.error("Kampaniya saxlanmadı:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleSendCampaign(id: string) {
    if (!confirm("Bu kampaniyanı indi göndərmək istədiyinizdən əminsiniz?")) return;
    try {
      await sendPushCampaign(id);
      alert("Kampaniya göndərilir... (Backend job triggered)");
      loadData();
    } catch (err) {
      console.error("Kampaniya göndərilmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleDeleteCampaign(id: string) {
    if (!confirm("Bu kampaniyanı silmək istədiyinizdən əminsiniz?")) return;
    try {
      await deletePushCampaign(id);
      loadData();
    } catch (err) {
      console.error("Kampaniya silinmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleTemplateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPushTemplate(templateFormData);
      setShowTemplateForm(false);
      loadData();
    } catch (err) {
      console.error("Şablon saxlanmadı:", err);
      alert("Xəta baş verdi");
    }
  }

  function applyTemplate(template: PushNotificationTemplate) {
    setCampaignFormData({
      ...campaignFormData,
      type: template.type,
      title: template.title,
      body: template.body,
      imageUrl: template.imageUrl,
      clickUrl: template.clickUrl,
    });
    setShowCampaignForm(true);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Push Bildirişlər</h1>
        <p className="mt-2 text-gray-600">
          Web push kampaniyaları, şablonlar və statistika
        </p>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cəmi Kampaniya</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Göndərilib: {stats.sentCampaigns} | Planlaşdırılıb: {stats.scheduledCampaigns}
                </p>
              </div>
              <div className="text-blue-500 text-4xl">📢</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Göndərilən</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSent}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Bu həftə: {stats.thisWeekSent} | Bu ay: {stats.thisMonthSent}
                </p>
              </div>
              <div className="text-green-500 text-4xl">📤</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Açılma Dərəcəsi</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.openRate}%</p>
                <p className="mt-1 text-xs text-gray-500">
                  Açılıb: {stats.totalOpened} / {stats.totalSent}
                </p>
              </div>
              <div className="text-purple-500 text-4xl">👁️</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Klik Dərəcəsi</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.clickRate}%</p>
                <p className="mt-1 text-xs text-gray-500">
                  Klik: {stats.totalClicked} / {stats.totalOpened}
                </p>
              </div>
              <div className="text-orange-500 text-4xl">👆</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 font-medium ${
            activeTab === "campaigns"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Kampaniyalar ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 font-medium ${
            activeTab === "templates"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Şablonlar ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-medium ${
            activeTab === "stats"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Detallı Statistika
        </button>
      </div>

      {/* Tab: Campaigns */}
      {activeTab === "campaigns" && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={openCampaignForm}
              className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              <span className="text-lg">+</span>
              Yeni Kampaniya
            </button>
          </div>

          {showCampaignForm && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {editingCampaign ? "Kampaniyanı Redaktə Et" : "Yeni Kampaniya Yarat"}
              </h2>
              <form onSubmit={handleCampaignSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kampaniya Adı</label>
                    <input
                      type="text"
                      value={campaignFormData.name}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      required
                      placeholder="Məs: Yeni məqalə bildirişi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bildiriş Tipi</label>
                    <select
                      value={campaignFormData.type}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, type: e.target.value as any })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    >
                      <option value="new_article">Yeni məqalə</option>
                      <option value="breaking_news">Təcili xəbər</option>
                      <option value="ebook_promotion">E-kitab promosyonu</option>
                      <option value="subscription">Üzvlük xatırlatması</option>
                      <option value="custom">Xüsusi mesaj</option>
                    </select>
                  </div>
                </div>

                {/* Multilingual Title & Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlıq (5 dil)</label>
                  <div className="space-y-2">
                    {locales.map((locale) => (
                      <div key={locale} className="flex items-center gap-2">
                        <span className="w-12 text-xs font-medium uppercase text-gray-600">{locale}:</span>
                        <input
                          type="text"
                          value={campaignFormData.title[locale]}
                          onChange={(e) => setCampaignFormData({
                            ...campaignFormData,
                            title: { ...campaignFormData.title, [locale]: e.target.value },
                          })}
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          placeholder={`Başlıq (${locale})`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mətn (5 dil)</label>
                  <div className="space-y-2">
                    {locales.map((locale) => (
                      <div key={locale} className="flex items-start gap-2">
                        <span className="w-12 pt-2 text-xs font-medium uppercase text-gray-600">{locale}:</span>
                        <textarea
                          value={campaignFormData.body[locale]}
                          onChange={(e) => setCampaignFormData({
                            ...campaignFormData,
                            body: { ...campaignFormData.body, [locale]: e.target.value },
                          })}
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          rows={2}
                          placeholder={`Mətn (${locale})`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image & Click URL */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Şəkil URL (opsional)</label>
                    <input
                      type="url"
                      value={campaignFormData.imageUrl || ""}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, imageUrl: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Klik URL</label>
                    <input
                      type="url"
                      value={campaignFormData.clickUrl || ""}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, clickUrl: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      placeholder="/az/meqaleler/..."
                    />
                  </div>
                </div>

                {/* Audience */}
                <div className="rounded border border-gray-200 p-4">
                  <h3 className="mb-3 font-medium text-gray-900">Auditoriya</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-700">Auditoriya tipi</label>
                      <select
                        value={campaignFormData.audience}
                        onChange={(e) => setCampaignFormData({
                          ...campaignFormData,
                          audience: e.target.value as PushAudience,
                        })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      >
                        <option value="all">Bütün istifadəçilər</option>
                        <option value="subscribers">Newsletter abunəçiləri</option>
                        <option value="premium">Premium üzvlər</option>
                        <option value="category">Kateqoriya marağı</option>
                      </select>
                    </div>

                    {campaignFormData.audience === "category" && (
                      <div>
                        <label className="block text-sm text-gray-700">Kateqoriya</label>
                        <select
                          value={campaignFormData.categorySlug || ""}
                          onChange={(e) => setCampaignFormData({
                            ...campaignFormData,
                            categorySlug: e.target.value as any,
                          })}
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        >
                          <option value="">Seç...</option>
                          {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>{cat.name.az}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {campaignFormData.audience === "premium" && (
                      <div>
                        <label className="block text-sm text-gray-700">Üzvlük Planı</label>
                        <select
                          value={campaignFormData.subscriptionPlan || ""}
                          onChange={(e) => setCampaignFormData({
                            ...campaignFormData,
                            subscriptionPlan: e.target.value as any,
                          })}
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        >
                          <option value="">Hamısı</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    📊 Təxmini auditoriya: <span className="font-bold">{audienceSize}</span> cihaz
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Göndərmə Vaxtı</label>
                  <input
                    type="datetime-local"
                    value={campaignFormData.scheduledAt ? campaignFormData.scheduledAt.substring(0, 16) : ""}
                    onChange={(e) => setCampaignFormData({
                      ...campaignFormData,
                      scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Boş qoyun = dərhal göndər. Tarix seçin = planlaşdırılmış göndərim.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    <span>✓</span>
                    Saxla
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCampaignForm(false)}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <span>✕</span>
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Campaigns List */}
          <div className="rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kampaniya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Auditoriya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Statistika
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.title.az}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(campaign.createdAt).toLocaleDateString("az")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {campaign.audience === "all" && "Bütün istifadəçilər"}
                      {campaign.audience === "subscribers" && "Newsletter abunəçiləri"}
                      {campaign.audience === "premium" && "Premium üzvlər"}
                      {campaign.audience === "category" && `Kateqoriya: ${campaign.categorySlug}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        campaign.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "sending"
                          ? "bg-blue-100 text-blue-800"
                          : campaign.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : campaign.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {campaign.status === "sent" && "Göndərilib"}
                        {campaign.status === "sending" && "Göndərilir"}
                        {campaign.status === "scheduled" && "Planlaşdırılıb"}
                        {campaign.status === "failed" && "Uğursuz"}
                        {campaign.status === "draft" && "Layihə"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Göndərilib: {campaign.stats.sent}</div>
                      <div>Açılıb: {campaign.stats.opened}</div>
                      <div>Klik: {campaign.stats.clicked}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {campaign.status === "draft" && (
                        <>
                          <button
                            onClick={() => handleSendCampaign(campaign.id)}
                            className="mr-2 text-green-600 hover:text-green-900"
                            title="Göndər"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => openEditCampaignForm(campaign)}
                            className="mr-2 text-blue-600 hover:text-blue-900"
                            title="Redaktə et"
                          >
                            ✏️
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {campaigns.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Heç bir kampaniya yoxdur. Yeni kampaniya yaradın.
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Templates */}
      {activeTab === "templates" && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowTemplateForm(true)}
              className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              <span className="text-lg">+</span>
              Yeni Şablon
            </button>
          </div>

          {showTemplateForm && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">Yeni Şablon Yarat</h2>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şablon Adı</label>
                  <input
                    type="text"
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlıq (Azərbaycanca)</label>
                  <input
                    type="text"
                    value={templateFormData.title.az}
                    onChange={(e) => setTemplateFormData({
                      ...templateFormData,
                      title: { ...templateFormData.title, az: e.target.value },
                    })}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    placeholder="Variables: {{title}}, {{author}}"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    <span>✓</span>
                    Saxla
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplateForm(false)}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <span>✕</span>
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg bg-white p-4 shadow">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{template.title.az}</p>
                <p className="mt-1 text-xs text-gray-500">{template.body.az.substring(0, 80)}...</p>
                <button
                  onClick={() => applyTemplate(template)}
                  className="mt-3 text-sm text-pink-600 hover:text-pink-700"
                >
                  Tətbiq et →
                </button>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Heç bir şablon yoxdur. Yeni şablon yaradın.
            </div>
          )}
        </>
      )}

      {/* Tab: Detailed Stats */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Ümumi Performans</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Cəmi Göndərilən</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalSent}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cəmi Açılma</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalOpened}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cəmi Klik</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalClicked}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Dərəcələr</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Açılma Dərəcəsi</span>
                <span className="text-lg font-bold text-blue-600">{stats.openRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Klik Dərəcəsi</span>
                <span className="text-lg font-bold text-green-600">{stats.clickRate}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Cihazlar</h2>
            <div>
              <p className="text-sm text-gray-600">Aktiv FCM Token</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.activeFcmTokens}</p>
              <p className="mt-1 text-xs text-gray-500">
                Web + Mobile + iOS bildiriş alacaq cihaz sayı
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
