import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const adminRoutes = ['/admin/dashboard'];
const adminApiRoutes = ['/api/categories'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('token')?.value;

  if (adminRoutes.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    } catch (error) {
      console.error('Помилка верифікації токена:', error);
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  if (adminApiRoutes.some((route) => pathname.startsWith(route)) && req.method !== 'GET') {
    if (!token) {
      return NextResponse.json({ message: 'Потрібна авторизація' }, { status: 401 });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 403 });
      }
      return NextResponse.next();
    } catch (error) {
      console.error('Помилка верифікації токена:', error);
      return NextResponse.json({ message: 'Недійсний токен' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...adminRoutes, ...adminApiRoutes.map((route) => `${route}(.*)`)],
};