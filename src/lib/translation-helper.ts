/**
 * Translation Helper Functions
 * Google Translate API ilə məqalə tərcüməsi
 */

import type { Article, ArticleInput, Locale, LocalizedText } from "./types";

export interface TranslationResult {
  success: boolean;
  translatedFields: Partial<ArticleInput>;
  errors?: string[];
}

/**
 * Tək mətn tərcüməsi
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Tərcümə xətası");
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Translate text error:", error);
    throw error;
  }
}

/**
 * Batch mətn tərcüməsi - bir neçə mətn eyni anda
 */
export async function translateBatch(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  try {
    const response = await fetch("/api/translate", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts,
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Batch tərcümə xətası");
    }

    const data = await response.json();
    return data.translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error("Translate batch error:", error);
    throw error;
  }
}

/**
 * Məqalənin bütün sahələrini tərcümə et
 */
export async function translateArticleFields(
  article: Article | ArticleInput,
  sourceLocale: Locale,
  targetLocale: Locale,
  onProgress?: (progress: number, field: string) => void
): Promise<TranslationResult> {
  const errors: string[] = [];
  const translatedFields: Partial<ArticleInput> = {
    title: { ...article.title },
    excerpt: { ...article.excerpt },
    body: { ...article.body },
    coverAlt: { ...(article.coverAlt || {}) },
  };

  try {
    let completed = 0;
    const totalFields = 4; // title, excerpt, body, coverAlt

    // 1. Başlığı tərcümə et
    if (article.title[sourceLocale]) {
      onProgress?.(0, "Başlıq tərcümə edilir...");
      try {
        const translated = await translateText(
          article.title[sourceLocale],
          sourceLocale,
          targetLocale
        );
        translatedFields.title![targetLocale] = translated;
        completed++;
        onProgress?.((completed / totalFields) * 100, "Başlıq tərcümə edildi");
      } catch (error) {
        errors.push(`Başlıq tərcüməsi: ${error instanceof Error ? error.message : "Xəta"}`);
      }
    }

    // 2. Xülasəni tərcümə et
    if (article.excerpt[sourceLocale]) {
      onProgress?.((completed / totalFields) * 100, "Xülasə tərcümə edilir...");
      try {
        const translated = await translateText(
          article.excerpt[sourceLocale],
          sourceLocale,
          targetLocale
        );
        translatedFields.excerpt![targetLocale] = translated;
        completed++;
        onProgress?.((completed / totalFields) * 100, "Xülasə tərcümə edildi");
      } catch (error) {
        errors.push(`Xülasə tərcüməsi: ${error instanceof Error ? error.message : "Xəta"}`);
      }
    }

    // 3. Əsas mətni tərcümə et (uzun mətn olduğu üçün hissələrə böl)
    if (article.body[sourceLocale]) {
      onProgress?.((completed / totalFields) * 100, "Mətn tərcümə edilir...");
      try {
        const bodyText = article.body[sourceLocale];
        
        // Uzun mətnləri hissələrə böl (Google Translate limiti ~5000 char)
        const maxChunkSize = 4500;
        
        if (bodyText.length <= maxChunkSize) {
          const translated = await translateText(bodyText, sourceLocale, targetLocale);
          translatedFields.body![targetLocale] = translated;
        } else {
          // Paraqraflara görə böl
          const paragraphs = bodyText.split(/\n\n+/);
          const translatedParagraphs: string[] = [];
          
          let currentChunk = "";
          const chunks: string[] = [];
          
          for (const para of paragraphs) {
            if (currentChunk.length + para.length + 2 <= maxChunkSize) {
              currentChunk += (currentChunk ? "\n\n" : "") + para;
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = para;
            }
          }
          if (currentChunk) chunks.push(currentChunk);
          
          // Hər chunk-u tərcümə et
          for (const chunk of chunks) {
            const translated = await translateText(chunk, sourceLocale, targetLocale);
            translatedParagraphs.push(translated);
            
            // Progress update
            const chunkProgress = (chunks.indexOf(chunk) + 1) / chunks.length;
            onProgress?.(
              ((completed + chunkProgress) / totalFields) * 100,
              `Mətn tərcümə edilir... (${chunks.indexOf(chunk) + 1}/${chunks.length})`
            );
          }
          
          translatedFields.body![targetLocale] = translatedParagraphs.join("\n\n");
        }
        
        completed++;
        onProgress?.((completed / totalFields) * 100, "Mətn tərcümə edildi");
      } catch (error) {
        errors.push(`Mətn tərcüməsi: ${error instanceof Error ? error.message : "Xəta"}`);
      }
    }

    // 4. Cover alt text-i tərcümə et
    if (article.coverAlt?.[sourceLocale]) {
      onProgress?.((completed / totalFields) * 100, "Şəkil alt text tərcümə edilir...");
      try {
        const translated = await translateText(
          article.coverAlt[sourceLocale],
          sourceLocale,
          targetLocale
        );
        translatedFields.coverAlt![targetLocale] = translated;
        completed++;
        onProgress?.((completed / totalFields) * 100, "Şəkil alt text tərcümə edildi");
      } catch (error) {
        errors.push(`Alt text tərcüməsi: ${error instanceof Error ? error.message : "Xəta"}`);
      }
    }

    onProgress?.(100, "Tərcümə tamamlandı!");

    return {
      success: errors.length === 0,
      translatedFields,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Article translation error:", error);
    return {
      success: false,
      translatedFields: {},
      errors: [error instanceof Error ? error.message : "Ümumi xəta"],
    };
  }
}

/**
 * Tərcümə API-nin mövcudluğunu yoxla
 */
export async function checkTranslationAPIAvailability(): Promise<{
  available: boolean;
  message: string;
}> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "test",
        targetLanguage: "en",
      }),
    });

    if (response.status === 500) {
      const error = await response.json();
      if (error.hint) {
        return {
          available: false,
          message: error.hint,
        };
      }
    }

    return {
      available: response.ok,
      message: response.ok
        ? "Google Translate API aktivdir"
        : "API mövcud deyil və ya xəta var",
    };
  } catch (error) {
    return {
      available: false,
      message: "API yoxlana bilmədi",
    };
  }
}

/**
 * Tərcümə keyfiyyətini qiymətləndir (sadə heuristics)
 */
export function assessTranslationQuality(
  originalText: string,
  translatedText: string
): {
  score: number; // 0-100
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Uzunluq fərqi yoxlaması
  const lengthRatio = translatedText.length / originalText.length;
  if (lengthRatio < 0.3 || lengthRatio > 3) {
    issues.push("Tərcümə uzunluğu orijinala nisbətdə çox fərqlidir");
    score -= 20;
  }

  // Boş nəticə
  if (translatedText.trim().length === 0) {
    issues.push("Tərcümə boşdur");
    score = 0;
  }

  // HTML tag-lar saxlanılıb?
  const originalTags = (originalText.match(/<[^>]+>/g) || []).length;
  const translatedTags = (translatedText.match(/<[^>]+>/g) || []).length;
  if (originalTags !== translatedTags) {
    issues.push("HTML structure dəyişib");
    score -= 15;
  }

  // Markdown link-lər saxlanılıb?
  const originalLinks = (originalText.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
  const translatedLinks = (translatedText.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
  if (originalLinks !== translatedLinks) {
    issues.push("Bəzi linklər itirilə bilər");
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    issues,
  };
}
