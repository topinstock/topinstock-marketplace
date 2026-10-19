import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Protect Admin Pages (/admin/...) ─────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('topinstock_session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const [payloadBase64] = sessionCookie.split('.');
      if (!payloadBase64) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Safe Base64URL decode in Edge runtime
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonStr = atob(base64);
      const session = JSON.parse(jsonStr);

      // Verify expiration
      if (session.exp && session.exp < Date.now()) {
        const redirectUrl = new URL('/admin/login', request.url);
        redirectUrl.searchParams.set('error', 'expired');
        return NextResponse.redirect(redirectUrl);
      }

      // Verify role
      if (session.role !== 'ADMIN' && session.role !== 'VENDOR') {
        const redirectUrl = new URL('/admin/login', request.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }

      // Strict Super-Admin routes restriction
      const superAdminRoutes = ['/admin/finante', '/admin/firma', '/admin/vanzatori', '/admin/importer'];
      if (superAdminRoutes.some((route) => pathname.startsWith(route)) && session.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // ── 2. Protect Admin API Endpoints (/api/admin/...) ─────
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get('topinstock_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Acces interzis. Conectați-vă ca administrator.' },
        { status: 401 }
      );
    }

    try {
      const [payloadBase64] = sessionCookie.split('.');
      if (!payloadBase64) {
        return NextResponse.json({ success: false, error: 'Sesiune invalidă.' }, { status: 401 });
      }

      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const session = JSON.parse(atob(base64));

      if (session.exp && session.exp < Date.now()) {
        return NextResponse.json({ success: false, error: 'Sesiunea a expirat.' }, { status: 401 });
      }

      if (session.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Privilegii insuficiente de administrator.' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json({ success: false, error: 'Eroare validare sesiune.' }, { status: 401 });
    }
  }

  // ── 3. Apply Hardened Security Headers to all responses ─
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
