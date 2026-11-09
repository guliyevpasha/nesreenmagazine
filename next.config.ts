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
    // Yüksək keyfiyyətli şəkillər üçün
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
