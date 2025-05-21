import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { productOptions: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не знайдено' }, { status: 404 });
    }

    return NextResponse.json(product.productOptions);
  } catch (error) {
    console.error('Помилка отримання опцій продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }

  try {
    const productId = parseInt(params.id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      return NextResponse.json({ error: 'Продукт не знайдено' }, { status: 404 });
    }

    const data = await request.json();
    const { name, value } = data;

    if (!name || !value) {
      return NextResponse.json({ error: 'Назва та значення опції є обов\'язковими' }, { status: 400 });
    }

    const productOption = await prisma.productOption.create({
      data: {
        productId,
        name,
        value,
      },
    });

    return NextResponse.json(productOption, { status: 201 });
  } catch (error) {
    console.error('Помилка створення опції продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
