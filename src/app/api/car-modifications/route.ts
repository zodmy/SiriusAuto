import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { checkAdmin } from '@/lib/auth';
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
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Немає прав доступу' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, engineId } = body;

    if (engineId === undefined || engineId === null) {
      return NextResponse.json({ error: "Відсутнє обов'язкове поле engineId" }, { status: 400 });
    }
    const parsedEngineId = parseInt(engineId, 10);
    if (isNaN(parsedEngineId)) {
      return NextResponse.json({ error: 'Невалідний ID двигуна' }, { status: 400 });
    }


    const carEngineExists = await prisma.carEngine.findUnique({
      where: { id: parsedEngineId },
    });

    if (!carEngineExists) {
      return NextResponse.json({ error: `Двигун з ID ${parsedEngineId} не знайдено` }, { status: 404 });
    }

    const newCarModification = await prisma.carModification.create({
      data: {
        name,
        engine: { connect: { id: parsedEngineId } },
      },
    });

    return NextResponse.json(newCarModification, { status: 201 });
  } catch (error) {
    console.error('Помилка створення модифікації автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {

        return NextResponse.json({ error: 'Модифікація з такою назвою для даного двигуна вже існує.' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося створити модифікацію автомобіля' }, { status: 500 });
  }
}
