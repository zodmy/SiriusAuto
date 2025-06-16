'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HiCheckCircle } from 'react-icons/hi';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    document.title = 'Замовлення оформлено - Sirius Auto';
  }, []);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
    }
  }, [orderId, router]);

  return (
    <main className='container mx-auto px-4 py-16'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='bg-white rounded-lg shadow-md p-8'>
          <div className='flex justify-center mb-6'>
            <HiCheckCircle className='w-20 h-20 text-green-500' />
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Замовлення успішно оформлено!</h1>

          <p className='text-lg text-gray-600 mb-6'>Дякуємо за ваше замовлення. Ми зв&apos;яжемося з вами найближчим часом для підтвердження деталей.</p>

          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-600'>Номер замовлення:</p>
              <p className='text-xl font-semibold text-gray-900'>#{orderId}</p>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button onClick={() => router.push('/products')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
              Продовжити покупки
            </button>

            <button onClick={() => router.push('/profile')} className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
              Мої замовлення
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <Suspense
        fallback={
          <main className='container mx-auto px-4 py-16'>
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
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
