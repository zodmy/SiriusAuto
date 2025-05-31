import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
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

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  const { params } = await context;
  try {
    const carEngineId = parseInt(params.id, 10);
    if (isNaN(carEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна автомобіля' }, { status: 400 });
    }

    const body = await req.json();

    const { name, bodyTypeId } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json({ error: 'Надано невірну або порожню назву' }, { status: 400 });
    }
    if (bodyTypeId !== undefined && typeof bodyTypeId !== 'number') {
      return NextResponse.json({ error: 'Надано невірний ID типу кузова автомобіля' }, { status: 400 });
    }

    if (bodyTypeId !== undefined) {
      const bodyTypeExists = await prisma.carBodyType.findUnique({ where: { id: bodyTypeId } });
      if (!bodyTypeExists) {
        return NextResponse.json({ error: 'Вказаний тип кузова автомобіля не знайдено' }, { status: 404 });
      }
    }

    const dataToUpdate: { name?: string; bodyTypeId?: number } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (bodyTypeId !== undefined) dataToUpdate.bodyTypeId = bodyTypeId;

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
        return NextResponse.json({ error: 'Двигун з такою назвою для вказаного типу кузова вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Двигун автомобіля не знайдено' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити двигун автомобіля' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  const { params } = await context;
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
