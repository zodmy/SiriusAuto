import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Перевіряємо авторизацію користувача
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Необхідно авторизуватися' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        email: string;
      };
    } catch {
      return NextResponse.json(
        { error: 'Недійсний токен авторизації' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Недійсний ID замовлення' },
        { status: 400 }
      );
    }

    // Знаходимо замовлення
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        orderDate: true,
        userId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Замовлення не знайдено' },
        { status: 404 }
      );
    }

    // Перевіряємо, чи користувач має право на це замовлення
    if (order.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Доступ заборонено' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
      orderDate: order.orderDate,
    });

  } catch (error) {
    console.error('Помилка перевірки статусу замовлення:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
