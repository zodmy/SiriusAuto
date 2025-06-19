'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/components/AuthProvider';
import { AuthLayout, FormField, PasswordInput, Button, Alert, Grid, LoadingSpinner } from '@/components';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isInitialCheckComplete } = useAuth();

  useEffect(() => {
    document.title = 'Реєстрація акаунта - Sirius Auto';
  }, []);
  useEffect(() => {
    if (isInitialCheckComplete && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isInitialCheckComplete, isAuthenticated, router, searchParams]);

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
    <AuthLayout
      title='Створення облікового запису'
      subtitle={
        <p>
          Уже маєте обліковий запис?{' '}
          <Link href={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} className='font-medium text-blue-600 hover:text-blue-500 transition-colors'>
            Увійдіть
          </Link>
        </p>
      }
    >
      {error && <Alert type='error' message={error} className='mb-6' />}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <Grid cols={{ default: 1, sm: 2 }} gap='md'>
          <FormField id='firstName' name='firstName' type='text' label="Ім'я" placeholder="Ваше ім'я" value={formData.firstName} onChange={handleInputChange} required autoComplete='given-name' disabled={isSubmitting} />

          <FormField id='lastName' name='lastName' type='text' label='Прізвище' placeholder='Ваше прізвище' value={formData.lastName} onChange={handleInputChange} autoComplete='family-name' disabled={isSubmitting} />
        </Grid>
        <FormField id='email' name='email' type='email' label='Email адреса' placeholder='Введіть ваш email' value={formData.email} onChange={handleInputChange} required autoComplete='email' disabled={isSubmitting} />
        <PasswordInput id='password' name='password' label='Пароль' placeholder='Створіть пароль (мін. 6 символів)' value={formData.password} onChange={handleInputChange} required autoComplete='new-password' disabled={isSubmitting} />
        <PasswordInput id='confirmPassword' name='confirmPassword' label='Підтвердіть пароль' placeholder='Повторіть пароль' value={formData.confirmPassword} onChange={handleInputChange} required autoComplete='new-password' disabled={isSubmitting} />{' '}
        <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} fullWidth size='lg' className='mt-6'>
          {isSubmitting ? 'Реєстрація...' : 'Створити обліковий запис'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}
