'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { HiOutlineFolder } from 'react-icons/hi';

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parent?: { name: string };
}

export default function ManageCategoriesPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
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
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isAdmin && !isVerifyingAuth) {
      fetchCategories();
    }
  }, [isAdmin, isVerifyingAuth]);

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
        <p>Перевірка авторизації...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gray-100 p-4 flex justify-center items-center'>
        <p>Не авторизовано. Перенаправлення...</p>
      </div>
    );
  }

  // Render page content if isAdmin is true
  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <header className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200 mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
          <span className='text-blue-700'>
            <HiOutlineFolder className='inline-block mr-1' size={28} />
          </span>
          Керування категоріями
        </h2>
      </header>

      {isCreating && (
        <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
          <form onSubmit={handleCreate}>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>Нова категорія</h2>
            {error && <p className='text-red-500 bg-red-100 p-3 rounded-md mb-4'>{error}</p>}
            <div className='mb-4'>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
                Назва категорії
              </label>
              <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Наприклад, "Запчастини для двигуна"' required />
            </div>
            <div className='mb-4'>
              <label htmlFor='parentId' className='block text-sm font-medium text-gray-700 mb-1'>
                Батьківська категорія (необов&apos;язково)
              </label>
              <select id='parentId' value={parentId || ''} onChange={(e) => setParentId(e.target.value || undefined)} className='mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'>
                <option value=''>Без батьківської категорії</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button type='submit' className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out'>
              Створити категорію
            </button>
          </form>
        </div>
      )}

      {isLoadingCategories ? (
        <div className='flex justify-center items-center py-10'>
          <p className='text-gray-600'>Завантаження категорій...</p>
        </div>
      ) : error && categories.length === 0 ? (
        <div className='bg-white shadow-md rounded-lg p-6 text-center'>
          <p className='text-red-500'>{error}</p>
          <button onClick={fetchCategories} className='mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out'>
            Спробувати ще раз
          </button>
        </div>
      ) : (
        <div className='bg-white shadow-md rounded-lg overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ID
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Назва
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Батьківська категорія
                </th>
                <th scope='col' className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{category.id}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{category.name}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{category.parent ? category.parent.name : 'N/A'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <Link href={`/admin/dashboard/manage/categories/${category.id}`} className='text-indigo-600 hover:text-indigo-900 mr-3'>
                      Редагувати
                    </Link>
                    <button onClick={() => handleDelete(category.id)} className='text-red-600 hover:text-red-900'>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
