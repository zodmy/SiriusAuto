import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { liqPayService } from '@/lib/liqpay';
import { OrderStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  email: string;
}

export async function GET(
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
      select: {
        id: true,
        userId: true,
        status: true,
        totalPrice: true,
        paymentMethod: true,
        orderDate: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Замовлення не знайдено' },
        { status: 404 }
      );
    }    // Перевіряємо, чи користувач має право переглядати це замовлення
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'Доступ заборонено' },
        { status: 403 }
      );
    }

    // Якщо це картковий платіж і статус ще PENDING, перевіряємо через API LiqPay
    if (order.paymentMethod === 'CARD' && order.status === 'PENDING') {
      console.log(`Checking payment status for order ${orderId} via LiqPay API`);

      const paymentStatus = await liqPayService.checkPaymentStatus(orderId.toString());

      if (paymentStatus && liqPayService.isSuccessfulPayment(paymentStatus.status)) {
        // Оновлюємо статус замовлення в базі даних
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PAID,
            updatedAt: new Date(),
          },
        });

        console.log(`Order ${orderId} status updated to PAID based on LiqPay API check`);

        // Оновлюємо об'єкт order для відповіді
        order.status = OrderStatus.PAID;
      }
    }

    // Повертаємо статус замовлення
    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPrice: order.totalPrice,
      orderDate: order.orderDate,
      isPaid: order.status === 'PAID',
      isPending: order.status === 'PENDING',
      isFailed: order.status === 'CANCELLED',
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
