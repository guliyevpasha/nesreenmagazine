/**
 * Nesreen Magazine — Next.js konfiqurasiyası.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js standart olaraq kök qovluqda AGENTS.md / CLAUDE.md faylları yaradır.
  // Layihədə belə köməkçi fayllara ehtiyac yoxdur.
  agentRules: false,

  images: {
    // Məqalə şəkilləri Firebase Storage-dan gəlir.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
