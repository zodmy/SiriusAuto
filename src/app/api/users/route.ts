import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Помилка отримання користувачів:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { password, ...userData } = data;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    }

    const newUser = await prisma.user.create({
      data: userData,
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Помилка створення користувача:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
