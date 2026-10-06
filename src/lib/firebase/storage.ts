import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Upload file to Firebase Storage
 * @param file - File to upload
 * @param folder - Storage folder (articles, ejournals, ads, staff)
 * @returns Upload result with URL and path
 */
export async function uploadFile(
  file: File,
  folder: "articles" | "ejournals" | "ads" | "staff" | "horoscopes"
): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = `${folder}/${fileName}`;
  
  const storageRef = ref(storage, filePath);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
    },
  };
  
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  
  return {
    url,
    path: filePath,
    size: file.size,
  };
}

/**
 * Delete file from Firebase Storage
 * @param path - File path in storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB = 5
): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Yalnız JPG, PNG, WebP və GIF formatları qəbul edilir",
    };
  }
  
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Fayl ölçüsü ${maxSizeMB}MB-dan kiçik olmalıdır`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate PDF file
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns Validation result
 */
export function validatePDFFile(
  file: File,
  maxSizeMB = 50
): { valid: boolean; error?: string } {
  if (file.type !== "application/pdf") {
    return {
      valid: false,
      error: "Yalnız PDF format qəbul edilir",
    };
  }
  
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Fayl ölçüsü ${maxSizeMB}MB-dan kiçik olmalıdır`,
    };
  }
  
  return { valid: true };
}

/**
 * Get image dimensions
 * @param file - Image file
 * @returns Promise with width and height
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Şəkil yüklənə bilmədi"));
    };
    
    img.src = url;
  });
}

/**
 * Resize image client-side before upload
 * @param file - Image file
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Resized blob
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context yaradıla bilmədi"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Şəkil sıxışdırıla bilmədi"));
          }
        },
        file.type,
        0.9
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Şəkil yüklənə bilmədi"));
    };
    
    img.src = url;
  });
}
