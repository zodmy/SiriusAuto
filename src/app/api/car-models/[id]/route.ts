import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const carModelId = parseInt(params.id, 10);

  if (isNaN(carModelId)) {
    return NextResponse.json({ error: 'Невалідний ID моделі автомобіля' }, { status: 400 });
  }

  try {
    const carModel = await prisma.carModel.findUnique({
      where: { id: carModelId },
    });

    if (!carModel) {
      return NextResponse.json({ message: `Модель автомобіля з ID ${carModelId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(carModel, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання моделі автомобіля з ID ${carModelId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати модель автомобіля' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const carModelId = parseInt(params.id, 10);

  if (isNaN(carModelId)) {
    return NextResponse.json({ error: 'Невалідний ID моделі автомобіля' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, carMakeId: makeId } = body; // Corrected: makeId from body

    if (!name || makeId === undefined) { // Corrected: use makeId
      return NextResponse.json({ error: 'Назва моделі та ID марки автомобіля є обов\'язковими' }, { status: 400 });
    }

    if (typeof makeId !== 'number' || isNaN(makeId)) { // Corrected: use makeId
      return NextResponse.json({ error: 'ID марки автомобіля має бути числом' }, { status: 400 });
    }

    const updatedCarModel = await prisma.carModel.update({
      where: { id: carModelId },
      data: {
        name,
        makeId, // Corrected: use makeId for the field name
      },
    });

    return NextResponse.json(updatedCarModel, { status: 200 });
  } catch (error: unknown) {
    console.error(`Помилка оновлення моделі автомобіля з ID ${carModelId}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Модель автомобіля з ID ${carModelId} не знайдено` }, { status: 404 });
      } else if (prismaError.code === 'P2002') {
        // Assuming 'name' and 'makeId' might be part of a unique constraint.
        // Adjust if the unique constraint involves other fields or is different.
        if (prismaError.meta?.target?.includes('name') || prismaError.meta?.target?.includes('makeId')) { // Corrected: use makeId
          return NextResponse.json({ error: 'Модель автомобіля з такою назвою та маркою вже існує' }, { status: 409 });
        }
      } else if (prismaError.code === 'P2003') { // Foreign key constraint failed
        // Corrected: Check for 'makeId' in the foreign key constraint violation
        if (prismaError.meta?.target?.includes('makeId')) {
          // Access makeId from body for the error message
          const body = await request.json().catch(() => ({})); // Re-parse or use a stored value if available
          return NextResponse.json({ error: `Марка автомобіля з ID ${body.carMakeId} не існує` }, { status: 400 });
        }
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити модель автомобіля' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const carModelId = parseInt(params.id, 10);

  if (isNaN(carModelId)) {
    return NextResponse.json({ error: 'Невалідний ID моделі автомобіля' }, { status: 400 });
  }

  try {
    await prisma.carModel.delete({
      where: { id: carModelId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`Помилка видалення моделі автомобіля з ID ${carModelId}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Модель автомобіля з ID ${carModelId} не знайдено` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося видалити модель автомобіля' }, { status: 500 });
  }
}
