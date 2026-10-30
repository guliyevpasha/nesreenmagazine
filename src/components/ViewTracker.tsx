"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  articleId: string;
  slug: string;
  category: string;
}

/**
 * Client-side komponent məqalə baxışını track edir
 * Server-side rendered səhifələrdə istifadə olunur
 */
export default function ViewTracker({ articleId, slug, category }: ViewTrackerProps) {
  useEffect(() => {
    // Visitor ID-si localStorage-dan götür və ya yarat
    let visitorId = "";
    if (typeof window !== "undefined") {
      try {
        visitorId = localStorage.getItem("nesreen_visitor_id") || "";
        if (!visitorId) {
          visitorId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
          localStorage.setItem("nesreen_visitor_id", visitorId);
        }
      } catch (error) {
        // localStorage bloklanıbsa, sadəcə davam et
        console.warn("localStorage not available for visitor tracking");
      }
    }

    // API-yə track et
    const trackView = async () => {
      try {
        await fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId,
            slug,
            category,
            visitorId,
          }),
        });
      } catch (error) {
        // Xəta olsa belə, səhifə göstərilməli
        console.error("View tracking failed:", error);
      }
    };

    // Track et (debounce ilə)
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [articleId, slug, category]);

  // Bu komponent heç bir UI göstərmir
  return null;
}
