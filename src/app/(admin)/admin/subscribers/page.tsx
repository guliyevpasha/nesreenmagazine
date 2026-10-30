"use client";

import { useEffect, useState } from "react";

import {
  listSubscribers,
  removeSubscriber,
  updateSubscriberStatus,
} from "@/lib/data/admin";
import type { Subscriber } from "@/lib/data/admin";
import {
  Alert,
  Button,
  Empty,
  PageHeader,
} from "@/components/admin/ui";
import { useRoleAccess } from "@/hooks/useRoleAccess";

/* ── köməkçilər ─────────────────────────────────────────────────────────── */
function fmtDate(d?: string) {
  if (!d) return "—";
  return d.slice(0, 10);
}

function exportCsv(subscribers: Subscriber[]) {
  const header = "Email,Ad,Dil,Aktiv,Abunə tarixi";
  const rows = subscribers.map((s) =>
    [
      s.email,
      s.name ?? "",
      s.locale ?? "",
      s.active ? "Bəli" : "Xeyr",
      fmtDate(s.createdAt),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `abuneciler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Əsas səhifə ────────────────────────────────────────────────────────── */
export default function SubscribersPage() {
  const { hasAccess, loading: accessLoading } = useRoleAccess('/admin/subscribers');
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  
  if (accessLoading || !hasAccess) return null;
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterLocale, setFilterLocale] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setSubscribers(await listSubscribers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  /* Filtr */
  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.email.toLowerCase().includes(q) ||
      (s.name ?? "").toLowerCase().includes(q);
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && s.active) ||
      (filterActive === "inactive" && !s.active);
    const matchLocale = !filterLocale || s.locale === filterLocale;
    return matchSearch && matchActive && matchLocale;
  });

  /* Unikal dillər */
  const locales = [...new Set(subscribers.map((s) => s.locale).filter(Boolean))] as string[];

  /* Seçim əməliyyatları */
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  }

  async function handleStatusChange(id: string, active: boolean) {
    try {
      await updateSubscriberStatus(id, active);
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active } : s)),
      );
    } catch {
      alert("Status dəyişdirilmədi.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu abunəçini silmək istəyirsiniz?")) return;
    try {
      await removeSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch {
      alert("Silinmə xətası.");
    }
  }

  /* Kütləvi sil */
  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} abunəçini silmək istəyirsiniz?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map(removeSubscriber));
      setSubscribers((prev) => prev.filter((s) => !selected.has(s.id)));
      setSelected(new Set());
    } catch {
      alert("Kütləvi silmə xətası.");
    } finally {
      setBulkLoading(false);
    }
  }

  /* Kütləvi deaktiv et */
  async function handleBulkDeactivate() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map((id) => updateSubscriberStatus(id, false)));
      setSubscribers((prev) =>
        prev.map((s) => (selected.has(s.id) ? { ...s, active: false } : s)),
      );
      setSelected(new Set());
    } catch {
      alert("Kütləvi deaktivləşdirmə xətası.");
    } finally {
      setBulkLoading(false);
    }
  }

  /* Statistika */
  const activeCount = subscribers.filter((s) => s.active).length;
  const inactiveCount = subscribers.length - activeCount;
  const thisMonth = subscribers.filter((s) => {
    if (!s.createdAt) return false;
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  /* Dil paylanması */
  const byLocale = locales.map((loc) => ({
    locale: loc,
    count: subscribers.filter((s) => s.locale === loc).length,
  })).sort((a, b) => b.count - a.count);

  const localeNames: Record<string, string> = {
    az: "Azərbaycan",
    en: "İngilis",
    ru: "Rus",
    tr: "Türk",
    ar: "Ərəb",
  };

  return (
    <>
      <PageHeader
        title="Abunəçilər"
        description="Newsletter abunəliyi, abunəçi siyahısı və e-poçt idarəetməsi."
        actions={
          <Button
            variant="ghost"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            ↓ CSV ixrac et
          </Button>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">

        {/* Statistika kartları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ümumi abunəçi", value: subscribers.length },
            { label: "Aktiv", value: activeCount },
            { label: "Deaktiv", value: inactiveCount },
            { label: "Bu ay yeni", value: thisMonth },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-muted">{stat.label}</p>
              <p className="mt-1 font-display text-3xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Dil paylanması */}
        {byLocale.length > 0 && (
          <div className="border border-line bg-paper p-5">
            <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted mb-3">Dil üzrə paylanma</p>
            <div className="flex flex-wrap gap-3">
              {byLocale.map(({ locale, count }) => (
                <div key={locale} className="flex items-center gap-2">
                  <span className="font-ui text-[13px] text-ink">
                    {localeNames[locale] ?? locale}
                  </span>
                  <span className="font-ui text-[12px] text-muted">
                    {count} ({Math.round((count / subscribers.length) * 100)}%)
                  </span>
                  <div className="h-1.5 w-16 bg-line overflow-hidden">
                    <div
                      className="h-full bg-bordo"
                      style={{ width: `${(count / subscribers.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        {/* Axtarış + filtrlər */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="border border-line bg-paper px-3.5 py-2 font-ui text-[13px] placeholder:text-muted/55 focus:border-bordo focus:outline-none flex-1 min-w-[200px]"
            placeholder="E-poçt və ya ad axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
          >
            <option value="all">Hamısı</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Deaktiv</option>
          </select>
          {locales.length > 0 && (
            <select
              className="border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
              value={filterLocale}
              onChange={(e) => setFilterLocale(e.target.value)}
            >
              <option value="">Bütün dillər</option>
              {locales.map((l) => (
                <option key={l} value={l}>{localeNames[l] ?? l}</option>
              ))}
            </select>
          )}
        </div>

        {/* Kütləvi əməliyyatlar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 border border-gold/30 bg-gold/10 px-4 py-3">
            <span className="font-ui text-[13px] text-ink">
              {selected.size} abunəçi seçilib
            </span>
            <Button
              variant="ghost"
              onClick={() => void handleBulkDeactivate()}
              disabled={bulkLoading}
              className="py-1.5"
            >
              Deaktiv et
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleBulkDelete()}
              disabled={bulkLoading}
              className="py-1.5"
            >
              {bulkLoading ? "Silinir…" : "Sil"}
            </Button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-auto font-ui text-[11px] text-muted hover:text-ink transition-colors"
            >
              Seçimi ləğv et
            </button>
          </div>
        )}

        {/* Yüklənmə */}
        {loading && (
          <div className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</div>
        )}

        {/* Cədvəl */}
        {!loading && filtered.length === 0 && (
          <Empty
            title="Abunəçi tapılmadı"
            text="Hələ heç kim abunə olmayıb və ya axtarış nəticəsi boşdur."
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-line bg-cream-deep">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-bordo"
                      aria-label="Hamısını seç"
                    />
                  </th>
                  {["E-poçt", "Ad", "Dil", "Status", "Abunə tarixi", "Əməliyyat"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-ui text-[10px] uppercase tracking-[0.14em] text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-line transition-colors hover:bg-cream-deep/40 ${selected.has(sub.id) ? "bg-gold/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(sub.id)}
                        onChange={() => toggleSelect(sub.id)}
                        className="h-4 w-4 accent-bordo"
                        aria-label={`${sub.email} seç`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${sub.email}`}
                        className="font-ui text-[13px] text-bordo hover:underline"
                      >
                        {sub.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-muted">
                      {sub.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-ui text-[12px] text-muted">
                      {sub.locale ? (localeNames[sub.locale] ?? sub.locale) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block border px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-[0.12em] ${
                          sub.active
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-100 text-gray-500"
                        }`}
                      >
                        {sub.active ? "Aktiv" : "Deaktiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-ui text-[12px] text-muted">
                      {fmtDate(sub.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleStatusChange(sub.id, !sub.active)}
                          className="font-ui text-[11px] uppercase tracking-[0.1em] text-muted hover:text-ink transition-colors"
                        >
                          {sub.active ? "Deaktiv" : "Aktiv"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(sub.id)}
                          className="font-ui text-[11px] uppercase tracking-[0.1em] text-bordo/60 hover:text-bordo transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="border-t border-line px-4 py-3 flex items-center justify-between">
              <p className="font-ui text-[12px] text-muted">
                {filtered.length} nəticə göstərilir ({subscribers.length} ümumi)
              </p>
              <Button
                variant="ghost"
                onClick={() => exportCsv(filtered)}
                className="py-1.5 text-[10px]"
              >
                ↓ CSV ixrac
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
