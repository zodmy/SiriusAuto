import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const carBodyTypeId = parseInt(params.id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    const carBodyTypeWithEngines = await prisma.carBodyType.findUnique({
      where: { id: carBodyTypeId },
      include: { engines: true },
    });

    if (!carBodyTypeWithEngines) {
      return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
    }

    return NextResponse.json(carBodyTypeWithEngines.engines);
  } catch (error) {
    console.error('Помилка отримання двигунів для типу кузова автомобіля:', error);
    return NextResponse.json({ error: 'Не вдалося отримати двигуни для типу кузова автомобіля' }, { status: 500 });
  }
}
