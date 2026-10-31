/**
 * Nesreen Magazine — Next.js konfiqurasiyası.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Agent rules-ı deaktiv et
  agentRules: false,
  
  // TypeScript build xətalarını production-da yoxla
  typescript: {
    // Development-də xətalara baxmayaraq davam et, production-da yoxla
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  images: {
    // Məqalə şəkilləri Firebase Storage-dan gəlir.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Environment variables-ləri explicit expose et
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  },
};

export default nextConfig;
