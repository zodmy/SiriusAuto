import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const carYearId = parseInt(id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Невалідний ID року випуску автомобіля' }, { status: 400 });
    }

    const carYearWithDetails = await prisma.carYear.findUnique({
      where: { id: carYearId },
      include: {
        bodyTypes: {
          include: {
            engines: true,
          },
        },
      },
    });

    if (!carYearWithDetails) {
      return NextResponse.json({ error: 'Рік випуску автомобіля не знайдено' }, { status: 404 });
    }


    const allEngines = carYearWithDetails.bodyTypes.flatMap(bodyType => bodyType.engines);


    const uniqueEngines = Array.from(new Map(allEngines.map(engine => [engine.id, engine])).values());

    return NextResponse.json(uniqueEngines);
  } catch (error) {
    console.error('Помилка отримання двигунів автомобілів для року випуску:', error);
    return NextResponse.json({ error: 'Не вдалося отримати двигуни автомобілів для року випуску' }, { status: 500 });
  }
}
