"use client";

import { useState } from "react";

import { Alert, Button, Panel } from "./ui";

/* ── Tip tərifləri ───────────────────────────────────────────────────────── */
interface ContentAnalysis {
  readabilityScore: number;       // 0-100
  readabilityLabel: string;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  readingMinutes: number;
  headingCount: number;
  paragraphCount: number;
  suggestions: string[];
}

interface TitleVariant {
  title: string;
  type: "question" | "list" | "how_to" | "emotional" | "news";
  reason: string;
}

interface AIContentAssistantProps {
  title: string;
  body: string;
  category: string;
  onApplyTitle?: (title: string) => void;
  onApplyExcerpt?: (excerpt: string) => void;
}

/* ── Oxunuş dərəcəsi hesabı ──────────────────────────────────────────────── */
function analyzeContent(title: string, body: string): ContentAnalysis {
  const text = body.replace(/[#*_`\[\]()>]/g, "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  const headings = (body.match(/^#{1,6}\s/gm) ?? []).length;

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  // Flesch-Kincaid oxunuş xalı (sadələşdirilmiş)
  let readabilityScore = 100;
  if (avgSentenceLength > 25) readabilityScore -= 20;
  else if (avgSentenceLength > 20) readabilityScore -= 10;
  if (wordCount < 300) readabilityScore -= 15;
  if (headings === 0 && wordCount > 500) readabilityScore -= 10;
  if (paragraphs.length < 3) readabilityScore -= 10;
  readabilityScore = Math.max(0, Math.min(100, readabilityScore));

  let readabilityLabel = "Çox yaxşı";
  if (readabilityScore < 40) readabilityLabel = "Çətin";
  else if (readabilityScore < 60) readabilityLabel = "Orta";
  else if (readabilityScore < 80) readabilityLabel = "Yaxşı";

  const suggestions: string[] = [];
  if (wordCount < 300) suggestions.push("Məqalə qısa görünür — ən azı 300 söz tövsiyə edilir.");
  if (wordCount > 3000) suggestions.push("Məqalə çox uzundur — bölmələrə ayırmağı düşünün.");
  if (headings === 0 && wordCount > 400) suggestions.push("Başlıqlar (H2, H3) əlavə edin — oxunuşu asanlaşdırır.");
  if (avgSentenceLength > 25) suggestions.push("Uzun cümlələri qısaldın (orta 15-20 söz tövsiyə olunur).");
  if (!title.trim()) suggestions.push("Başlıq boşdur — əvvəl başlıq yazın.");
  if (title.length > 70) suggestions.push("Başlıq çox uzundur (70 simvoldan az olmalıdır).");
  if (paragraphs.length < 3 && wordCount > 200) suggestions.push("Məzmunu daha çox paraqrafa bölün.");

  return {
    readabilityScore,
    readabilityLabel,
    wordCount,
    sentenceCount,
    avgSentenceLength,
    readingMinutes,
    headingCount: headings,
    paragraphCount: paragraphs.length,
    suggestions,
  };
}

/* ── Başlıq variantları generasiyası ─────────────────────────────────────── */
function generateTitleVariants(title: string, category: string): TitleVariant[] {
  if (!title.trim()) return [];

  const base = title.trim().replace(/[?!.]+$/, "");
  const variants: TitleVariant[] = [];

  // Sual formatı
  variants.push({
    title: `${base}: nə bilmək lazımdır?`,
    type: "question",
    reason: "Sual formatı klik nisbətini artırır",
  });

  // Siyahı formatı
  const nums = ["5", "7", "10"];
  const num = nums[Math.floor(Math.random() * nums.length)];
  variants.push({
    title: `${num} əsas məqam: ${base}`,
    type: "list",
    reason: "Siyahı başlıqları daha çox paylaşılır",
  });

  // Necə formatı
  variants.push({
    title: `${base} — tam bələdçi`,
    type: "how_to",
    reason: "Bələdçi formatı axtarış motorlarında yaxşı sıralanır",
  });

  // Emosional format
  const adjectives = ["vacib", "məşhur", "gözlənilməz", "maraqlı"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  variants.push({
    title: `Ən ${adj} ${base.toLowerCase()} haqqında`,
    type: "emotional",
    reason: "Emosional açar sözlər oxucunu cəlb edir",
  });

  // Xəbər formatı
  variants.push({
    title: `${base} — 2026-cı ildə bilməlisiniz`,
    type: "news",
    reason: "Aktual il oxucunun marağını artırır",
  });

  return variants;
}

/* ── Excerpt generasiyası ────────────────────────────────────────────────── */
function generateExcerpt(body: string, maxLength = 160): string {
  const text = body
    .replace(/^#{1,6}\s.+$/gm, "")
    .replace(/[*_`\[\]()#>]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  const firstSentences = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  if (firstSentences.length <= maxLength) return firstSentences;
  return firstSentences.slice(0, maxLength - 3) + "…";
}

/* ── Xal rəngi ───────────────────────────────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function scoreBg(score: number) {
  if (score >= 80) return "border-green-300 bg-green-50";
  if (score >= 60) return "border-yellow-300 bg-yellow-50";
  return "border-red-300 bg-red-50";
}

const titleTypeLabels: Record<TitleVariant["type"], string> = {
  question:  "Sual",
  list:      "Siyahı",
  how_to:    "Bələdçi",
  emotional: "Emosional",
  news:      "Xəbər",
};

/* ── Əsas komponent ──────────────────────────────────────────────────────── */
export default function AIContentAssistant({
  title,
  body,
  category,
  onApplyTitle,
  onApplyExcerpt,
}: AIContentAssistantProps) {
  const [analyzed, setAnalyzed] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [titleVariants, setTitleVariants] = useState<TitleVariant[]>([]);
  const [generatedExcerpt, setGeneratedExcerpt] = useState("");
  const [copiedTitle, setCopiedTitle] = useState("");
  const [loading, setLoading] = useState(false);

  function handleAnalyze() {
    setLoading(true);
    setTimeout(() => {
      const result = analyzeContent(title, body);
      const variants = generateTitleVariants(title, category);
      const excerpt = generateExcerpt(body);
      setAnalysis(result);
      setTitleVariants(variants);
      setGeneratedExcerpt(excerpt);
      setAnalyzed(true);
      setLoading(false);
    }, 300);
  }

  function handleCopyTitle(t: string) {
    void navigator.clipboard.writeText(t);
    setCopiedTitle(t);
    setTimeout(() => setCopiedTitle(""), 2000);
  }

  return (
    <Panel
      title="AI Kontent Köməkçisi"
      description="Məzmun analizi, başlıq variantları və excerpt generasiyası."
    >
      <div className="space-y-5">

        {/* Analiz düyməsi */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={loading || (!title.trim() && !body.trim())}
          >
            {loading ? "Analiz edilir…" : analyzed ? "Yenidən analiz et" : "Analiz et"}
          </Button>
          {!title.trim() && !body.trim() && (
            <p className="font-ui text-[12px] text-muted">Başlıq və ya məzmun lazımdır.</p>
          )}
        </div>

        {analyzed && analysis && (
          <>
            {/* ── Oxunuş xalı ── */}
            <div className={`border px-4 py-4 ${scoreBg(analysis.readabilityScore)}`}>
              <div className="flex items-center justify-between">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Oxunuş xalı
                </p>
                <p className={`font-display text-3xl ${scoreColor(analysis.readabilityScore)}`}>
                  {analysis.readabilityScore}/100
                </p>
              </div>
              <p className={`mt-1 font-ui text-[13px] font-semibold ${scoreColor(analysis.readabilityScore)}`}>
                {analysis.readabilityLabel}
              </p>
            </div>

            {/* ── Məzmun statistikası ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Söz sayı", value: analysis.wordCount },
                { label: "Oxu müddəti", value: `${analysis.readingMinutes} dəq` },
                { label: "Başlıq sayı", value: analysis.headingCount },
                { label: "Paraqraf", value: analysis.paragraphCount },
              ].map((s) => (
                <div key={s.label} className="border border-line bg-cream-deep px-3 py-3 text-center">
                  <p className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted">{s.label}</p>
                  <p className="mt-1 font-display text-xl text-ink">{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── Təkliflər ── */}
            {analysis.suggestions.length > 0 && (
              <div className="border border-gold/30 bg-gold/5 p-4 space-y-2">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Tövsiyələr ({analysis.suggestions.length})
                </p>
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gold mt-0.5 shrink-0">→</span>
                    <p className="font-ui text-[13px] text-ink-soft">{s}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Başlıq variantları ── */}
            {titleVariants.length > 0 && onApplyTitle && (
              <div className="space-y-2">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Başlıq variantları
                </p>
                {titleVariants.map((v, i) => (
                  <div key={i} className="border border-line bg-paper p-3 hover:border-bordo/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="inline-block border border-line px-1.5 py-0.5 font-ui text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
                          {titleTypeLabels[v.type]}
                        </span>
                        <p className="font-ui text-[13px] text-ink">{v.title}</p>
                        <p className="mt-0.5 font-ui text-[11px] text-muted/70">{v.reason}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyTitle(v.title)}
                          className="font-ui text-[10px] uppercase tracking-[0.1em] text-muted hover:text-ink transition-colors px-2 py-1 border border-line"
                        >
                          {copiedTitle === v.title ? "✓" : "Kopyala"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplyTitle(v.title)}
                          className="font-ui text-[10px] uppercase tracking-[0.1em] text-bordo hover:bg-bordo hover:text-cream transition-colors px-2 py-1 border border-bordo"
                        >
                          Tətbiq et
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Excerpt generasiyası ── */}
            {generatedExcerpt && onApplyExcerpt && (
              <div className="border border-line p-4 space-y-2">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Avtomatik excerpt ({generatedExcerpt.length} simvol)
                </p>
                <p className="font-ui text-[13px] text-ink-soft leading-relaxed">
                  {generatedExcerpt}
                </p>
                <button
                  type="button"
                  onClick={() => onApplyExcerpt(generatedExcerpt)}
                  className="font-ui text-[11px] uppercase tracking-[0.12em] text-bordo hover:underline transition-colors"
                >
                  Bu excerptü tətbiq et →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
