import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carEngineId = parseInt(params.id, 10);
    if (isNaN(carEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна автомобіля' }, { status: 400 });
    }

    const carBodyTypes = await prisma.carBodyType.findMany({
      where: { engineId: carEngineId },
    });

    if (!carBodyTypes || carBodyTypes.length === 0) {
      return NextResponse.json({ error: 'Для цього двигуна автомобіля не знайдено типів кузова' }, { status: 404 });
    }

    return NextResponse.json(carBodyTypes);
  } catch (error) {
    console.error('Помилка отримання типів кузовів автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати типи кузовів автомобілів' }, { status: 500 });
  }
}
