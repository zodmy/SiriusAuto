import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as OrderStatus | null;
  const userIdParam = searchParams.get('userId');

  let userId: number | undefined;
  if (userIdParam) {
    userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Недійсний ID користувача для фільтрації' }, { status: 400 });
    }
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Помилка отримання списку замовлень:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
