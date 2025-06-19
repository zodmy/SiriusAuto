import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED'
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    const reviewableOrders = [];

    for (const order of orders) {
      const reviewableItems = []; for (const item of order.orderItems) {
        const existingReview = await prisma.review.findUnique({
          where: {
            productId_userId: {
              productId: item.productId,
              userId: user.id
            }
          }
        });

        if (!existingReview) {
          reviewableItems.push(item);
        }
      }

      if (reviewableItems.length > 0) {
        reviewableOrders.push({
          ...order,
          orderItems: reviewableItems
        });
      }
    }

    return NextResponse.json(reviewableOrders);
  } catch (error) {
    console.error('Error fetching reviewable orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
