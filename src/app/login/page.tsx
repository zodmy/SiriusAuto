'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/components/AuthProvider';
import AuthLayout from '@/components/AuthLayout';
import FormField from '@/components/FormField';
import PasswordInput from '@/components/PasswordInput';
import Button from '@/components/Button';
import Alert from '@/components/Alert';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <AuthLayout 
      title="Вхід до системи"
      subtitle={
        <p>
          Не маєте облікового запису?{' '}
          <Link 
            href={`/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Зареєструйтесь
          </Link>
        </p>
      }
    >
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-6" />
      )}
      
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          name="email"
          type="email"
          label="Email адреса"
          placeholder="Введіть ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isSubmitting}
        />

        <PasswordInput
          id="password"
          name="password"
          label="Пароль"
          placeholder="Введіть ваш пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          fullWidth
          size="lg"
          className="mt-6"
        >
          Увійти
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
