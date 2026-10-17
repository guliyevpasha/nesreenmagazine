import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary konfiqurasiyası
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Fayl tapılmadı' },
        { status: 400 }
      );
    }

    // File-ı buffer-ə çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Base64-ə çevir
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Cloudinary-a yüklə
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `nesreen-magazine/${folder}`,
      resource_type: 'auto',
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
      { error: 'Şəkil yüklənmədi' },
      { status: 500 }
    );
  }
}
