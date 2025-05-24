import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.toLowerCase();
  if (pathname === '/admin' || pathname === '/admin/') {
    const isAdmin = await checkAdmin({ req });
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const isAdmin = await checkAdmin({ req });
    if (!isAdmin) {
      const res = NextResponse.redirect(new URL('/admin', req.url));
      res.headers.set('X-Auth-Error', '401');
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/*',
    '/api/admin/login',
  ],
};