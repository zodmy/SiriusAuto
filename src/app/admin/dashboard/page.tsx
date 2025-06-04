import Link from 'next/link';
import { checkAdmin } from '@/lib/auth';
import { HiOutlineCog, HiOutlineFolder } from 'react-icons/hi';
import { AiOutlineShoppingCart } from 'react-icons/ai';

export default async function AdminDashboard() {
  await checkAdmin({ redirectOnFail: true });
  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <main className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200'>
        <h2 className='text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2'>
          <span className='text-blue-700'>
            <HiOutlineCog className='inline-block mr-1' size={28} />
          </span>
          Адмінська панель
        </h2>{' '}
        <div className='grid grid-cols-1 gap-4 mb-6'>
          <Link href='/admin/dashboard/manage/car-variations' className='flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'>
            <HiOutlineCog size={22} /> Керування автомобілями
          </Link>
          <Link href='/admin/dashboard/manage/categories' className='flex items-center justify-center gap-2 bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2'>
            <HiOutlineFolder size={22} /> Керування категоріями
          </Link>
          <Link href='/admin/dashboard/manage/products' className='flex items-center justify-center gap-2 bg-pink-600 text-white p-4 rounded-lg shadow hover:bg-pink-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2'>
            <AiOutlineShoppingCart size={22} /> Керування товарами
          </Link>
        </div>
      </main>
    </div>
  );
}
