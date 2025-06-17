import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdmin({ req: request });

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав доступу' },
        { status: 403 }
      );
    }

    const orderId = parseInt(params.id);
    const { status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'ID замовлення та статус є обов\'язковими' },
        { status: 400 }
      );
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Недійсний статус замовлення' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Замовлення не знайдено' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
