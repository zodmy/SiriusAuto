import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Перевіряє, чи користувач є адміністратором.
 * Якщо передано req (API Route), перевіряє через req.cookies.
 * Якщо req не передано (app route), перевіряє через cookies() (server component).
 * Якщо redirectOnFail=true, робить редірект на /admin при невдачі.
 */
export async function checkAdmin({ req, redirectOnFail = false }: { req?: NextRequest, redirectOnFail?: boolean } = {}): Promise<boolean> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get('token')?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  }
  if (!token) {
    if (redirectOnFail) redirect('/admin');
    return false;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const isAdmin = decoded?.role === 'admin';
    if (!isAdmin && redirectOnFail) redirect('/admin');
    return isAdmin;
  } catch {
    if (redirectOnFail) redirect('/admin');
    return false;
  }
}