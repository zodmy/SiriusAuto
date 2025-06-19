'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import AdminAnalytics from '@/components/AdminAnalytics';

export default function AnalyticsPage() {
  const { isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    document.title = 'Аналітика - Sirius Auto';
  }, []);

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
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center space-x-4'>
            <Link href='/admin/dashboard' className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'>
              <HiOutlineArrowLeft size={20} />
              Назад до панелі
            </Link>
          </div>
        </div>
      </div>

      <AdminAnalytics />
    </div>
  );
}
