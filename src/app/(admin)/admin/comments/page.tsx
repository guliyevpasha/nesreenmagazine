"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";
import type { Comment, CommentStats, CommentStatus } from "@/lib/types";
import {
  listComments,
  updateCommentStatus,
  replyToComment,
  bulkUpdateCommentStatus,
  deleteComment,
  getCommentStats,
} from "@/lib/data/admin";
import { commentStatusLabels } from "@/lib/types";

export default function CommentsPage() {
  const { session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CommentStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [commentsData, statsData] = await Promise.all([
        listComments(selectedStatus === "all" ? undefined : selectedStatus),
        getCommentStats(),
      ]);
      setComments(commentsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError("Şərhlər yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: CommentStatus) {
    if (!session?.email) return;
    
    try {
      await updateCommentStatus(id, status, session.email);
      setSuccess(`Şərh statusu "${commentStatusLabels[status]}" olaraq dəyişdirildi`);
      loadData();
    } catch (err) {
      console.error(err);
      setError("Status dəyişdirilərkən xəta baş verdi");
    }
  }

  async function handleBulkAction(action: CommentStatus | "delete") {
    if (!session?.email || selectedIds.size === 0) return;
    
    const confirmed = confirm(
      `Seçilmiş ${selectedIds.size} şərhi ${action === "delete" ? "silmək" : `"${commentStatusLabels[action as CommentStatus]}" etmək`} istədiyinizə əminsiniz?`
    );
    
    if (!confirmed) return;

    try {
      if (action === "delete") {
        await Promise.all(Array.from(selectedIds).map((id) => deleteComment(id)));
      } else {
        await bulkUpdateCommentStatus(Array.from(selectedIds), action, session.email);
      }
      setSuccess(`${selectedIds.size} şərh uğurla ${action === "delete" ? "silindi" : "yeniləndi"}`);
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      console.error(err);
      setError("Bulk əməliyyat zamanı xəta baş verdi");
    }
  }

  async function handleReply(id: string) {
    if (!session?.email || !replyText.trim()) return;

    try {
      await replyToComment(id, replyText.trim(), session.email);
      setSuccess("Cavab uğurla göndərildi");
      setReplyText("");
      setReplyingTo(null);
      loadData();
    } catch (err) {
      console.error(err);
      setError("Cavab göndərilərkən xəta baş verdi");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Bu şərhi silmək istədiyinizə əminsiniz?");
    if (!confirmed) return;

    try {
      await deleteComment(id);
      setSuccess("Şərh uğurla silindi");
      loadData();
    } catch (err) {
      console.error(err);
      setError("Şərh silinərkən xəta baş verdi");
    }
  }

  function toggleSelect(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function selectAll() {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader title="Şərhlər" description="Yüklənir..." />
      </div>
    );
  }

  const statusColors: Record<CommentStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    spam: "bg-red-100 text-red-800",
    deleted: "bg-gray-100 text-gray-800",
  };

  // Badge component
  const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Şərhlər"
        description="İstifadəçi şərhlərini təsdiq edin, cavablandırın və spam filtrləyin"
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Cəmi</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-700">Gözləmədə</div>
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-700">Təsdiqlənib</div>
            <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-red-700">Spam</div>
            <div className="text-2xl font-bold text-red-800">{stats.spam}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-700">Silinib</div>
            <div className="text-2xl font-bold text-gray-800">{stats.deleted}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">Bu gün</div>
            <div className="text-2xl font-bold text-blue-800">{stats.todayCount}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700">Gündəlik Ort.</div>
            <div className="text-2xl font-bold text-purple-800">{stats.avgPerDay}</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {(["all", "pending", "approved", "spam", "deleted"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              selectedStatus === status
                ? "bg-white border-b-2 border-blue-500 text-blue-600 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status === "all" ? "Hamısı" : commentStatusLabels[status]}
            {status !== "all" && stats && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {status === "pending" && stats.pending}
                {status === "approved" && stats.approved}
                {status === "spam" && stats.spam}
                {status === "deleted" && stats.deleted}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-blue-800 font-medium">
            {selectedIds.size} şərh seçildi
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => handleBulkAction("approved")}
              className="!text-green-700 !bg-green-50 !border-green-300 hover:!bg-green-100"
            >
              ✓ Təsdiq et
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleBulkAction("spam")}
              className="!text-orange-700 !bg-orange-50 !border-orange-300"
            >
              🚫 Spam
            </Button>
            <Button
              variant="danger"
              onClick={() => handleBulkAction("delete")}
            >
              🗑 Sil
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              İmtina
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <Panel title="Şərhlər" className="overflow-hidden">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {selectedStatus === "all"
              ? "Hələ heç bir şərh yoxdur"
              : `"${commentStatusLabels[selectedStatus as CommentStatus]}" statusunda şərh yoxdur`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === comments.length && comments.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Müəllif</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Şərh</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Məqalə</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Tarix</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.has(comment.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900">{comment.authorName}</div>
                        <div className="text-xs text-gray-500">{comment.authorEmail}</div>
                        {comment.authorWebsite && (
                          <a
                            href={comment.authorWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            🌐 Website
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3 max-w-md">
                      <div className="text-sm text-gray-900 line-clamp-3">{comment.body}</div>
                      {comment.parentId && (
                        <div className="text-xs text-gray-500 mt-1">↳ Cavabdır</div>
                      )}
                      {comment.moderatorReply && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <div className="font-medium text-green-800">Moderator cavabı:</div>
                          <div className="text-gray-700">{comment.moderatorReply}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {comment.repliedBy} · {new Date(comment.repliedAt!).toLocaleDateString("az-AZ")}
                          </div>
                        </div>
                      )}
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Cavabınızı yazın..."
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              onClick={() => handleReply(comment.id)}
                            >
                              Göndər
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              İmtina
                            </Button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {comment.articleTitle}
                      </div>
                      <a
                        href={`/admin/articles/${comment.articleId}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Məqaləyə bax →
                      </a>
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[comment.status]}>
                        {commentStatusLabels[comment.status]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">
                        {new Date(comment.createdAt).toLocaleDateString("az-AZ")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleTimeString("az-AZ")}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {comment.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(comment.id, "approved")}
                              className="text-xs text-green-600 hover:text-green-800 hover:underline text-left"
                            >
                              ✓ Təsdiq et
                            </button>
                            <button
                              onClick={() => handleStatusChange(comment.id, "spam")}
                              className="text-xs text-red-600 hover:text-red-800 hover:underline text-left"
                            >
                              🚫 Spam
                            </button>
                          </>
                        )}
                        {comment.status === "approved" && (
                          <button
                            onClick={() => handleStatusChange(comment.id, "pending")}
                            className="text-xs text-yellow-600 hover:text-yellow-800 hover:underline text-left"
                          >
                            ⏸ Gözləməyə al
                          </button>
                        )}
                        {comment.status === "spam" && (
                          <button
                            onClick={() => handleStatusChange(comment.id, "pending")}
                            className="text-xs text-yellow-600 hover:text-yellow-800 hover:underline text-left"
                          >
                            ↩ Bərpa et
                          </button>
                        )}
                        {!comment.moderatorReply && (
                          <button
                            onClick={() => {
                              setReplyingTo(comment.id);
                              setReplyText("");
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            💬 Cavabla
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline text-left"
                        >
                          🗑 Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
