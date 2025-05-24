'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAdminClient } from '@/lib/auth-client';

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminClient();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) {
          throw new Error('Не вдалося завантажити категорії');
        }
        const data = await res.json();
        setCategories(data.filter((cat: Category) => cat.id !== parseInt(id as string, 10)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Сталася невідома помилка');
      }
    };

    const fetchCategory = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/categories/${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              setError('Категорія не знайдена');
            } else {
              throw new Error('Не вдалося завантажити категорію');
            }
            setIsLoading(false);
            return;
          }
          const data: Category = await res.json();
          setCategory(data);
          setName(data.name);
          setParentId(data.parentId?.toString() || '');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Сталася невідома помилка');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('Не вказано ID категорії');
        setIsLoading(false);
      }
    };
    fetchCategories();
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError("Назва є обов'язковою");
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentId: parentId ? parseInt(parentId, 10) : null }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Не вдалося оновити категорію');
      }
      router.push('/admin/dashboard/manage/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сталася невідома помилка');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className='min-h-screen bg-gray-100 p-4'>
        <header className='bg-white shadow-md rounded-lg p-4 mb-4'>
          <h1 className='text-2xl font-bold text-gray-800'>Редагувати</h1>
        </header>
        <main className='bg-white shadow-md rounded-lg p-4'>
          <p className='text-red-500'>{error}</p>
          <button onClick={() => router.push('/admin/dashboard/manage/categories')} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            Назад
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <header className='bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-800'>Редагувати: {category?.name}</h1>
        <button onClick={() => router.push('/admin/dashboard/manage/categories')} className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
          Назад до категорій
        </button>
      </header>
      <main className='bg-white shadow-md rounded-lg p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
              Назва
            </label>
            <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900' required />
          </div>
          <div>
            <label htmlFor='parentId' className='block text-sm font-medium text-gray-700'>
              Батьківська категорія (необов&#39;язково)
            </label>
            <select id='parentId' value={parentId} onChange={(e) => setParentId(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900'>
              <option value=''>Немає</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>{' '}
          <button type='submit' className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            Зберегти зміни
          </button>
        </form>
      </main>
    </div>
  );
}
