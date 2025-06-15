'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { HiTag, HiSearch, HiChevronRight, HiHome, HiViewGrid, HiViewList } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';

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

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  manufacturer?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface SavedCarSelection {
  makeId: number;
  makeName: string;
  modelId: number;
  modelName: string;
  yearId: number;
  year: number;
  bodyTypeId: number;
  bodyTypeName: string;
  engineId: number;
  engineName: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryName = searchParams.get('category');

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [savedCar, setSavedCar] = useState<SavedCarSelection | null>(null);

  useEffect(() => {
    const savedCarData = localStorage.getItem('selectedCar');
    if (savedCarData) {
      try {
        const car = JSON.parse(savedCarData) as SavedCarSelection;
        setSavedCar(car);
      } catch (error) {
        console.error('Помилка завантаження збереженого автомобіля:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (categoryName) {
            const category = data.find((cat: Category) => cat.name === decodeURIComponent(categoryName));
            setCurrentCategory(category || null);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження категорій:', error);
      }
    };
    fetchCategories();
  }, [categoryName]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = '/api/products?';
        const params = new URLSearchParams();
        if (categoryName) {
          params.append('category', categoryName);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        params.append('sort', sortBy);

        url += params.toString();

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Помилка завантаження товарів:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName, searchQuery, sortBy]);

  const breadcrumbs = () => {
    const crumbs = [
      { name: 'Головна', href: '/' },
      { name: 'Товари', href: '/products' },
    ];
    if (currentCategory) {
      if (currentCategory.parent) {
        crumbs.push({
          name: currentCategory.parent.name,
          href: `/products?category=${encodeURIComponent(currentCategory.parent.name)}`,
        });
      }
      crumbs.push({
        name: currentCategory.name,
        href: `/products?category=${encodeURIComponent(currentCategory.name)}`,
      });
    }

    return crumbs;
  };
  const getSubcategories = () => {
    if (!currentCategory) {
      return categories.filter((cat) => !cat.parent) || [];
    }

    return currentCategory.children || [];
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <main className='flex-grow'>
        <div className='bg-white border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <nav className='flex items-center space-x-2 text-sm'>
              {breadcrumbs().map((crumb, index) => (
                <div key={index} className='flex items-center'>
                  {index > 0 && <HiChevronRight className='text-gray-400 mx-2' />}
                  {index === 0 ? <HiHome className='text-gray-400 mr-1' /> : null}
                  {index === breadcrumbs().length - 1 ? (
                    <span className='text-gray-900 font-medium'>{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className='text-blue-600 hover:text-blue-800'>
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {savedCar && (
          <div className='bg-green-50 border-b border-green-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
              <div className='flex items-center gap-3'>
                <FaCar className='text-green-600' />
                <span className='text-green-800 font-medium'>
                  Обраний автомобіль: {savedCar.makeName} {savedCar.modelName} {savedCar.year} ({savedCar.bodyTypeName}, {savedCar.engineName})
                </span>
                <Link href='/' className='text-green-700 hover:text-green-900 text-sm underline'>
                  Змінити
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex flex-col lg:flex-row gap-8'>
            <aside className='lg:w-80'>
              <div className='bg-white rounded-lg shadow-sm p-6 sticky top-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <HiTag className='text-blue-600' />
                  {currentCategory ? 'Підкатегорії' : 'Категорії'}
                </h3>

                <div className='space-y-2'>
                  {!currentCategory && (
                    <Link href='/products' className='block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'>
                      Всі товари
                    </Link>
                  )}{' '}
                  {getSubcategories().map((category) => (
                    <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} className='block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'>
                      {category.name}
                      {category.children && category.children.length > 0 && <span className='text-xs text-gray-500 ml-2'>({category.children.length})</span>}
                    </Link>
                  ))}
                  {currentCategory && currentCategory.parent && (
                    <Link href={`/products?category=${encodeURIComponent(currentCategory.parent.name)}`} className='block px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 font-medium transition-colors border-t border-gray-200 mt-4 pt-4'>
                      ← Назад до {currentCategory.parent.name}
                    </Link>
                  )}
                </div>
              </div>
            </aside>

            <div className='flex-1'>
              <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>{currentCategory ? currentCategory.name : 'Всі товари'}</h1>
                    {currentCategory?.description && <p className='text-gray-600 mt-1'>{currentCategory.description}</p>}
                  </div>

                  <div className='flex items-center gap-2'>
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                      <HiViewGrid size={20} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                      <HiViewList size={20} />
                    </button>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-4'>
                  <form onSubmit={handleSearch} className='flex-1'>
                    <div className='relative'>
                      <HiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input type='text' placeholder='Пошук товарів...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                    </div>
                  </form>

                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                    <option value='name'>За назвою</option>
                    <option value='price_asc'>За ціною (зростання)</option>
                    <option value='price_desc'>За ціною (спадання)</option>
                    <option value='newest'>Спочатку нові</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-gray-600'>Завантаження товарів...</p>
                </div>
              ) : products.length === 0 ? (
                <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                  <HiTag className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>Товарів не знайдено</h3>
                  <p className='text-gray-600 mb-4'>{searchQuery ? `За запитом "${searchQuery}" нічого не знайдено` : 'В цій категорії поки немає товарів'}</p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className='text-blue-600 hover:text-blue-800 font-medium'>
                      Очистити пошук
                    </button>
                  )}
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
                  {products.map((product) => (
                    <div key={product.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'}`}>
                      {product.imageUrl && (
                        <div className={`${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'w-full h-48 mb-4'} relative bg-gray-100 rounded-md overflow-hidden`}>
                          <Image src={product.imageUrl} alt={product.name} fill className='object-contain' />
                        </div>
                      )}

                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h3 className={`font-semibold text-gray-900 mb-2 ${viewMode === 'list' ? 'text-lg' : 'text-base'}`}>{product.name}</h3>
                        {product.description && <p className='text-gray-600 text-sm mb-2 line-clamp-2'>{product.description}</p>}{' '}
                        <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-2' : 'mt-4'}`}>
                          <div>
                            <p className='text-lg font-bold text-blue-600'>₴{Number(product.price).toFixed(2)}</p>
                            {product.manufacturer && <p className='text-xs text-gray-500'>{product.manufacturer.name}</p>}
                          </div>
                          <div className='text-right'>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stockQuantity > 0 ? 'В наявності' : 'Немає в наявності'}</span>
                          </div>
                        </div>
                        <button className='w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed'>{product.stockQuantity > 0 ? 'Додати в кошик' : 'Повідомити про надходження'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
