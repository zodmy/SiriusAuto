import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

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

    const reviews = await prisma.review.findMany({
      where: { userId },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Помилка отримання відгуків користувача:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
