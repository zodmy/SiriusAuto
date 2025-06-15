import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');

    const carMake = searchParams.get('carMake');
    const carModel = searchParams.get('carModel');
    const carYear = searchParams.get('carYear');
    const carBodyType = searchParams.get('carBodyType');
    const carEngine = searchParams.get('carEngine'); const showAllProducts = searchParams.get('showAllProducts') === 'true';

    const whereCondition: Prisma.ManufacturerWhereInput = {};

    if (categoryName) {
      whereCondition.products = {
        some: {
          category: {
            name: decodeURIComponent(categoryName)
          }
        }
      };
    }

    if (carMake && carModel && carYear && carBodyType && carEngine && !showAllProducts) {
      const compatibilityCondition = {
        compatibleVehicles: {
          some: {
            carMake: { name: carMake },
            carModel: { name: carModel },
            carYear: { year: parseInt(carYear) },
            carBodyType: { name: carBodyType },
            carEngine: { name: carEngine }
          }
        }
      }; if (categoryName) {
        whereCondition.products = {
          some: {
            AND: [
              { category: { name: decodeURIComponent(categoryName) } },
              compatibilityCondition
            ]
          }
        };
      } else {
        whereCondition.products = {
          some: compatibilityCondition
        };
      }
    }

    let manufacturers;

    if (Object.keys(whereCondition).length > 0) {
      manufacturers = await prisma.manufacturer.findMany({
        where: whereCondition,
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      manufacturers = await prisma.manufacturer.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    }

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
