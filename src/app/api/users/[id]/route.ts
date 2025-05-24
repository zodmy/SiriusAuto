import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Недійсний ID користувача' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Недійсний ID користувача' }, { status: 400 });
    }

    const data = await request.json();
    const { password, ...userData } = data;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Помилка оновлення користувача:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Недійсний ID користувача' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Користувача успішно видалено' }, { status: 200 });
  } catch (error) {
    console.error('Помилка видалення користувача:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
