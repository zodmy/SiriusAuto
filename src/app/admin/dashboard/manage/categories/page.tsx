'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkAdminClient } from '@/lib/auth-client';

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parent?: { name: string };
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminClient();
  }, []);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      setIsVerifyingAuth(true);
      try {
        const response = await fetch('/api/admin/check-auth');
        if (response.ok) {
          const data = await response.json();
          if (data.isAdmin) {
            setIsAuthorized(true);
          } else {
            router.push('/admin');
          }
        } else {
          router.push('/admin');
        }
      } catch (err) {
        console.error('Не вдалося перевірити статус адміністратора:', err);
        router.push('/admin');
      } finally {
        setIsVerifyingAuth(false);
      }
    };
    verifyAdminAccess();
  }, [router]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити категорії');
      }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сталася невідома помилка');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && !isLoading) {
      fetchCategories();
    }
  }, [isAuthorized, isLoading]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError("Назва є обов'язковою для нової категорії");
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentId: parentId ? parseInt(parentId, 10) : null }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Не вдалося створити категорію');
      }
      setName('');
      setParentId('');
      setIsCreating(false);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сталася невідома помилка');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      setError('');
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Не вдалося видалити категорію');
        }
        fetchCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Сталася невідома помилка');
      }
    }
  };

  if (isVerifyingAuth) {
    return (
      <div className='min-h-screen bg-gray-100 p-4 flex justify-center items-center'>
        <p className='text-xl text-gray-700'>Перевірка авторизації...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className='min-h-screen bg-gray-100 p-4 flex justify-center items-center'>
        <p className='text-xl text-gray-700'>Перенаправлення на логін...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <header className='bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center'>
        {' '}
        <h1 className='text-2xl font-bold text-gray-800'>Керування категоріями</h1>
        <button onClick={() => router.push('/admin/dashboard')} className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
          Назад до панелі
        </button>
      </header>

      <main className='bg-white shadow-md rounded-lg p-6'>
        {' '}
        <button onClick={() => setIsCreating(!isCreating)} className='mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none'>
          {isCreating ? 'Скасувати' : '+ Створити нову категорію'}
        </button>
        {isCreating && (
          <form onSubmit={handleCreate} className='mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-700'>Створити нову категорію</h2>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <div>
              {' '}
              <label htmlFor='newName' className='block text-sm font-medium text-gray-700'>
                Назва
              </label>
              <input type='text' id='newName' value={name} onChange={(e) => setName(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900' required />
            </div>
            <div>
              {' '}
              <label htmlFor='newParentId' className='block text-sm font-medium text-gray-700'>
                Батьківська категорія (необов&#39;язково)
              </label>
              <select id='newParentId' value={parentId} onChange={(e) => setParentId(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900'>
                <option value=''>Немає</option>
                {categories
                  .filter((c) => c.id !== 0)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>{' '}
            <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              Створити категорію
            </button>
          </form>
        )}
        {error && !isCreating && <p className='text-red-500 mb-4'>{error}</p>}{' '}
        {isLoading ? (
          <p>Завантаження категорій...</p>
        ) : categories.length === 0 && !error ? (
          <p>Категорії не знайдено. Створіть нову!</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {' '}
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Ідентифікатор</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Назва</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Батьківська категорія</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Дії</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{category.id}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{category.name}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{category.parent ? category.parent.name : 'Немає'}</td>{' '}
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <Link href={`/admin/dashboard/manage/categories/${category.id}`} className='text-indigo-600 hover:text-indigo-900 mr-3'>
                        Редагувати
                      </Link>
                      <button onClick={() => handleDelete(category.id)} className='text-red-600 hover:text-red-900 focus:outline-none'>
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
