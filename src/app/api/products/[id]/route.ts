import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    } const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stockQuantity: true,
        imageUrl: true,
        categoryId: true,
        manufacturerId: true,
        isVariant: true,
        baseProductId: true,
        averageRating: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
        baseProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не знайдено' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Помилка отримання продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    const data = await request.json();
    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
        baseProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Помилка оновлення продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { id } = await params;
    console.error(`Помилка видалення продукту з ID ${id}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Продукт з ID ${id} не знайдено` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося видалити продукт' }, { status: 500 });
  }
}
