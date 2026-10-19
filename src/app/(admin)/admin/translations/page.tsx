"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import {
  listArticleTranslations,
  listTranslationJobs,
  getTranslationStats,
  findMissingTranslations,
  createTranslationJob,
  updateTranslationJob,
  deleteTranslationJob,
  upsertArticleTranslation,
  listArticles,
} from "@/lib/data/admin";
import {
  type ArticleTranslation,
  type TranslationJob,
  type TranslationJobInput,
  type TranslationStats,
  type Locale,
} from "@/lib/types";
import { locales } from "@/lib/i18n/config";

/**
 * Translation Manager
 * 
 * Features:
 * - Translation progress tracking (5 languages)
 * - Missing translations finder
 * - Translation jobs & assignments
 * - Completion percentage by language
 * - Bulk operations
 */
export default function TranslationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [translations, setTranslations] = useState<ArticleTranslation[]>([]);
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [missingTranslations, setMissingTranslations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "missing" | "jobs">("overview");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("en");
  const [showJobForm, setShowJobForm] = useState(false);
  
  const [jobFormData, setJobFormData] = useState<TranslationJobInput>({
    type: "article",
    resourceId: "",
    resourceTitle: "",
    targetLocale: "en",
    status: "pending",
    priority: "medium",
    sourceLocale: "az",
    createdAt: "",
    createdBy: "",
  });

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
      // Sync article translations first
      const articles = await listArticles();
      for (const article of articles) {
        await upsertArticleTranslation(article);
      }

      const [translationsData, jobsData, statsData] = await Promise.all([
        listArticleTranslations(),
        listTranslationJobs(),
        getTranslationStats(),
      ]);

      setTranslations(translationsData);
      setJobs(jobsData);
      setStats(statsData);
    } catch (err) {
      console.error("Məlumat yüklənmədi:", err);
    } finally {
      setLoading(false);
    }
  }

  // Load missing translations for selected locale
  useEffect(() => {
    if (selectedLocale && activeTab === "missing") {
      findMissingTranslations(selectedLocale).then(setMissingTranslations);
    }
  }, [selectedLocale, activeTab]);

  async function handleJobSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTranslationJob(jobFormData);
      setShowJobForm(false);
      loadData();
    } catch (err) {
      console.error("İş yaradılmadı:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleJobStatusChange(jobId: string, status: TranslationJob["status"]) {
    try {
      const updates: any = { status };
      if (status === "in_progress") {
        updates.startedAt = new Date().toISOString();
      } else if (status === "completed") {
        updates.completedAt = new Date().toISOString();
      }
      await updateTranslationJob(jobId, updates);
      loadData();
    } catch (err) {
      console.error("Status dəyişdirilmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleDeleteJob(id: string) {
    if (!confirm("Bu işi silmək istədiyinizdən əminsiniz?")) return;
    try {
      await deleteTranslationJob(id);
      loadData();
    } catch (err) {
      console.error("İş silinmədi:", err);
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
        <h1 className="text-3xl font-bold text-gray-900">Tərcümə İdarəetməsi</h1>
        <p className="mt-2 text-gray-600">
          5 dildə məzmun tərcümə status və idarəetmə
        </p>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {locales.map((locale) => {
            const localeStats = stats.completionByLocale[locale];
            return (
              <div key={locale} className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {locale === "az" && "🇦🇿 AZ"}
                    {locale === "en" && "🇬🇧 EN"}
                    {locale === "ru" && "🇷🇺 RU"}
                    {locale === "tr" && "🇹🇷 TR"}
                    {locale === "ar" && "🇸🇦 AR"}
                  </span>
                  <span className={`text-2xl font-bold ${
                    localeStats.percentage === 100
                      ? "text-green-600"
                      : localeStats.percentage >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {localeStats.percentage}%
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>✓ Tamamlanmış: {localeStats.completed}</div>
                  <div>⏳ Tərcümə olunur: {localeStats.inProgress}</div>
                  <div>✕ Boş: {localeStats.empty}</div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      localeStats.percentage === 100
                        ? "bg-green-500"
                        : localeStats.percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${localeStats.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {stats && (
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cəmi Məqalə</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
              </div>
              <div className="text-blue-500 text-4xl">📄</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktiv İşlər</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Bu həftə: {stats.completedJobsThisWeek} tamamlandı
                </p>
              </div>
              <div className="text-green-500 text-4xl">📋</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gecikən İşlər</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{stats.overdueJobs}</p>
                <p className="mt-1 text-xs text-gray-500">Deadline keçilib</p>
              </div>
              <div className="text-red-500 text-4xl">⚠️</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium ${
            activeTab === "overview"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Ümumi Baxış ({translations.length})
        </button>
        <button
          onClick={() => setActiveTab("missing")}
          className={`px-4 py-2 font-medium ${
            activeTab === "missing"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Boş Tərcümələr
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 font-medium ${
            activeTab === "jobs"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Tərcümə İşləri ({jobs.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Məqalə
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  AZ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  EN
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  RU
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  TR
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  AR
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {translations.map((trans) => (
                <tr key={trans.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{trans.articleSlug}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(trans.lastUpdatedAt).toLocaleDateString("az")}
                    </div>
                  </td>
                  {locales.map((locale) => {
                    const progress = trans.progress[locale];
                    return (
                      <td key={locale} className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                          progress.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : progress.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {progress.percentage}%
                        </div>
                        {progress.emptyFields > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            {progress.emptyFields} boş
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/articles?search=${trans.articleSlug}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Redaktə et"
                    >
                      ✏️
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {translations.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Heç bir məqalə yoxdur.
            </div>
          )}
        </div>
      )}

      {/* Tab: Missing Translations */}
      {activeTab === "missing" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <label className="mr-2 text-sm font-medium text-gray-700">Dil seç:</label>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value as Locale)}
                className="rounded border border-gray-300 px-3 py-2"
              >
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale === "az" && "🇦🇿 Azərbaycanca"}
                    {locale === "en" && "🇬🇧 English"}
                    {locale === "ru" && "🇷🇺 Русский"}
                    {locale === "tr" && "🇹🇷 Türkçe"}
                    {locale === "ar" && "🇸🇦 العربية"}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {missingTranslations.length} məqalədə boş tərcümə var
            </div>
          </div>

          <div className="rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Məqalə
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Boş Sahələr
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {missingTranslations.map((item) => (
                  <tr key={item.articleId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.articleSlug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.emptyFields.map((field: string) => (
                          <span
                            key={field}
                            className="inline-flex rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/articles?search=${item.articleSlug}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Tərcümə et →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {missingTranslations.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                ✓ Bütün məqalələr {selectedLocale} dilində tərcümə olunub!
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Jobs */}
      {activeTab === "jobs" && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowJobForm(true)}
              className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              <span className="text-lg">+</span>
              Yeni İş
            </button>
          </div>

          {showJobForm && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">Yeni Tərcümə İşi</h2>
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resurs ID</label>
                    <input
                      type="text"
                      value={jobFormData.resourceId}
                      onChange={(e) => setJobFormData({ ...jobFormData, resourceId: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      required
                      placeholder="Məqalə ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resurs Başlığı</label>
                    <input
                      type="text"
                      value={jobFormData.resourceTitle}
                      onChange={(e) => setJobFormData({ ...jobFormData, resourceTitle: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hədəf Dil</label>
                    <select
                      value={jobFormData.targetLocale}
                      onChange={(e) => setJobFormData({ ...jobFormData, targetLocale: e.target.value as Locale })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    >
                      {locales.map((locale) => (
                        <option key={locale} value={locale}>{locale.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={jobFormData.priority}
                      onChange={(e) => setJobFormData({ ...jobFormData, priority: e.target.value as any })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    >
                      <option value="low">Aşağı</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksək</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="date"
                      value={jobFormData.dueDate ? jobFormData.dueDate.substring(0, 10) : ""}
                      onChange={(e) => setJobFormData({
                        ...jobFormData,
                        dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Təyin Et</label>
                    <input
                      type="email"
                      value={jobFormData.assignedTo || ""}
                      onChange={(e) => setJobFormData({ ...jobFormData, assignedTo: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      placeholder="translator@example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
                  >
                    <span>✓</span>
                    Yarat
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <span>✕</span>
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    İş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Təyin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{job.resourceTitle}</div>
                      <div className="text-xs text-gray-500">
                        {job.sourceLocale.toUpperCase()} → {job.targetLocale.toUpperCase()}
                      </div>
                      <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                        job.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : job.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {job.priority === "high" && "Yüksək"}
                        {job.priority === "medium" && "Orta"}
                        {job.priority === "low" && "Aşağı"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.assignedTo || "Təyin edilməyib"}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleJobStatusChange(job.id, e.target.value as any)}
                        className={`rounded border px-2 py-1 text-xs font-semibold ${
                          job.status === "completed"
                            ? "border-green-300 bg-green-100 text-green-800"
                            : job.status === "in_progress"
                            ? "border-blue-300 bg-blue-100 text-blue-800"
                            : job.status === "failed"
                            ? "border-red-300 bg-red-100 text-red-800"
                            : "border-gray-300 bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="pending">Gözləyir</option>
                        <option value="in_progress">İcra olunur</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="failed">Uğursuz</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.dueDate ? new Date(job.dueDate).toLocaleDateString("az") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteJob(job.id)}
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

            {jobs.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Heç bir tərcümə işi yoxdur.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
