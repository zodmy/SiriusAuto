import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
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
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const body = await req.json();

    const { name, bodyTypeId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '' || bodyTypeId === undefined || typeof bodyTypeId !== 'number') {
      return NextResponse.json({ error: 'Надано невірну назву або ID типу кузова автомобіля' }, { status: 400 });
    }


    const bodyTypeExists = await prisma.carBodyType.findUnique({ where: { id: bodyTypeId } });
    if (!bodyTypeExists) {
      return NextResponse.json({ error: 'Вказаний тип кузова автомобіля не знайдено' }, { status: 404 });
    }

    const newCarEngine = await prisma.carEngine.create({
      data: {
        name,
        bodyType: { connect: { id: bodyTypeId } },
      },
    });
    return NextResponse.json(newCarEngine, { status: 201 });
  } catch (error) {
    console.error('Помилка створення двигуна автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {

      return NextResponse.json({ error: 'Двигун з такою назвою для вказаного типу кузова вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити двигун автомобіля' }, { status: 500 });
  }
}
