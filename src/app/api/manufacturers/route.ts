import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');

    const carMake = searchParams.get('carMake');
    const carModel = searchParams.get('carModel');
    const carYear = searchParams.get('carYear');
    const carBodyType = searchParams.get('carBodyType');
    const carEngine = searchParams.get('carEngine');
    const showAllProducts = searchParams.get('showAllProducts') === 'true';

    const productFilterConditions: Prisma.ProductWhereInput[] = [];

    if (categoryName) {
      productFilterConditions.push({
        category: {
          name: decodeURIComponent(categoryName)
        }
      });
    }

    if (search) {
      productFilterConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (minPrice || maxPrice) {
      const priceCondition: { gte?: number; lte?: number } = {};
      if (minPrice) {
        priceCondition.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceCondition.lte = parseFloat(maxPrice);
      }
      productFilterConditions.push({
        price: priceCondition
      });
    }

    if (inStock === 'true') {
      productFilterConditions.push({
        stockQuantity: {
          gt: 0
        }
      });
    }

    if (carMake && carModel && carYear && carBodyType && carEngine && !showAllProducts) {
      productFilterConditions.push({
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
      });
    }

    const whereCondition: Prisma.ManufacturerWhereInput = {};

    if (productFilterConditions.length > 0) {
      whereCondition.products = {
        some: {
          AND: productFilterConditions
        }
      };
    }

    const manufacturers = await prisma.manufacturer.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(manufacturers, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання виробників:', error);
    return NextResponse.json({ error: 'Не вдалося отримати виробників' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Назва виробника є обов\'язковою' }, { status: 400 });
    }

    const newManufacturer = await prisma.manufacturer.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newManufacturer, { status: 201 });
  } catch (error) {
    console.error('Помилка створення виробника:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const meta = 'meta' in error ? error.meta as { target?: string[] } : undefined;
      if (meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Виробник з такою назвою вже існує' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося створити виробника' }, { status: 500 });
  }
}
