/**
 * Google Analytics 4 Helper Functions
 * nesreenmagazine.com - Admin Analytics Dashboard
 */

// Google Analytics 4 Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

// Initialize GA4
export const initGA = () => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
    // Load gtag.js script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
    });
  }
};

// Track page view
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom event
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track article view
export const trackArticleView = (articleId: string, title: string, category: string) => {
  event({
    action: "view_article",
    category: "engagement",
    label: `${category}/${articleId}`,
  });
};

// Track internal link click
export const trackInternalLink = (from: string, to: string) => {
  event({
    action: "internal_link_click",
    category: "navigation",
    label: `${from} -> ${to}`,
  });
};

// Track download (e-journal PDF)
export const trackDownload = (fileName: string) => {
  event({
    action: "download",
    category: "engagement",
    label: fileName,
  });
};

// Track newsletter subscription
export const trackNewsletterSubscription = () => {
  event({
    action: "newsletter_subscribe",
    category: "conversion",
  });
};

// Track contact form submission
export const trackContactForm = () => {
  event({
    action: "contact_form_submit",
    category: "conversion",
  });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Analytics Dashboard Types
 */
export interface AnalyticsData {
  // Traffic Overview
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;

  // Traffic Sources
  sources: {
    organic: number; // Google axtarış
    social: number; // Sosial media
    direct: number; // Birbaşa
    referral: number; // Digər saytlardan
    email: number; // Email kampaniyalarından
  };

  // Top Pages
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueUsers: number;
  }>;

  // Search Keywords (organic)
  searchKeywords: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    position: number;
  }>;

  // Demographics
  demographics: {
    age: Array<{ range: string; percentage: number }>;
    gender: Array<{ gender: string; percentage: number }>;
  };

  // Devices
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };

  // Geographic
  countries: Array<{
    country: string;
    users: number;
    sessions: number;
  }>;

  // Internal Link Clicks
  internalLinkClicks: number;
  internalLinkClickRate: number;

  // Real-time
  realtime: {
    activeUsers: number;
    topPages: string[];
  };
}

export type TimeRange =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "half-yearly"
  | "yearly"
  | "custom";

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
