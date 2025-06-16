'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HiEye, HiEyeOff } from 'react-icons/hi';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isInitialCheckComplete } = useAuth();

  useEffect(() => {
    document.title = 'Вхід в акаунт - Sirius Auto';
  }, []);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Реєстрацію завершено! Тепер ви можете увійти до системи.');
    }
  }, [searchParams]);
  useEffect(() => {
    if (isInitialCheckComplete && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isInitialCheckComplete, isAuthenticated, router, searchParams]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    } else {
      setError(result.error || 'Помилка входу');
    }
    setIsSubmitting(false);
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <div className='flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        {' '}
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='text-3xl font-extrabold text-gray-900'>Вхід до системи</h2>{' '}
            <p className='mt-2 text-sm text-gray-600'>
              Не маєте облікового запису?{' '}
              <Link href={`/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} className='font-medium text-blue-600 hover:text-blue-500 cursor-pointer'>
                Зареєструйтесь
              </Link>
            </p>
          </div>
          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                  Email адреса
                </label>
                <div className='mt-1'>
                  <input id='email' name='email' type='email' autoComplete='email' required value={email} onChange={(e) => setEmail(e.target.value)} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder='Введіть ваш email' />
                </div>
              </div>

              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                  Пароль
                </label>
                <div className='mt-1 relative'>
                  <input id='password' name='password' type={showPassword ? 'text' : 'password'} autoComplete='current-password' required value={password} onChange={(e) => setPassword(e.target.value)} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder='Введіть ваш пароль' />
                  <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <HiEyeOff className='h-5 w-5 text-gray-400' /> : <HiEye className='h-5 w-5 text-gray-400' />}
                  </button>
                </div>
              </div>
            </div>
            {successMessage && (
              <div className='rounded-md bg-green-50 p-4 mb-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <div className='text-sm text-green-800'>{successMessage}</div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className='rounded-md bg-red-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <div className='text-sm text-red-800'>{error}</div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <button type='submit' disabled={isSubmitting} className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'>
                {isSubmitting ? 'Вхід...' : 'Увійти'}
              </button>
            </div>{' '}
          </form>{' '}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
