import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const carMakes = await prisma.carMake.findMany();
    return NextResponse.json(carMakes, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання марок автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати марки автомобілів' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Назва марки автомобіля є обов\'язковою' }, { status: 400 });
    }

    const newCarMake = await prisma.carMake.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newCarMake, { status: 201 });
  } catch (error) {
    console.error('Помилка створення марки автомобіля:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const meta = 'meta' in error ? error.meta as { target?: string[] } : undefined;
      if (meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Марка автомобіля з такою назвою вже існує' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося створити марку автомобіля' }, { status: 500 });
  }
}
