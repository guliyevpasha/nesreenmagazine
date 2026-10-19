"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";
import type { Article, MediaBlock, Locale } from "@/lib/types";
import { getArticle, saveArticle } from "@/lib/data/admin";
import { pick } from "@/lib/types";
import MediaBlockEditor from "@/components/admin/MediaBlockEditor";
import MediaBlockRenderer from "@/components/admin/MediaBlockRenderer";

export default function ArticleMediaPage() {
  const params = useParams();
  const { session } = useAuth();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<MediaBlock | null>(null);
  const [adding, setAdding] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>("az");

  useEffect(() => {
    loadData();
  }, [articleId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const articleData = await getArticle(articleId);

      if (!articleData) {
        setError("Məqalə tapılmadı");
        return;
      }

      setArticle(articleData);
    } catch (err) {
      console.error(err);
      setError("Məlumatlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBlock(block: MediaBlock) {
    if (!article || !session?.email) return;

    try {
      const existingBlocks = article.mediaBlocks || [];
      const blockIndex = existingBlocks.findIndex((b) => b.id === block.id);

      let updatedBlocks: MediaBlock[];
      if (blockIndex >= 0) {
        // Update existing
        updatedBlocks = [...existingBlocks];
        updatedBlocks[blockIndex] = block;
      } else {
        // Add new
        updatedBlocks = [...existingBlocks, block];
      }

      await saveArticle(articleId, {
        ...article,
        mediaBlocks: updatedBlocks,
      });

      setSuccess(blockIndex >= 0 ? "Media block yeniləndi" : "Media block əlavə edildi");
      setAdding(false);
      setEditing(null);
      loadData();
    } catch (err) {
      console.error(err);
      setError("Saxlanarkən xəta baş verdi");
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!article || !session?.email) return;

    const confirmed = confirm("Bu media block-u silmək istədiyinizə əminsiniz?");
    if (!confirmed) return;

    try {
      const updatedBlocks = (article.mediaBlocks || []).filter((b) => b.id !== blockId);

      await saveArticle(articleId, {
        ...article,
        mediaBlocks: updatedBlocks,
      });

      setSuccess("Media block silindi");
      loadData();
    } catch (err) {
      console.error(err);
      setError("Silinərkən xəta baş verdi");
    }
  }

  async function handleMoveBlock(blockId: string, direction: "up" | "down") {
    if (!article || !session?.email) return;

    try {
      const blocks = [...(article.mediaBlocks || [])];
      const index = blocks.findIndex((b) => b.id === blockId);

      if (index === -1) return;
      if (direction === "up" && index === 0) return;
      if (direction === "down" && index === blocks.length - 1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

      await saveArticle(articleId, {
        ...article,
        mediaBlocks: blocks,
      });

      loadData();
    } catch (err) {
      console.error(err);
      setError("Sıralama dəyişdirilərkən xəta baş verdi");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader
          title="Media Blocks"
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

  const mediaBlocks = article.mediaBlocks || [];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Rich Media Blocks"
        description={pick(article.title, "az")}
        backHref={`/admin/articles/${articleId}`}
        actions={
          !adding && !editing ? (
            <Button variant="primary" onClick={() => setAdding(true)}>
              + Yeni Block
            </Button>
          ) : null
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Add/Edit Block */}
      {(adding || editing) && (
        <MediaBlockEditor
          block={editing}
          onSave={handleSaveBlock}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
          activeLocale={activeLocale}
        />
      )}

      {/* Info Panel */}
      {!adding && !editing && mediaBlocks.length === 0 && (
        <Panel title="📚 Rich Media Blocks haqqında">
          <div className="text-sm text-gray-700 space-y-2">
            <p>• Məqalənizə video, şəkil qalereyası, sosial media postları əlavə edin</p>
            <p>• YouTube və Vimeo videoları avtomatik embed olunur</p>
            <p>• Instagram və Twitter postlarını məqaləyə daxil edə bilərsiniz</p>
            <p>• Öz HTML kodunuzu yaza bilərsiniz</p>
            <p>• Blokların sırasını dəyişə bilərsiniz</p>
          </div>
        </Panel>
      )}

      {/* Blocks List */}
      {!adding && !editing && mediaBlocks.length > 0 && (
        <Panel title={`Media Blocks (${mediaBlocks.length})`}>
          <div className="space-y-4">
            {mediaBlocks.map((block, index) => (
              <div
                key={block.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                      {getBlockTypeLabel(block.type)}
                    </span>
                    <div className="text-xs text-gray-500">Sıra: #{index + 1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveBlock(block.id, "up")}
                        className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        ↑
                      </button>
                    )}
                    {index < mediaBlocks.length - 1 && (
                      <button
                        onClick={() => handleMoveBlock(block.id, "down")}
                        className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => setEditing(block)}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      ✏️ Redaktə
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="text-xs text-red-600 hover:text-red-800 hover:underline"
                    >
                      🗑 Sil
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white p-4 rounded border border-gray-200">
                  <MediaBlockRenderer block={block} locale={activeLocale} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function getBlockTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    video: "🎥 Video",
    gallery: "🖼️ Qalereya",
    instagram: "📷 Instagram",
    twitter: "🐦 Twitter",
    quote: "💬 Sitat",
    html: "💻 HTML",
    divider: "➖ Ayırıcı",
  };
  return labels[type] || type;
}
