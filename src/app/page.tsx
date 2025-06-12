import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiriusAutoLogoDynamic from '@/components/SiriusAutoLogoDynamic';

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow'>
        <section className='bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <div className='mb-8'>
                <SiriusAutoLogoDynamic textColor='#FFFFFF' iconColor='#1c5eae' width={300} height={100} className='mx-auto' />
              </div>
              <h1 className='text-4xl md:text-6xl font-bold mb-6'>Автозапчастини для вашого авто</h1>
              <p className='text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto'>Широкий асортимент якісних запчастин для різних марок автомобілів за найкращими цінами</p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link href='/products' className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg'>
                  Каталог товарів
                </Link>
                <Link href='/about' className='bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg'>
                  Про нас
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className='py-16 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Чому обирають нас?</h2>
              <p className='text-lg text-gray-600 max-w-2xl mx-auto'>Ми пропонуємо найкращий сервіс та якісні автозапчастини для вашого комфорту</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center p-6'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>Гарантія якості</h3>
                <p className='text-gray-600'>Всі запчастини проходять ретельну перевірку та мають офіційну гарантію</p>
              </div>

              <div className='text-center p-6'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>Швидка доставка</h3>
                <p className='text-gray-600'>Доставляємо замовлення по всій Україні протягом 1-3 робочих днів</p>
              </div>

              <div className='text-center p-6'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>Підтримка 24/7</h3>
                <p className='text-gray-600'>Наші фахівці готові допомогти вам у виборі запчастин цілодобово</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
