/**
 * Nesreen Magazine — media yükləmə (brauzer tərəfi).
 *
 * Şəkillər ƏVVƏL brauzerdə sıxılır (maks. 2000px, WebP), sonra birbaşa
 * Firebase Storage-a yüklənir. Nəticədə yalnız kiçik URL saxlanılır,
 * beləliklə Firestore sənədinin 1 MB limiti aşılmır (köhnə base64 data-URI
 * yanaşması bu limiti keçirdi və məqalələr dərc olunmurdu).
 *
 * Yükləmə yalnız daxil olmuş redaksiya heyəti üçün mümkündür — Storage
 * qaydaları (storage.rules) isStaff() yoxlayır.
 */
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

/** Storage qaydalarında icazəli qovluqlar */
const ALLOWED_FOLDERS = [
  "covers",
  "banners",
  "inline-images",
  "ejournals",
  "ejournal-covers",
  "media",
] as const;

type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MAX_IMAGE_DIMENSION = 2000;
const IMAGE_QUALITY = 0.82;
/** Sıxışdırmadan sonra belə bu həddi aşan şəkil rədd edilir (Storage qaydası: 8 MB) */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_PDF_BYTES = 60 * 1024 * 1024;

export interface UploadedMedia {
  url: string;
  path: string;
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
      throw new MediaUploadError("GIF ölçüsü 8 MB-dan çox ola bilməz.");
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
      throw new MediaUploadError("Şəkil ölçüsü 8 MB-dan çoxdur. Daha kiçik şəkil seçin.");
    }
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  const webp = new File([blob], `${baseName}.webp`, { type: "image/webp" });

  if (webp.size >= file.size && file.size <= MAX_IMAGE_BYTES && ratio === 1) {
    return file;
  }
  if (webp.size > MAX_IMAGE_BYTES) {
    throw new MediaUploadError("Şəkil sıxışdırıldıqdan sonra da 8 MB-dan böyükdür.");
  }
  return webp;
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

/**
 * Faylı (şəkil, video və ya PDF) hazırlayır və Firebase Storage-a yükləyir.
 */
export async function uploadMedia(file: File, folder?: FormDataEntryValue | null): Promise<UploadedMedia> {
  if (!storage) {
    throw new MediaUploadError("Firebase Storage konfiqurasiya olunmayıb.");
  }

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
    throw new MediaUploadError("Video ölçüsü 50 MB-dan çox ola bilməz.");
  } else if (isPdf && file.size > MAX_PDF_BYTES) {
    throw new MediaUploadError("PDF ölçüsü 60 MB-dan çox ola bilməz.");
  }

  const targetFolder = normalizeFolder(folder ?? null, isImage);
  const path = `${targetFolder}/${Date.now()}-${safeFileName(prepared.name)}`;

  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, prepared, {
      contentType: prepared.type,
      customMetadata: { originalName: file.name },
    });
    const url = await getDownloadURL(storageRef);
    return { url, path, size: prepared.size, type: prepared.type, name: file.name };
  } catch (error) {
    const code = (error as { code?: string })?.code ?? "";
    if (code === "storage/unauthorized") {
      throw new MediaUploadError("Yükləmə icazəsi yoxdur. Yenidən daxil olun.");
    }
    throw new MediaUploadError(
      error instanceof Error ? error.message : "Fayl yüklənmədi.",
    );
  }
}

/**
 * Köhnə `fetch('/api/upload', { body: formData })` çağırışlarının yerini tutur.
 * Eyni Response formatını qaytarır ({ url, size, type, name }), ona görə
 * mövcud komponentlərdə response.ok / response.json() dəyişmədən işləyir.
 */
export async function uploadFormData(formData: FormData): Promise<Response> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Fayl tapılmadı" }, { status: 400 });
  }
  try {
    const result = await uploadMedia(file, formData.get("folder"));
    return Response.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fayl yüklənmədi";
    const status = error instanceof MediaUploadError ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
