import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { isAdmin } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const carModificationId = parseInt(params.id, 10);

  if (isNaN(carModificationId)) {
    return NextResponse.json({ error: 'Невалідний ID модифікації автомобіля' }, { status: 400 });
  }

  try {
    const carModification = await prisma.carModification.findUnique({
      where: { id: carModificationId },
    });

    if (!carModification) {
      return NextResponse.json({ message: `Модифікацію автомобіля з ID ${carModificationId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(carModification, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання модифікації автомобіля з ID ${carModificationId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати модифікацію автомобіля' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Немає прав доступу' }, { status: 403 });
  }
  const carModificationId = parseInt(params.id, 10);

  if (isNaN(carModificationId)) {
    return NextResponse.json({ error: 'Невалідний ID модифікації автомобіля' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, bodyTypeId } = body;

    let parsedBodyTypeId: number | undefined = undefined;
    if (bodyTypeId !== undefined && bodyTypeId !== null) {
      parsedBodyTypeId = parseInt(bodyTypeId, 10);
      if (isNaN(parsedBodyTypeId)) {
        return NextResponse.json({ error: 'Невалідний ID типу кузова' }, { status: 400 });
      }
      const carBodyTypeExists = await prisma.carBodyType.findUnique({
        where: { id: parsedBodyTypeId },
      });
      if (!carBodyTypeExists) {
        return NextResponse.json({ error: `Тип кузова з ID ${parsedBodyTypeId} не знайдено` }, { status: 404 });
      }
    }

    const dataToUpdate: { name?: string | null; bodyTypeId?: number } = {};
    if (name !== undefined) {
      dataToUpdate.name = name;
    }
    if (parsedBodyTypeId !== undefined) {
      dataToUpdate.bodyTypeId = parsedBodyTypeId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Не надано даних для оновлення' }, { status: 400 });
    }

    const updatedCarModification = await prisma.carModification.update({
      where: { id: carModificationId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedCarModification, { status: 200 });
  } catch (error) {
    console.error(`Помилка оновлення модифікації автомобіля з ID ${carModificationId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Модифікація з такою назвою для даного типу кузова вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ message: `Модифікацію автомобіля з ID ${carModificationId} не знайдено` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити модифікацію автомобіля' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Немає прав доступу' }, { status: 403 });
  }
  const carModificationId = parseInt(params.id, 10);

  if (isNaN(carModificationId)) {
    return NextResponse.json({ error: 'Невалідний ID модифікації автомобіля' }, { status: 400 });
  }

  try {
    await prisma.carModification.delete({
      where: { id: carModificationId },
    });

    return NextResponse.json({ message: `Модифікацію автомобіля з ID ${carModificationId} успішно видалено` }, { status: 200 });
  } catch (error) {
    console.error(`Помилка видалення модифікації автомобіля з ID ${carModificationId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: `Модифікацію автомобіля з ID ${carModificationId} не знайдено` }, { status: 404 });
    }
    return NextResponse.json({ error: 'Не вдалося видалити модифікацію автомобіля' }, { status: 500 });
  }
}
