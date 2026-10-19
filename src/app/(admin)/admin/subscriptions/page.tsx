"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  listSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionStats,
  listUserSubscriptions,
} from "@/lib/data/admin";
import { emptyLocalized, type SubscriptionPlan, type SubscriptionPlanInput, type SubscriptionStats, type UserSubscription, type Locale } from "@/lib/types";
import { locales } from "@/lib/i18n/config";

/**
 * Subscription Plans Manager
 * 
 * Features:
 * - Free, Premium, VIP plan management
 * - Multilingual pricing & descriptions (5 languages)
 * - Stripe/PayPal integration placeholders
 * - Statistics dashboard (MRR, ARR, churn rate)
 * - User subscription list
 */
export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<SubscriptionPlanInput>({
    type: "free",
    name: emptyLocalized(),
    description: emptyLocalized(),
    features: { az: [], en: [], ru: [], tr: [], ar: [] },
    priceMonthly: 0,
    priceYearly: 0,
    active: true,
    popular: false,
    order: 0,
    ctaText: emptyLocalized(),
    limits: {
      monthlyArticleLimit: 0,
      ejournalDiscount: 0,
      premiumContent: false,
      showAds: true,
      earlyAccess: false,
      exclusiveNewsletter: false,
    },
    createdAt: "",
    createdBy: "",
  });

  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions" | "stats">("plans");

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
      const [plansData, statsData, subsData] = await Promise.all([
        listSubscriptionPlans(),
        getSubscriptionStats(),
        listUserSubscriptions(),
      ]);
      setPlans(plansData);
      setStats(statsData);
      setSubscriptions(subsData.slice(0, 50)); // İlk 50 üzvlük
    } catch (err) {
      console.error("Məlumat yüklənmədi:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingPlan(null);
    setFormData({
      type: "free",
      name: emptyLocalized(),
      description: emptyLocalized(),
      features: { az: [], en: [], ru: [], tr: [], ar: [] },
      priceMonthly: 0,
      priceYearly: 0,
      active: true,
      popular: false,
      order: plans.length,
      ctaText: emptyLocalized(),
      limits: {
        monthlyArticleLimit: 0,
        ejournalDiscount: 0,
        premiumContent: false,
        showAds: true,
        earlyAccess: false,
        exclusiveNewsletter: false,
      },
      createdAt: new Date().toISOString(),
      createdBy: user?.email || "",
    });
    setShowForm(true);
  }

  function openEditForm(plan: SubscriptionPlan) {
    setEditingPlan(plan);
    setFormData({
      type: plan.type,
      name: plan.name,
      description: plan.description,
      features: plan.features,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      stripeProductId: plan.stripeProductId,
      stripePriceIdMonthly: plan.stripePriceIdMonthly,
      stripePriceIdYearly: plan.stripePriceIdYearly,
      paypalPlanId: plan.paypalPlanId,
      active: plan.active,
      popular: plan.popular,
      order: plan.order,
      ctaText: plan.ctaText,
      badgeText: plan.badgeText,
      limits: plan.limits,
      createdAt: plan.createdAt,
      createdBy: plan.createdBy,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, formData);
      } else {
        await createSubscriptionPlan(formData);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Plan saxlanmadı:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu planı silmək istədiyinizdən əminsiniz?")) return;
    try {
      await deleteSubscriptionPlan(id);
      loadData();
    } catch (err) {
      console.error("Plan silinmədi:", err);
      alert("Xəta baş verdi");
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Üzvlük Planları</h1>
        <p className="mt-2 text-gray-600">
          Free, Premium və VIP planlar — qiymətlər, xüsusiyyətlər, statistika
        </p>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktiv Üzvlük</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalActive}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Free: {stats.freeUsers} | Premium: {stats.premiumUsers} | VIP: {stats.vipUsers}
                </p>
              </div>
              <div className="text-blue-500 text-4xl">👥</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR (Aylıq Gəlir)</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.monthlyRecurringRevenue.toFixed(0)} ₼
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  ARR: {stats.annualRecurringRevenue.toFixed(0)} ₼
                </p>
              </div>
              <div className="text-green-500 text-4xl">💳</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="mt-1 text-xs text-gray-500">
                  Free → Paid
                </p>
              </div>
              <div className="text-purple-500 text-4xl">📈</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.churnRate}%</p>
                <p className="mt-1 text-xs text-gray-500">
                  Bu ay: {stats.newThisMonth} yeni / {stats.cancelledThisMonth} ləğv
                </p>
              </div>
              <div className="text-red-500 text-4xl">📊</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 font-medium ${
            activeTab === "plans"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Planlar ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 font-medium ${
            activeTab === "subscriptions"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Üzvlüklər ({subscriptions.length})
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

      {/* Tab: Plans */}
      {activeTab === "plans" && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              <span className="text-lg">+</span>
              Yeni Plan
            </button>
          </div>

          {showForm && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {editingPlan ? "Planı Redaktə Et" : "Yeni Plan Yarat"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Tipi</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="free">Pulsuz</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aylıq Qiymət (₼)</label>
                    <input
                      type="number"
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">İllik Qiymət (₼)</label>
                    <input
                      type="number"
                      value={formData.priceYearly}
                      onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Multilingual Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Adı (5 dil)</label>
                  <div className="space-y-2">
                    {locales.map((locale) => (
                      <div key={locale} className="flex items-center gap-2">
                        <span className="w-12 text-xs font-medium uppercase text-gray-600">{locale}:</span>
                        <input
                          type="text"
                          value={formData.name[locale]}
                          onChange={(e) => setFormData({
                            ...formData,
                            name: { ...formData.name, [locale]: e.target.value },
                          })}
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          placeholder={`Plan adı (${locale})`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Təsvir (5 dil)</label>
                  <div className="space-y-2">
                    {locales.map((locale) => (
                      <div key={locale} className="flex items-start gap-2">
                        <span className="w-12 pt-2 text-xs font-medium uppercase text-gray-600">{locale}:</span>
                        <textarea
                          value={formData.description[locale]}
                          onChange={(e) => setFormData({
                            ...formData,
                            description: { ...formData.description, [locale]: e.target.value },
                          })}
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          rows={2}
                          placeholder={`Təsvir (${locale})`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA Mətni (5 dil)</label>
                  <div className="space-y-2">
                    {locales.map((locale) => (
                      <div key={locale} className="flex items-center gap-2">
                        <span className="w-12 text-xs font-medium uppercase text-gray-600">{locale}:</span>
                        <input
                          type="text"
                          value={formData.ctaText[locale]}
                          onChange={(e) => setFormData({
                            ...formData,
                            ctaText: { ...formData.ctaText, [locale]: e.target.value },
                          })}
                          className="flex-1 rounded border border-gray-300 px-3 py-2"
                          placeholder={`CTA button (${locale})`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features (simplified - only Azerbaijani for now) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xüsusiyyətlər (Azərbaycanca, hər xüsusiyyət yeni sətir)
                  </label>
                  <textarea
                    value={formData.features.az.join("\n")}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, az: e.target.value.split("\n").filter(Boolean) },
                    })}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    rows={5}
                    placeholder="Xüsusiyyət 1&#10;Xüsusiyyət 2&#10;Xüsusiyyət 3"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Digər dillərdə tərcümə üçün səhifədə redaktə edin
                  </p>
                </div>

                {/* Limits */}
                <div className="rounded border border-gray-200 p-4">
                  <h3 className="mb-3 font-medium text-gray-900">Plan Limitləri</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-700">Aylıq məqalə limiti (0 = limitsiz)</label>
                      <input
                        type="number"
                        value={formData.limits.monthlyArticleLimit}
                        onChange={(e) => setFormData({
                          ...formData,
                          limits: { ...formData.limits, monthlyArticleLimit: parseInt(e.target.value) || 0 },
                        })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">E-jurnal endirim (%)</label>
                      <input
                        type="number"
                        value={formData.limits.ejournalDiscount}
                        onChange={(e) => setFormData({
                          ...formData,
                          limits: { ...formData.limits, ejournalDiscount: parseInt(e.target.value) || 0 },
                        })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.limits.premiumContent}
                        onChange={(e) => setFormData({
                          ...formData,
                          limits: { ...formData.limits, premiumContent: e.target.checked },
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Premium kontent</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.limits.showAds}
                        onChange={(e) => setFormData({
                          ...formData,
                          limits: { ...formData.limits, showAds: e.target.checked },
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Reklamlar göstərilir</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.limits.earlyAccess}
                        onChange={(e) => setFormData({
                          ...formData,
                          limits: { ...formData.limits, earlyAccess: e.target.checked },
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Erkən giriş</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.limits.exclusiveNewsletter}
                        onChange={(e) => setFormData({
                          ...formData,
                          limits: { ...formData.limits, exclusiveNewsletter: e.target.checked },
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Xüsusi newsletter</span>
                    </label>
                  </div>
                </div>

                {/* Payment Integration */}
                <div className="rounded border border-gray-200 p-4">
                  <h3 className="mb-3 font-medium text-gray-900">Ödəniş İnteqrasiyası (Placeholder)</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-700">Stripe Product ID</label>
                      <input
                        type="text"
                        value={formData.stripeProductId || ""}
                        onChange={(e) => setFormData({ ...formData, stripeProductId: e.target.value })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        placeholder="prod_xxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">PayPal Plan ID</label>
                      <input
                        type="text"
                        value={formData.paypalPlanId || ""}
                        onChange={(e) => setFormData({ ...formData, paypalPlanId: e.target.value })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        placeholder="P-xxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">Stripe Price ID (Monthly)</label>
                      <input
                        type="text"
                        value={formData.stripePriceIdMonthly || ""}
                        onChange={(e) => setFormData({ ...formData, stripePriceIdMonthly: e.target.value })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        placeholder="price_xxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">Stripe Price ID (Yearly)</label>
                      <input
                        type="text"
                        value={formData.stripePriceIdYearly || ""}
                        onChange={(e) => setFormData({ ...formData, stripePriceIdYearly: e.target.value })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        placeholder="price_xxxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktiv</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Populyar (badge)</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sıralama</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      min="0"
                    />
                  </div>
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
                    onClick={() => setShowForm(false)}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <span>✕</span>
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Plans List */}
          <div className="rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Qiymət
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Limitlər
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{plan.name.az}</div>
                        <div className="text-sm text-gray-500">{plan.description.az.substring(0, 60)}...</div>
                        {plan.popular && (
                          <span className="mt-1 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            Populyar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {plan.priceMonthly > 0 ? `${plan.priceMonthly} ₼/ay` : "Pulsuz"}
                        </div>
                        {plan.priceYearly > 0 && (
                          <div className="text-gray-500">{plan.priceYearly} ₼/il</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        plan.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {plan.active ? "Aktiv" : "Deaktiv"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        {plan.limits.monthlyArticleLimit > 0 
                          ? `${plan.limits.monthlyArticleLimit} məqalə/ay`
                          : "Limitsiz"}
                      </div>
                      {plan.limits.ejournalDiscount > 0 && (
                        <div>E-jurnal: {plan.limits.ejournalDiscount}% endirim</div>
                      )}
                      {plan.limits.premiumContent && <div className="text-purple-600">Premium kontent</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditForm(plan)}
                        className="mr-2 text-blue-600 hover:text-blue-900"
                        title="Redaktə et"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
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

            {plans.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Heç bir plan yoxdur. Yeni plan yaradın.
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Subscriptions */}
      {activeTab === "subscriptions" && (
        <div className="rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  İstifadəçi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tarixlər
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Məbləğ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{sub.userId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      sub.planType === "vip"
                        ? "bg-purple-100 text-purple-800"
                        : sub.planType === "premium"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {sub.planType.toUpperCase()}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({sub.billingCycle === "monthly" ? "Aylıq" : "İllik"})
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      sub.status === "active"
                        ? "bg-green-100 text-green-800"
                        : sub.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : sub.status === "expired"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>Başlama: {new Date(sub.startedAt).toLocaleDateString("az")}</div>
                    <div>Bitmə: {new Date(sub.expiresAt).toLocaleDateString("az")}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {sub.amount} {sub.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscriptions.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Heç bir üzvlük yoxdur.
            </div>
          )}
        </div>
      )}

      {/* Tab: Detailed Stats */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Gəlir Analitikası</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Aylıq Recurring Gəlir (MRR)</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.monthlyRecurringRevenue} ₼
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">İllik Recurring Gəlir (ARR)</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.annualRecurringRevenue} ₼
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ortalama Üzvlük Dəyəri</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.avgSubscriptionValue.toFixed(2)} ₼
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate (Free → Paid)</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.conversionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Üzvlük Bölgüsü</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Free Plan</span>
                <span className="text-lg font-bold text-gray-900">{stats.freeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Premium Plan</span>
                <span className="text-lg font-bold text-blue-600">{stats.premiumUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">VIP Plan</span>
                <span className="text-lg font-bold text-purple-600">{stats.vipUsers}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Cəmi Aktiv</span>
                  <span className="text-lg font-bold text-gray-900">{stats.totalActive}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Bu Ay (Growth & Churn)</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Yeni Üzvlük</span>
                <span className="text-lg font-bold text-green-600">+{stats.newThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ləğv Edildi</span>
                <span className="text-lg font-bold text-red-600">-{stats.cancelledThisMonth}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Churn Rate</span>
                  <span className="text-lg font-bold text-gray-900">{stats.churnRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
