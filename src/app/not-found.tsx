'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HiHome, HiSearch, HiArrowLeft } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <main className='flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <div className='bg-white rounded-lg shadow-sm p-8'>
            <div className='w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <FaCar className='w-12 h-12 text-white' />
            </div>

            <h1 className='text-6xl font-bold text-gray-900 mb-4'>404</h1>

            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Сторінку не знайдено</h2>

            <p className='text-gray-600 mb-8 leading-relaxed'>На жаль, сторінка, яку ви шукаете, не існує або була переміщена. Можливо, ви перейшли за застарілим посиланням або ввели неправильну адресу.</p>

            <div className='space-y-4'>
              <Link href='/' className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-300 flex items-center justify-center gap-2'>
                <HiHome className='w-5 h-5' />
                Повернутися на головну
              </Link>
              <Link href='/products' className='w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors duration-300 flex items-center justify-center gap-2'>
                <HiSearch className='w-5 h-5' />
                Переглянути каталог
              </Link>{' '}
              <button onClick={() => window.history.back()} className='w-full text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer'>
                <HiArrowLeft className='w-5 h-5' />
                Повернутися назад
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
