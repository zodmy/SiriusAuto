import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {

  const url = new URL(request.url);
  const rawId = url.pathname.split('/').pop() || '';
  const parsedId = parseInt(rawId, 10);

  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parsedId },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: `Категорію з ID ${parsedId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`Помилка при запиті категорії з ID ${parsedId}:`, error);
    return NextResponse.json({ error: `Не вдалося отримати категорію` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawId = url.pathname.split('/').pop() || '';
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }
  try {
    const { name, parentId } = await request.json();

    if (parentId !== null && parentId !== undefined) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: Number(parentId) },
        select: { id: true }
      });

      if (!parentCategory) {
        return NextResponse.json({ error: `Батьківську категорію з ID '${parentId}' не знайдено` }, { status: 400 });
      }

      if (Number(parentId) === id) {
        return NextResponse.json({ error: `Категорія не може бути власною батьківською категорією` }, { status: 400 });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        // if parentId is provided (number or null), use it; otherwise omit
        parentId: parentId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`Не вдалося оновити категорію з ID ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const target = error.meta?.target;
      if (error.code === 'P2002' && ((Array.isArray(target) && target.includes('name')) || (typeof target === 'string' && target.includes('name')))) {
        return NextResponse.json({ error: 'Категорія з такою назвою вже існує' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: `Категорію з ID ${id} не знайдено для оновлення` }, { status: 404 });
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Вказана батьківська категорія недійсна' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: `Не вдалося оновити категорію з ID ${id}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawId = url.pathname.split('/').pop() || '';
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }

  try {
    const categoryWithChildren = await prisma.category.findUnique({
      where: { id },
      include: { children: { select: { id: true } } },
    });

    if (!categoryWithChildren) {
      return NextResponse.json({ error: `Категорію з ID ${id} не знайдено` }, { status: 404 });
    }

    if (categoryWithChildren.children && categoryWithChildren.children.length > 0) {
      return NextResponse.json({ error: `Не вдалося видалити категорію з ID ${id}, оскільки вона має дочірні категорії.` }, { status: 409 });
    }

    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ message: `Категорію з ID ${id} видалено` }, { status: 200 });
  } catch (error) {
    console.error(`Не вдалося видалити категорію з ID ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ error: `Не вдалося видалити категорію з ID ${id}. Можливо, вона використовується іншими записами (наприклад, товарами).` }, { status: 409 });
      }
    }
    return NextResponse.json({ error: `Не вдалося видалити категорію з ID ${id}` }, { status: 500 });
  }
}