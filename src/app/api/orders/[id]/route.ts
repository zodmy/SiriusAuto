import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Недійсний ID замовлення' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Замовлення не знайдено' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Помилка отримання інформації про замовлення:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
