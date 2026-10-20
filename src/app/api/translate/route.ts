import { NextRequest, NextResponse } from "next/server";

/**
 * Google Translate API v3 Integration
 * https://cloud.google.com/translate/docs/reference/rest
 */

interface TranslateRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, sourceLanguage, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "text və targetLanguage mütləqdir" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Translate API key konfiqurasiya edilməyib",
          hint: "GOOGLE_TRANSLATE_API_KEY environment variable-ı .env.local-da əlavə edin",
        },
        { status: 500 }
      );
    }

    // Language code mapping - Google Translate istifadə edilən kodlar
    const langMap: Record<string, string> = {
      az: "az", // Azerbaijani
      en: "en", // English
      ru: "ru", // Russian
      tr: "tr", // Turkish
      ar: "ar", // Arabic
    };

    const sourceLang = sourceLanguage ? langMap[sourceLanguage] || sourceLanguage : undefined;
    const targetLang = langMap[targetLanguage] || targetLanguage;

    // Google Translate API v3 REST call
    const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(translateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("Google Translate API error:", errorData);
      
      return NextResponse.json(
        {
          error: "Tərcümə xətası",
          details: errorData.error?.message || response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translation = data.data?.translations?.[0];

    if (!translation) {
      return NextResponse.json(
        { error: "Tərcümə cavabı boşdur" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText: translation.translatedText,
      detectedLanguage: translation.detectedSourceLanguage,
    });
  } catch (error) {
    console.error("Translate API error:", error);
    return NextResponse.json(
      {
        error: "Server xətası",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Batch translation - bir neçə mətn eyni anda
 */
export async function PUT(request: NextRequest) {
  try {
    const body: {
      texts: string[];
      sourceLanguage: string;
      targetLanguage: string;
    } = await request.json();

    const { texts, sourceLanguage, targetLanguage } = body;

    if (!texts || texts.length === 0 || !targetLanguage) {
      return NextResponse.json(
        { error: "texts və targetLanguage mütləqdir" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Translate API key konfiqurasiya edilməyib" },
        { status: 500 }
      );
    }

    const langMap: Record<string, string> = {
      az: "az",
      en: "en",
      ru: "ru",
      tr: "tr",
      ar: "ar",
    };

    const sourceLang = sourceLanguage ? langMap[sourceLanguage] || sourceLanguage : undefined;
    const targetLang = langMap[targetLanguage] || targetLanguage;

    const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(translateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: texts,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "Batch tərcümə xətası",
          details: errorData.error?.message || response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translations = data.data?.translations || [];

    return NextResponse.json({
      translations: translations.map((t: any) => ({
        translatedText: t.translatedText,
        detectedLanguage: t.detectedSourceLanguage,
      })),
    });
  } catch (error) {
    console.error("Batch translate error:", error);
    return NextResponse.json(
      {
        error: "Server xətası",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
