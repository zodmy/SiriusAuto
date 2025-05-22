'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100'>
      <form onSubmit={handleLogin} className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-6 text-center text-gray-700'>Вхід до адмінської панелі</h1>
        <div className='mb-4'>
          <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
            Пароль адміністратора
          </label>
          <input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Введіть ваш пароль' className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900' autoFocus />
        </div>
        {error && <p className='mb-4 text-sm text-red-600 text-center'>{error}</p>}
        <button type='submit' className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          Увійти
        </button>
      </form>
    </div>
  );
}
