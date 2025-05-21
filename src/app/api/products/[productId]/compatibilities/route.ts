import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = parseInt(params.productId, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    const compatibilities = await prisma.compatibility.findMany({
      where: { productId },
    });

    return NextResponse.json(compatibilities);
  } catch (error) {
    console.error('Помилка отримання сумісностей для продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
