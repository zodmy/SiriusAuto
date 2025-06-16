import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string, optionId: string }> }) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }
  try {
    const { id, optionId } = await params;
    const productId = parseInt(id, 10);
    const optionIdNum = parseInt(optionId, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID товару' }, { status: 400 });
    }

    if (isNaN(optionIdNum)) {
      return NextResponse.json({ error: 'Недійсний ID опції' }, { status: 400 });
    }

    const data = await request.json();
    const { name, value } = data;

    if (!name && !value) {
      return NextResponse.json({ error: 'Назва або значення опції є обов\'язковими для оновлення' }, { status: 400 });
    } const productOption = await prisma.productOption.update({
      where: { id: optionIdNum, productId: productId },
      data: {
        ...(name && { name }),
        ...(value && { value }),
      },
    });

    return NextResponse.json(productOption);
  } catch (error: unknown) {
    console.error('Помилка оновлення опції товару:', error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string }; if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Опція не знайдена` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, optionId: string }> }) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }

  try {
    const { id, optionId } = await params;
    const productId = parseInt(id, 10);
    const optionIdNum = parseInt(optionId, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID товару' }, { status: 400 });
    }

    if (isNaN(optionIdNum)) {
      return NextResponse.json({ error: 'Недійсний ID опції' }, { status: 400 });
    }

    await prisma.productOption.delete({
      where: { id: optionIdNum, productId: productId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`Помилка видалення опції товару:`, error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ message: `Опція не знайдена` }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Не вдалося видалити опцію товару' }, { status: 500 });
  }
}
