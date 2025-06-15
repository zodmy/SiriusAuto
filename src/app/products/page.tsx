'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { HiTag, HiSearch, HiChevronRight, HiHome, HiViewGrid, HiViewList, HiShoppingCart, HiFilter } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';

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
  const router = useRouter();
  const categoryName = searchParams.get('category');
  const urlSearchQuery = searchParams.get('search');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [savedCar, setSavedCar] = useState<SavedCarSelection | null>(null);
  // Стани для фільтрів
  const [manufacturers, setManufacturers] = useState<{ id: number; name: string }[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  useEffect(() => {
    if (urlSearchQuery) {
      const query = decodeURIComponent(urlSearchQuery);
      setSearchQuery(query);
      setDebouncedSearchQuery(query);
    }
  }, [urlSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  }, []); // Завантаження виробників
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        let url = '/api/manufacturers';
        if (categoryName) {
          url += `?category=${encodeURIComponent(categoryName)}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setManufacturers(data);
          // Очищуємо обраних виробників при зміні категорії
          setSelectedManufacturers([]);
        }
      } catch (error) {
        console.error('Помилка завантаження виробників:', error);
      }
    };
    fetchManufacturers();
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
        if (debouncedSearchQuery) {
          params.append('search', debouncedSearchQuery);
        }
        if (selectedManufacturers.length > 0) {
          params.append('manufacturers', selectedManufacturers.join(','));
        }
        if (priceRange.min) {
          params.append('minPrice', priceRange.min);
        }
        if (priceRange.max) {
          params.append('maxPrice', priceRange.max);
        }
        if (inStockOnly) {
          params.append('inStock', 'true');
        }
        params.append('sort', sortBy);

        url += params.toString();
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const sortedProducts = data.sort((a: Product, b: Product) => {
            if (a.stockQuantity > 0 && b.stockQuantity === 0) return -1;
            if (a.stockQuantity === 0 && b.stockQuantity > 0) return 1;
            return 0;
          });
          setProducts(sortedProducts);
        }
      } catch (error) {
        console.error('Помилка завантаження товарів:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName, debouncedSearchQuery, sortBy, selectedManufacturers, priceRange, inStockOnly]);
  const breadcrumbs = () => {
    const crumbs = [
      { name: 'Головна', href: '/' },
      { name: 'Товари', href: '/products' },
    ];
    if (categoryName) {
      crumbs.push({
        name: decodeURIComponent(categoryName),
        href: `/products?category=${encodeURIComponent(categoryName)}`,
      });
    }

    return crumbs;
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (categoryName) {
      params.append('category', categoryName);
    }

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ''}`);
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
            {' '}
            <aside className='lg:w-64'>
              <div className='bg-white rounded-lg shadow-sm p-6 sticky top-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <HiFilter className='text-blue-600' />
                  Фільтри
                </h3>

                <div className='space-y-6'>
                  {/* Фільтр за наявністю */}
                  <div>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input type='checkbox' checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                      <span className='text-sm font-medium text-gray-700'>Тільки в наявності</span>
                    </label>
                  </div>
                  {/* Фільтр за ціною */}
                  <div>
                    <h4 className='text-sm font-medium text-gray-900 mb-3'>Ціна (₴)</h4>
                    <div className='flex gap-2'>
                      <input type='number' placeholder='Від' value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                      <input type='number' placeholder='До' value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                    </div>
                  </div>{' '}
                  {/* Фільтр за виробником */}
                  <div>
                    <h4 className='text-sm font-medium text-gray-900 mb-3'>Виробник</h4>
                    <div className='space-y-2 max-h-48 overflow-y-auto'>
                      {manufacturers.map((manufacturer) => (
                        <label key={manufacturer.id} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedManufacturers.includes(manufacturer.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedManufacturers([...selectedManufacturers, manufacturer.name]);
                              } else {
                                setSelectedManufacturers(selectedManufacturers.filter((m) => m !== manufacturer.name));
                              }
                            }}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <span className='text-sm text-gray-700'>{manufacturer.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Кнопка скидання фільтрів */}{' '}
                  <button
                    onClick={() => {
                      setSelectedManufacturers([]);
                      setPriceRange({ min: '', max: '' });
                      setInStockOnly(false);
                    }}
                    className='w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                  >
                    Скинути фільтри
                  </button>
                </div>
              </div>
            </aside>
            <div className='flex-1'>
              <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
                  {' '}
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>{categoryName ? decodeURIComponent(categoryName) : 'Всі товари'}</h1>
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
                  {' '}
                  <form onSubmit={handleSearch} className='flex-1'>
                    <div className='relative'>
                      <HiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input type='text' placeholder='Пошук товарів...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                      {searchQuery !== debouncedSearchQuery && (
                        <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                        </div>
                      )}
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
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>Товарів не знайдено</h3> <p className='text-gray-600 mb-4'>{debouncedSearchQuery ? `За запитом "${debouncedSearchQuery}" нічого не знайдено` : 'В цій категорії поки немає товарів'}</p>
                  {debouncedSearchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                        const params = new URLSearchParams();
                        if (categoryName) {
                          params.append('category', categoryName);
                        }
                        const queryString = params.toString();
                        router.push(`/products${queryString ? `?${queryString}` : ''}`);
                      }}
                      className='text-blue-600 hover:text-blue-800 font-medium'
                    >
                      Очистити пошук
                    </button>
                  )}
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
                  {products.map((product) => (
                    <div key={product.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-stretch gap-4 p-4' : 'p-4 flex flex-col h-full'}`}>
                      <div className={`${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48 mb-4'} relative bg-gray-100 rounded-md overflow-hidden`}>
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill className='object-contain' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-gray-400'>
                            <HiTag className='w-8 h-8' />
                          </div>
                        )}
                      </div>{' '}
                      <div className={`${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : 'flex-1 flex flex-col'}`}>
                        <div className='mb-2'>
                          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${viewMode === 'list' ? 'text-lg mb-1' : 'text-base mb-2'}`}>{product.name}</h3>
                          {product.manufacturer && <p className='text-xs text-gray-500 mb-1'>{product.manufacturer.name}</p>}
                        </div>
                        {product.description && <p className='text-gray-600 text-sm mb-3 line-clamp-2 flex-grow'>{product.description}</p>}{' '}
                        <div className='mt-auto'>
                          {viewMode === 'list' ? (
                            <div>
                              <p className='text-lg font-bold text-blue-600'>₴{Number(product.price).toFixed(2)}</p>
                            </div>
                          ) : (
                            <div className='flex items-center justify-between mb-3'>
                              <div>
                                <p className='text-lg font-bold text-blue-600'>₴{Number(product.price).toFixed(2)}</p>
                              </div>{' '}
                              <div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stockQuantity > 0 ? 'В наявності' : 'Немає'}</span>
                              </div>
                            </div>
                          )}

                          {viewMode === 'grid' && (
                            <button disabled={product.stockQuantity === 0} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed'>
                              {product.stockQuantity > 0 ? 'Додати до кошику' : 'Повідомити про надходження'}
                            </button>
                          )}
                        </div>
                      </div>{' '}
                      {viewMode === 'list' && (
                        <div className='flex-shrink-0 flex items-center gap-3'>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stockQuantity > 0 ? 'В наявності' : 'Немає'}</span>
                          <button disabled={product.stockQuantity === 0} className='p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed' title={product.stockQuantity > 0 ? 'Додати до кошику' : 'Повідомити про надходження'}>
                            <HiShoppingCart className='w-5 h-5' />
                          </button>
                        </div>
                      )}
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
