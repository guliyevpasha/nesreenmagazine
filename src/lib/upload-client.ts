/**
 * Nesreen Magazine — media yükləmə (brauzer tərəfi).
 *
 * Şəkillər ƏVVƏL brauzerdə sıxılır (maks. 2000px, WebP), sonra birbaşa
 * Cloudinary-yə yüklənir. Firestore-da yalnız qısa URL saxlanılır, ona görə
 * sənədin 1 MB limiti aşılmır (köhnə base64 data-URI yanaşması bu limiti
 * keçirdi və məqalələr dərc olunmurdu).
 *
 * Firebase Storage pulsuz (Spark) planda aktiv deyil, ona görə Cloudinary
 * istifadə olunur. Yükləmə imzasını yalnız daxil olmuş redaksiya üzvü ala bilər
 * (/api/upload-signature) — kənar şəxs fayl yükləyə bilməz.
 */
import { authorizedFetch } from "@/lib/auth/authorized-fetch";

/** İcazəli qovluqlar (Cloudinary-də nesreen/<qovluq>) */
const ALLOWED_FOLDERS = [
  "covers",
  "banners",
  "inline-images",
  "ejournals",
  "ejournal-covers",
  "ebook",
  "media",
] as const;

type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MAX_IMAGE_DIMENSION = 2000;
const IMAGE_QUALITY = 0.82;
/** Cloudinary Free plan limitləri */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export interface UploadedMedia {
  url: string;
  path: string;
  /** Cloudinary public_id (Fayl İdarəetməsi bunu saxlayır) */
  publicId: string;
  size: number;
  type: string;
  name: string;
}

export class MediaUploadError extends Error {}

function normalizeFolder(value: FormDataEntryValue | null, isImage: boolean): AllowedFolder {
  if (typeof value === "string" && (ALLOWED_FOLDERS as readonly string[]).includes(value)) {
    return value as AllowedFolder;
  }
  return isImage ? "inline-images" : "media";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new MediaUploadError("Şəkil oxuna bilmədi. Fayl zədələnmiş ola bilər."));
    };
    img.src = url;
  });
}

/**
 * Şəkli sıxışdırır. GIF animasiyasını qorumaq üçün GIF-lər olduğu kimi saxlanılır.
 * Sıxışdırma orijinaldan böyük nəticə verərsə, orijinal istifadə olunur.
 */
export async function prepareImage(file: File): Promise<File> {
  if (file.type === "image/gif") {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new MediaUploadError("GIF ölçüsü 10 MB-dan çox ola bilməz.");
    }
    return file;
  }

  const img = await loadImage(file);
  const ratio = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new MediaUploadError("Brauzer şəkli emal edə bilmir.");
  }
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY),
  );

  // Brauzer WebP-ni dəstəkləməsə, toBlob PNG qaytarır — o halda orijinalı saxlayırıq
  if (!blob || blob.type !== "image/webp") {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new MediaUploadError("Şəkil ölçüsü 10 MB-dan çoxdur. Daha kiçik şəkil seçin.");
    }
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  const webp = new File([blob], `${baseName}.webp`, { type: "image/webp" });

  if (webp.size >= file.size && file.size <= MAX_IMAGE_BYTES && ratio === 1) {
    return file;
  }
  if (webp.size > MAX_IMAGE_BYTES) {
    throw new MediaUploadError("Şəkil sıxışdırıldıqdan sonra da 10 MB-dan böyükdür.");
  }
  return webp;
}

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  error?: string;
};

/**
 * Faylı (şəkil, video və ya PDF) hazırlayır və Cloudinary-yə yükləyir.
 */
export async function uploadMedia(file: File, folder?: FormDataEntryValue | null): Promise<UploadedMedia> {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  if (!isImage && !isVideo && !isPdf) {
    throw new MediaUploadError("Yalnız şəkil, video və ya PDF faylları qəbul edilir.");
  }

  let prepared: File = file;
  if (isImage) {
    prepared = await prepareImage(file);
  } else if (isVideo && file.size > MAX_VIDEO_BYTES) {
    throw new MediaUploadError("Video ölçüsü 100 MB-dan çox ola bilməz.");
  } else if (isPdf && file.size > MAX_PDF_BYTES) {
    throw new MediaUploadError("PDF ölçüsü 10 MB-dan çox ola bilməz (Cloudinary pulsuz plan). Daha böyük PDF üçün sıxılmış versiya yükləyin.");
  }

  const targetFolder = normalizeFolder(folder ?? null, isImage);

  // 1) Serverdən imza al (yalnız aktiv staff üzvünə verilir)
  const signResponse = await authorizedFetch("/api/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: targetFolder }),
  });
  const sign = (await signResponse.json().catch(() => ({}))) as UploadSignature;
  if (!signResponse.ok) {
    throw new MediaUploadError(
      signResponse.status === 401
        ? "Yükləmə icazəsi yoxdur. Çıxıb yenidən daxil olun."
        : sign.error || "Yükləmə imzası alınmadı.",
    );
  }

  // 2) Faylı birbaşa Cloudinary-yə göndər. PDF «raw» kimi saxlanılır ki, olduğu kimi yüklənsin.
  const resourceType = isImage ? "image" : isVideo ? "video" : "raw";
  const body = new FormData();
  body.append("file", prepared);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);

  let result: { secure_url?: string; public_id?: string; bytes?: number; error?: { message?: string } };
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`,
      { method: "POST", body },
    );
    result = await response.json();
    if (!response.ok || !result.secure_url) {
      throw new MediaUploadError(result.error?.message || "Fayl yüklənmədi.");
    }
  } catch (error) {
    if (error instanceof MediaUploadError) throw error;
    throw new MediaUploadError("Şəbəkə xətası — fayl yüklənmədi. İnterneti yoxlayıb yenidən cəhd edin.");
  }

  return {
    url: result.secure_url,
    path: result.public_id ?? "",
    publicId: result.public_id ?? "",
    size: result.bytes ?? prepared.size,
    type: prepared.type,
    name: file.name,
  };
}

/**
 * Köhnə `fetch('/api/upload', { body: formData })` çağırışlarının yerini tutur.
 * Eyni Response formatını qaytarır ({ url, size, type, name }), ona görə
 * mövcud komponentlərdə response.ok / response.json() dəyişmədən işləyir.
 */
export async function uploadFormData(formData: FormData): Promise<Response> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ error: "Fayl tapılmadı" }, 400);
  }
  try {
    const result = await uploadMedia(file, formData.get("folder"));
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fayl yüklənmədi";
    const status = error instanceof MediaUploadError ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
}

/** `Response.json()` köhnə Safari-də yoxdur — əl ilə qururuq */
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
