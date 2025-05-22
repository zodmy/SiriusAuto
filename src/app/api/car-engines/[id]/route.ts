import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carEngineId = parseInt(params.id, 10);
    if (isNaN(carEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна автомобіля' }, { status: 400 });
    }

    const carEngine = await prisma.carEngine.findUnique({
      where: { id: carEngineId },
    });

    if (!carEngine) {
      return NextResponse.json({ error: 'Двигун автомобіля не знайдено' }, { status: 404 });
    }

    return NextResponse.json(carEngine);
  } catch (error) {
    console.error('Помилка отримання двигуна автомобіля:', error);
    return NextResponse.json({ error: 'Не вдалося отримати двигун автомобіля' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const carEngineId = parseInt(params.id, 10);
    if (isNaN(carEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна автомобіля' }, { status: 400 });
    }

    const body = await req.json();
    const { name, capacity, horsepower, carYearId } = body;

    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ error: 'Надано невірну назву' }, { status: 400 });
    }
    if (capacity !== undefined && typeof capacity !== 'number') {
      return NextResponse.json({ error: 'Надано невірну ємність' }, { status: 400 });
    }
    if (horsepower !== undefined && typeof horsepower !== 'number') {
      return NextResponse.json({ error: 'Надано невірну потужність' }, { status: 400 });
    }
    if (carYearId !== undefined && typeof carYearId !== 'number') {
      return NextResponse.json({ error: 'Надано невірний ID року випуску автомобіля' }, { status: 400 });
    }

    const dataToUpdate: { name?: string; capacity?: number; horsepower?: number; carYearId?: number } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (capacity !== undefined) dataToUpdate.capacity = capacity;
    if (horsepower !== undefined) dataToUpdate.horsepower = horsepower;
    if (carYearId !== undefined) dataToUpdate.carYearId = carYearId;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Немає полів для оновлення' }, { status: 400 });
    }

    const updatedCarEngine = await prisma.carEngine.update({
      where: { id: carEngineId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedCarEngine);
  } catch (error) {
    console.error('Помилка оновлення двигуна автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Двигун автомобіля з такою назвою для вказаного року випуску вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Двигун автомобіля не знайдено' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити двигун автомобіля' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const carEngineId = parseInt(params.id, 10);
    if (isNaN(carEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна автомобіля' }, { status: 400 });
    }

    await prisma.carEngine.delete({
      where: { id: carEngineId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Помилка видалення двигуна автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Двигун автомобіля не знайдено' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Не вдалося видалити двигун автомобіля' }, { status: 500 });
  }
}
