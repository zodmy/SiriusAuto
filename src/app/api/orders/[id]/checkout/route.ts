import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { liqPayService } from '@/lib/liqpay';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  email: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Перевіряємо аутентифікацію користувача
    const token = request.cookies.get('auth-token')?.value;
    let userId: number | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        userId = decoded.userId;
      } catch {
        return NextResponse.json(
          { error: 'Недійсний токен авторизації' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Недійсний ID замовлення' },
        { status: 400 }
      );
    }

    // Знаходимо замовлення та перевіряємо права доступу
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Замовлення не знайдено' },
        { status: 404 }
      );
    }

    // Перевіряємо, чи користувач має право оплачувати це замовлення
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'Доступ заборонено' },
        { status: 403 }
      );
    }    // Перевіряємо статус замовлення
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Замовлення не може бути оплачено в поточному статусі' },
        { status: 400 }
      );
    }    // Отримуємо домен для URL-ів
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    // Генеруємо дані для оплати через власний сервіс
    const paymentData = liqPayService.generatePaymentData({
      orderId: order.id,
      amount: parseFloat(order.totalPrice.toString()),
      description: `Оплата за замовлення №${order.id}`,
      resultUrl: `${baseUrl}/payment-status?order=${order.id}`,
      serverUrl: `${baseUrl}/api/liqpay-callback`,
    });

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Order checkout error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
