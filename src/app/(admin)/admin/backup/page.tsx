"use client";

import { useEffect, useState } from "react";
import {
  listDatabaseBackups,
  listBackupSchedules,
  getBackupStats,
  createManualBackup,
  deleteBackup,
  createBackupSchedule,
  deleteBackupSchedule,
  toggleBackupSchedule,
  startRestore,
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
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [backupName, setBackupName] = useState("");

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

  async function handleCreateBackup() {
    if (!user || selectedCollections.length === 0 || !backupName.trim()) {
      alert("Zəhmət olmasa bütün sahələri doldurun");
      return;
    }

    setIsCreatingBackup(true);
    try {
      await createManualBackup(selectedCollections, backupName, user.uid);
      setBackupName("");
      setSelectedCollections([]);
      await loadData();
      alert("Backup uğurla yaradıldı!");
    } catch (error) {
      alert("Backup yaradıla bilmədi");
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

  async function handleRestore(backupId: string) {
    if (!user) return;
    if (!confirm("Bu backup-dan restore etmək istədiyinizə əminsiniz? Mövcud data əvəz olunacaq!")) {
      return;
    }

    try {
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) return;

      await startRestore(backupId, backup.collections, user.uid);
      alert("Restore prosesi başladı. Bu bir neçə dəqiqə çəkə bilər.");
      await loadData();
    } catch (error: any) {
      alert(error.message || "Restore uğursuz oldu");
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
            Database yedəkləmə və bərpa sistemi
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
            className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/80"
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

      {/* Create Backup Form */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🔄 Yeni Backup Yarat</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Backup Adı</label>
            <input
              type="text"
              placeholder="Məs: Günlük Backup 2026-10-15"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Kolleksiyalar ({selectedCollections.length} seçildi)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              <button
                onClick={() => {
                  if (selectedCollections.length === availableCollections.length) {
                    setSelectedCollections([]);
                  } else {
                    setSelectedCollections([...availableCollections]);
                  }
                }}
                className="col-span-full px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                {selectedCollections.length === availableCollections.length
                  ? "Heç birini seçmə"
                  : "Hamısını seç"}
              </button>
              {availableCollections.map((col) => (
                <label key={col} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCollections([...selectedCollections, col]);
                      } else {
                        setSelectedCollections(selectedCollections.filter((c) => c !== col));
                      }
                    }}
                  />
                  <span className="truncate">{col}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup || selectedCollections.length === 0 || !backupName.trim()}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isCreatingBackup ? "Yaradılır..." : "💾 Backup Yarat"}
          </button>
        </div>
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
                        onClick={() => handleRestore(backup.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        ↩️ Restore
                      </button>
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
