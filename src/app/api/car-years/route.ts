import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    const whereClause = modelId ? { modelId: parseInt(modelId) } : {};

    const carYears = await prisma.carYear.findMany({
      where: whereClause,
      orderBy: { year: 'desc' },
    });
    return NextResponse.json(carYears);
  } catch (error) {
    console.error('Помилка отримання років випуску автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати роки випуску автомобілів' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { year, modelId } = body;
    if (!year || typeof year !== 'number' || !modelId || typeof modelId !== 'number') {
      return NextResponse.json({ error: 'Надано невірний рік або ID моделі' }, { status: 400 });
    }
    const newCarYear = await prisma.carYear.create({
      data: { year, modelId },
    });
    return NextResponse.json(newCarYear, { status: 201 });
  } catch (error) {
    console.error('Помилка створення року випуску автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Рік випуску для цієї моделі вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити рік випуску автомобіля' }, { status: 500 });
  }
}
