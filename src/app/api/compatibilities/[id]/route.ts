import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const compatibilityId = parseInt(params.id, 10);

    if (isNaN(compatibilityId)) {
      return NextResponse.json({ error: 'Недійсний ID запису сумісності' }, { status: 400 });
    }

    const compatibility = await prisma.compatibility.findUnique({
      where: { id: compatibilityId },
    });

    if (!compatibility) {
      return NextResponse.json({ error: 'Запис сумісності не знайдено' }, { status: 404 });
    }

    return NextResponse.json(compatibility);
  } catch (error) {
    console.error('Помилка отримання запису сумісності:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }
  try {
    const compatibilityId = parseInt(params.id, 10);
    if (isNaN(compatibilityId)) {
      return NextResponse.json({ error: 'Недійсний ID запису сумісності' }, { status: 400 });
    }

    const data = await request.json();
    const updatedCompatibility = await prisma.compatibility.update({
      where: { id: compatibilityId },
      data,
    });

    if (!updatedCompatibility) {
      return NextResponse.json({ error: 'Запис сумісності не знайдено для оновлення' }, { status: 404 });
    }

    return NextResponse.json(updatedCompatibility);
  } catch (error) {
    console.error('Помилка оновлення запису сумісності:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }
  try {
    const compatibilityId = parseInt(params.id, 10);
    if (isNaN(compatibilityId)) {
      return NextResponse.json({ error: 'Недійсний ID запису сумісності' }, { status: 400 });
    }

    await prisma.compatibility.delete({
      where: { id: compatibilityId },
    });

    return NextResponse.json({ message: 'Запис сумісності видалено успішно' });
  } catch (error) {
    console.error('Помилка видалення запису сумісності:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
