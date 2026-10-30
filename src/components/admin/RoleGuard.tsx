'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { canAccessPath, FORBIDDEN_MESSAGE } from '@/middleware/roleGuard';
import { useAuth } from '@/lib/firebase/auth';

interface RoleGuardProps {
  children: React.ReactNode;
}

/**
 * Səhifə səviyyəsində rol yoxlaması
 * Yazarları icazəsiz səhifələrə daxil olmaqdan qoruyur
 */
export function RoleGuard({ children }: RoleGuardProps) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    // Giriş edilməyibsə login-ə yönləndir
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // İstifadəçi staff deyilsə
    if (!session.role) {
      router.push('/');
      return;
    }

    // Rol yoxlaması
    const role = session.role;
    const canAccess = canAccessPath(role, pathname);

    console.log('[RoleGuard] Yoxlama:', { role, pathname, canAccess });

    if (!canAccess) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    setHasAccess(true);
    setIsChecking(false);
  }, [session, loading, pathname, router]);

  // Loading zamanı
  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // İcazə yoxdursa
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {FORBIDDEN_MESSAGE.title}
          </h3>
          <p className="text-slate-600 mb-6">
            {FORBIDDEN_MESSAGE.message}
          </p>
          <button
            onClick={() => router.replace('/admin')}
            className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-bordo-deep px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-bordo transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Geri qayıt
          </button>
        </div>
      </div>
    );
  }

  // İcazə varsa səhifəni göstər
  return <>{children}</>;
}
