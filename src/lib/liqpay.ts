import crypto from 'crypto';

export interface LiqPayFormData {
  public_key: string;
  version: number;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url: string;
  server_url: string;
  sandbox?: number;
}

export interface LiqPayResponse {
  data: string;
  signature: string;
}

export class LiqPayService {
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.publicKey = process.env.LIQPAY_PUBLIC_KEY!;
    this.privateKey = process.env.LIQPAY_PRIVATE_KEY!;

    if (!this.publicKey || !this.privateKey) {
      throw new Error('LiqPay keys are not configured in environment variables');
    }
  }
  /**
   * Генерує дані для форми оплати LiqPay
   */
  generatePaymentData(orderData: {
    orderId: number;
    amount: number;
    description: string;
    resultUrl: string;
    serverUrl: string;
  }): LiqPayResponse {
    const formData: LiqPayFormData = {
      public_key: this.publicKey,
      version: 3,
      action: 'pay',
      amount: orderData.amount,
      currency: 'UAH',
      description: orderData.description,
      order_id: orderData.orderId.toString(),
      result_url: orderData.resultUrl,
      server_url: orderData.serverUrl,
    };

    if (this.publicKey.startsWith('sandbox_')) {
      formData.sandbox = 1;
    }

    const data = Buffer.from(JSON.stringify(formData)).toString('base64');
    const signature = this.generateSignature(data);

    return { data, signature };
  }

  /**
   * Генерує підпис для LiqPay
   */
  private generateSignature(data: string): string {
    const signString = this.privateKey + data + this.privateKey;
    return crypto.createHash('sha1').update(signString).digest('base64');
  }

  /**
   * Перевіряє підпис від LiqPay callback
   */
  verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data);
    return expectedSignature === signature;
  }
  /**
   * Декодує дані з LiqPay callback
   */
  decodeCallbackData(data: string): Record<string, unknown> | null {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      return JSON.parse(decodedData) as Record<string, unknown>;
    } catch (error) {
      console.error('Error decoding LiqPay callback data:', error);
      return null;
    }
  }

  /**
   * Перевіряє чи є статус успішним
   */
  isSuccessfulPayment(status: string): boolean {
    return status === 'success' || status === 'sandbox';
  }

  /**
   * Перевіряє статус платежу через API LiqPay
   */
  async checkPaymentStatus(orderId: string): Promise<{ status: string; err_code?: string; err_description?: string } | null> {
    try {
      const requestData = {
        public_key: this.publicKey,
        version: 3,
        action: 'status',
        order_id: orderId,
      };

      const data = Buffer.from(JSON.stringify(requestData)).toString('base64');
      const signature = this.generateSignature(data);

      const response = await fetch('https://www.liqpay.ua/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`,
      });

      if (!response.ok) {
        console.error('LiqPay API error:', response.status, response.statusText);
        return null;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }
}

export const liqPayService = new LiqPayService();
