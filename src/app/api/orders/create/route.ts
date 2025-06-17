import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { OrderStatus } from '@prisma/client';

interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  deliveryInfo: {
    method: 'pickup' | 'novaposhta';
    novaPoshtaBranch?: string;
    novaPoshtaCity?: string;
  };
  deliveryPrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    let userId: number | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        userId = decoded.userId;
      } catch (error) {
        console.error('Помилка верифікації токена:', error);
      }
    }

    const body: CreateOrderRequest = await request.json();
    const { items, customerInfo, deliveryInfo, deliveryPrice } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 });
    }

    if (!customerInfo.firstName || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json({ error: 'Не всі обов\'язкові поля заповнені' }, { status: 400 });
    }

    if (deliveryInfo.method === 'novaposhta' && (!deliveryInfo.novaPoshtaCity || !deliveryInfo.novaPoshtaBranch)) {
      return NextResponse.json({ error: 'Для доставки Новою Поштою необхідно вказати місто та відділення' }, { status: 400 });
    }

    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stockQuantity: true, price: true }
    }); for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Товар з ID ${item.productId} не знайдено` }, { status: 400 });
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json({ error: `Недостатньо товару на складі для товару з ID ${item.productId}` }, { status: 400 });
      }
    }
    const totalPrice = items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? Number(product.price) * item.quantity : 0);
    }, 0);

    let order;
    if (userId) {
      order = await prisma.order.create({
        data: {
          userId: userId,
          totalPrice,
          status: OrderStatus.PENDING,
          customerFirstName: customerInfo.firstName,
          customerLastName: customerInfo.lastName,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          deliveryMethod: deliveryInfo.method,
          deliveryPrice: deliveryPrice || 0,
          novaPoshtaCity: deliveryInfo.novaPoshtaCity || null,
          novaPoshtaBranch: deliveryInfo.novaPoshtaBranch || null,
          orderItems: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: products.find(p => p.id === item.productId)?.price || item.price
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });

      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: 'Замовлення успішно створено'
      });
    } else {
      return NextResponse.json({ error: 'Необхідно авторизуватися для створення замовлення' }, { status: 401 });
    }

  } catch (error) {
    console.error('Помилка створення замовлення:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
