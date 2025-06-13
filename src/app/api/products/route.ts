import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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
        compatibleVehicles: {
          include: {
            carMake: {
              select: {
                id: true,
                name: true,
              },
            },
            carModel: {
              select: {
                id: true,
                name: true,
              },
            },
            carYear: {
              select: {
                id: true,
                year: true,
              },
            },
            carBodyType: {
              select: {
                id: true,
                name: true,
              },
            },
            carEngine: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Помилка отримання продуктів:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const data = await request.json();
    const product = await prisma.product.create({
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
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Помилка створення продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
