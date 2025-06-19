'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff, HiLockClosed } from 'react-icons/hi';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Адміністратор - Sirius Auto';
  }, []);

  const checkAuth = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  if (isChecking) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200'>
          <div className='flex items-center justify-center gap-2'>
            <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'></div>
          </div>
          <p className='text-gray-700 mt-4'>Перевірка авторизації...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!password.trim()) {
      setError('Введіть пароль');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Невірний пароль');
      }
    } catch (err) {
      setError("Помилка з'єднання з сервером");
      console.error('Помилка логіну:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-xl shadow-xl border border-gray-200 p-8'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <HiLockClosed className='w-8 h-8 text-blue-600' aria-hidden='true' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Адміністративна панель</h1>
            <p className='text-gray-600'>Введіть пароль для доступу до системи управління</p>
          </div>

          <form onSubmit={handleLogin} className='space-y-6'>
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Пароль адміністратора
              </label>
              <div className='relative'>
                <input id='password' type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Введіть ваш пароль' className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-colors' disabled={isSubmitting} autoFocus autoComplete='current-password' aria-describedby={error ? 'password-error' : undefined} />
                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors' disabled={isSubmitting} aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}>
                  {showPassword ? <HiEyeOff className='w-5 h-5' aria-hidden='true' /> : <HiEye className='w-5 h-5' aria-hidden='true' />}
                </button>
              </div>
            </div>
            {error && (
              <div id='password-error' className='bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm' role='alert'>
                {error}
              </div>
            )}
            <button type='submit' disabled={isSubmitting || !password.trim()} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2'>
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Вхід...
                </>
              ) : (
                'Увійти до панелі'
              )}
            </button>{' '}
          </form>
        </div>
      </div>
    </div>
  );
}
