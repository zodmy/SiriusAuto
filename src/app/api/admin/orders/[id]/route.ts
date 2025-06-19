import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

const normalizePhoneNumber = (phone: string) => {
  return phone.replace(/[^\d+]/g, '');
};

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
    const { id } = params;
    const orderId = parseInt(id);
    const requestData = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID замовлення є обов\'язковим' },
        { status: 400 }
      );
    }
    const updateData: Record<string, string | OrderStatus | null> = {};

    if (requestData.status !== undefined) {
      if (!Object.values(OrderStatus).includes(requestData.status)) {
        return NextResponse.json(
          { error: 'Недійсний статус замовлення' },
          { status: 400 }
        );
      }
      updateData.status = requestData.status;
    }
    if (requestData.trackingNumber !== undefined) {
      updateData.trackingNumber = requestData.trackingNumber;
    }
    if (requestData.customerFirstName !== undefined) updateData.customerFirstName = requestData.customerFirstName;
    if (requestData.customerLastName !== undefined) updateData.customerLastName = requestData.customerLastName;
    if (requestData.customerEmail !== undefined) updateData.customerEmail = requestData.customerEmail;
    if (requestData.customerPhone !== undefined) updateData.customerPhone = normalizePhoneNumber(requestData.customerPhone);
    if (requestData.deliveryMethod !== undefined) updateData.deliveryMethod = requestData.deliveryMethod;
    if (requestData.novaPoshtaCity !== undefined) updateData.novaPoshtaCity = requestData.novaPoshtaCity;
    if (requestData.novaPoshtaBranch !== undefined) updateData.novaPoshtaBranch = requestData.novaPoshtaBranch;
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
