'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiriusAutoLogoDynamic from '@/components/SiriusAutoLogoDynamic';
import '../admin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          router.push('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.log('Помилка перевірки авторизації:', error);
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className='h-[100svh] flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <SiriusAutoLogoDynamic textColor='#374151' iconColor='#1c5eae' width={180} height={60} className='max-w-full h-auto mb-4' />
          <p className='text-gray-600'>Завантаження...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Помилка входу');
      } else {
        const data = await res.json();
        if (data.success) {
          router.push('/admin/dashboard');
        } else {
          setError(data.message || 'Помилка входу');
        }
      }
    } catch (err) {
      setError('Серверна помилка');
      console.error('Помилка логіну:', err);
    }
  };
  return (
    <div className='h-[100svh] flex items-center justify-center bg-gray-100 px-4'>
      <div className='flex flex-col items-center max-w-md w-full'>
        <div className='mb-6'>
          <SiriusAutoLogoDynamic textColor='#374151' iconColor='#1c5eae' width={180} height={60} className='max-w-full h-auto' />
        </div>
        <form onSubmit={handleLogin} className='bg-white p-5 sm:p-8 rounded-lg shadow-md w-full'>
          <h1 className='text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-center text-gray-700'>Вхід до адмінської панелі</h1>
          <div className='mb-3 sm:mb-4'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Пароль адміністратора
            </label>
            <input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Введіть ваш пароль' className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1c5eae] focus:border-[#1c5eae] sm:text-sm text-gray-900' autoFocus />
          </div>
          {error && <p className='mb-3 text-sm text-red-600 text-center'>{error}</p>}
          <button type='submit' className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1c5eae] hover:bg-[#174b8f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c5eae]'>
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
}
