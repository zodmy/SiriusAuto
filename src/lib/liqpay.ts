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

  /**
   * Генерує HTML форму для оплати (аналог cnb_form з SDK)
   */
  generatePaymentForm(orderData: {
    orderId: number;
    amount: number;
    description: string;
    resultUrl: string;
    serverUrl: string;
    language?: string;
  }): string {
    const { data, signature } = this.generatePaymentData(orderData);

    const language = orderData.language || 'uk';

    return `
      <form method="post" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
        <input type="hidden" name="data" value="${data}" />
        <input type="hidden" name="signature" value="${signature}" />
        <input type="image" src="//static.liqpay.ua/buttons/p1${language}.radius.png" name="btn_text" />
      </form>
    `;
  }

  /**
   * Генерує URL для редиректу на LiqPay
   */
  generatePaymentUrl(orderData: {
    orderId: number;
    amount: number;
    description: string;
    resultUrl: string;
    serverUrl: string;
  }): string {
    const { data, signature } = this.generatePaymentData(orderData);

    const params = new URLSearchParams({
      data,
      signature,
    });

    return `https://www.liqpay.ua/api/3/checkout?${params.toString()}`;
  }

  /**
   * Отримує детальну інформацію про статус платежу
   */
  getPaymentStatusInfo(status: string): {
    isSuccess: boolean;
    isFailure: boolean;
    isPending: boolean;
    description: string;
  } {
    const statusMap: Record<string, { isSuccess: boolean; isFailure: boolean; isPending: boolean; description: string }> = {
      success: { isSuccess: true, isFailure: false, isPending: false, description: 'Платіж успішно завершено' },
      sandbox: { isSuccess: true, isFailure: false, isPending: false, description: 'Тестовий платіж успішно завершено' },
      failure: { isSuccess: false, isFailure: true, isPending: false, description: 'Платіж відхилено' },
      error: { isSuccess: false, isFailure: true, isPending: false, description: 'Помилка під час обробки платежу' },
      reversed: { isSuccess: false, isFailure: true, isPending: false, description: 'Платіж скасовано' },
      subscribed: { isSuccess: true, isFailure: false, isPending: false, description: 'Підписка активована' },
      unsubscribed: { isSuccess: false, isFailure: true, isPending: false, description: 'Підписка деактивована' },
      '3ds_verify': { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування 3D-Secure верифікації' },
      captcha_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування введення капчі' },
      cvv_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування введення CVV' },
      ivr_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування IVR верифікації' },
      otp_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування OTP верифікації' },
      password_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування введення пароля' },
      phone_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування верифікації телефону' },
      pin_verify: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування введення PIN' },
      processing: { isSuccess: false, isFailure: false, isPending: true, description: 'Платіж обробляється' },
      wait_qr: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування сканування QR-коду' },
      wait_sender: { isSuccess: false, isFailure: false, isPending: true, description: 'Очікування відправника' },
    };

    return statusMap[status] || { isSuccess: false, isFailure: true, isPending: false, description: 'Невідомий статус платежу' };
  }
}

export const liqPayService = new LiqPayService();
