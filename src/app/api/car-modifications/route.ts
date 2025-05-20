import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { isAdmin } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const carModifications = await prisma.carModification.findMany();
    return NextResponse.json(carModifications, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання модифікацій автомобілів:', error);
    return NextResponse.json({ error: 'Не вдалося отримати модифікації автомобілів' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Немає прав доступу' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, bodyTypeId } = body;

    if (bodyTypeId === undefined || bodyTypeId === null) {
      return NextResponse.json({ error: "Відсутнє обов'язкове поле bodyTypeId" }, { status: 400 });
    }
    const parsedBodyTypeId = parseInt(bodyTypeId, 10);
    if (isNaN(parsedBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова' }, { status: 400 });
    }

    const carBodyTypeExists = await prisma.carBodyType.findUnique({
      where: { id: parsedBodyTypeId },
    });

    if (!carBodyTypeExists) {
      return NextResponse.json({ error: `Тип кузова з ID ${parsedBodyTypeId} не знайдено` }, { status: 404 });
    }

    const newCarModification = await prisma.carModification.create({
      data: {
        name,
        bodyTypeId: parsedBodyTypeId,
      },
    });

    return NextResponse.json(newCarModification, { status: 201 });
  } catch (error) {
    console.error('Помилка створення модифікації автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Модифікація з такою назвою для даного типу кузова вже існує або надані дані порушують унікальність.' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося створити модифікацію автомобіля' }, { status: 500 });
  }
}
