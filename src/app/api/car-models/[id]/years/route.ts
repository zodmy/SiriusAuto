import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const modelId = parseInt(params.id, 10);

  if (isNaN(modelId)) {
    return NextResponse.json({ error: 'Невалідний ID моделі автомобіля' }, { status: 400 });
  }

  try {
    const carModel = await prisma.carModel.findUnique({
      where: { id: modelId },
      include: {
        years: {
          select: {
            id: true,
            year: true,
          }
        }
      }
    });

    if (!carModel) {
      return NextResponse.json({ message: `Модель автомобіля з ID ${modelId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(carModel.years, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання років випуску для моделі з ID ${modelId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати роки випуску для моделі' }, { status: 500 });
  }
}
