import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const { productId, orderId, rating, comment } = await request.json();

    if (!productId || !orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        status: 'COMPLETED'
      },
      include: {
        orderItems: {
          where: {
            productId: productId
          }
        }
      }
    });

    if (!order || order.orderItems.length === 0) {
      return NextResponse.json({
        error: 'Order not found or product not in order'
      }, { status: 404 });
    }
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: productId,
          userId: user.id
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({
        error: 'Ви вже залишили відгук на цей товар'
      }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        productId: productId,
        userId: user.id,
        orderId: orderId,
        rating: rating,
        comment: comment || null
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        product: {
          select: {
            name: true
          }
        }
      }
    });

    const avgRating = await prisma.review.aggregate({
      where: {
        productId: productId
      },
      _avg: {
        rating: true
      }
    });

    await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        averageRating: avgRating._avg.rating
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
