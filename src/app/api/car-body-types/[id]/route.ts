import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carBodyTypeId = parseInt(params.id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    const carBodyType = await prisma.carBodyType.findUnique({
      where: { id: carBodyTypeId },
    });

    if (!carBodyType) {
      return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
    }

    return NextResponse.json(carBodyType);
  } catch (error) {
    console.error('Помилка отримання типу кузова автомобіля:', error);
    return NextResponse.json({ error: 'Не вдалося отримати тип кузова автомобіля' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const carBodyTypeId = parseInt(params.id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    const body = await req.json();
    const { name, engineId } = body;

    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ error: 'Надано невірну назву' }, { status: 400 });
    }
    if (engineId !== undefined && typeof engineId !== 'number') {
      return NextResponse.json({ error: 'Надано невірний ID двигуна' }, { status: 400 });
    }

    const dataToUpdate: { name?: string; engineId?: number } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (engineId !== undefined) dataToUpdate.engineId = engineId;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Немає полів для оновлення' }, { status: 400 });
    }

    const updatedCarBodyType = await prisma.carBodyType.update({
      where: { id: carBodyTypeId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedCarBodyType);
  } catch (error) {
    console.error('Помилка оновлення типу кузова автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Тип кузова з такою назвою для вказаного двигуна вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити тип кузова автомобіля' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const carBodyTypeId = parseInt(params.id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    await prisma.carBodyType.delete({
      where: { id: carBodyTypeId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Помилка видалення типу кузова автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Не вдалося видалити тип кузова автомобіля' }, { status: 500 });
  }
}
