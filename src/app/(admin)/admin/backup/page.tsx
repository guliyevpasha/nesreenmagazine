"use client";

import { useEffect, useState } from "react";
import {
  listDatabaseBackups,
  listBackupSchedules,
  getBackupStats,
  exportBackupSnapshot,
  BACKUP_EXPORT_COLLECTIONS,
  deleteBackup,
  createBackupSchedule,
  deleteBackupSchedule,
  toggleBackupSchedule,
  exportCollectionData,
} from "@/lib/data/admin";
import type { DatabaseBackup, BackupSchedule, BackupStats } from "@/lib/types";
import { useAuth } from "@/lib/firebase/auth";
import { COLLECTIONS } from "@/lib/firebase/config";

export default function BackupRestorePage() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [showNewScheduleDialog, setShowNewScheduleDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const availableCollections = Object.values(COLLECTIONS);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [backupsData, schedulesData, statsData] = await Promise.all([
        listDatabaseBackups(),
        listBackupSchedules(),
        getBackupStats(),
      ]);

      setBackups(backupsData);
      setSchedules(schedulesData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load backup data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportAll() {
    setIsCreatingBackup(true);
    setExportMessage(null);
    try {
      const { data, counts, errors } = await exportBackupSnapshot();
      const failed = Object.keys(errors);
      const payload = {
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email ?? null,
        counts,
        errors,
        collections: data,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nesreen-ixrac-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
      setExportMessage(
        failed.length === 0
          ? `Fayl yükləndi: ${total} sənəd, ${Object.keys(counts).length} kolleksiya.`
          : `Fayl yükləndi (${total} sənəd), lakin bu kolleksiyalar oxuna bilmədi: ${failed
              .map((k) => `${k} (${errors[k]})`)
              .join(", ")}`
      );
    } catch (error: any) {
      setExportMessage(`İxrac uğursuz oldu: ${error?.message || "naməlum xəta"}`);
    } finally {
      setIsCreatingBackup(false);
    }
  }

  async function handleDeleteBackup(id: string) {
    if (!confirm("Bu backup-ı silmək istədiyinizə əminsiniz?")) return;

    try {
      await deleteBackup(id);
      await loadData();
    } catch (error) {
      alert("Backup silinə bilmədi");
    }
  }

  async function handleExport(collectionName: string) {
    try {
      const data = await exportCollectionData(collectionName);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collectionName}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export uğursuz oldu");
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "in-progress":
        return "Davam edir";
      case "failed":
        return "Uğursuz";
      case "pending":
        return "Gözləyir";
      default:
        return status;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup & Restore</h1>
          <p className="text-muted-foreground">
            Məlumatların yedək nüsxəsi (JSON ixracı)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowExportDialog(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            📤 Export
          </button>
          <button
            onClick={() => setShowNewScheduleDialog(true)}
            disabled
            title="Avtomatik yedəkləmə hələ qoşulmayıb"
            className="px-4 py-2 bg-secondary text-primary rounded-lg opacity-50 cursor-not-allowed"
          >
            ⏰ Schedule
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Ümumi Backup</div>
            <div className="text-4xl font-bold">{stats.totalBackups}</div>
            <div className="text-xs text-green-600 mt-1">
              ✓ {stats.successfulBackups} uğurlu
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Ümumi Ölçü</div>
            <div className="text-4xl font-bold">{formatFileSize(stats.totalSize)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Orta: {formatFileSize(stats.averageSize)}
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Aktiv Schedule</div>
            <div className="text-4xl font-bold">{stats.activeSchedules}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Avtomatik backup
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Son Backup</div>
            <div className="text-lg font-medium">
              {stats.lastBackupDate
                ? new Date(stats.lastBackupDate).toLocaleDateString("az-AZ")
                : "Yoxdur"}
            </div>
            {stats.lastBackupDate && (
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(stats.lastBackupDate).toLocaleTimeString("az-AZ")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* JSON ixracı */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Məlumatların JSON ixracı</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Əsas kolleksiyalar ({BACKUP_EXPORT_COLLECTIONS.join(", ")}) sizin hesabın icazələri
          daxilində oxunur və bir .json fayl kimi kompüterinizə yüklənir. Fayl serverdə
          saxlanılmır.
        </p>
        <button
          onClick={handleExportAll}
          disabled={isCreatingBackup}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isCreatingBackup ? "Hazırlanır..." : "JSON ixrac et"}
        </button>
        {exportMessage && <p className="text-sm mt-3">{exportMessage}</p>}
        <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
          Bərpa əməliyyatı yalnız texniki dəstək vasitəsilə aparılır. Planlaşdırılmış avtomatik
          yedəkləmə hələ qoşulmayıb; aşağıdakı qeydlər yalnız əvvəlki yazılardır.
        </p>
      </div>

      {/* Backup Schedules */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">⏰ Planlaşdırılmış Backup-lar</h2>
          <span className="text-sm text-muted-foreground">
            {schedules.filter((s) => s.enabled).length} aktiv
          </span>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Planlanmış backup yoxdur
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 border rounded-lg ${
                  !schedule.enabled ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{schedule.name}</span>
                      {schedule.enabled && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {schedule.description}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>🕐 {schedule.cronExpression}</span>
                      <span>📦 {schedule.collections.length} kolleksiya</span>
                      <span>🗓️ {schedule.retentionDays} gün saxlanılır</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleBackupSchedule(schedule.id, !schedule.enabled).then(loadData)}
                      className={`px-3 py-1 text-sm rounded ${
                        schedule.enabled
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {schedule.enabled ? "Dayandır" : "Aktivləşdir"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Bu schedule-u silmək istədiyinizə əminsiniz?")) {
                          deleteBackupSchedule(schedule.id).then(loadData);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup History */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">📚 Backup Tarixçəsi</h2>

        {backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Backup yoxdur
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{backup.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(backup.status)}`}>
                        {getStatusLabel(backup.status)}
                      </span>
                      {backup.type === "scheduled" && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          Planlanmış
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📅 {new Date(backup.createdAt).toLocaleString("az-AZ")}</span>
                      <span>📦 {backup.collections.length} kolleksiya</span>
                      <span>📄 {backup.totalDocuments} document</span>
                      <span>💾 {formatFileSize(backup.size)}</span>
                      {backup.duration && (
                        <span>⏱️ {(backup.duration / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                    {backup.error && (
                      <div className="text-xs text-red-600 mt-2">
                        Xəta: {backup.error}
                      </div>
                    )}
                  </div>

                  {backup.status === "completed" && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">📤 Kolleksiya Export</h2>
            
            <div className="space-y-2 mb-4">
              {availableCollections.map((col) => (
                <button
                  key={col}
                  onClick={() => handleExport(col)}
                  className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{col}</div>
                  <div className="text-xs text-muted-foreground">JSON formatında yüklə</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowExportDialog(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
