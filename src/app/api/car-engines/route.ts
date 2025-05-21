import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const carEngines = await prisma.carEngine.findMany();
    return NextResponse.json(carEngines);
  } catch (error) {
    console.error('Помилка отримання двигунів автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати двигуни автомобілів' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, carYearId, capacity, horsepower } = body;

    if (!name || typeof name !== 'string' || !carYearId || typeof carYearId !== 'number') {
      return NextResponse.json({ error: 'Надано невірну назву або ID року випуску автомобіля' }, { status: 400 });
    }

    const dataToCreate: {
      name: string;
      year: { connect: { id: number } };
      capacity?: number;
      horsepower?: number;
    } = {
      name,
      year: { connect: { id: carYearId } },
    };
    if (capacity !== undefined && typeof capacity === 'number') {
      dataToCreate.capacity = capacity;
    }
    if (horsepower !== undefined && typeof horsepower === 'number') {
      dataToCreate.horsepower = horsepower;
    }

    const newCarEngine = await prisma.carEngine.create({
      data: dataToCreate,
    });
    return NextResponse.json(newCarEngine, { status: 201 });
  } catch (error) {
    console.error('Помилка створення двигуна автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Двигун автомобіля з такою назвою для вказаного року випуску вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити двигун автомобіля' }, { status: 500 });
  }
}
