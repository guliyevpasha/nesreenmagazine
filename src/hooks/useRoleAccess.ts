'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { canAccessPath } from '@/middleware/roleGuard';

/**
 * Səhifə səviyyəsində rol yoxlaması hook
 * Hər məhdudlaşdırılmış səhifənin əvvəlində çağırın
 */
export function useRoleAccess(requiredPath: string) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (loading) {
      setChecking(true);
      return;
    }

    if (!session) {
      router.replace('/admin');
      return;
    }

    const access = canAccessPath(session.role, requiredPath);

    if (!access) {
      setHasAccess(false);
      setChecking(false);
      router.replace('/admin');
      return;
    }

    setHasAccess(true);
    setChecking(false);
  }, [session, loading, requiredPath, router]);

  return {
    hasAccess,
    loading: checking,
    session,
  };
}
