'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
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
    <div>
      <h1>Вхід до адмінської панелі</h1>
      <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Пароль адміністратора' />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin}>Увійти</button>
    </div>
  );
}
