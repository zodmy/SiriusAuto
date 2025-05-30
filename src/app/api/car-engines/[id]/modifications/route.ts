import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const engineId = parseInt(params.id, 10);
    if (isNaN(engineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна' }, { status: 400 });
    }

    const engineWithModifications = await prisma.carEngine.findUnique({
      where: { id: engineId },
      include: { modifications: true },
    });

    if (!engineWithModifications) {
      return NextResponse.json({ error: 'Двигун не знайдено' }, { status: 404 });
    }

    return NextResponse.json(engineWithModifications.modifications);
  } catch (error) {
    console.error('Помилка отримання модифікацій для двигуна:', error);
    return NextResponse.json({ error: 'Не вдалося отримати модифікації для двигуна' }, { status: 500 });
  }
}
