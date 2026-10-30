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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {FORBIDDEN_MESSAGE.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {FORBIDDEN_MESSAGE.message}
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              İdarə panelinə qayıt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // İcazə varsa səhifəni göstər
  return <>{children}</>;
}
