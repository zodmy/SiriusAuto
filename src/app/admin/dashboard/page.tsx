'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiOutlineCog, HiOutlineTag, HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineLogout } from 'react-icons/hi';
import { LuCar } from 'react-icons/lu';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (!response.ok) {
          router.push('/admin');
          return;
        }
        const data = await response.json();
        if (!data.isAdmin) {
          router.push('/admin');
          return;
        }
        setIsLoading(false);
      } catch {
        router.push('/admin');
      }
    };
    verifyAdmin();
  }, [router]);
  const handleLogout = async () => {
    try {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
      document.cookie = 'token=; Max-Age=0; path=/; SameSite=Lax';

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
          <Link href='/admin/dashboard/manage/car-variations' className='flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'>
            <LuCar size={22} /> Керування автомобілями
          </Link>
          <Link href='/admin/dashboard/manage/categories' className='flex items-center justify-center gap-2 bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2'>
            <HiOutlineTag size={22} /> Керування категоріями
          </Link>{' '}
          <Link href='/admin/dashboard/manage/products' className='flex items-center justify-center gap-2 bg-pink-600 text-white p-4 rounded-lg shadow hover:bg-pink-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2'>
            <HiOutlineCube size={22} /> Керування товарами
          </Link>
          <Link href='/admin/dashboard/manage/manufacturers' className='flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition-colors text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'>
            <HiOutlineOfficeBuilding size={22} /> Керування виробниками
          </Link>
        </div>
      </main>
    </div>
  );
}
