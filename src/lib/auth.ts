import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded?.role === 'admin';
  } catch (error) {
    console.error('Помилка верифікації токена:', error);
    return false;
  }
}