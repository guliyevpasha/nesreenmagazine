"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";

import { getDb } from "@/lib/firebase/client";

type ModuleStatus = {
  name: string;
  path: string;
  category: string;
  features: string[];
  collections?: string[];
};

const MODULES: ModuleStatus[] = [
  // Content Management
  {
    name: "Comments Moderation",
    path: "/admin/comments",
    category: "Content Management",
    features: ["Approve/Reject", "Spam Filter", "Bulk Actions", "Reply System"],
    collections: ["comments"],
  },
  {
    name: "Article Version History",
    path: "/admin/articles/[id]/versions",
    category: "Content Management",
    features: ["Auto Versioning", "Compare Versions", "Restore", "Timeline View"],
    collections: ["articleVersions"],
  },
  {
    name: "Advanced Text Editor",
    path: "/admin/articles/[id]/media",
    category: "Content Management",
    features: ["Rich Media Blocks", "Video Embed", "Gallery", "Social Embeds"],
    collections: [],
  },
  {
    name: "Category Manager",
    path: "/admin/categories",
    category: "Content Management",
    features: ["Nested Categories", "SEO Metadata", "Icons & Colors", "Stats"],
    collections: ["enhancedCategories", "categoryStats"],
  },
  {
    name: "Tags Manager",
    path: "/admin/tags",
    category: "Content Management",
    features: ["Tag CRUD", "Merge Tags", "Usage Tracking", "Popularity Stats"],
    collections: ["tags"],
  },
  {
    name: "Translation Manager",
    path: "/admin/translations",
    category: "Content Management",
    features: ["5 Languages", "Progress Tracking", "Translation Jobs", "Missing Finder"],
    collections: ["articleTranslations", "translationJobs"],
  },

  // User Management
  {
    name: "User Management",
    path: "/admin/users",
    category: "User Management",
    features: ["Subscriber CRUD", "Reading History", "Activity Log", "Bulk Actions"],
    collections: ["frontendUsers", "userReadingHistory", "userActivities"],
  },
  {
    name: "Subscription Plans",
    path: "/admin/subscriptions",
    category: "User Management",
    features: ["Free/Premium/VIP", "MRR/ARR Tracking", "Billing Cycles", "Analytics"],
    collections: ["subscriptionPlans", "userSubscriptions", "subscriptionPayments"],
  },

  // E-Commerce
  {
    name: "E-Journal Manager",
    path: "/admin/ejournals",
    category: "E-Commerce",
    features: ["PDF Upload", "Order Tracking", "Sales Stats", "Download Log"],
    collections: ["ejournalOrders", "ejournalDownloads"],
  },

  // Marketing
  {
    name: "Push Notifications",
    path: "/admin/push-notifications",
    category: "Marketing",
    features: ["Campaigns", "Templates"],
    collections: ["pushCampaigns", "pushTemplates", "userFcmTokens", "pushDeliveryLogs"],
  },

  // Media & Files
  {
    name: "File Manager",
    path: "/admin/files",
    category: "Media & Files",
    features: ["Folder Structure", "Grid/List View", "Type Filters", "Storage Stats"],
    collections: ["mediaFolders", "mediaFiles"],
  },

  // System & Monitoring
  {
    name: "Performance Monitor",
    path: "/admin/performance",
    category: "System & Monitoring",
    features: ["Core Web Vitals", "Page Speed", "Optimization Tips", "Trend Analysis"],
    collections: ["pagePerformance", "optimizationTips"],
  },
  {
    name: "Activity Log",
    path: "/admin/activity-log",
    category: "System & Monitoring",
    features: ["Audit Trail", "Filtering", "Statistics", "Export"],
    collections: ["auditLogs"],
  },
  {
    name: "Backup & Restore",
    path: "/admin/backup",
    category: "System & Monitoring",
    features: ["JSON ixracı"],
    collections: ["databaseBackups", "backupSchedules", "restoreOperations"],
  },

  // Developer
  {
    name: "API Documentation",
    path: "/admin/api-docs",
    category: "Developer",
    features: ["REST Endpoints", "Examples", "Status Codes"],
    collections: [],
  },
];

type CheckState = { state: "idle" | "checking" | "ok" | "error"; message?: string };

function errorCode(error: unknown): string {
  const e = error as { code?: string; message?: string };
  return e?.code || e?.message || "unknown";
}

