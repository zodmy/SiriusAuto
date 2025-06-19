'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HiLockClosed } from 'react-icons/hi';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import PasswordInput from '@/components/PasswordInput';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          <LoadingSpinner size='lg' text='Перевірка авторизації...' />
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
          </div>{' '}
          <form onSubmit={handleLogin} className='space-y-6'>
            <PasswordInput id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Введіть ваш пароль' label='Пароль адміністратора' disabled={isSubmitting} autoFocus autoComplete='current-password' error={error} className='w-full px-4 py-3 text-base' />

            <Button type='submit' isLoading={isSubmitting} disabled={!password.trim()} fullWidth size='lg'>
              Увійти до панелі
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
