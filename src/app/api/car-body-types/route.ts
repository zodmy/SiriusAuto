import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const carBodyTypes = await prisma.carBodyType.findMany();
    return NextResponse.json(carBodyTypes);
  } catch (error) {
    console.error('Помилка отримання типів кузовів автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати типи кузовів автомобілів' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, engineId } = body;

    if (!name || typeof name !== 'string' || !engineId || typeof engineId !== 'number') {
      return NextResponse.json({ error: 'Надано невірну назву або ID двигуна' }, { status: 400 });
    }

    const newCarBodyType = await prisma.carBodyType.create({
      data: {
        name,
        engine: { connect: { id: engineId } },
      },
    });
    return NextResponse.json(newCarBodyType, { status: 201 });
  } catch (error) {
    console.error('Помилка створення типу кузова автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Тип кузова з такою назвою для вказаного двигуна вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити тип кузова автомобіля' }, { status: 500 });
  }
}