export default function SystemHealthPage() {
  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [running, setRunning] = useState(false);

  const categories = Array.from(new Set(MODULES.map((m) => m.category)));
  const totalCollections = Array.from(
    new Set(MODULES.flatMap((m) => m.collections || []))
  ).length;

  async function runChecks() {
    setRunning(true);
    const db = getDb();
    const initial: Record<string, CheckState> = {};
    MODULES.forEach((m) => {
      initial[m.name] = { state: m.collections && m.collections.length > 0 ? "checking" : "idle" };
    });
    setChecks(initial);

    if (!db) {
      const failed: Record<string, CheckState> = {};
      MODULES.forEach((m) => {
        failed[m.name] =
          m.collections && m.collections.length > 0
            ? { state: "error", message: "Firebase qoşulmayıb" }
            : { state: "idle" };
      });
      setChecks(failed);
      setCheckedAt(new Date());
      setRunning(false);
      return;
    }

    await Promise.all(
      MODULES.map(async (m) => {
        if (!m.collections || m.collections.length === 0) return;
        const errors: string[] = [];
        for (const col of m.collections) {
          try {
            await getDocs(query(collection(db, col), limit(1)));
          } catch (error) {
            errors.push(`${col}: ${errorCode(error)}`);
          }
        }
        setChecks((prev) => ({
          ...prev,
          [m.name]:
            errors.length === 0
              ? { state: "ok" }
              : { state: "error", message: errors.join("; ") },
        }));
      })
    );

    setCheckedAt(new Date());
    setRunning(false);
  }

  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const values = Object.values(checks);
  const okCount = values.filter((c) => c.state === "ok").length;
  const errorCount = values.filter((c) => c.state === "error").length;
  const checkable = MODULES.filter((m) => m.collections && m.collections.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-muted-foreground">
            Modulların Firestore əlçatanlığı sizin hazırkı sessiyanızla real vaxtda yoxlanılır
          </p>
        </div>
        <button
          onClick={runChecks}
          disabled={running}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {running ? "Yoxlanılır..." : "Yenidən yoxla"}
        </button>
      </div>

      <div className="text-xs text-muted-foreground">
        Yoxlama hər kolleksiyadan bir sənəd oxumaqla aparılır. &quot;Xəta&quot; adətən icazə
        (permission-denied) və ya şəbəkə problemini bildirir. Build/TypeScript vəziyyəti bu
        səhifədən yoxlanıla bilməz.
        {checkedAt && <> Son yoxlama: {checkedAt.toLocaleTimeString("az-AZ")}.</>}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-6 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Ümumi Modullar</div>
          <div className="text-4xl font-bold">{MODULES.length}</div>
        </div>

        <div className="p-6 border rounded-lg bg-green-50">
          <div className="text-sm text-muted-foreground mb-2">Operational</div>
          <div className="text-4xl font-bold text-green-600">{okCount}</div>
          <div className="text-xs text-muted-foreground mt-1">{checkable} yoxlanıla bilən</div>
        </div>

        <div className="p-6 border rounded-lg bg-red-50">
          <div className="text-sm text-muted-foreground mb-2">Xəta</div>
          <div className="text-4xl font-bold text-red-600">{errorCount}</div>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Kateqoriyalar</div>
          <div className="text-4xl font-bold">{categories.length}</div>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Kolleksiyalar</div>
          <div className="text-4xl font-bold">{totalCollections}</div>
        </div>
      </div>

      {/* Modules by Category */}
      {categories.map((category) => {
        const categoryModules = MODULES.filter((m) => m.category === category);

        return (
          <div key={category} className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{category}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryModules.map((module) => {
                const check = checks[module.name] ?? { state: "idle" as const };
                return (
                  <div key={module.name} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">{module.name}</div>
                        <code className="text-xs text-muted-foreground">{module.path}</code>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          check.state === "ok"
                            ? "bg-green-100 text-green-700"
                            : check.state === "error"
                              ? "bg-red-100 text-red-700"
                              : check.state === "checking"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {check.state === "ok"
                          ? "Operational"
                          : check.state === "error"
                            ? "Xəta"
                            : check.state === "checking"
                              ? "Yoxlanılır..."
                              : "Yoxlama yoxdur"}
                      </span>
                    </div>

                    {check.state === "error" && check.message && (
                      <div className="mb-2 text-xs text-red-600 break-words">{check.message}</div>
                    )}

                    <div className="mb-2">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {module.collections && module.collections.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Collections:</div>
                        <div className="flex flex-wrap gap-1">
                          {module.collections.map((col, i) => (
                            <code key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                              {col}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
