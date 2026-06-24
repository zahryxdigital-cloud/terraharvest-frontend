import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract the HTTP-only jwt cookie
  const token = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect authenticated users away from /admin/login only
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 2. Protect /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      if (pathname === '/admin/products/add' || pathname === '/admin/(dashboard)/products/add') {
        return NextResponse.redirect(new URL('/signup', request.url));
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Protect user routes (/checkout, /profile, /my-orders)
  const userRoutes = ['/checkout', '/profile', '/my-orders'];
  if (userRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure middleware only runs on matching paths to optimize performance
export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/profile', '/my-orders', '/login', '/signup'],
};
