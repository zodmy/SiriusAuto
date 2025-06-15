import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parentCategoryId = parseInt(id, 10);

  if (isNaN(parentCategoryId)) {
    return NextResponse.json({ error: 'Невалідний ID батьківської категорії' }, { status: 400 });
  }

  try {
    const children = await prisma.category.findMany({
      where: { parentId: parentCategoryId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!children || children.length === 0) {
      return NextResponse.json({ message: `Підкатегорії для батьківської категорії з ID ${parentCategoryId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(children, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання підкатегорій для батьківської категорії з ID ${parentCategoryId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати підкатегорії' }, { status: 500 });
  }
}
