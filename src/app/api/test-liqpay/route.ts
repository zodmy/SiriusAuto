import { NextResponse } from 'next/server';
import { liqPayService } from '@/lib/liqpay';

export async function GET() {
  try {
    // Тестуємо ініціалізацію сервісу LiqPay
    const testData = {
      orderId: 12345,
      amount: 100,
      description: 'Тестовий платіж',
      resultUrl: 'http://localhost:3000/payment-success?order=12345',
      serverUrl: 'http://localhost:3000/api/liqpay-callback',
    };

    const paymentData = liqPayService.generatePaymentData(testData);

    return NextResponse.json({
      success: true,
      message: 'LiqPay сервіс працює правильно',
      testData: {
        hasData: !!paymentData.data,
        hasSignature: !!paymentData.signature,
        dataLength: paymentData.data.length,
        signatureLength: paymentData.signature.length,
      },
      environment: {
        hasPublicKey: !!process.env.LIQPAY_PUBLIC_KEY,
        hasPrivateKey: !!process.env.LIQPAY_PRIVATE_KEY,
        publicKeyLength: process.env.LIQPAY_PUBLIC_KEY?.length || 0,
        privateKeyLength: process.env.LIQPAY_PRIVATE_KEY?.length || 0,
      }
    });

  } catch (error) {
    console.error('LiqPay test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка',
    }, { status: 500 });
  }
}
