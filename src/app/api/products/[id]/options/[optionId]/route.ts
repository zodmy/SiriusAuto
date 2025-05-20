import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string, optionId: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }

  try {
    const productId = parseInt(params.id, 10);
    const optionId = parseInt(params.optionId, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    if (isNaN(optionId)) {
      return NextResponse.json({ error: 'Недійсний ID опції' }, { status: 400 });
    }

    const data = await request.json();
    const { name, value } = data;

    if (!name && !value) {
      return NextResponse.json({ error: 'Назва або значення опції є обов\'язковими для оновлення' }, { status: 400 });
    }

    const productOption = await prisma.productOption.update({
      where: { id: optionId, productId: productId },
      data: {
        ...(name && { name }),
        ...(value && { value }),
      },
    });

    return NextResponse.json(productOption);
  } catch (error: unknown) {
    console.error('Помилка оновлення опції продукту:', error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Опція з ID ${params.optionId} для продукту з ID ${params.id} не знайдена` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string, optionId: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }

  try {
    const productId = parseInt(params.id, 10);
    const optionId = parseInt(params.optionId, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    if (isNaN(optionId)) {
      return NextResponse.json({ error: 'Недійсний ID опції' }, { status: 400 });
    }

    await prisma.productOption.delete({
      where: { id: optionId, productId: productId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`Помилка видалення опції продукту з ID ${params.optionId} для продукту з ID ${params.id}:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Опція з ID ${params.optionId} для продукту з ID ${params.id} не знайдена` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося видалити опцію продукту' }, { status: 500 });
  }
}
