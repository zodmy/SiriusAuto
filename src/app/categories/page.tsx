'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import CategoryCard from '@/components/CategoryCard';

interface Category {
  id: number;
  name: string;
  description?: string;
  children: Category[];
  parent?: {
    id: number;
    name: string;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Категорії автозапчастин - Sirius Auto';
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Помилка завантаження категорій:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const breadcrumbs = [
    { name: 'Головна', href: '/' },
    { name: 'Всі категорії', href: '/categories' },
  ];

  const getTopLevelCategories = () => {
    return categories.filter((cat) => !cat.parent).sort((a, b) => a.name.localeCompare(b.name, 'uk', { sensitivity: 'base' }));
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {' '}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>Категорії</h1>
            <p className='text-gray-600 max-w-2xl mx-auto'>Оберіть потрібну категорію для перегляду товарів</p>
          </div>
        </div>
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, index) => (
              <div key={index} className='bg-white rounded-xl shadow-sm p-6'>
                <div className='animate-pulse text-center'>
                  <div className='w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2 mx-auto'></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {getTopLevelCategories().map((category) => (
              <CategoryCard key={category.id} category={category} showChildren={true} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
