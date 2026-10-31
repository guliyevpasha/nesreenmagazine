/**
 * File Upload API - Cloudinary inteqrasiyası
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 */
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireStaffAuth } from '@/lib/auth/middleware';
import { staffRateLimiter, getClientIp } from '@/lib/rate-limit';

// Cloudinary konfiqurasiyası - bütün açarlar environment variable-lardan
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required');
}
if (!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_API_KEY is required');
}
if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is required');
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  mp4: { 
    mime: 'video/mp4',
    magic: [[0x00, 0x00, 0x00]]
  },
  webm: { 
    mime: 'video/webm',
    magic: [[0x1A, 0x45, 0xDF, 0xA3]]
  },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
      { error: 'Çox çox sorğu göndərilir. Bir az gözləyin.' },
      { status: 429 }
    );
  }

  // Authentication yoxla
  const session = await requireStaffAuth(request);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Staff access required' },
      { status: 401 }
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
        { error: 'Fayl ölçüsü maksimum 50MB ola bilər' },
        { status: 400 }
      );
    }

    // File name sanitize et
    const safeName = sanitizeFilename(file.name);

    // File-ı buffer-ə çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes ilə file type yoxla (MIME type-a güvənmə)
    if (!validateFileType(buffer)) {
      return NextResponse.json(
        { error: 'Yalnız şəkil və video faylları qəbul edilir' },
        { status: 400 }
      );
    }

    // Base64-ə çevir
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Cloudinary-a yüklə
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `nesreen-magazine/${folder}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'],
      max_file_size: MAX_FILE_SIZE,
      filename_override: safeName,
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload xətası:', error);
    
    return NextResponse.json(
      { error: 'Fayl yüklənmədi' },
      { status: 500 }
    );
  }
}
