/**
 * API request validation schemas using Zod
 */
import { z } from 'zod';

/** Email validation */
export const emailSchema = z.object({
  email: z.string()
    .email('Düzgün email daxil edin')
    .max(200, 'Email çox uzundur')
    .toLowerCase()
    .trim(),
});

/** Contact form validation */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Ad ən azı 2 hərf olmalıdır')
    .max(100, 'Ad çox uzundur')
    .trim(),
  email: z.string()
    .email('Düzgün email daxil edin')
    .max(200, 'Email çox uzundur')
    .toLowerCase()
    .trim(),
  subject: z.string()
    .min(3, 'Mövzu ən azı 3 hərf olmalıdır')
    .max(200, 'Mövzu çox uzundur')
    .trim(),
  message: z.string()
    .min(10, 'Mesaj ən azı 10 hərf olmalıdır')
    .max(5000, 'Mesaj çox uzundur')
    .trim(),
});

/** Page view tracking */
export const pageViewSchema = z.object({
  path: z.string()
    .max(500, 'Path çox uzundur')
    .trim(),
  articleId: z.string().optional(),
  sessionId: z.string()
    .max(100)
    .trim(),
  referrer: z.string()
    .max(500)
    .default(''),
  locale: z.enum(['az', 'en', 'ru', 'tr', 'ar']),
});

/** Banner tracking */
export const bannerTrackingSchema = z.object({
  bannerId: z.string()
    .max(100)
    .trim(),
  type: z.enum(['click', 'impression']),
  location: z.string()
    .max(100)
    .trim(),
});

/** Translation request */
export const translationRequestSchema = z.object({
  text: z.string()
    .min(1, 'Mətn boş ola bilməz')
    .max(5000, 'Mətn çox uzundur'),
  sourceLang: z.enum(['az', 'en', 'ru', 'tr', 'ar']),
  targetLang: z.enum(['az', 'en', 'ru', 'tr', 'ar']),
});

/** File upload validation */
export const fileUploadSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) return false;
    // Allowed types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
    ];
    return allowedTypes.includes(file.type);
  }, {
    message: 'Yalnız şəkil faylları (JPEG, PNG, WebP, GIF) və maksimum 10MB ölçüdə qəbul edilir',
  }),
});

/** Revalidation request */
export const revalidateSchema = z.object({
  path: z.string()
    .startsWith('/', 'Path / ilə başlamalıdır')
    .max(500)
    .trim(),
  secret: z.string()
    .min(1, 'Secret açar tələb olunur'),
});

/** Generic ID validation */
export const idSchema = z.object({
  id: z.string()
    .min(1, 'ID tələb olunur')
    .max(100)
    .trim(),
});

/** Date range validation */
export const dateRangeSchema = z.object({
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarix YYYY-MM-DD formatında olmalıdır'),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarix YYYY-MM-DD formatında olmalıdır'),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Başlanğıc tarixi bitmə tarixindən sonra ola bilməz' }
);

/** Safe validate helper - returns typed result */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format Zod errors into a readable string
  const errorMessage = result.error.issues
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  
  return { success: false, error: errorMessage };
}
