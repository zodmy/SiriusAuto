'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HiCheckCircle } from 'react-icons/hi';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || searchParams.get('order');
  const [paymentData, setPaymentData] = useState<{
    status: string;
    isPaid: boolean;
    isPending: boolean;
    isFailed: boolean;
    totalPrice?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);

  const checkPaymentStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsCheckingStatus(true);
      const response = await fetch(`/api/orders/${orderId}/payment-status`);
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);

        if (data.isFailed) {
          router.push(`/payment-error?order=${orderId}`);
          return;
        }
      } else if (response.status === 401) {
        setIsAuthError(true);
        setError('Необхідно авторизуватися для перевірки статусу замовлення');
      } else if (response.status === 403) {
        setIsAuthError(true);
        setError('У вас немає доступу до цього замовлення');
      } else {
        setError('Помилка перевірки статусу платежу');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError("Помилка з'єднання з сервером");
    } finally {
      setIsLoading(false);
      setIsCheckingStatus(false);
    }
  }, [orderId, router, setIsLoading, setIsCheckingStatus, setPaymentData, setError, setIsAuthError]);

  useEffect(() => {
    document.title = 'Статус оплати - Sirius Auto';
  }, []);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Перевіряємо статус через кілька секунд, щоб дати час callback обробитися
    const timer = setTimeout(() => {
      checkPaymentStatus();
    }, 2000);
    return () => clearTimeout(timer);
  }, [orderId, router, checkPaymentStatus]);
  if (isLoading) {
    return (
      <main className='container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='animate-pulse'>
              <div className='w-20 h-20 bg-blue-300 rounded-full mx-auto mb-6'></div>
              <div className='h-8 bg-gray-300 rounded mb-4 max-w-sm mx-auto'></div>
              <div className='h-4 bg-gray-300 rounded mb-8'></div>
            </div>
            <p className='text-lg text-gray-600'>Перевіряємо статус оплати...</p>
          </div>
        </div>
      </main>
    );
  }
  if (error || (paymentData && paymentData.isFailed)) {
    if (isAuthError) {
      // Показуємо повідомлення про авторизацію
      return (
        <main className='container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center'>
          <div className='max-w-2xl mx-auto text-center'>
            <div className='bg-white rounded-lg shadow-md p-8'>
              <div className='flex justify-center mb-6'>
                <HiCheckCircle className='w-20 h-20 text-blue-500' />
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>Необхідна авторизація</h1>
              <p className='text-lg text-gray-600 mb-6'>{error}</p>
              {orderId && (
                <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                  <p className='text-sm text-gray-600'>Номер замовлення:</p>
                  <p className='text-xl font-semibold text-gray-900'>#{orderId}</p>
                </div>
              )}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button onClick={() => router.push(`/login?redirect=/payment-status?order=${orderId}`)} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                  Увійти в акаунт
                </button>
                <button onClick={() => router.push('/register')} className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                  Зареєструватися
                </button>
                <button onClick={() => router.push('/')} className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                  Головна сторінка
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    } else {
      // Показуємо звичайну помилку оплати
      return (
        <main className='container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center'>
          <div className='max-w-2xl mx-auto text-center'>
            <div className='bg-white rounded-lg shadow-md p-8'>
              <div className='flex justify-center mb-6'>
                <HiCheckCircle className='w-20 h-20 text-red-500' />
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>Помилка оплати</h1>
              <p className='text-lg text-gray-600 mb-6'>{error || 'На жаль, сталася помилка при обробці платежу. Спробуйте ще раз або зверніться до служби підтримки.'}</p>
              {orderId && (
                <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                  <p className='text-sm text-gray-600'>Номер замовлення:</p>
                  <p className='text-xl font-semibold text-gray-900'>#{orderId}</p>
                </div>
              )}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button onClick={() => router.push('/profile')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                  Мої замовлення
                </button>
                <button onClick={() => router.push('/')} className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                  Продовжити покупки
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    }
  }
  if (paymentData && paymentData.isPending) {
    return (
      <main className='container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='flex justify-center mb-6'>
              <HiCheckCircle className='w-20 h-20 text-yellow-500' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>Оплата обробляється</h1>
            <p className='text-lg text-gray-600 mb-6'>Ваш платіж обробляється. Це може зайняти кілька хвилин. Ми надішлемо підтвердження на ваш email.</p>
            {orderId && (
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <p className='text-sm text-gray-600'>Номер замовлення:</p>
                <p className='text-xl font-semibold text-gray-900'>#{orderId}</p>
              </div>
            )}
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button onClick={checkPaymentStatus} disabled={isCheckingStatus} className='bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-md font-medium cursor-pointer disabled:cursor-not-allowed'>
                {isCheckingStatus ? 'Перевіряю...' : 'Перевірити статус'}
              </button>
              <button onClick={() => router.push('/profile')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                Мої замовлення
              </button>
              <button onClick={() => router.push('/')} className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
                Продовжити покупки
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className='container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='bg-white rounded-lg shadow-md p-8'>
          <div className='flex justify-center mb-6'>
            <HiCheckCircle className='w-20 h-20 text-green-500' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Оплата успішно завершена!</h1>
          <p className='text-lg text-gray-600 mb-6'>Дякуємо за ваше замовлення! Оплата пройшла успішно. Ми розпочнемо обробку вашого замовлення найближчим часом.</p>
          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-600'>Номер замовлення:</p>
              <p className='text-xl font-semibold text-gray-900'>#{orderId}</p>
            </div>
          )}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button onClick={() => router.push('/profile')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
              Мої замовлення
            </button>
            <button onClick={() => router.push('/')} className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
              Продовжити покупки
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      <Header />
      <div className='flex-grow'>
        {' '}
        <Suspense
          fallback={
            <main className='container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center'>
              <div className='max-w-2xl mx-auto text-center'>
                <div className='bg-white rounded-lg shadow-md p-8'>
                  <div className='animate-pulse'>
                    <div className='w-20 h-20 bg-gray-300 rounded-full mx-auto mb-6'></div>
                    <div className='h-8 bg-gray-300 rounded mb-4 max-w-sm mx-auto'></div>
                    <div className='h-4 bg-gray-300 rounded mb-8'></div>
                    <div className='h-12 bg-gray-300 rounded max-w-xs mx-auto'></div>
                  </div>
                </div>
              </div>
            </main>
          }
        >
          <PaymentStatusContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
