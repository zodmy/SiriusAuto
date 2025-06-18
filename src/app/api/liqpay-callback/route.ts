import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { liqPayService } from '@/lib/liqpay';
import { OrderStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  console.log('=== LiqPay callback received ===');
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    console.log('Callback data received:', {
      hasData: !!data,
      hasSignature: !!signature,
      dataLength: data?.length || 0
    });

    if (!data || !signature) {
      console.error('LiqPay callback: Missing data or signature');
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові параметри' },
        { status: 400 }
      );    }

    if (!liqPayService.verifySignature(data, signature)) {
      console.error('LiqPay callback: Invalid signature');
      return NextResponse.json(
        { error: 'Недійсний підпис' },
        { status: 400 }
      );
    }

    const callbackData = liqPayService.decodeCallbackData(data);
    console.log('Decoded callback data:', callbackData);

    if (!callbackData) {
      console.error('LiqPay callback: Failed to decode data');
      return NextResponse.json(
        { error: 'Помилка декодування даних' },
        { status: 400 }
      );
    }

    const orderId = parseInt(callbackData.order_id as string);
    const paymentStatus = callbackData.status as string;
    const paymentId = callbackData.payment_id as string;
    const amount = callbackData.amount as number;

    console.log('LiqPay callback received:', {
      orderId,
      paymentStatus,
      paymentId,
      amount,
    });

    if (isNaN(orderId)) {
      console.error('LiqPay callback: Invalid order ID');
      return NextResponse.json(
        { error: 'Недійсний ID замовлення' },
        { status: 400 }
      );    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`LiqPay callback: Order ${orderId} not found`);
      return NextResponse.json(
        { error: 'Замовлення не знайдено' },
        { status: 404 }
      );
    }

    const orderAmount = parseFloat(order.totalPrice.toString());
    if (Math.abs(orderAmount - amount) > 0.01) {
      console.error(`LiqPay callback: Amount mismatch for order ${orderId}. Expected: ${orderAmount}, Got: ${amount}`);
      return NextResponse.json(
        { error: 'Сума оплати не відповідає замовленню' },
        { status: 400 }
      );    }

    if (liqPayService.isSuccessfulPayment(paymentStatus)) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          updatedAt: new Date(),
        },
      });

      console.log(`Order ${orderId} marked as PAID (payment ${paymentId})`);
    } else {
      console.log(`Payment for order ${orderId} failed with status: ${paymentStatus}`);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('LiqPay callback error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
