import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const manufacturers = searchParams.get('manufacturers');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock'); const carMake = searchParams.get('carMake');
    const carModel = searchParams.get('carModel');
    const carYear = searchParams.get('carYear');
    const carBodyType = searchParams.get('carBodyType');
    const carEngine = searchParams.get('carEngine');
    const showAllProducts = searchParams.get('showAllProducts');

    const baseConditions: Prisma.ProductWhereInput[] = [];

    if (categoryName) {
      baseConditions.push({
        category: {
          name: decodeURIComponent(categoryName)
        }
      });
    }

    if (search) {
      baseConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (manufacturers) {
      const manufacturerList = manufacturers.split(',').map(m => m.trim());
      baseConditions.push({
        manufacturer: {
          name: {
            in: manufacturerList
          }
        }
      });
    } if (minPrice || maxPrice) {
      const priceCondition: { gte?: number; lte?: number } = {};
      if (minPrice) {
        priceCondition.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceCondition.lte = parseFloat(maxPrice);
      }
      baseConditions.push({
        price: priceCondition
      });
    }

    if (inStock === 'true') {
      baseConditions.push({
        stockQuantity: {
          gt: 0
        }
      });
    }

    let where: Prisma.ProductWhereInput = {};

    if (baseConditions.length > 0) {
      where.AND = baseConditions;
    } if (carMake && carModel && carYear && carBodyType && carEngine && showAllProducts !== 'true') {
      const carCompatibilityCondition = {
        OR: [
          {
            compatibleVehicles: {
              some: {
                carMake: { name: carMake },
                carModel: { name: carModel },
                carYear: { year: parseInt(carYear) },
                carBodyType: { name: carBodyType },
                carEngine: { name: carEngine }
              }
            }
          },
          {
            compatibleVehicles: {
              none: {}
            }
          }
        ]
      }; if (where.AND && Array.isArray(where.AND)) {
        where.AND.push(carCompatibilityCondition);
      } else {
        where = carCompatibilityCondition;
      }
    } let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating_desc':
        orderBy = { averageRating: 'desc' };
        break;
      case 'rating_asc':
        orderBy = { averageRating: 'asc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
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
    console.error('Помилка отримання товарів:', error);
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
    console.error('Помилка створення товару:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
