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
    
    // Admin her yerə daxil ola bilər
    if (role === 'admin') {
      console.log('[useRoleAccess] ✅ Admin - tam icazə');
      setHasAccess(true);
      setChecking(false);
      return;
    }
    
    const access = canAccessPath(role, requiredPath);

    console.log('[useRoleAccess] Yoxlama:', { 
      role, 
      requiredPath, 
      hasAccess: access,
      sessionName: session.name,
      sessionEmail: session.email,
    });

    if (!access) {
      console.log('[useRoleAccess] ⛔ İcazə YOX - redirect edilir');
      setHasAccess(false);
      setChecking(false);
      // Dərhal redirect et
      router.replace('/admin');
      return;
    }
    
    console.log('[useRoleAccess] ✅ İcazə var');
    setHasAccess(true);
    setChecking(false);
  }, [session, loading, requiredPath, router]);

  return { 
    hasAccess,
    loading: checking,
    session,
  };
}
