"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  listEnhancedCategories,
  createEnhancedCategory,
  updateEnhancedCategory,
  deleteEnhancedCategory,
  listCategoryStats,
  upsertCategoryStats,
  reorderCategories,
} from "@/lib/data/admin";
import {
  emptyLocalized,
  type EnhancedCategory,
  type EnhancedCategoryInput,
  type CategoryStats,
  type Locale,
} from "@/lib/types";
import { locales } from "@/lib/i18n/config";

/**
 * Category Manager Enhancement
 * 
 * Features:
 * - Nested categories (parent-child)
 * - SEO metadata (title, description, keywords)
 * - Category icons & colors
 * - Article count statistics
 * - Drag & drop ordering (manual order input for now)
 * - Active/inactive status
 */
export default function CategoriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EnhancedCategory | null>(null);
  
  const [formData, setFormData] = useState<EnhancedCategoryInput>({
    slug: "",
    name: emptyLocalized(),
    description: emptyLocalized(),
    tagline: emptyLocalized(),
    icon: "📁",
    color: "#ec4899",
    seo: {
      title: emptyLocalized(),
      description: emptyLocalized(),
      keywords: { az: [], en: [], ru: [], tr: [], ar: [] },
    },
    active: true,
    order: 0,
    articleCount: 0,
    createdAt: "",
    createdBy: "",
  });

  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");

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
      const [categoriesData, statsData] = await Promise.all([
        listEnhancedCategories(),
        listCategoryStats(),
      ]);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (err) {
      console.error("Məlumat yüklənmədi:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingCategory(null);
    setFormData({
      slug: "",
      name: emptyLocalized(),
      description: emptyLocalized(),
      tagline: emptyLocalized(),
      icon: "📁",
      color: "#ec4899",
      seo: {
        title: emptyLocalized(),
        description: emptyLocalized(),
        keywords: { az: [], en: [], ru: [], tr: [], ar: [] },
      },
      active: true,
      order: categories.length,
      articleCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || "",
    });
    setShowForm(true);
  }

  function openEditForm(category: EnhancedCategory) {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      parentId: category.parentId,
      name: category.name,
      description: category.description,
      tagline: category.tagline,
      icon: category.icon,
      color: category.color,
      seo: category.seo,
      active: category.active,
      order: category.order,
      articleCount: category.articleCount,
      createdAt: category.createdAt,
      createdBy: category.createdBy,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateEnhancedCategory(editingCategory.id, formData);
      } else {
        await createEnhancedCategory(formData);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Kateqoriya saxlanmadı:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kateqoriyanı silmək istədiyinizdən əminsiniz?")) return;
    try {
      await deleteEnhancedCategory(id);
      loadData();
    } catch (err) {
      console.error("Kateqoriya silinmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleUpdateStats(categorySlug: string) {
    try {
      await upsertCategoryStats(categorySlug);
      loadData();
    } catch (err) {
      console.error("Statistika yenilənmədi:", err);
    }
  }

  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

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
        <h1 className="text-3xl font-bold text-gray-900">Kateqoriya İdarəetməsi</h1>
        <p className="mt-2 text-gray-600">
          Nested kateqoriyalar, SEO, icon və statistika
        </p>
      </div>

      {/* Stats Summary */}
      <div className="mb-8 grid gap-6 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cəmi Kateqoriya</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{categories.length}</p>
              <p className="mt-1 text-xs text-gray-500">
                Parent: {parentCategories.length} | Child: {categories.length - parentCategories.length}
              </p>
            </div>
            <div className="text-blue-500 text-4xl">📂</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktiv</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {categories.filter((c) => c.active).length}
              </p>
            </div>
            <div className="text-green-500 text-4xl">✓</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deaktiv</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {categories.filter((c) => !c.active).length}
              </p>
            </div>
            <div className="text-red-500 text-4xl">✕</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cəmi Məqalə</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {categories.reduce((sum, c) => sum + c.articleCount, 0)}
              </p>
            </div>
            <div className="text-purple-500 text-4xl">📝</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 font-medium ${
            activeTab === "list"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Kateqoriyalar ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-medium ${
            activeTab === "stats"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Statistika
        </button>
      </div>

      {/* Tab: List */}
      {activeTab === "list" && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              <span className="text-lg">+</span>
              Yeni Kateqoriya
            </button>
          </div>

          {showForm && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {editingCategory ? "Kateqoriyanı Redaktə Et" : "Yeni Kateqoriya Yarat"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      required
                      placeholder="moda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Kateqoriya</label>
                    <select
                      value={formData.parentId || ""}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    >
                      <option value="">Yoxdur (Top level)</option>
                      {parentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name.az}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.icon || ""}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-2xl"
                      placeholder="📁"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rəng (Hex)</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="color"
                        value={formData.color || "#ec4899"}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-16 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.color || ""}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 rounded border border-gray-300 px-3 py-2"
                        placeholder="#ec4899"
                      />
                    </div>
                  </div>

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

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Aktiv</span>
                    </label>
                  </div>
                </div>

                {/* Multilingual Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad (5 dil)</label>
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
                          placeholder={`Ad (${locale})`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tagline (simplified - only AZ) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tagline (Azərbaycanca)</label>
                  <textarea
                    value={formData.tagline.az}
                    onChange={(e) => setFormData({
                      ...formData,
                      tagline: { ...formData.tagline, az: e.target.value },
                    })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    rows={2}
                  />
                </div>

                {/* SEO */}
                <div className="rounded border border-gray-200 p-4">
                  <h3 className="mb-3 font-medium text-gray-900">SEO Metadata</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700">Meta Title (Azərbaycanca)</label>
                      <input
                        type="text"
                        value={formData.seo.title.az}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo,
                            title: { ...formData.seo.title, az: e.target.value },
                          },
                        })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">Meta Description (Azərbaycanca)</label>
                      <textarea
                        value={formData.seo.description.az}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo,
                            description: { ...formData.seo.description, az: e.target.value },
                          },
                        })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700">Meta Keywords (Azərbaycanca, vergüllə ayır)</label>
                      <input
                        type="text"
                        value={formData.seo.keywords.az.join(", ")}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo,
                            keywords: {
                              ...formData.seo.keywords,
                              az: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                            },
                          },
                        })}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        placeholder="moda, stil, gözəllik"
                      />
                    </div>
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

          {/* Categories List (Hierarchical) */}
          <div className="space-y-4">
            {parentCategories.map((parent) => (
              <div key={parent.id} className="rounded-lg bg-white shadow">
                {/* Parent Category */}
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{parent.icon || "📁"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{parent.name.az}</span>
                        {!parent.active && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Deaktiv
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Slug: {parent.slug} | Məqalə: {parent.articleCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStats(parent.slug)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Statistika yenilə"
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => openEditForm(parent)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Redaktə et"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Child Categories */}
                {childCategories(parent.id).length > 0 && (
                  <div className="divide-y bg-gray-50">
                    {childCategories(parent.id).map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-4 pl-12">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{child.icon || "📄"}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{child.name.az}</span>
                              {!child.active && (
                                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                  Deaktiv
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Slug: {child.slug} | Məqalə: {child.articleCount}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStats(child.slug)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Statistika yenilə"
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => openEditForm(child)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Redaktə et"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(child.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Categories without parent */}
            {categories.filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId)).length > 0 && (
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Parent-i olmayan child kateqoriyalar:
                </p>
                <div className="mt-2 space-y-2">
                  {categories
                    .filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId))
                    .map((orphan) => (
                      <div key={orphan.id} className="text-sm text-yellow-700">
                        {orphan.name.az} (Parent ID: {orphan.parentId})
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Stats */}
      {activeTab === "stats" && (
        <div className="rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kateqoriya
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cəmi
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dərc
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Draft
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Son 30 gün
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((stat) => {
                const category = categories.find((c) => c.slug === stat.categorySlug);
                return (
                  <tr key={stat.categorySlug} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {category && <span className="text-xl">{category.icon}</span>}
                        <span className="font-medium text-gray-900">
                          {category?.name.az || stat.categorySlug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {stat.totalArticles}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-green-600">
                      {stat.publishedArticles}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-yellow-600">
                      {stat.draftArticles}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-blue-600">
                      {stat.articlesLast30Days}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {stats.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Statistika yoxdur. "Statistika yenilə" düyməsinə basın.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
