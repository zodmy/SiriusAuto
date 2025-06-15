import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const carEngineId = parseInt(id, 10);
    if (isNaN(carEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна автомобіля' }, { status: 400 });
    }

    const carEngine = await prisma.carEngine.findUnique({
      where: { id: carEngineId },
      include: {
        bodyType: true,
      },
    });

    if (!carEngine || !carEngine.bodyType) {
      return NextResponse.json({ error: 'Для цього двигуна автомобіля не знайдено тип кузова' }, { status: 404 });
    }

    return NextResponse.json(carEngine.bodyType);
  } catch (error) {
    console.error('Помилка отримання типу кузова для двигуна:', error);
    return NextResponse.json({ error: 'Не вдалося отримати тип кузова для двигуна' }, { status: 500 });
  }
}
