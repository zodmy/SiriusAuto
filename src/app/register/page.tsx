'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HiEye, HiEyeOff } from 'react-icons/hi';

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isInitialCheckComplete } = useAuth();

  useEffect(() => {
    document.title = 'Реєстрація акаунта - Sirius Auto';
  }, []);

  useEffect(() => {
    if (isInitialCheckComplete && isAuthenticated) {
      router.push('/');
    }
  }, [isInitialCheckComplete, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName) {
      return "Усі обов'язкові поля повинні бути заповнені";
    }

    if (formData.password.length < 6) {
      return 'Пароль повинен містити принаймні 6 символів';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Паролі не співпадають';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Введіть коректну email адресу';
    }

    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName || undefined,
    });

    if (result.success) {
      const redirectTo = searchParams.get('redirect');
      const loginUrl = redirectTo ? `/login?registered=true&redirect=${redirectTo}` : '/login?registered=true';
      router.push(loginUrl);
    } else {
      setError(result.error || 'Помилка реєстрації');
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
            <h2 className='text-3xl font-extrabold text-gray-900'>Створення облікового запису</h2>{' '}
            <p className='mt-2 text-sm text-gray-600'>
              Уже маєте обліковий запис?{' '}
              <Link href={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} className='font-medium text-blue-600 hover:text-blue-500 cursor-pointer'>
                Увійдіть
              </Link>
            </p>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  {' '}
                  <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
                    {"Ім'я"} <span className='text-red-500'>*</span>
                  </label>
                  <div className='mt-1'>
                    <input id='firstName' name='firstName' type='text' autoComplete='given-name' required value={formData.firstName} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder={"Ваше ім'я"} />
                  </div>
                </div>

                <div>
                  <label htmlFor='lastName' className='block text-sm font-medium text-gray-700'>
                    Прізвище
                  </label>
                  <div className='mt-1'>
                    <input id='lastName' name='lastName' type='text' autoComplete='family-name' value={formData.lastName} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder='Ваше прізвище' />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                  Email адреса <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1'>
                  <input id='email' name='email' type='email' autoComplete='email' required value={formData.email} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder='Введіть ваш email' />
                </div>
              </div>

              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                  Пароль <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1 relative'>
                  <input id='password' name='password' type={showPassword ? 'text' : 'password'} autoComplete='new-password' required value={formData.password} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder='Створіть пароль (мін. 6 символів)' />
                  <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <HiEyeOff className='h-5 w-5 text-gray-400' /> : <HiEye className='h-5 w-5 text-gray-400' />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                  Підтвердіть пароль <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1 relative'>
                  <input id='confirmPassword' name='confirmPassword' type={showConfirmPassword ? 'text' : 'password'} autoComplete='new-password' required value={formData.confirmPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-semibold text-gray-900' placeholder='Повторіть пароль' />
                  <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <HiEyeOff className='h-5 w-5 text-gray-400' /> : <HiEye className='h-5 w-5 text-gray-400' />}
                  </button>
                </div>
              </div>
            </div>

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
                {isSubmitting ? 'Реєстрація...' : 'Створити обліковий запис'}{' '}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
