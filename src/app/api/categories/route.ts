import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: {
          orderBy: {
            name: 'asc',
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      }, orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    return NextResponse.json({ error: 'Не вдалося отримати категорії' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const categoriesData = Array.isArray(body) ? body : [body];

    if (categoriesData.some(cat => !cat.name)) {
      return NextResponse.json({ error: 'Для всіх категорій потрібно вказати назву' }, { status: 400 });
    } const createdCategories = await prisma.$transaction(async (tx) => {
      return Promise.all(categoriesData.map(async (categoryData) => {
        const { name, parentId } = categoryData;
        const parentIdToSet: number | null = parentId || null;

        if (parentIdToSet !== null) {
          const parentCategory = await tx.category.findUnique({
            where: { id: parentIdToSet },
            select: { id: true }
          });
          if (!parentCategory) {
            throw new Error(`Батьківську категорію з ID '${parentIdToSet}' не знайдено для створення підкатегорії '${name}'.`);
          }
        }

        return tx.category.create({
          data: {
            name,
            parentId: parentIdToSet,
          },
          include: {
            parent: {
              select: { id: true, name: true },
            },
            children: true,
          },
        });
      }));
    });

    return NextResponse.json(Array.isArray(body) ? createdCategories : createdCategories[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Помилка створення категорії:', error);

    if (error instanceof Error && (error.message.startsWith('Батьківську категорію з назвою') || error.message.startsWith('Некоректне значення для parentName'))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (typeof error === 'object' && error !== null) {
      const potentialErrorObject = error as {
        code?: string;
        meta?: { target?: string[]; field_name?: string };
      };

      if (potentialErrorObject.code === 'P2002' && potentialErrorObject.meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Категорія з такою назвою вже існує' }, { status: 409 });
      } if (potentialErrorObject.code === 'P2003' && potentialErrorObject.meta?.field_name === 'parentId') {
        return NextResponse.json({ error: 'Не вдалося створити категорію: вказано неіснуючу батьківську категорію (parentId).' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося створити категорію(ї)' }, { status: 500 });
  }
}
