import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Невалідний ID року випуску автомобіля' }, { status: 400 });
    }

    const carYear = await prisma.carYear.findUnique({
      where: { id: carYearId },
    });

    if (!carYear) {
      return NextResponse.json({ error: 'Рік випуску автомобіля не знайдено' }, { status: 404 });
    }

    return NextResponse.json(carYear);
  } catch (error) {
    console.error('Помилка отримання року випуску автомобіля:', error);
    return NextResponse.json({ error: 'Не вдалося отримати рік випуску автомобіля' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Невалідний ID року випуску автомобіля' }, { status: 400 });
    }

    const body = await req.json();
    const { year, modelId } = body;

    if (year !== undefined && typeof year !== 'number') {
      return NextResponse.json({ error: 'Надано невірний рік' }, { status: 400 });
    }
    if (modelId !== undefined && typeof modelId !== 'number') {
      return NextResponse.json({ error: 'Надано невірний ID моделі' }, { status: 400 });
    }

    const dataToUpdate: { year?: number; modelId?: number } = {};
    if (year !== undefined) dataToUpdate.year = year;
    if (modelId !== undefined) dataToUpdate.modelId = modelId;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Немає полів для оновлення' }, { status: 400 });
    }

    const updatedCarYear = await prisma.carYear.update({
      where: { id: carYearId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedCarYear);
  } catch (error) {
    console.error('Помилка оновлення року випуску автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Рік випуску для цієї моделі вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Рік випуску автомобіля не знайдено' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити рік випуску автомобіля' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Невалідний ID року випуску автомобіля' }, { status: 400 });
    }

    await prisma.carYear.delete({
      where: { id: carYearId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Помилка видалення року випуску автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Рік випуску автомобіля не знайдено' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Не вдалося видалити рік випуску автомобіля' }, { status: 500 });
  }
}