"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";
import type { Article, ArticleVersion } from "@/lib/types";
import {
  getArticle,
  listArticleVersions,
  restoreArticleVersion,
  compareArticleVersions,
} from "@/lib/data/admin";
import { pick } from "@/lib/types";

export default function ArticleVersionsPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [comparing, setComparing] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [articleId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [articleData, versionsData] = await Promise.all([
        getArticle(articleId),
        listArticleVersions(articleId),
      ]);

      if (!articleData) {
        setError("Məqalə tapılmadı");
        return;
      }

      setArticle(articleData);
      setVersions(versionsData);
    } catch (err) {
      console.error(err);
      setError("Məlumatlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(versionId: string, versionNumber: number) {
    if (!session?.email) return;

    const confirmed = confirm(
      `Məqaləni v${versionNumber} versiyasına qaytarmaq istədiyinizə əminsiniz? Hazırkı versiya backup-a alınacaq.`
    );

    if (!confirmed) return;

    try {
      await restoreArticleVersion(articleId, versionId, session.email);
      setSuccess(`Məqalə v${versionNumber} versiyasına uğurla qaytarıldı`);
      loadData();
      // Reload article editor
      setTimeout(() => router.push(`/admin/articles/${articleId}`), 2000);
    } catch (err) {
      console.error(err);
      setError("Restore zamanı xəta baş verdi");
    }
  }

  function toggleCompare(versionId: string) {
    if (comparing.includes(versionId)) {
      setComparing(comparing.filter((id) => id !== versionId));
    } else if (comparing.length < 2) {
      setComparing([...comparing, versionId]);
    }
  }

  async function handleCompare() {
    if (comparing.length !== 2) return;

    try {
      const result = await compareArticleVersions(comparing[0], comparing[1]);
      setCompareResult(result);
    } catch (err) {
      console.error(err);
      setError("Müqayisə zamanı xəta baş verdi");
    }
  }

  function clearCompare() {
    setComparing([]);
    setCompareResult(null);
  }

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader
          title="Versiya tarixçəsi"
          description="Yüklənir..."
          backHref={`/admin/articles/${articleId}`}
        />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-8">
        <PageHeader title="Məqalə tapılmadı" backHref="/admin/articles" />
        <Alert tone="error">Məqalə tapılmadı və ya silinib</Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Versiya tarixçəsi"
        description={pick(article.title, "az")}
        backHref={`/admin/articles/${articleId}`}
        actions={
          comparing.length === 2 ? (
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCompare}>
                Müqayisə et
              </Button>
              <Button variant="ghost" onClick={clearCompare}>
                İmtina
              </Button>
            </div>
          ) : null
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {comparing.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-800 font-medium">
            {comparing.length === 1
              ? "1 versiya seçildi - müqayisə üçün daha bir versiya seçin"
              : "2 versiya seçildi - müqayisə edin"}
          </div>
        </div>
      )}

      {/* Compare Result */}
      {compareResult && (
        <Panel title="Versiya müqayisəsi">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Versiya 1</div>
                <div className="font-semibold">v{compareResult.version1.version}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(compareResult.version1.createdAt).toLocaleString("az-AZ")}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {compareResult.version1.summary}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Versiya 2</div>
                <div className="font-semibold">v{compareResult.version2.version}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(compareResult.version2.createdAt).toLocaleString("az-AZ")}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {compareResult.version2.summary}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Dəyişikliklər ({compareResult.changes.length})
              </h3>
              {compareResult.changes.length === 0 ? (
                <p className="text-gray-500">Heç bir dəyişiklik yoxdur</p>
              ) : (
                <div className="space-y-3">
                  {compareResult.changes.map((change: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200">
                      <div className="font-medium text-gray-900 mb-2">{change.field}</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-red-600 font-medium mb-1">Köhnə:</div>
                          <div className="text-gray-700 bg-red-50 p-2 rounded border border-red-200 max-h-40 overflow-auto">
                            {change.oldValue.length > 200
                              ? change.oldValue.substring(0, 200) + "..."
                              : change.oldValue}
                          </div>
                        </div>
                        <div>
                          <div className="text-green-600 font-medium mb-1">Yeni:</div>
                          <div className="text-gray-700 bg-green-50 p-2 rounded border border-green-200 max-h-40 overflow-auto">
                            {change.newValue.length > 200
                              ? change.newValue.substring(0, 200) + "..."
                              : change.newValue}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button variant="ghost" onClick={clearCompare}>
              Müqayisəni bağla
            </Button>
          </div>
        </Panel>
      )}

      {/* Versions List */}
      <Panel title={`Versiyalar (${versions.length})`}>
        {versions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hələ heç bir versiya yoxdur. Məqaləni ilk dəfə saxladıqdan sonra versiya tarixçəsi
            başlayacaq.
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => {
              const isLatest = index === 0;
              const isSelected = comparing.includes(version.id);

              return (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompare(version.id)}
                        disabled={comparing.length === 2 && !isSelected}
                        className="mt-1 w-4 h-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            Versiya {version.version}
                          </span>
                          {isLatest && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Son versiya
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{version.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            📅 {new Date(version.createdAt).toLocaleDateString("az-AZ")}
                          </span>
                          <span>
                            🕐 {new Date(version.createdAt).toLocaleTimeString("az-AZ")}
                          </span>
                          <span>👤 {version.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isLatest && (
                        <button
                          onClick={() => handleRestore(version.id, version.version)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-3 py-1 border border-blue-300 rounded hover:bg-blue-50"
                        >
                          ↩ Restore et
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Info Panel */}
      <Panel title="📚 Versiya tarixçəsi haqqında">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            • Məqalə hər dəfə saxlandıqda yeni versiya avtomatik yaradılır
          </p>
          <p>
            • İstənilən versiyaya qayıtmaq olar (restore), hazırkı versiya avtomatik backup alınır
          </p>
          <p>
            • İki versiyanı müqayisə edərək nə dəyişdiyini görə bilərsiniz
          </p>
          <p>
            • Versiya tarixçəsi məqalənin bütün redaktə prosesini saxlayır
          </p>
        </div>
      </Panel>
    </div>
  );
}
