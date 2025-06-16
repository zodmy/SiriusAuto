'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { HiTag, HiChevronRight, HiHome } from 'react-icons/hi';
import { useBreadcrumbScroll } from '@/lib/hooks/useBreadcrumbScroll';

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
  const { breadcrumbRef } = useBreadcrumbScroll();

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

  const breadcrumbs = () => {
    return [
      { name: 'Головна', href: '/' },
      { name: 'Всі категорії', href: '/categories' },
    ];
  };

  const getMainCategories = () => {
    return categories.filter((cat) => !cat.parent).sort((a, b) => a.name.localeCompare(b.name, 'uk', { sensitivity: 'base' }));
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <main className='flex-grow'>
        {' '}
        <div className='bg-white border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='relative'>
              <nav ref={breadcrumbRef} className='breadcrumb-container flex items-center space-x-1 sm:space-x-2 text-sm overflow-x-auto scrollbar-hide'>
                <div className='flex items-center space-x-1 sm:space-x-2 min-w-max'>
                  {breadcrumbs().map((crumb, index) => (
                    <div key={index} className='flex items-center'>
                      {index > 0 && <HiChevronRight className='text-gray-400 mx-1 sm:mx-2 flex-shrink-0' />}
                      {index === 0 ? <HiHome className='text-gray-400 mr-1 flex-shrink-0' /> : null}
                      {index === breadcrumbs().length - 1 ? (
                        <span className='text-gray-900 font-medium whitespace-nowrap'>{crumb.name}</span>
                      ) : (
                        <Link href={crumb.href} className='text-blue-600 hover:text-blue-800 whitespace-nowrap'>
                          {crumb.name}
                        </Link>
                      )}
                    </div>
                  ))}{' '}
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
            <div className='text-center'>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>Всі категорії товарів</h1>
              <p className='text-gray-600 text-lg'>Оберіть категорію для перегляду асортименту автозапчастин</p>
            </div>
          </div>

          {isLoading ? (
            <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Завантаження категорій...</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {getMainCategories().map((category) => (
                <Link key={category.id} href={`/categories/${encodeURIComponent(category.name)}`} className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group'>
                  <div className='p-6 text-center'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                      <HiTag className='w-8 h-8 text-white' />
                    </div>
                    <h3 className='font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors'>{category.name}</h3>
                    {category.description && <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{category.description}</p>}
                    {category.children.length > 0 && <div className='text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block'>{category.children.length} підкатегорій</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
