import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const id = parseInt(productId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Недійсний ID товару' }, { status: 400 });
    }

    const compatibilities = await prisma.compatibility.findMany({
      where: { productId: id },
    });

    return NextResponse.json(compatibilities);
  } catch (error) {
    console.error('Помилка отримання сумісностей для товару:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
