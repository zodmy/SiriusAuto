'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories?includeParent=true');
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required for new category');
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
        throw new Error(errorData.error || 'Failed to create category');
      }
      setName('');
      setParentId('');
      setIsCreating(false);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setError('');
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete category');
        }
        fetchCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <header className='bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-800'>Manage Categories</h1>
        <button onClick={() => router.push('/admin/dashboard')} className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>
          Back to Dashboard
        </button>
      </header>

      <main className='bg-white shadow-md rounded-lg p-6'>
        <button onClick={() => setIsCreating(!isCreating)} className='mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none'>
          {isCreating ? 'Cancel' : '+ Create New Category'}
        </button>

        {isCreating && (
          <form onSubmit={handleCreate} className='mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-700'>Create New Category</h2>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <div>
              <label htmlFor='newName' className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input type='text' id='newName' value={name} onChange={(e) => setName(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900' required />
            </div>
            <div>
              <label htmlFor='newParentId' className='block text-sm font-medium text-gray-700'>
                Parent Category (Optional)
              </label>
              <select id='newParentId' value={parentId} onChange={(e) => setParentId(e.target.value)} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900'>
                <option value=''>None</option>
                {categories
                  .filter((c) => c.id !== 0)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              Create Category
            </button>
          </form>
        )}

        {error && !isCreating && <p className='text-red-500 mb-4'>{error}</p>}

        {isLoading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 && !error ? (
          <p>No categories found. Create one!</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>ID</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Parent Category</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{category.id}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{category.name}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{category.parent ? category.parent.name : 'N/A'}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <Link href={`/admin/dashboard/manage/categories/${category.id}`} className='text-indigo-600 hover:text-indigo-900 mr-3'>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(category.id)} className='text-red-600 hover:text-red-900 focus:outline-none'>
                        Delete
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
