'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { canAccessPath } from '@/middleware/roleGuard';

/**
 * Səhifə səviyyəsində rol yoxlaması hook
 * Hər məhdudlaşdırılmış səhifənin əvvəlində çağırın
 */
export function useRoleAccess(requiredPath: string) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      console.log('[useRoleAccess] Session yoxdur, login-ə yönləndirilir');
      router.push('/auth/signin');
      return;
    }

    const role = session.role;
    const hasAccess = canAccessPath(role, requiredPath);

    console.log('[useRoleAccess] Yoxlama:', { 
      role, 
      requiredPath, 
      hasAccess,
      sessionName: session.name,
    });

    if (!hasAccess) {
      console.log('[useRoleAccess] İcazə yoxdur, dashboarda yönləndirilir');
      router.push('/admin');
    }
  }, [session, loading, requiredPath, router]);

  return { 
    hasAccess: session ? canAccessPath(session.role, requiredPath) : false,
    loading: loading || !session,
    session,
  };
}
