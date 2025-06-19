import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import LiqPay from 'liqpay-sdk-nodejs';
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
    }// Отримуємо домен для URL-ів
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const liqpay = new LiqPay(process.env.LIQPAY_PUBLIC_KEY!, process.env.LIQPAY_PRIVATE_KEY!);
    const formHtml = liqpay.cnb_form({
      action: 'pay',
      amount: parseFloat(order.totalPrice.toString()),
      currency: 'UAH',
      description: `Оплата за замовлення №${order.id}`,
      order_id: order.id.toString(),
      version: '3',
      result_url: `${baseUrl}/payment-status?order=${order.id}`,
      server_url: `${baseUrl}/api/liqpay-callback`,
      language: 'uk',
      sandbox: 1,
    });

    const dataMatch = formHtml.match(/name="data" value="([^"]+)"/);
    const signatureMatch = formHtml.match(/name="signature" value="([^"]+)"/);

    if (!dataMatch || !signatureMatch) {
      console.error("Could not parse data/signature from LiqPay HTML form", formHtml);
      return NextResponse.json(
        { error: 'Не вдалося згенерувати дані для оплати' },
        { status: 500 }
      );
    }

    const paymentData = {
      data: dataMatch[1],
      signature: signatureMatch[1],
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Order checkout error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
