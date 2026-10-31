import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

/**
 * Fayl adını sanitize et
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
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
    const folder = (formData.get('folder') as string || 'uploads').replace(/[^a-zA-Z0-9-_]/g, '');

    if (!file) {
      return NextResponse.json(
        { error: 'Fayl tapılmadı' },
        { status: 400 }
      );
    }

    // File size yoxla
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fayl ölçüsü maksimum 10MB ola bilər' },
        { status: 400 }
      );
    }

    // File name sanitize et
    const timestamp = Date.now();
    const safeName = `${timestamp}-${sanitizeFilename(file.name)}`;

    // File-ı buffer-ə çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes ilə file type yoxla
    if (!validateFileType(buffer)) {
      return NextResponse.json(
        { error: 'Yalnız şəkil faylları qəbul edilir' },
        { status: 400 }
      );
    }

    // Firebase Admin SDK
    const admin = getFirebaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Firebase konfiqurasiya edilməyib' },
        { status: 500 }
      );
    }

    const storage = getStorage(admin);
    const bucket = storage.bucket();
    
    // Firebase Storage-a yüklə
    const filePath = `${folder}/${safeName}`;
    const fileUpload = bucket.file(filePath);
    
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      public: true,
    });

    // Public URL al
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Uzun müddətli URL
    });

    // Və ya public URL (əgər bucket public-dirsə)
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
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
