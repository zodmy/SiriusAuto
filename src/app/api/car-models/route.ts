import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const makeId = searchParams.get('makeId');

    const whereClause = makeId ? { makeId: parseInt(makeId) } : {};

    const carModels = await prisma.carModel.findMany({
      where: whereClause,
    });
    return NextResponse.json(carModels, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання моделей автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати моделі автомобілів' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, makeId } = body;

    if (!name || !makeId) {
      return NextResponse.json({ error: 'Назва моделі та ID марки автомобіля є обов\'язковими' }, { status: 400 });
    }

    const carMakeExists = await prisma.carMake.findUnique({
      where: { id: makeId },
    });

    if (!carMakeExists) {
      return NextResponse.json({ error: `Марку автомобіля з ID ${makeId} не знайдено` }, { status: 404 });
    }

    const newCarModel = await prisma.carModel.create({
      data: {
        name,
        makeId,
      },
    });

    return NextResponse.json(newCarModel, { status: 201 });
  } catch (error) {
    console.error('Помилка створення моделі автомобіля:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Модель автомобіля з такими даними вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити модель автомобіля' }, { status: 500 });
  }
}
