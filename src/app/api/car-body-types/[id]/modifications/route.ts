import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carBodyTypeId = parseInt(params.id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    const carBodyTypeExists = await prisma.carBodyType.findUnique({
      where: { id: carBodyTypeId },
    });

    if (!carBodyTypeExists) {
      return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
    }

    const modifications = await prisma.carModification.findMany({
      where: { bodyTypeId: carBodyTypeId },
    });

    return NextResponse.json(modifications);
  } catch (error) {
    console.error('Помилка отримання модифікацій для типу кузова автомобіля:', error);
    return NextResponse.json({ error: 'Не вдалося отримати модифікації для типу кузова автомобіля' }, { status: 500 });
  }
}
