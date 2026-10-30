"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Alert, Empty } from "@/components/admin/ui";
import { getAllBanners, deleteBanner, duplicateBanner, getBannerStats, toggleBannerStatus } from "@/lib/data/banners";
import type { AdvancedAdBanner } from "@/lib/types";
import { adBannerLocationLabels } from "@/lib/types";

export default function AdvancedBannersPage() {
  const [banners, setBanners] = useState<AdvancedAdBanner[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bannersData, statsData] = await Promise.all([
        getAllBanners(),
        getBannerStats(),
      ]);
      setBanners(bannersData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`"${name}" banneri silinsin?`)) return;
    
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Silinmədi: " + (err instanceof Error ? err.message : "Xəta"));
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const newId = await duplicateBanner(id, "admin");
      await loadData();
      alert("Banner kopyalandı!");
    } catch (err) {
      alert("Kopyalanmadı: " + (err instanceof Error ? err.message : "Xəta"));
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      const newStatus = await toggleBannerStatus(id);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: newStatus } : b))
      );
    } catch (err) {
      alert("Dəyişdirilmədi: " + (err instanceof Error ? err.message : "Xəta"));
    }
  }

  const filteredBanners = banners.filter((b) => {
    if (filter === "active") return b.active;
    if (filter === "inactive") return !b.active;
    return true;
  });

  if (loading) {
    return (
      <>
        <PageHeader title="Reklam Bannerləri" />
        <div className="p-10 text-center text-sm text-muted">Yüklənir...</div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Reklam Bannerləri"
        description="Məqalələrdə və digər səhifələrdə göstərilən reklam bannerlərini idarə edin"
        actions={
          <Link href="/admin/advanced-banners/new" className="btn-primary !py-2.5 !text-[11px]">
            + Yeni Banner
          </Link>
        }
      />

      <div className="px-6 py-8 lg:px-10">
        {error && (
          <div className="mb-6">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {/* Statistika */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Ümumi Banner" value={stats.total} icon="📊" />
            <StatCard title="Aktiv" value={stats.active} icon="✅" color="green" />
            <StatCard title="Deaktiv" value={stats.inactive} icon="⏸️" color="gray" />
            <StatCard title="Orta CTR" value={`${stats.avgCTR}%`} icon="📈" color="blue" />
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-wider ${
              filter === "all"
                ? "border-b-2 border-bordo text-bordo"
                : "text-muted hover:text-ink"
            }`}
          >
            Hamısı ({banners.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-wider ${
              filter === "active"
                ? "border-b-2 border-bordo text-bordo"
                : "text-muted hover:text-ink"
            }`}
          >
            Aktiv ({banners.filter((b) => b.active).length})
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-wider ${
              filter === "inactive"
                ? "border-b-2 border-bordo text-bordo"
                : "text-muted hover:text-ink"
            }`}
          >
            Deaktiv ({banners.filter((b) => !b.active).length})
          </button>
        </div>

        {/* Banner Siyahısı */}
        {filteredBanners.length === 0 ? (
          <Empty
            title="Heç bir banner yoxdur"
            text="Yeni banner əlavə etmək üçün yuxarıdakı düyməyə basın"
          />
        ) : (
          <div className="space-y-4">
            {filteredBanners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onDelete={() => handleDelete(banner.id, banner.name)}
                onDuplicate={() => handleDuplicate(banner.id)}
                onToggleStatus={() => handleToggleStatus(banner.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color = "bordo",
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: "bordo" | "green" | "blue" | "gray";
}) {
  const colors = {
    bordo: "border-bordo/20 bg-bordo/5",
    green: "border-green-500/20 bg-green-50",
    blue: "border-blue-500/20 bg-blue-50",
    gray: "border-gray-300/20 bg-gray-50",
  };

  return (
    <div className={`border ${colors[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-muted">{title}</p>
          <p className="mt-2 font-display text-3xl text-ink">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

function BannerCard({
  banner,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: {
  banner: AdvancedAdBanner;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
}) {
  const ctr = banner.impressions > 0 
    ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
    : "0";

  return (
    <div className="border border-line bg-paper p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-6">
        {/* Banner Preview */}
        <div className="shrink-0">
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.altText}
              className="h-24 w-32 border border-line object-cover"
            />
          ) : (
            <div className="flex h-24 w-32 items-center justify-center border border-line bg-cream text-center text-xs text-muted">
              Şəkil yoxdur
            </div>
          )}
        </div>

        {/* Banner Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg text-ink">{banner.name}</h3>
                <span
                  className={`px-2 py-1 font-ui text-[10px] uppercase tracking-wider ${
                    banner.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {banner.active ? "Aktiv" : "Deaktiv"}
                </span>
                {banner.animation && banner.animation !== "none" && (
                  <span className="px-2 py-1 font-ui text-[10px] uppercase tracking-wider bg-purple-100 text-purple-700">
                    {banner.animation}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-muted line-clamp-1">
                {banner.linkUrl || "Link yoxdur"}
              </p>

              {/* Locations */}
              <div className="mt-3 flex flex-wrap gap-2">
                {banner.locations.map((loc) => (
                  <span
                    key={loc}
                    className="border border-line bg-cream-deep/40 px-2 py-1 font-ui text-[10px] text-ink-soft"
                  >
                    {adBannerLocationLabels[loc]}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-3 flex gap-6 text-sm">
                <span className="text-muted">
                  👁️ {banner.impressions.toLocaleString()} göstərilmə
                </span>
                <span className="text-muted">
                  🖱️ {banner.clicks.toLocaleString()} klik
                </span>
                <span className="text-muted">
                  📊 CTR: {ctr}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/admin/advanced-banners/${banner.id}`}
                className="btn-ghost !py-1.5 !px-3 !text-[10px]"
                title="Redaktə et"
              >
                ✏️
              </Link>
              <button
                onClick={onToggleStatus}
                className={`btn-ghost !py-1.5 !px-3 !text-[10px] ${
                  banner.active 
                    ? "hover:!border-orange-500 hover:!text-orange-600" 
                    : "hover:!border-green-500 hover:!text-green-600"
                }`}
                title={banner.active ? "Deaktiv et" : "Aktiv et"}
              >
                {banner.active ? "⏸️" : "▶️"}
              </button>
              <button
                onClick={onDuplicate}
                className="btn-ghost !py-1.5 !px-3 !text-[10px] hover:!border-blue-500 hover:!text-blue-600"
                title="Kopyala"
              >
                📋
              </button>
              <button
                onClick={onDelete}
                className="btn-ghost !py-1.5 !px-3 !text-[10px] hover:!border-red-500 hover:!text-red-600"
                title="Sil"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
