import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const yearId = parseInt(params.id, 10);
    if (isNaN(yearId)) {
      return NextResponse.json({ error: 'Невалідний ID року випуску' }, { status: 400 });
    }

    const yearWithBodyTypes = await prisma.carYear.findUnique({
      where: { id: yearId },
      include: { bodyTypes: true },
    });

    if (!yearWithBodyTypes) {
      return NextResponse.json({ error: 'Рік випуску не знайдено' }, { status: 404 });
    }

    return NextResponse.json(yearWithBodyTypes.bodyTypes);
  } catch (error) {
    console.error('Помилка отримання типів кузова для року випуску:', error);
    return NextResponse.json({ error: 'Не вдалося отримати типи кузова для року випуску' }, { status: 500 });
  }
}
