/**
 * Environment variables validation and type-safe access
 * Validates required env vars at build time
 */

import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  // Firebase - Required for production
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),
  
  // Cloudinary - Optional but recommended
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Google Translate API - Optional
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),
  
  // Google Analytics - Optional
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  
  // Site URL - Optional, defaults to production URL
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  
  // Admin email - Optional
  ADMIN_EMAIL: z.string().email().optional(),
  
  // Revalidation secret - Optional but recommended for production
  REVALIDATE_SECRET: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

/** Validated environment variables */
let validatedEnv: Env | null = null;

/**
 * Validate environment variables
 * Called automatically on import
 */
function validateEnv(): Env {
  if (validatedEnv) return validatedEnv;
  
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    logger.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  
  validatedEnv = parsed.data;
  
  // Warn about missing optional but important variables
  const warnings: string[] = [];
  
  if (!validatedEnv.NEXT_PUBLIC_FIREBASE_API_KEY) {
    warnings.push('Firebase configuration missing - using seed data');
  }
  
  if (!validatedEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && validatedEnv.NODE_ENV === 'production') {
    warnings.push('Cloudinary not configured - image uploads will fail');
  }
  
  if (!validatedEnv.GOOGLE_TRANSLATE_API_KEY && validatedEnv.NODE_ENV === 'production') {
    warnings.push('Google Translate API not configured - auto-translation disabled');
  }
  
  if (!validatedEnv.REVALIDATE_SECRET && validatedEnv.NODE_ENV === 'production') {
    warnings.push('REVALIDATE_SECRET not set - cache revalidation endpoint is insecure');
  }
  
  if (warnings.length > 0) {
    logger.warn('⚠️  Environment warnings:');
    warnings.forEach((warning) => logger.warn(`  - ${warning}`));
  }
  
  return validatedEnv;
}

// Validate on import
export const env = validateEnv();

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
}

/**
 * Check if Google Translate is configured
 */
export function isTranslationConfigured(): boolean {
  return !!env.GOOGLE_TRANSLATE_API_KEY;
}

/**
 * Get site URL with fallback
 */
export function getSiteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL || 'https://nesreenmagazine.com';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}
