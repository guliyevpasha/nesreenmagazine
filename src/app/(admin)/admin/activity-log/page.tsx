"use client";

import { useEffect, useState } from "react";
import {
  listAuditLogsWithFilter,
  getAuditLogStats,
  exportAuditLogs,
} from "@/lib/data/admin";
import type { AuditLog, AuditAction } from "@/lib/types";
import { auditActionLabels } from "@/lib/types";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterAction, setFilterAction] = useState<AuditAction | "">("");
  const [filterResource, setFilterResource] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [filterAction, filterResource, filterUser, filterDateFrom, filterDateTo, searchQuery]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        listAuditLogsWithFilter({
          action: filterAction || undefined,
          resource: filterResource || undefined,
          userEmail: filterUser || undefined,
          dateFrom: filterDateFrom || undefined,
          dateTo: filterDateTo || undefined,
          searchQuery: searchQuery || undefined,
        }),
        getAuditLogStats(),
      ]);

      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExport() {
    try {
      const exportData = await exportAuditLogs({
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      });

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export uğursuz oldu");
    }
  }

  function getActionColor(action: AuditAction): string {
    switch (action) {
      case "create":
        return "text-green-600 bg-green-50";
      case "update":
        return "text-blue-600 bg-blue-50";
      case "delete":
        return "text-red-600 bg-red-50";
      case "publish":
        return "text-purple-600 bg-purple-50";
      case "unpublish":
        return "text-gray-600 bg-gray-50";
      case "login":
        return "text-cyan-600 bg-cyan-50";
      case "logout":
        return "text-orange-600 bg-orange-50";
      case "settings_change":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  if (isLoading && !stats) {
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
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">
            Bütün sistem hərəkətlərinin audit loqu
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          📥 Export JSON
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Ümumi Log</div>
              <div className="text-4xl font-bold">{stats.totalLogs}</div>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Yaratma</div>
              <div className="text-4xl font-bold text-green-600">{stats.byAction.create}</div>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Yeniləmə</div>
              <div className="text-4xl font-bold text-blue-600">{stats.byAction.update}</div>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Silmə</div>
              <div className="text-4xl font-bold text-red-600">{stats.byAction.delete}</div>
            </div>
          </div>

          {/* Top Resources & Users */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">📊 Top Resurslar</h2>
              <div className="space-y-2">
                {stats.byResource.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.resource}</span>
                    <span className="text-sm font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">👥 Top İstifadəçilər</h2>
              <div className="space-y-2">
                {stats.byUser.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.userName}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.userEmail}</div>
                    </div>
                    <span className="text-sm font-bold ml-4">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">🔍 Filtrlər</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Əməliyyat Növü</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Hamısı</option>
              {Object.entries(auditActionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">İstifadəçi Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resurs</label>
            <input
              type="text"
              placeholder="articles, banners..."
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tarix Başlanğıcı</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tarix Sonu</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Axtarış</label>
            <input
              type="text"
              placeholder="Açar söz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              setFilterAction("");
              setFilterResource("");
              setFilterUser("");
              setFilterDateFrom("");
              setFilterDateTo("");
              setSearchQuery("");
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Sıfırla
          </button>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📋 Fəaliyyət Loqu</h2>
          <span className="text-sm text-muted-foreground">
            {logs.length} qeyd
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Yüklənir...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Qeyd tapılmadı
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded ${getActionColor(log.action)}`}>
                        {auditActionLabels[log.action]}
                      </span>
                      <span className="text-sm font-medium">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-xs text-muted-foreground">#{log.resourceId.slice(0, 8)}</span>
                      )}
                    </div>

                    <div className="text-sm mb-2">{log.description}</div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>👤 {log.userName} ({log.userEmail})</span>
                      <span>🕐 {new Date(log.createdAt).toLocaleString("az-AZ")}</span>
                    </div>

                    {(log.before || log.after) && (
                      <details className="mt-3">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                          Dəyişiklikləri gör
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          {log.before && (
                            <div className="mb-2">
                              <div className="font-medium mb-1">Əvvəl:</div>
                              <pre className="overflow-x-auto">{log.before}</pre>
                            </div>
                          )}
                          {log.after && (
                            <div>
                              <div className="font-medium mb-1">Sonra:</div>
                              <pre className="overflow-x-auto">{log.after}</pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
