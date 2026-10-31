import { NextRequest, NextResponse } from 'next/server';
import { staffRateLimiter, getClientIp } from '@/lib/rate-limit';

// İcazəli fayl növləri və magic bytes
const ALLOWED_TYPES: Record<string, { mime: string; magic: number[][] }> = {
  jpeg: { 
    mime: 'image/jpeg',
    magic: [[0xFF, 0xD8, 0xFF]]
  },
  jpg: { 
    mime: 'image/jpeg',
    magic: [[0xFF, 0xD8, 0xFF]]
  },
  png: { 
    mime: 'image/png',
    magic: [[0x89, 0x50, 0x4E, 0x47]]
  },
  webp: { 
    mime: 'image/webp',
    magic: [[0x52, 0x49, 0x46, 0x46]]
  },
  gif: { 
    mime: 'image/gif',
    magic: [[0x47, 0x49, 0x46, 0x38]]
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (Firestore limit)

/**
 * Magic bytes ilə fayl növünü yoxla
 */
function validateFileType(buffer: Buffer): boolean {
  for (const [_, { magic }] of Object.entries(ALLOWED_TYPES)) {
    for (const signature of magic) {
      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateLimitResult = await staffRateLimiter.limit(ip);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Çox sorğu göndərilir. Bir az gözləyin.' },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Fayl tapılmadı' },
        { status: 400 }
      );
    }

    // File size yoxla
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fayl ölçüsü maksimum 5MB ola bilər' },
        { status: 400 }
      );
    }

    // File-ı buffer-ə çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes ilə file type yoxla
    if (!validateFileType(buffer)) {
      return NextResponse.json(
        { error: 'Yalnız şəkil faylları qəbul edilir (JPG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Base64 data URI yarat
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Data URI-ni qaytır (frontend Firestore-a saxlayacaq və ya birbaşa istifadə edəcək)
    return NextResponse.json({
      url: dataUri,
      size: file.size,
      type: file.type,
      name: file.name,
    });
  } catch (error) {
    console.error('Upload xətası:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Fayl yüklənmədi';
    
    return NextResponse.json(
      { 
        error: 'Fayl yüklənmədi',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
