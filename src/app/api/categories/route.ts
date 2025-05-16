// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Переконайтеся, що шлях правильний

export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
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

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    return NextResponse.json({ error: 'Не вдалося отримати категорії' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Потрібно вказати назву категорії' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        parentId: parentId !== undefined ? Number(parentId) : null,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: true,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Помилка створення категорії:', error);
    if (error.code === '23505' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Категорія з такою назвою вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити категорію' }, { status: 500 });
  }
}
