import { NextRequest, NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {

  const res = NextResponse.next();

  const isProd = process.env.NODE_ENV === 'production';

  // Baseline security headers (balanced for dev and prod)
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()'
    ].join(', ')
  );

  if (isProd) {
    // CSP suitable for production; allows Next.js assets and APIs
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://cloud.appwrite.io https://*.appwrite.io",
      "frame-ancestors 'self'"
    ].join('; ');
    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  return res;
}

export const config = {
  matcher: '/:path*'
};