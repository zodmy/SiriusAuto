import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            stockQuantity: {
              gt: 0
            }
          },
          {
            OR: [
              {
                name: {
                  contains: query.trim(),
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: query.trim(),
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      include: {
        category: true,
        manufacturer: true
      },
      take: 8,
      orderBy: {
        name: 'asc'
      }
    });

    const formattedProducts = products
      .filter(product => product.stockQuantity > 0)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category.name,
        manufacturer: product.manufacturer.name,
        stockQuantity: product.stockQuantity
      }));

    console.log(`Пошук "${query}": знайдено ${products.length} товарів, в наявності ${formattedProducts.length}`);

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Помилка пошуку товарів:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
