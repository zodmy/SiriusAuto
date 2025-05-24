import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Отримує токен з request (API) або cookies (app route/server component)
async function getTokenFromRequestOrCookies(req?: NextRequest): Promise<string | undefined> {
  if (req) {
    return req.cookies.get('token')?.value;
  } else {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
  }
}

// Перевіряє токен на роль адміністратора
export function getAdminStatusFromToken(token?: string): boolean {
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded?.role === 'admin';
  } catch {
    return false;
  }
}

// Універсальна перевірка адміністратора для API та серверних компонентів
export async function checkAdmin({ req, redirectOnFail = false }: { req?: NextRequest, redirectOnFail?: boolean } = {}): Promise<boolean> {
  const token = await getTokenFromRequestOrCookies(req);
  const isAdmin = getAdminStatusFromToken(token);
  if (!isAdmin && redirectOnFail) redirect('/admin');
  return isAdmin;
}