'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiOutlineCog, HiOutlineTag, HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineLogout } from 'react-icons/hi';
import { LuCar } from 'react-icons/lu';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    document.title = 'Панель адміністратора - Sirius Auto';
  }, []);

  const handleLogout = async () => {
    try {
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
      document.cookie = 'adminToken=; Max-Age=0; path=/; SameSite=Lax';

      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        console.warn('API logout недоступний, але печиво видалено локально');
      }

      setTimeout(() => {
        router.push('/admin');
      }, 100);
    } catch (error) {
      console.error('Помилка виходу:', error);
      router.push('/admin');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100 p-4 flex items-center justify-center'>
        <div className='text-gray-600'>Завантаження...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <main className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200'>
        {' '}
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <span className='text-blue-700'>
              <HiOutlineCog className='inline-block mr-1' size={28} />
            </span>
            Адмінська панель
          </h2>
          <button onClick={handleLogout} className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 cursor-pointer h-fit'>
            <HiOutlineLogout size={20} />
            Вийти
          </button>
        </div>
        <div className='grid grid-cols-1 gap-4 mb-6'>
          {' '}
          <Link href='/admin/dashboard/manage/car-variations' className='flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer'>
            <LuCar size={22} /> Керування автомобілями
          </Link>
          <Link href='/admin/dashboard/manage/categories' className='flex items-center justify-center gap-2 bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 cursor-pointer'>
            <HiOutlineTag size={22} /> Керування категоріями
          </Link>{' '}
          <Link href='/admin/dashboard/manage/products' className='flex items-center justify-center gap-2 bg-pink-600 text-white p-4 rounded-lg shadow hover:bg-pink-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 cursor-pointer'>
            <HiOutlineCube size={22} /> Керування товарами
          </Link>
          <Link href='/admin/dashboard/manage/manufacturers' className='flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 cursor-pointer'>
            <HiOutlineOfficeBuilding size={22} /> Керування виробниками
          </Link>
        </div>
      </main>
    </div>
  );
}
