import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request, context: { params: { id: string } }) {
  const id = parseInt(context.params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: `Категорію з ID ${id} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`Помилка при запиті категорії з ID ${id}:`, error);
    return NextResponse.json({ error: `Не вдалося отримати категорію` }, { status: 500 });
  }
}
