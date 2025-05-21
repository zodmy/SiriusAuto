import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Невалідний ID року випуску автомобіля' }, { status: 400 });
    }

    const carYear = await prisma.carYear.findUnique({
      where: { id: carYearId },
      include: {
        engines: true,
      },
    });

    if (!carYear) {
      return NextResponse.json({ error: 'Рік випуску автомобіля не знайдено' }, { status: 404 });
    }

    return NextResponse.json(carYear.engines);
  } catch (error) {
    console.error('Помилка отримання двигунів автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати двигуни автомобілів' }, { status: 500 });
  }
}
