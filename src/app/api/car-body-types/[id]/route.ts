import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const carBodyTypeId = parseInt(id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    const carBodyType = await prisma.carBodyType.findUnique({
      where: { id: carBodyTypeId },
    });

    if (!carBodyType) {
      return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
    }

    return NextResponse.json(carBodyType);
  } catch (error) {
    console.error('Помилка отримання типу кузова автомобіля:', error);
    return NextResponse.json({ error: 'Не вдалося отримати тип кузова автомобіля' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const carBodyTypeId = parseInt(id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    const body = await request.json();
    const { name, yearId } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json({ error: 'Надано невірну або порожню назву' }, { status: 400 });
    }
    if (yearId !== undefined && typeof yearId !== 'number') {
      return NextResponse.json({ error: 'Надано невірний ID року автомобіля' }, { status: 400 });
    }


    if (yearId !== undefined) {
      const yearExists = await prisma.carYear.findUnique({ where: { id: yearId } });
      if (!yearExists) {
        return NextResponse.json({ error: 'Вказаний рік автомобіля не знайдено' }, { status: 404 });
      }
    }

    const dataToUpdate: { name?: string; yearId?: number } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (yearId !== undefined) dataToUpdate.yearId = yearId;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Немає полів для оновлення' }, { status: 400 });
    }

    const updatedCarBodyType = await prisma.carBodyType.update({
      where: { id: carBodyTypeId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedCarBodyType);
  } catch (error) {
    console.error('Помилка оновлення типу кузова автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {

        return NextResponse.json({ error: 'Тип кузова з такою назвою для вказаного року вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити тип кузова автомобіля' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin({ req }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const carBodyTypeId = parseInt(id, 10);
    if (isNaN(carBodyTypeId)) {
      return NextResponse.json({ error: 'Невалідний ID типу кузова автомобіля' }, { status: 400 });
    }

    await prisma.carBodyType.delete({
      where: { id: carBodyTypeId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Помилка видалення типу кузова автомобіля:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Тип кузова автомобіля не знайдено' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Не вдалося видалити тип кузова автомобіля' }, { status: 500 });
  }
}
