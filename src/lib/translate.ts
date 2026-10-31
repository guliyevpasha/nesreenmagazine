import { Translate } from '@google-cloud/translate/build/src/v2';

// Google Translate API klientini yaradırıq
let translateClient: Translate | null = null;

function getTranslateClient() {
  if (!translateClient) {
    // API key environment variable-dan oxuyuruq
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_TRANSLATE_API_KEY environment variable is not set');
    }
    
    translateClient = new Translate({ key: apiKey });
  }
  
  return translateClient;
}

// Dil kodları (ISO 639-1)
export const SUPPORTED_LANGUAGES = {
  az: 'Azərbaycan',
  en: 'English',
  ru: 'Русский',
  tr: 'Türkçe',
  ar: 'العربية',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface TranslationResult {
  [key: string]: string;
}

/**
 * Mətni müəyyən dilə tərcümə edir
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'az'
): Promise<string> {
  try {
    // Əgər eyni dillə tərcümə istənilirsə, orijinalı qaytarırıq
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    const client = getTranslateClient();
    
    const [translation] = await client.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate to ${targetLanguage}: ${error}`);
  }
}

/**
 * Mətni bütün dəstəklənən dillərə tərcümə edir
 */
export async function translateToAllLanguages(
  text: string,
  sourceLanguage: LanguageCode = 'az'
): Promise<TranslationResult> {
  const translations: TranslationResult = {
    [sourceLanguage]: text, // Orijinal dili də əlavə edirik
  };

  const targetLanguages = Object.keys(SUPPORTED_LANGUAGES).filter(
    (lang) => lang !== sourceLanguage
  ) as LanguageCode[];

  // Bütün dillərə paralel tərcümə edirik
  const translationPromises = targetLanguages.map(async (lang) => {
    try {
      const translated = await translateText(text, lang, sourceLanguage);
      return { lang, translated };
    } catch (error) {
      console.error(`Failed to translate to ${lang}:`, error);
      return { lang, translated: text }; // Xəta olarsa, orijinalı saxlayırıq
    }
  });

  const results = await Promise.all(translationPromises);
  
  results.forEach(({ lang, translated }) => {
    translations[lang] = translated;
  });

  return translations;
}

/**
 * Məqalə obyektini (başlıq, xülasə, mətn, etiketlər) bütün dillərə tərcümə edir
 */
export async function translateArticle(article: {
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
}, sourceLanguage: LanguageCode = 'az') {
  try {
    // Paralel tərcümə edirik
    const [titleTranslations, excerptTranslations, contentTranslations, tagsTranslations] = 
      await Promise.all([
        translateToAllLanguages(article.title, sourceLanguage),
        translateToAllLanguages(article.excerpt, sourceLanguage),
        translateToAllLanguages(article.content, sourceLanguage),
        article.tags && article.tags.length > 0
          ? Promise.all(
              article.tags.map(tag => translateToAllLanguages(tag, sourceLanguage))
            )
          : Promise.resolve([]),
      ]);

    // Etiketləri düzgün formatda birləşdiririk
    const translatedTags: { [key: string]: string[] } = {};
    const languages = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
    
    if (article.tags && article.tags.length > 0) {
      languages.forEach(lang => {
        translatedTags[lang] = tagsTranslations.map(tagTrans => tagTrans[lang]);
      });
    }

    return {
      title: titleTranslations,
      excerpt: excerptTranslations,
      content: contentTranslations,
      tags: translatedTags,
    };
  } catch (error) {
    console.error('Article translation error:', error);
    throw new Error('Failed to translate article');
  }
}

/**
 * Markdown formatını qoruyaraq tərcümə edir
 * (Google Translate bəzən markdown formatını pozur, ona görə basic qorunma)
 */
export async function translateMarkdown(
  markdown: string,
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'az'
): Promise<string> {
  try {
    // Sadə halda, birbaşa tərcümə edirik
    // Əgər format pozulma problemi olarsa, daha mürəkkəb parsing lazım olar
    return await translateText(markdown, targetLanguage, sourceLanguage);
  } catch (error) {
    console.error('Markdown translation error:', error);
    throw error;
  }
}
