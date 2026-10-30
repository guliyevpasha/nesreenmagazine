import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bu middleware hər admin səhifə sorğusunda işləyir
// Ancaq Firebase session yoxlaması client-side olduğuna görə
// burda yalnız redirect edə bilərik

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin səhifələrində yoxlama
  if (pathname.startsWith('/admin')) {
    // Session yoxlaması client-side olur (Firebase)
    // Ona görə burda yalnız basic yoxlamalar edə bilərik
    
    // Hər halda, səhifəni render et və RoleGuard-a burax
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
