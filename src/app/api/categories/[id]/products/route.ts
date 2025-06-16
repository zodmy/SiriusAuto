import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { categoryId },
    });

    if (!products || products.length === 0) {
      return NextResponse.json({ message: `Товари для категорії з ID ${categoryId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання товарів для категорії з ID ${categoryId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати товари категорії' }, { status: 500 });
  }
}
