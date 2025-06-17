import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не знайдено' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderDate: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Недійсний токен' },
      { status: 401 }
    );
  }
}
