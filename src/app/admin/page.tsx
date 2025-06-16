'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiriusAutoLogoDynamic from '@/components/SiriusAutoLogoDynamic';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Адміністратор - Sirius Auto';
  }, []);

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

    const originalOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    const originalMinHeight = document.body.style.minHeight;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    if (window.innerWidth <= 640) {
      document.body.style.minHeight = '-webkit-fill-available';
    }

    checkAuth();

    return () => {
      document.documentElement.style.overflow = originalOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.height = originalHeight;
      document.body.style.height = originalBodyHeight;
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
      document.body.style.minHeight = originalMinHeight;
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className='h-[100svh] flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <SiriusAutoLogoDynamic textColor='#1c5eae' iconColor='#1c5eae' width={180} height={60} className='max-w-full h-auto mb-4' />
          <p className='text-gray-700'>Завантаження...</p>
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
          <SiriusAutoLogoDynamic textColor='#1c5eae' iconColor='#1c5eae' width={180} height={60} className='max-w-full h-auto' />
        </div>
        <form onSubmit={handleLogin} className='bg-white p-6 rounded-xl shadow-lg w-full border border-gray-200'>
          <h1 className='text-2xl font-bold mb-4 text-center text-gray-900'>Вхід до адмінської панелі</h1>
          <div className='mb-4'>
            <input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Введіть ваш пароль' className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white' autoFocus />
          </div>
          {error && <div className='text-red-600 mb-3 text-center'>{error}</div>}
          <button type='submit' className='w-full flex justify-center py-2 px-4 rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors cursor-pointer'>
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
}
