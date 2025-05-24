import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: Request, context: { params: { id: string } }) {

  const { id: rawId } = await context.params;
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

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }

  try {
    const { name, parentId } = await request.json();
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        parentId: parentId !== undefined ? Number(parentId) : (parentId === null ? null : undefined),
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
    }
    return NextResponse.json({ error: `Не вдалося оновити категорію з ID ${id}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const { id: rawId } = await context.params;
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