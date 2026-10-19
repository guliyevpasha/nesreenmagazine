"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  bulkDeleteTags,
  mergeTags,
  getTagStats,
  findUnusedTags,
  findDuplicateTags,
  updateAllTagUsageCounts,
} from "@/lib/data/admin";
import {
  emptyLocalized,
  type Tag,
  type TagInput,
  type TagStats,
  type Locale,
} from "@/lib/types";
import { locales } from "@/lib/i18n/config";

/**
 * Tags Manager
 * 
 * Features:
 * - Tag CRUD operations
 * - Tag merge (duplicate consolidation)
 * - Bulk operations (delete, activate, deactivate)
 * - Popularity statistics (usage count)
 * - Unused tags finder
 * - Duplicate detection
 * - 5-language support
 */
export default function TagsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [unusedTags, setUnusedTags] = useState<Tag[]>([]);
  const [duplicates, setDuplicates] = useState<{ name: string; tags: Tag[] }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<TagInput>({
    slug: "",
    name: emptyLocalized(),
    color: "#ec4899",
    active: true,
    usageCount: 0,
    createdAt: "",
    createdBy: "",
  });

  const [activeTab, setActiveTab] = useState<"all" | "unused" | "duplicates" | "stats">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      const [tagsData, statsData, unusedData, duplicatesData] = await Promise.all([
        listTags(),
        getTagStats(),
        findUnusedTags(),
        findDuplicateTags(),
      ]);
      setTags(tagsData);
      setStats(statsData);
      setUnusedTags(unusedData);
      setDuplicates(duplicatesData);
    } catch (err) {
      console.error("Məlumat yüklənmədi:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingTag(null);
    setFormData({
      slug: "",
      name: emptyLocalized(),
      color: "#ec4899",
      active: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || "",
    });
    setShowForm(true);
  }

  function openEditForm(tag: Tag) {
    setEditingTag(tag);
    setFormData({
      slug: tag.slug,
      name: tag.name,
      description: tag.description,
      color: tag.color,
      active: tag.active,
      usageCount: tag.usageCount,
      lastUsedAt: tag.lastUsedAt,
      createdAt: tag.createdAt,
      createdBy: tag.createdBy,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
      } else {
        await createTag(formData);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Tag saxlanmadı:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu tag-ı silmək istədiyinizdən əminsiniz?")) return;
    try {
      await deleteTag(id);
      loadData();
    } catch (err) {
      console.error("Tag silinmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleBulkDelete() {
    if (selectedTags.length === 0) {
      alert("Heç bir tag seçilməyib");
      return;
    }
    if (!confirm(`${selectedTags.length} tag-ı silmək istədiyinizdən əminsiniz?`)) return;
    
    try {
      await bulkDeleteTags(selectedTags);
      setSelectedTags([]);
      loadData();
    } catch (err) {
      console.error("Tag-lar silinmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleMerge(sourceIds: string[], targetId: string) {
    if (!confirm(`${sourceIds.length} tag-ı birləşdirmək istədiyinizdən əminsiniz?`)) return;
    
    try {
      await mergeTags({ sourceTagIds: sourceIds, targetTagId: targetId });
      loadData();
    } catch (err) {
      console.error("Tag-lar birləşdirilmədi:", err);
      alert("Xəta baş verdi");
    }
  }

  async function handleUpdateAllUsageCounts() {
    try {
      await updateAllTagUsageCounts();
      loadData();
    } catch (err) {
      console.error("Usage count yenilənmədi:", err);
    }
  }

  function toggleTagSelection(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.az.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Tag İdarəetməsi</h1>
        <p className="mt-2 text-gray-600">
          Tag CRUD, merge, bulk operations və statistika
        </p>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="mb-8 grid gap-6 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cəmi Tag</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalTags}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Aktiv: {stats.activeTags}
                </p>
              </div>
              <div className="text-blue-500 text-4xl">🏷️</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">İstifadə Edilməyən</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{stats.unusedTags}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Usage count = 0
                </p>
              </div>
              <div className="text-red-500 text-4xl">🗑️</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duplicate</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{duplicates.length}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Eyni adlı tag-lar
                </p>
              </div>
              <div className="text-yellow-500 text-4xl">⚠️</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Yaradılan</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.tagsCreatedThisMonth}</p>
              </div>
              <div className="text-green-500 text-4xl">✨</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tag axtar..."
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleUpdateAllUsageCounts}
            className="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            🔄 Usage Count Yenilə
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedTags.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              🗑️ Seçilənləri Sil ({selectedTags.length})
            </button>
          )}
          <button
            onClick={openCreateForm}
            className="rounded bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            + Yeni Tag
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium ${
            activeTab === "all"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Bütün Tag-lar ({tags.length})
        </button>
        <button
          onClick={() => setActiveTab("unused")}
          className={`px-4 py-2 font-medium ${
            activeTab === "unused"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          İstifadə Edilməyən ({unusedTags.length})
        </button>
        <button
          onClick={() => setActiveTab("duplicates")}
          className={`px-4 py-2 font-medium ${
            activeTab === "duplicates"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Duplicate-lər ({duplicates.length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-medium ${
            activeTab === "stats"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Top Tag-lar
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">
            {editingTag ? "Tag-ı Redaktə Et" : "Yeni Tag Yarat"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  required
                  placeholder="fashion-2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rəng</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    value={formData.color || "#ec4899"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-16 rounded border"
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
            </div>

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
                      placeholder={`Tag adı (${locale})`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Aktiv</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                ✓ Saxla
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                ✕ Ləğv et
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: All Tags */}
      {activeTab === "all" && (
        <div className="rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags(filteredTags.map((t) => t.id));
                      } else {
                        setSelectedTags([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tag
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Usage Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTagSelection(tag.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: tag.color || "#ec4899" }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{tag.name.az}</div>
                        <div className="text-xs text-gray-500">{tag.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      tag.usageCount === 0
                        ? "bg-red-100 text-red-800"
                        : tag.usageCount < 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {tag.usageCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      tag.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {tag.active ? "Aktiv" : "Deaktiv"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditForm(tag)}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTags.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {searchQuery ? "Nəticə tapılmadı" : "Heç bir tag yoxdur"}
            </div>
          )}
        </div>
      )}

      {/* Tab: Unused Tags */}
      {activeTab === "unused" && (
        <div className="space-y-4">
          <div className="rounded bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Bu tag-lar heç bir məqalədə istifadə edilməyib. Silə bilərsiniz.
            </p>
          </div>

          <div className="rounded-lg bg-white shadow">
            <div className="divide-y">
              {unusedTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: tag.color || "#ec4899" }}
                    />
                    <span className="font-medium text-gray-900">{tag.name.az}</span>
                    <span className="text-xs text-gray-500">({tag.slug})</span>
                  </div>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    🗑️ Sil
                  </button>
                </div>
              ))}
            </div>

            {unusedTags.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                ✓ Bütün tag-lar istifadə olunur!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Duplicates */}
      {activeTab === "duplicates" && (
        <div className="space-y-4">
          <div className="rounded bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Eyni adlı tag-lar. Merge edərək birləşdirin.
            </p>
          </div>

          {duplicates.map((group) => (
            <div key={group.name} className="rounded-lg bg-white p-4 shadow">
              <h3 className="mb-3 font-medium text-gray-900">"{group.name}" - {group.tags.length} variant</h3>
              <div className="space-y-2">
                {group.tags.map((tag, index) => (
                  <div key={tag.id} className="flex items-center justify-between rounded bg-gray-50 p-3">
                    <div>
                      <span className="font-medium">{tag.name.az}</span>
                      <span className="ml-2 text-xs text-gray-500">({tag.slug})</span>
                      <span className="ml-2 text-xs text-gray-500">Usage: {tag.usageCount}</span>
                    </div>
                    {index === 0 && group.tags.length > 1 && (
                      <button
                        onClick={() => {
                          const sourceIds = group.tags.slice(1).map((t) => t.id);
                          handleMerge(sourceIds, tag.id);
                        }}
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Bu tag-a birləşdir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {duplicates.length === 0 && (
            <div className="rounded-lg bg-white py-12 text-center text-gray-500 shadow">
              ✓ Duplicate tag yoxdur!
            </div>
          )}
        </div>
      )}

      {/* Tab: Top Tags */}
      {activeTab === "stats" && stats && (
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Ən Populyar 10 Tag</h2>
            <div className="space-y-3">
              {stats.topTags.map((item, index) => (
                <div key={item.tagId} className="flex items-center justify-between rounded bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{item.tagName}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.usageCount}</span>
                </div>
              ))}
            </div>

            {stats.topTags.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Statistika yoxdur
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
