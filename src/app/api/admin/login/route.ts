import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const storedHashedPassword = process.env.ADMIN_PASSWORD_HASH;

    if (!storedHashedPassword) {
      return NextResponse.json({ success: false, message: 'Серверна помилка: відсутній хеш пароля' }, { status: 500 });
    }

    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (passwordMatch) {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET!, {
        expiresIn: '1d',
      });

      const cookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
      });
    } else {
      return NextResponse.json({ success: false, message: 'Невірний пароль' }, { status: 401 });
    }
  } catch (error) {
    console.error('Помилка обробки запиту:', error);
    return NextResponse.json({ success: false, message: 'Серверна помилка: помилка обробки' }, { status: 500 });
  }
}
