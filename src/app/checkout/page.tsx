'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { HiTrash, HiMinus, HiPlus } from 'react-icons/hi';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  method: 'pickup' | 'novaposhta';
  novaPoshtaCity?: string;
  novaPoshtaBranch?: string;
}

interface PaymentInfo {
  method: 'CASH' | 'CARD';
}

const DELIVERY_METHODS = {
  pickup: {
    name: 'Самовивіз з магазину',
    price: 0,
    description: 'м. Харків, вул. Полтавський Шлях, 115',
  },
  novaposhta: {
    name: 'Доставка Новою Поштою',
    price: 'За тарифами перевізника',
    description: 'Доставка у відділення або поштомат',
    delivery: '2-4 дні',
  },
};

const PAYMENT_METHODS = {
  CASH: {
    name: 'Готівкою при отриманні',
    description: 'Оплата готівкою при отриманні замовлення',
    icon: '💵',
  },
  CARD: {
    name: 'Карткою онлайн',
    description: 'Оплата карткою через LiqPay',
    icon: '💳',
  },
};

export default function CheckoutPage() {
  const { items, removeItem, getTotalPrice, clearCart, increaseQuantity, decreaseQuantity } = useCart();

  const { user, isAuthenticated, isInitialCheckComplete } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    novaPoshtaCity: false,
    novaPoshtaBranch: false,
  });

  const normalizePhoneNumber = (phone: string) => {
    return phone.replace(/[^\d+]/g, '');
  };

  useEffect(() => {
    document.title = 'Оформлення замовлення - Sirius Auto';
  }, []);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+38 (0__) ___-__-__',
  });
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    method: 'pickup',
    novaPoshtaBranch: '',
    novaPoshtaCity: '',
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'CARD',
  });

  useEffect(() => {
    if (isInitialCheckComplete && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isInitialCheckComplete, isAuthenticated, router]);

  useEffect(() => {
    if (user && isAuthenticated) {
      setCustomerInfo((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [user, isAuthenticated]);

  if (!isInitialCheckComplete) {
    return (
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <Header />
        <main className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Завантаження...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isInitialCheckComplete && !isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <Header />
        <main className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Перенаправлення на авторизацію...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      setError('Кошик порожній');
      return;
    }
    const errors = {
      firstName: !customerInfo.firstName,
      lastName: !customerInfo.lastName,
      email: !customerInfo.email,
      phone: !customerInfo.phone || customerInfo.phone.includes('_'),
      novaPoshtaCity: deliveryInfo.method === 'novaposhta' && !deliveryInfo.novaPoshtaCity,
      novaPoshtaBranch: deliveryInfo.method === 'novaposhta' && !deliveryInfo.novaPoshtaBranch,
    };

    setFieldErrors(errors);

    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      setError("Будь ласка, заповніть усі обов'язкові поля");
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const normalizedCustomerInfo = {
        ...customerInfo,
        phone: normalizePhoneNumber(customerInfo.phone),
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo: normalizedCustomerInfo,
          deliveryInfo,
          paymentMethod: paymentInfo.method,
        }),
      });

      const data = await response.json();      if (response.ok) {
        const orderId = data.orderId;

        clearCart();
        if (paymentInfo.method === 'CASH') {
          router.push(`/order-success?orderId=${orderId}`);
        } else {
          const checkoutResponse = await fetch(`/api/orders/${orderId}/checkout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (checkoutResponse.ok) {
            const paymentData = await checkoutResponse.json();

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://www.liqpay.ua/api/3/checkout';
            form.style.display = 'none';

            const dataInput = document.createElement('input');
            dataInput.type = 'hidden';
            dataInput.name = 'data';
            dataInput.value = paymentData.data;
            form.appendChild(dataInput);

            const signatureInput = document.createElement('input');
            signatureInput.type = 'hidden';
            signatureInput.name = 'signature';
            signatureInput.value = paymentData.signature;
            form.appendChild(signatureInput);

            document.body.appendChild(form);
            form.submit();
          } else {
            const checkoutError = await checkoutResponse.json();
            setError(checkoutError.error || 'Помилка створення платежу');
          }
        }
      } else {
        setError(data.error || 'Помилка створення замовлення');
      }
    } catch (error) {
      console.error('Помилка:', error);
      setError("Помилка з'єднання із сервером");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;

    const allowedChars = /[0-9+() -]/;
    const char = value[cursorPosition - 1];

    if (char && !allowedChars.test(char)) {
      return;
    }

    const template = '+38 (0__) ___-__-__';
    const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];

    let newValue = template;
    const digits = value.replace(/[^0-9]/g, '').slice(0, 9);
    for (let i = 0; i < digits.length; i++) {
      if (digitPositions[i] !== undefined) {
        newValue = newValue.substring(0, digitPositions[i]) + digits[i] + newValue.substring(digitPositions[i] + 1);
      }
    }

    setCustomerInfo((prev) => ({ ...prev, phone: newValue }));
    setFieldErrors((prev) => ({ ...prev, phone: false }));
    requestAnimationFrame(() => {
      const nextDigitPosition = digitPositions.find((pos) => pos > cursorPosition);
      if (nextDigitPosition !== undefined && digits.length > 0) {
        input.setSelectionRange(nextDigitPosition, nextDigitPosition);
      }
    });
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];

    if (e.key === 'Backspace') {
      e.preventDefault();
      const prevDigitPosition = digitPositions
        .slice()
        .reverse()
        .find((pos) => pos < cursorPosition);
      if (prevDigitPosition !== undefined) {
        const newValue = input.value.substring(0, prevDigitPosition) + '_' + input.value.substring(prevDigitPosition + 1);
        setCustomerInfo((prev) => ({ ...prev, phone: newValue }));
        setFieldErrors((prev) => ({ ...prev, phone: false }));

        requestAnimationFrame(() => {
          input.setSelectionRange(prevDigitPosition, prevDigitPosition);
        });
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const currentDigitPosition = digitPositions.find((pos) => pos >= cursorPosition);
      if (currentDigitPosition !== undefined) {
        const newValue = input.value.substring(0, currentDigitPosition) + '_' + input.value.substring(currentDigitPosition + 1);
        setCustomerInfo((prev) => ({ ...prev, phone: newValue }));
        setFieldErrors((prev) => ({ ...prev, phone: false }));
      }
    } else if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();

      const nextDigitPosition = digitPositions.find((pos) => pos >= cursorPosition && input.value[pos] === '_');
      if (nextDigitPosition !== undefined) {
        const newValue = input.value.substring(0, nextDigitPosition) + e.key + input.value.substring(nextDigitPosition + 1);
        setCustomerInfo((prev) => ({ ...prev, phone: newValue }));
        setFieldErrors((prev) => ({ ...prev, phone: false }));
        requestAnimationFrame(() => {
          const nextEmptyPosition = digitPositions.find((pos) => pos > nextDigitPosition && newValue[pos] === '_');
          const targetPosition = nextEmptyPosition !== undefined ? nextEmptyPosition : nextDigitPosition + 1;
          input.setSelectionRange(targetPosition, targetPosition);
        });
      }
    } else if (!['ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
    }
  };
  const handlePhoneClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];
    const firstEmptyPosition = digitPositions.find((pos) => input.value[pos] === '_');

    if (firstEmptyPosition !== undefined) {
      requestAnimationFrame(() => {
        input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
      });
    }
  };
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: false }));
  };
  const getFieldClassName = (hasError: boolean) => {
    const baseClasses = 'w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2';
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-red-500 bg-red-50`;
    }
    return `${baseClasses} border-gray-300 focus:ring-blue-500`;
  };

  if (items.length === 0) {
    return (
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <Header />
        <main className='flex-1 flex items-center justify-center'>
          <div className='max-w-2xl mx-auto text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>Кошик порожній</h1>
            <p className='text-gray-600 mb-8'>Додайте товари до кошика для оформлення замовлення</p>{' '}
            <button onClick={() => router.push('/')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md cursor-pointer'>
              Перейти до товарів
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      <Header />
      <main className='flex-1 container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>Оформлення замовлення</h1>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-semibold mb-6'>Контактна інформація</h2>

              {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{error}</div>}

              <form onSubmit={handleSubmit} className='space-y-4'>
                {' '}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Ім&apos;я *</label>
                    <input type='text' value={customerInfo.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={getFieldClassName(fieldErrors.firstName)} />
                  </div>{' '}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Прізвище *</label>
                    <input type='text' value={customerInfo.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={getFieldClassName(fieldErrors.lastName)} />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                  <input type='email' value={customerInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} className={getFieldClassName(fieldErrors.email)} />
                </div>{' '}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Телефон *</label> <input type='tel' value={customerInfo.phone} onChange={handlePhoneChange} onKeyDown={handlePhoneKeyDown} onClick={handlePhoneClick} className={getFieldClassName(fieldErrors.phone)} />{' '}
                </div>
                <div className='border-t pt-6 mt-6'>
                  <h3 className='text-lg font-semibold mb-4'>Спосіб оплати</h3>
                  <div className='space-y-3'>
                    {Object.entries(PAYMENT_METHODS).map(([method, info]) => (
                      <div key={method} className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                        <label className='flex items-center cursor-pointer'>
                          <input type='radio' name='paymentMethod' value={method} checked={paymentInfo.method === method} onChange={(e) => setPaymentInfo((prev) => ({ ...prev, method: e.target.value as 'CASH' | 'CARD' }))} className='mr-3' />
                          <div className='flex-1'>
                            <div className='flex items-center'>
                              <span className='text-2xl mr-3'>{info.icon}</span>
                              <div>
                                <span className='font-medium'>{info.name}</span>
                                <p className='text-sm text-gray-600 mt-1'>{info.description}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='border-t pt-6 mt-6'>
                  <h3 className='text-lg font-semibold mb-4'>Спосіб доставки</h3>{' '}
                  <div className='space-y-3'>
                    {Object.entries(DELIVERY_METHODS).map(([method, info]) => (
                      <div key={method} className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                        <label className='flex items-center cursor-pointer'>
                          <input type='radio' name='deliveryMethod' value={method} checked={deliveryInfo.method === method} onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, method: e.target.value as 'pickup' | 'novaposhta' }))} className='mr-3' />
                          <div className='flex-1'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <span className='font-medium'>{info.name}</span>
                                <p className='text-sm text-gray-600 mt-1'>{info.description}</p>
                              </div>{' '}
                              <div className='text-right ml-4'>
                                <span className='font-semibold text-blue-600'>{info.price === 0 ? 'Безкоштовно' : info.price}</span>
                                {'delivery' in info && <p className='text-xs text-gray-500'>{info.delivery}</p>}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>{' '}
                  {deliveryInfo.method === 'novaposhta' && (
                    <div className='mt-4 p-4 bg-blue-50 rounded-lg'>
                      <div className='space-y-4'>
                        {' '}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Місто доставки *</label>
                          <input
                            type='text'
                            value={deliveryInfo.novaPoshtaCity || ''}
                            onChange={(e) => {
                              setDeliveryInfo((prev) => ({ ...prev, novaPoshtaCity: e.target.value }));
                              setFieldErrors((prev) => ({ ...prev, novaPoshtaCity: false }));
                            }}
                            className={getFieldClassName(fieldErrors.novaPoshtaCity)}
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Номер відділення або поштомату *</label>
                          <input
                            type='text'
                            value={deliveryInfo.novaPoshtaBranch || ''}
                            onChange={(e) => {
                              setDeliveryInfo((prev) => ({ ...prev, novaPoshtaBranch: e.target.value }));
                              setFieldErrors((prev) => ({ ...prev, novaPoshtaBranch: false }));
                            }}
                            className={getFieldClassName(fieldErrors.novaPoshtaBranch)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>{' '}
                <button type='submit' disabled={isSubmitting} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-md font-medium cursor-pointer disabled:cursor-not-allowed'>
                  {' '}
                  {isSubmitting ? (paymentInfo.method === 'CASH' ? 'Оформлення замовлення...' : 'Перенаправлення на оплату...') : paymentInfo.method === 'CASH' ? 'Оформити замовлення' : 'Оплатити замовлення'}
                </button>
              </form>
            </div>{' '}
            <div className='bg-white rounded-lg shadow-md p-6 flex flex-col max-h-[70vh] min-h-[500px]'>
              <h2 className='text-xl font-semibold mb-6 flex-shrink-0'>Ваше замовлення</h2>
              <div className='flex-1 overflow-y-auto mb-4 pr-2 checkout-scroll'>
                <div className='space-y-4'>
                  {items.map((item) => (
                    <div key={item.id} className='flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg'>
                      {item.image && (
                        <div className='flex-shrink-0 w-16 h-16 relative'>
                          <Image src={item.image} alt={item.name} fill className='object-contain rounded-md' />
                        </div>
                      )}{' '}
                      <div className='flex-1 min-w-0'>
                        <Link href={`/products/${item.id}`} className='block'>
                          <h3 className='font-medium text-gray-900 mb-1 break-words hover:text-blue-600 transition-colors cursor-pointer'>{item.name}</h3>
                        </Link>
                        <p className='text-sm text-gray-600'>₴{Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className='flex items-center justify-between sm:justify-start gap-4'>
                        <div className='flex items-center gap-2'>
                          <button onClick={() => decreaseQuantity(item.id)} className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer'>
                            <HiMinus className='w-4 h-4' />
                          </button>

                          <span className='w-8 text-center font-medium'>{item.quantity}</span>

                          <button onClick={() => increaseQuantity(item.id)} className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer' disabled={!!(item.stockQuantity && item.quantity >= item.stockQuantity)}>
                            <HiPlus className='w-4 h-4' />
                          </button>

                          <button onClick={() => removeItem(item.id)} className='ml-2 text-red-500 hover:text-red-700 cursor-pointer'>
                            <HiTrash className='w-5 h-5' />
                          </button>
                        </div>

                        <div className='text-right'>
                          <p className='font-medium'>₴{(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>{' '}
              <div className='border-t pt-4 flex-shrink-0'>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center text-lg font-semibold'>
                    <span>Загальна сума:</span>
                    <span>₴{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
