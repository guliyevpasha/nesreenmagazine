"use client";

import { useEffect, useState } from "react";

import { listAuditLogs } from "@/lib/data/admin";
import type { AuditAction, AuditLog } from "@/lib/types";
import { auditActionLabels } from "@/lib/types";
import {
  Alert,
  Button,
  Empty,
  PageHeader,
} from "@/components/admin/ui";

/* ── rəng xəritəsi ────────────────────────────────────────────────────── */
const actionColors: Record<AuditAction, string> = {
  create:          "border-green-300 bg-green-50 text-green-700",
  update:          "border-blue-300 bg-blue-50 text-blue-700",
  delete:          "border-red-300 bg-red-50 text-red-700",
  publish:         "border-purple-300 bg-purple-50 text-purple-700",
  unpublish:       "border-yellow-300 bg-yellow-50 text-yellow-700",
  login:           "border-gray-200 bg-gray-100 text-gray-600",
  logout:          "border-gray-200 bg-gray-100 text-gray-500",
  settings_change: "border-orange-300 bg-orange-50 text-orange-700",
};

const actionIcons: Record<AuditAction, string> = {
  create:          "➕",
  update:          "✏️",
  delete:          "🗑️",
  publish:         "✅",
  unpublish:       "⏸️",
  login:           "🔑",
  logout:          "🚪",
  settings_change: "⚙️",
};

const ACTIONS: AuditAction[] = [
  "create", "update", "delete", "publish", "unpublish",
  "login", "logout", "settings_change",
];

const RESOURCE_LABELS: Record<string, string> = {
  articles:     "Məqalələr",
  banners:      "Bannerlər",
  staff:        "İşçilər",
  crmClients:   "CRM Müştərilər",
  adOrders:     "Reklam Sifarişləri",
  contentPlan:  "Kontent Planı",
  seoRedirects: "SEO Redirectlər",
  seoSettings:  "SEO Parametrləri",
  siteSettings: "Sayt Parametrləri",
  ejournals:    "E-jurnallar",
  horoscopes:   "Bürc şərhləri",
  subscribers:  "Abunəçilər",
};

