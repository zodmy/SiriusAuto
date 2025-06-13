import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const manufacturers = await prisma.manufacturer.findMany();
    return NextResponse.json(manufacturers, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання виробників:', error);
    return NextResponse.json({ error: 'Не вдалося отримати виробників' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Назва виробника є обов\'язковою' }, { status: 400 });
    }

    const newManufacturer = await prisma.manufacturer.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newManufacturer, { status: 201 });
  } catch (error) {
    console.error('Помилка створення виробника:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const meta = 'meta' in error ? error.meta as { target?: string[] } : undefined;
      if (meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Виробник з такою назвою вже існує' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося створити виробника' }, { status: 500 });
  }
}
