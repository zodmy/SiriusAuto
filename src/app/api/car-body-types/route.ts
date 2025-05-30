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
    const { name, yearId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '' || yearId === undefined || typeof yearId !== 'number') {
      return NextResponse.json({ error: 'Надано невірну назву або ID року автомобіля' }, { status: 400 });
    }


    const carYearExists = await prisma.carYear.findUnique({ where: { id: yearId } });
    if (!carYearExists) {
      return NextResponse.json({ error: 'Вказаний рік автомобіля не знайдено' }, { status: 404 });
    }

    const newCarBodyType = await prisma.carBodyType.create({
      data: {
        name,
        year: { connect: { id: yearId } },
      },
    });
    return NextResponse.json(newCarBodyType, { status: 201 });
  } catch (error) {
    console.error('Помилка створення типу кузова автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {

      return NextResponse.json({ error: 'Тип кузова з такою назвою для вказаного року вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити тип кузова автомобіля' }, { status: 500 });
  }
}
