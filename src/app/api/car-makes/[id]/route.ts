import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carMakeId = parseInt(id, 10);

  if (isNaN(carMakeId)) {
    return NextResponse.json({ error: 'Невалідний ID марки автомобіля' }, { status: 400 });
  }

  try {
    const carMake = await prisma.carMake.findUnique({
      where: { id: carMakeId },
    });

    if (!carMake) {
      return NextResponse.json({ message: `Марку автомобіля з ID ${carMakeId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(carMake, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання марки автомобіля з ID ${carMakeId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати марку автомобіля' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const { id } = await params;
  const carMakeId = parseInt(id, 10);

  if (isNaN(carMakeId)) {
    return NextResponse.json({ error: 'Невалідний ID марки автомобіля' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Назва марки автомобіля є обов\'язковою' }, { status: 400 });
    }

    const updatedCarMake = await prisma.carMake.update({
      where: { id: carMakeId },
      data: { name },
    });

    return NextResponse.json(updatedCarMake, { status: 200 });
  } catch (error: unknown) {
    console.error(`Помилка оновлення марки автомобіля з ID ${carMakeId}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Марку автомобіля з ID ${carMakeId} не знайдено` }, { status: 404 });
      } else if (prismaError.code === 'P2002') {
        if (prismaError.meta?.target?.includes('name')) {
          return NextResponse.json({ error: 'Марка автомобіля з такою назвою вже існує' }, { status: 409 });
        }
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити марку автомобіля' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const { id } = await params;
  const carMakeId = parseInt(id, 10);

  if (isNaN(carMakeId)) {
    return NextResponse.json({ error: 'Невалідний ID марки автомобіля' }, { status: 400 });
  }

  try {
    await prisma.carMake.delete({
      where: { id: carMakeId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`Помилка видалення марки автомобіля з ID ${carMakeId}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Марку автомобіля з ID ${carMakeId} не знайдено` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося видалити марку автомобіля' }, { status: 500 });
  }
}
