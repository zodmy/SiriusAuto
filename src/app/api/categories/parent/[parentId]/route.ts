import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { parentId: string } }) {
  const resolvedParams = await params;
  const parentId = parseInt(resolvedParams.parentId, 10);

  if (isNaN(parentId)) {
    return NextResponse.json({ error: 'Невалідний ID батьківської категорії' }, { status: 400 });
  }

  try {
    const subcategories = await prisma.category.findMany({
      where: { parentId: parentId },
      include: {
        children: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (!subcategories || subcategories.length === 0) {
      return NextResponse.json({ message: `Підкатегорії для батьківської категорії з ID ${parentId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(subcategories, { status: 200 });
  } catch (error) {
    console.error(`Помилка отримання підкатегорій для батьківської категорії з ID ${parentId}:`, error);
    return NextResponse.json({ error: 'Не вдалося отримати підкатегорії' }, { status: 500 });
  }
}
