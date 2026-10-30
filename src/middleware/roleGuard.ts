/**
 * Rol-based səhifə guard
 * Yazarların yalnız icazəli səhifələrə daxil olmasını təmin edir
 */

export type StaffRole = 'admin' | 'editor' | 'author' | 'seo' | 'sales' | 'finance' | 'analyst' | 'moderator';

// Hər rol üçün icazəli path-lar
const rolePermissions: Record<StaffRole, string[]> = {
  admin: ['/admin/**'], // Admin hər yerə daxil ola bilər
  
  author: [
    '/admin',
    '/admin/analytics',
    '/admin/analytics/**',
    '/admin/articles',
    '/admin/articles/**',
  ],
  
  editor: [
    '/admin',
    '/admin/analytics',
    '/admin/analytics/**',
    '/admin/articles',
    '/admin/articles/**',
    '/admin/files',
    '/admin/files/**',
    '/admin/content-plan',
    '/admin/content-plan/**',
    '/admin/seo',
    '/admin/seo/**',
  ],
  
  seo: [
    '/admin',
    '/admin/analytics',
    '/admin/analytics/**',
    '/admin/articles',
    '/admin/articles/**',
    '/admin/seo',
    '/admin/seo/**',
    '/admin/astrology',
    '/admin/astrology/**',
  ],
  
  sales: [
    '/admin',
    '/admin/analytics',
    '/admin/analytics/**',
    '/admin/crm',
    '/admin/crm/**',
    '/admin/ad-orders',
    '/admin/ad-orders/**',
    '/admin/sales-forecast',
    '/admin/sales-forecast/**',
  ],
  
  finance: [
    '/admin',
    '/admin/analytics',
    '/admin/analytics/**',
    '/admin/ad-orders',
    '/admin/ad-orders/**',
  ],
  
  analyst: [
    '/admin',
    '/admin/analytics',
    '/admin/analytics/**',
    '/admin/subscribers',
    '/admin/subscribers/**',
  ],
  
  moderator: [
    '/admin',
    '/admin/articles',
    '/admin/articles/**',
    '/admin/messages',
    '/admin/messages/**',
  ],
};

/**
 * İstifadəçinin path-a daxil icazəsi varmı?
 */
export function canAccessPath(role: StaffRole, path: string): boolean {
  console.log('[canAccessPath] Yoxlanır:', { role, path });
  
  if (role === 'admin') {
    console.log('[canAccessPath] Admin - icazə verildi');
    return true;
  }
  
  const permissions = rolePermissions[role] || [];
  console.log('[canAccessPath] İcazələr:', permissions);
  
  const hasAccess = permissions.some(pattern => {
    // Exact match
    if (pattern === path) {
      console.log('[canAccessPath] Exact match:', pattern);
      return true;
    }
    
    // Wildcard match: /admin/articles/** matches /admin/articles/123
    if (pattern.endsWith('/**')) {
      const basePath = pattern.slice(0, -3);
      const matches = path.startsWith(basePath);
      console.log('[canAccessPath] Wildcard yoxlama:', { pattern, basePath, path, matches });
      return matches;
    }
    
    return false;
  });
  
  console.log('[canAccessPath] Nəticə:', hasAccess);
  return hasAccess;
}

/**
 * Qadağan olunmuş səhifədə mesaj
 */
export const FORBIDDEN_MESSAGE = {
  title: 'İcazə yoxdur',
  message: 'Bu bölməyə daxil olmaq üçün icazəniz yoxdur. Admin ilə əlaqə saxlayın.',
};
