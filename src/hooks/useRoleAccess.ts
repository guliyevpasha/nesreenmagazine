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
      console.log('[useRoleAccess] Session yoxdur, login-ə yönləndirilir');
      router.replace('/auth/signin');
      return;
    }

    const role = session.role;
    const access = canAccessPath(role, requiredPath);

    console.log('[useRoleAccess] Yoxlama:', { 
      role, 
      requiredPath, 
      hasAccess: access,
      sessionName: session.name,
      sessionEmail: session.email,
    });

    setHasAccess(access);
    
    if (!access) {
      console.log('[useRoleAccess] İcazə yoxdur, dashboarda yönləndirilir');
      // 100ms gözlə ki React state update edə bilsin
      setTimeout(() => {
        router.replace('/admin');
      }, 100);
    }
    
    setChecking(false);
  }, [session, loading, requiredPath, router]);

  return { 
    hasAccess,
    loading: checking,
    session,
  };
}
