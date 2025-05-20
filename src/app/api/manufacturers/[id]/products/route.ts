import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const products = await prisma.product.findMany({
      where: { manufacturerId },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання продуктів для виробника з ID ${manufacturerId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати продукти виробника' }, { status: 500 });
  }
}