/* ── köməkçi ─────────────────────────────────────────────────────────────── */
function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("az-AZ", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

/* ── JSON diff görünüşü ──────────────────────────────────────────────────── */
function JsonDiff({ before, after }: { before?: string; after?: string }) {
  const [open, setOpen] = useState(false);
  if (!before && !after) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted hover:text-ink transition-colors"
      >
        {open ? "▲ Dəyişikliyi gizlət" : "▼ Dəyişikliyi göster"}
      </button>
      {open && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {before && (
            <div>
              <p className="mb-1 font-ui text-[10px] uppercase tracking-[0.1em] text-red-600">Əvvəl</p>
              <pre className="overflow-x-auto rounded border border-red-200 bg-red-50 p-3 font-mono text-[11px] text-red-700 max-h-48">
                {JSON.stringify(JSON.parse(before), null, 2)}
              </pre>
            </div>
          )}
          {after && (
            <div>
              <p className="mb-1 font-ui text-[10px] uppercase tracking-[0.1em] text-green-600">Sonra</p>
              <pre className="overflow-x-auto rounded border border-green-200 bg-green-50 p-3 font-mono text-[11px] text-green-700 max-h-48">
                {JSON.stringify(JSON.parse(after), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Əsas səhifə ─────────────────────────────────────────────────────────── */
export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState<AuditAction | "all">("all");
  const [filterResource, setFilterResource] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);

  async function load(lim = 100) {
    setLoading(true);
    try {
      setLogs(await listAuditLogs(lim));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(limit); }, [limit]);

  /* Unikal istifadəçilər */
  const users = [...new Set(logs.map((l) => l.userEmail))].sort();

  /* Unikal resurslar */
  const resources = [...new Set(logs.map((l) => l.resource))].sort();

  /* Filtr */
  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      log.description.toLowerCase().includes(q) ||
      log.userEmail.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q);
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchResource = !filterResource || log.resource === filterResource;
    const matchUser = !filterUser || log.userEmail === filterUser;
    return matchSearch && matchAction && matchResource && matchUser;
  });

  /* Statistika */
  const todayLogs = logs.filter((l) => {
    const today = new Date().toISOString().slice(0, 10);
    return l.createdAt.startsWith(today);
  }).length;

  const deleteLogs = logs.filter((l) => l.action === "delete").length;

  /* CSV ixrac */
  function exportCsv() {
    const header = "Tarix,İstifadəçi,Əməliyyat,Resurs,Resurs ID,Təsvir";
    const rows = filtered.map((l) =>
      [
        fmtDateTime(l.createdAt),
        l.userEmail,
        auditActionLabels[l.action],
        RESOURCE_LABELS[l.resource] ?? l.resource,
        l.resourceId ?? "",
        l.description,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Audit Jurnalı"
        description="Kim, nə vaxt, nəyi dəyişdirib — bütün əməliyyatların tam tarixçəsi."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={exportCsv} disabled={filtered.length === 0}>
              ↓ CSV
            </Button>
            <Button variant="ghost" onClick={() => { setLimit((l) => l + 100); }}>
              +100 yüklə
            </Button>
          </div>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ümumi qeyd", value: logs.length },
            { label: "Bu gün", value: todayLogs },
            { label: "İstifadəçi", value: users.length },
            { label: "Silinmə", value: deleteLogs },
          ].map((s) => (
            <div key={s.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</p>
              <p className="mt-1 font-display text-3xl text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {/* Filtrlər */}
        <div className="flex flex-wrap gap-3">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[180px]"
            placeholder="Axtarış: istifadəçi, resurs, təsvir..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditAction | "all")}
          >
            <option value="all">Bütün əməliyyatlar</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{auditActionLabels[a]}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
          >
            <option value="">Bütün resurslar</option>
            {resources.map((r) => (
              <option key={r} value={r}>{RESOURCE_LABELS[r] ?? r}</option>
            ))}
          </select>
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="">Bütün istifadəçilər</option>
            {users.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Nəticə sayı */}
        <p className="font-ui text-[12px] text-muted">
          {filtered.length} qeyd göstərilir (ümumi {logs.length})
        </p>

        {/* Yüklənmə */}
        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {/* Boş */}
        {!loading && filtered.length === 0 && (
          <Empty
            title="Audit qeydi tapılmadı"
            text="Hər hansı əməliyyat həyata keçirildikcə burada görünəcək."
          />
        )}

        {/* Qeydlər siyahısı */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="border border-line bg-paper p-4 hover:border-line/80 transition-colors"
              >
                <div className="flex flex-wrap items-start gap-3">
                  {/* İkon + əməliyyat */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-lg leading-none">{actionIcons[log.action]}</span>
                    <span className={`border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] ${actionColors[log.action]}`}>
                      {auditActionLabels[log.action]}
                    </span>
                  </div>

                  {/* Resurs */}
                  <span className="border border-line bg-cream-deep px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.1em] text-muted">
                    {RESOURCE_LABELS[log.resource] ?? log.resource}
                    {log.resourceId && <span className="ml-1 text-[9px] opacity-60">#{log.resourceId.slice(0, 8)}</span>}
                  </span>

                  {/* Tarix */}
                  <span className="ml-auto font-ui text-[11px] text-muted shrink-0">
                    {fmtDateTime(log.createdAt)}
                  </span>
                </div>

                {/* Təsvir */}
                <p className="mt-2 font-ui text-[13px] text-ink">{log.description}</p>

                {/* İstifadəçi */}
                <p className="mt-1 font-ui text-[11px] text-muted">
                  👤 {log.userName || log.userEmail}
                  {log.userName !== log.userEmail && (
                    <span className="opacity-60"> · {log.userEmail}</span>
                  )}
                </p>

                {/* JSON diff */}
                <JsonDiff before={log.before} after={log.after} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
