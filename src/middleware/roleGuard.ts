/**
 * Rol-based səhifə guard
 * Yazarların yalnız icazəli səhifələrə daxil olmasını təmin edir
 */

export type StaffRole = 'admin' | 'editor' | 'author' | 'seo' | 'sales' | 'finance' | 'analyst' | 'moderator';

// Hər rol üçün icazəli path-lar (prefiks). "/admin" (dashboard) yalnız dəqiq uyğunluqla yoxlanılır.
// Menyu (AdminShell) və guard eyni canAccessPath funksiyasından istifadə edir.
const rolePermissions: Record<StaffRole, string[]> = {
  admin: [], // Admin hər yerə daxil ola bilər (aşağıda ayrıca yoxlanılır)

  author: ['/admin/articles', '/admin/files', '/admin/media'],

  editor: [
    '/admin/articles',
    '/admin/files',
    '/admin/media',
    '/admin/content-plan',
    '/admin/analytics',
    '/admin/comments',
    '/admin/tags',
    '/admin/categories',
    '/admin/translations',
  ],

  seo: ['/admin/seo', '/admin/articles', '/admin/analytics'],

  sales: ['/admin/crm', '/admin/ad-orders', '/admin/sales-forecast'],

  finance: ['/admin/crm', '/admin/ad-orders', '/admin/sales-forecast', '/admin/analytics'],

  analyst: ['/admin/analytics', '/admin/subscribers'],

  moderator: ['/admin/messages', '/admin/comments', '/admin/subscribers'],
};

/**
 * İstifadəçinin path-a daxil icazəsi varmı?
 */
export function canAccessPath(role: StaffRole, path: string): boolean {
  if (role === 'admin') return true;

  // Query/hash hissəsini və sondakı slash-ı at
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  // Dashboard hamı üçün açıqdır
  if (clean === '/admin') return true;

  const permissions = rolePermissions[role] || [];
  return permissions.some((base) => clean === base || clean.startsWith(base + '/'));
}

/**
 * Qadağan olunmuş səhifədə mesaj
 */
export const FORBIDDEN_MESSAGE = {
  title: 'Giriş qadağandır',
  message: 'Sizin bu bölməyə giriş icazəniz yoxdur. Zəhmət olmasa geri qayıdın.',
};
