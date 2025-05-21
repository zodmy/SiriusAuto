import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const carMakeId = parseInt(params.id, 10);

  if (isNaN(carMakeId)) {
    return NextResponse.json({ error: 'Невалідний ID марки автомобіля' }, { status: 400 });
  }

  try {
    const carModels = await prisma.carModel.findMany({
      where: { makeId: carMakeId },
    });

    if (!carModels || carModels.length === 0) {
      return NextResponse.json({ message: `Моделі для марки автомобіля з ID ${carMakeId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(carModels, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання моделей для марки автомобіля з ID ${carMakeId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати моделі автомобілів' }, { status: 500 });
  }
}
