'use client';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiOutlineFolder } from 'react-icons/hi';

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
}

export default function EditCategoryPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isAdmin && !isVerifyingAuth && id) {
      const fetchCategories = async () => {
        try {
          const res = await fetch('/api/categories');
          if (!res.ok) {
            throw new Error('Не вдалося завантажити категорії');
          }
          const data = await res.json();
          setCategories(data.filter((cat: Category) => cat.id !== parseInt(id as string, 10)));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Сталася невідома помилка під час завантаження списку категорій');
        }
      };

      const fetchCategory = async () => {
        setIsLoadingData(true);
        try {
          const res = await fetch(`/api/categories/${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              setError('Категорія не знайдена');
            } else {
              throw new Error('Не вдалося завантажити категорію');
            }
            setCategory(null);
            return;
          }
          const data: Category = await res.json();
          setCategory(data);
          setName(data.name);
          setParentId(data.parentId?.toString() || '');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Сталася невідома помилка під час завантаження категорії');
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchCategories();
      fetchCategory();
    } else if (!id && !isVerifyingAuth) {
      setError('Не вказано ID категорії');
      setIsLoadingData(false);
    }
  }, [id, isAdmin, isVerifyingAuth]);

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

  if (isVerifyingAuth) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
        <p className='text-gray-700'>Перевірка авторизації...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
        <p className='text-gray-700'>Не авторизовано. Перенаправлення...</p>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
        <p className='text-gray-700'>Завантаження даних категорії...</p>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className='min-h-screen bg-gray-100 p-4'>
        <header className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200 mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <span className='text-blue-700'>
              <HiOutlineFolder className='inline-block mr-1' size={28} />
            </span>
            Редагування категорії
          </h2>
        </header>
        <main className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200'>
          <p className='text-red-600'>{error}</p>
        </main>
      </div>
    );
  }

  if (!category) {
    return <div className='min-h-screen bg-gray-100 p-4'></div>;
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <header className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200 mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
          <span className='text-blue-700'>
            <HiOutlineFolder className='inline-block mr-1' size={28} />
          </span>
          Редагування категорії
        </h2>
      </header>
      <main className='bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-gray-200'>
        {error && <p className='text-red-500 bg-red-100 p-3 rounded-md mb-4 text-center'>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              Назва категорії
            </label>
            <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' required />
          </div>
          <div className='mb-6'>
            <label htmlFor='parentId' className='block text-sm font-medium text-gray-700 mb-1'>
              Батьківська категорія
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
          <button type='submit' className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'>
            Зберегти зміни
          </button>
        </form>
      </main>
    </div>
  );
}
