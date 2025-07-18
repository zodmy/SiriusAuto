import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manufacturerId = parseInt(id, 10);

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
    console.error(`Помилка отримання товарів для виробника з ID ${manufacturerId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати товари виробника' }, { status: 500 });
  }
}
