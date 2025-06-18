'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HiExclamationCircle } from 'react-icons/hi';

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order');

  useEffect(() => {
    document.title = 'Помилка оплати - Sirius Auto';
  }, []);

  return (
    <main className='container mx-auto px-4 py-16'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='bg-white rounded-lg shadow-md p-8'>
          <div className='flex justify-center mb-6'>
            <HiExclamationCircle className='w-20 h-20 text-red-500' />
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Помилка оплати</h1>

          <p className='text-lg text-gray-600 mb-6'>На жаль, під час обробки вашого платежу сталася помилка. Замовлення не було оплачено.</p>

          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-600'>Номер замовлення:</p>
              <p className='text-xl font-semibold text-gray-900'>#{orderId}</p>
            </div>
          )}

          <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'>
            <div className='flex'>
              <div className='ml-3'>
                <p className='text-sm text-yellow-700'>
                  <strong>Що робити далі?</strong>
                </p>
                <ul className='text-sm text-yellow-600 mt-2 list-disc list-inside'>
                  <li>Перевірте дані вашої банківської карти</li>
                  <li>Переконайтеся, що на рахунку достатньо коштів</li>
                  <li>Спробуйте здійснити оплату пізніше</li>
                  <li>Зв&apos;яжіться з нашою службою підтримки для допомоги</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => {
                if (orderId) {
                  // Спробувати оплатити знову
                  fetch(`/api/orders/${orderId}/checkout`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })
                    .then(async (response) => {
                      if (response.ok) {
                        const paymentData = await response.json();

                        // Створюємо форму для автоматичного перенаправлення на LiqPay
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
                        alert('Помилка створення платежу. Спробуйте пізніше.');
                      }
                    })
                    .catch(() => {
                      alert("Помилка з'єднання. Спробуйте пізніше.");
                    });
                }
              }}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'
              disabled={!orderId}
            >
              Спробувати оплатити знову{' '}
            </button>

            <button onClick={() => router.push('/')} className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium cursor-pointer'>
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

export default function PaymentErrorPage() {
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
        <PaymentErrorContent />
      </Suspense>
      <Footer />
    </div>
  );
}
