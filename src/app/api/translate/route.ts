import { NextRequest, NextResponse } from 'next/server';
import { translateArticle, translateText, translateToAllLanguages, type LanguageCode } from '@/lib/translate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, sourceLanguage } = body;

    // Type yoxlaması
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    const sourceLang = (sourceLanguage || 'az') as LanguageCode;

    // Tərcümə növünə görə müxtəlif əməliyyatlar
    switch (type) {
      case 'article': {
        // Tam məqalə tərcüməsi (başlıq, xülasə, mətn, etiketlər)
        const { title, excerpt, content, tags } = data;
        
        if (!title || !excerpt || !content) {
          return NextResponse.json(
            { error: 'Title, excerpt, and content are required for article translation' },
            { status: 400 }
          );
        }

        const translations = await translateArticle(
          { title, excerpt, content, tags },
          sourceLang
        );

        return NextResponse.json({
          success: true,
          translations,
        });
      }

      case 'text': {
        // Sadə mətn tərcüməsi
        const { text } = data;
        
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }

        const translations = await translateToAllLanguages(text, sourceLang);

        return NextResponse.json({
          success: true,
          translations,
        });
      }

      case 'single': {
        // Bir dilə tərcümə
        const { text, targetLanguage } = data;
        
        if (!text || !targetLanguage) {
          return NextResponse.json(
            { error: 'Text and targetLanguage are required' },
            { status: 400 }
          );
        }

        const translation = await translateText(text, targetLanguage, sourceLang);

        return NextResponse.json({
          success: true,
          translation,
          targetLanguage,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid translation type. Use "article", "text", or "single"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Translation API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Translation failed';
    
    return NextResponse.json(
      { 
        error: 'Translation failed', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
