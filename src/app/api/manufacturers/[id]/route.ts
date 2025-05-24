import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const manufacturerId = parseInt(params.id, 10);

  if (isNaN(manufacturerId)) {
    return NextResponse.json({ error: 'Невалідний ID виробника' }, { status: 400 });
  }

  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) {
      return NextResponse.json({ message: `Виробника з ID ${manufacturerId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(manufacturer, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання виробника з ID ${manufacturerId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати виробника' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }
  const manufacturerId = parseInt(params.id, 10);

  if (isNaN(manufacturerId)) {
    return NextResponse.json({ error: 'Невалідний ID виробника' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Назва виробника є обов\'язковою' }, { status: 400 });
    }

    const updatedManufacturer = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: { name },
    });

    return NextResponse.json(updatedManufacturer, { status: 200 });
  } catch (error: unknown) {
    console.error(`Помилка оновлення виробника з ID ${manufacturerId}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Виробника з ID ${manufacturerId} не знайдено` }, { status: 404 });
      } else if (prismaError.code === 'P2002') {
        if (prismaError.meta?.target?.includes('name')) {
          return NextResponse.json({ error: 'Виробник з такою назвою вже існує' }, { status: 409 });
        }
      }
    }
    return NextResponse.json({ error: 'Не вдалося оновити виробника' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }
  const manufacturerId = parseInt(params.id, 10);

  if (isNaN(manufacturerId)) {
    return NextResponse.json({ error: 'Невалідний ID виробника' }, { status: 400 });
  }

  try {
    await prisma.manufacturer.delete({
      where: { id: manufacturerId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`Помилка видалення виробника з ID ${manufacturerId}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Виробника з ID ${manufacturerId} не знайдено` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося видалити виробника' }, { status: 500 });
  }
}
