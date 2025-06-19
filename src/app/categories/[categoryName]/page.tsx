'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { HiTag, HiSearch, HiChevronRight, HiHome, HiViewGrid, HiViewList, HiShoppingCart, HiFilter } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';
import { useCart } from '@/lib/hooks/useCart';
import { useBreadcrumbScroll } from '@/lib/hooks/useBreadcrumbScroll';
import CartNotification from '@/components/CartNotification';

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

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryName = decodeURIComponent(params.categoryName as string);
  const urlSearchQuery = searchParams.get('search');
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [savedCar, setSavedCar] = useState<SavedCarSelection | null>(null);
  const [manufacturers, setManufacturers] = useState<{ id: number; name: string }[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProductName, setNotificationProductName] = useState('');
  const { breadcrumbRef, scrollToEnd } = useBreadcrumbScroll();
  useEffect(() => {
    let title = `${categoryName} - автозапчастини - Sirius Auto`;
    if (currentCategory && debouncedSearchQuery) {
      title = `Пошук "${debouncedSearchQuery}" в ${currentCategory.name} - Sirius Auto`;
    } else if (debouncedSearchQuery) {
      title = `Пошук "${debouncedSearchQuery}" в ${categoryName} - Sirius Auto`;
    }
    document.title = title;
  }, [categoryName, currentCategory, debouncedSearchQuery]);

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
    if (debouncedSearchQuery) {
      scrollToEnd();
    }
  }, [debouncedSearchQuery, scrollToEnd]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (categoryName) {
            const category = data.find((cat: Category) => cat.name === categoryName);
            setCurrentCategory(category || null);
            scrollToEnd();
          }
        }
      } catch (error) {
        console.error('Помилка завантаження категорій:', error);
      }
    };
    fetchCategories();
  }, [categoryName, scrollToEnd]);

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
    const fetchManufacturers = async () => {
      try {
        let url = '/api/manufacturers';
        const params = new URLSearchParams();

        if (categoryName) {
          params.append('category', categoryName);
        }
        if (savedCar && !showAllProducts) {
          params.append('carMake', savedCar.makeName);
          params.append('carModel', savedCar.modelName);
          params.append('carYear', savedCar.year.toString());
          params.append('carBodyType', savedCar.bodyTypeName);
          params.append('carEngine', savedCar.engineName);
        }

        if (showAllProducts) {
          params.append('showAllProducts', 'true');
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setManufacturers(data);
          setSelectedManufacturers([]);
        }
      } catch (error) {
        console.error('Помилка завантаження виробників:', error);
      }
    };
    fetchManufacturers();
  }, [categoryName, savedCar, showAllProducts]);

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
        if (savedCar && !showAllProducts) {
          params.append('carMake', savedCar.makeName);
          params.append('carModel', savedCar.modelName);
          params.append('carYear', savedCar.year.toString());
          params.append('carBodyType', savedCar.bodyTypeName);
          params.append('carEngine', savedCar.engineName);
        }
        if (showAllProducts) {
          params.append('showAllProducts', 'true');
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
  }, [categoryName, debouncedSearchQuery, sortBy, selectedManufacturers, priceRange, inStockOnly, savedCar, showAllProducts]);

  const breadcrumbs = () => {
    const crumbs = [{ name: 'Головна', href: '/' }];

    if (currentCategory) {
      if (currentCategory.parent) {
        crumbs.push({
          name: currentCategory.parent.name,
          href: `/categories/${encodeURIComponent(currentCategory.parent.name)}`,
        });
      }
      crumbs.push({
        name: currentCategory.name,
        href: `/categories/${encodeURIComponent(currentCategory.name)}`,
      });
    } else {
      crumbs.push({ name: 'Товари', href: '/products' });
    }

    return crumbs;
  };

  const shouldShowSubcategories = () => {
    return currentCategory && currentCategory.children && currentCategory.children.length > 0;
  };

  const getSubcategories = () => {
    let subcategories = [];
    if (!currentCategory) {
      subcategories = categories.filter((cat) => !cat.parent) || [];
    } else {
      subcategories = currentCategory.children || [];
    }

    return subcategories.sort((a, b) => a.name.localeCompare(b.name, 'uk', { sensitivity: 'base' }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    const queryString = params.toString();
    router.push(`/categories/${encodeURIComponent(categoryName)}${queryString ? `?${queryString}` : ''}`);
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
        </div>{' '}
        {savedCar && (
          <div className='bg-green-50 border-b border-green-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
              <div className='flex items-center space-x-3'>
                <FaCar className='text-green-600' />
                <span className='text-sm text-green-800'>
                  <strong>Вибраний автомобіль:</strong> {savedCar.makeName} {savedCar.modelName} {savedCar.year} {savedCar.bodyTypeName} {savedCar.engineName}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {shouldShowSubcategories() ? (
            <div>
              <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
                <div className='text-center py-2'>
                  <h1 className='text-2xl font-bold text-gray-900 mb-2'>{currentCategory ? currentCategory.name : 'Категорії товарів'}</h1>
                  {currentCategory?.description && <p className='text-gray-600'>{currentCategory.description}</p>}
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {getSubcategories().map((subcategory) => (
                  <Link key={subcategory.id} href={`/categories/${encodeURIComponent(subcategory.name)}`} className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group'>
                    <div className='p-6 text-center'>
                      <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                        <HiTag className='w-8 h-8 text-white' />
                      </div>
                      <h3 className='font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors'>{subcategory.name}</h3>
                      {subcategory.description && <p className='text-sm text-gray-600 line-clamp-2'>{subcategory.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col lg:flex-row gap-8'>
              {' '}
              <aside className='lg:w-64'>
                <div className='bg-white rounded-lg shadow-sm p-6 sticky top-8'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <HiFilter className='text-blue-600' />
                    Фільтри
                  </h3>

                  <div className='space-y-6'>
                    <div>
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                        <span className='text-sm font-medium text-gray-700'>Тільки в наявності</span>
                      </label>
                    </div>{' '}
                    {savedCar && (
                      <div>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input type='checkbox' checked={showAllProducts} onChange={(e) => setShowAllProducts(e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                          <span className='text-sm font-medium text-gray-700'>Показувати несумісні</span>
                        </label>
                        <p className='text-xs text-gray-500 mt-1'>Показувати товари, несумісні з обраним автомобілем</p>
                      </div>
                    )}
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 mb-3'>Ціна (₴)</h4>
                      <div className='flex gap-2'>
                        <input type='number' placeholder='Від' value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        <input type='number' placeholder='До' value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                      </div>
                    </div>
                    {manufacturers.length > 0 && products.length > 0 && (
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
                    )}
                    <button
                      onClick={() => {
                        setSelectedManufacturers([]);
                        setPriceRange({ min: '', max: '' });
                        setInStockOnly(false);
                        setShowAllProducts(false);
                      }}
                      className='w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer'
                    >
                      Скинути фільтри
                    </button>
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
                    <p className='text-gray-600'>Завантаження...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                    <HiTag className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>Товарів не знайдено</h3>
                    <p className='text-gray-600 mb-4'>{debouncedSearchQuery ? `За запитом "${debouncedSearchQuery}" нічого не знайдено` : savedCar && !showAllProducts ? `Немає товарів, сумісних з вашим автомобілем ${savedCar.makeName} ${savedCar.modelName} ${savedCar.year} ${savedCar.bodyTypeName} ${savedCar.engineName}` : 'В цій категорії поки немає товарів'}</p>
                    {debouncedSearchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDebouncedSearchQuery('');
                          router.push(`/categories/${encodeURIComponent(categoryName)}`);
                        }}
                        className='text-blue-600 hover:text-blue-800 font-medium mr-4'
                      >
                        Очистити пошук
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
                    {products.map((product) => (
                      <div key={product.id} onClick={() => router.push(`/products/${product.id}`)} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex items-stretch gap-4 p-4' : 'p-4 flex flex-col h-full'}`}>
                        <div className={`${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48 mb-4'} relative bg-white rounded-md overflow-hidden border border-gray-200`}>
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className='object-contain' />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-400'>
                              <HiTag className='w-8 h-8' />
                            </div>
                          )}
                        </div>
                        <div className={`${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : 'flex-1 flex flex-col'}`}>
                          <div className='mb-2'>
                            <h3 className={`font-semibold text-gray-900 line-clamp-2 ${viewMode === 'list' ? 'text-lg mb-1' : 'text-base mb-2'}`}>{product.name}</h3>
                            {product.manufacturer && <p className='text-xs text-gray-500 mb-1'>{product.manufacturer.name}</p>}
                          </div>
                          {product.description && <p className='text-gray-600 text-sm mb-3 line-clamp-2 flex-grow'>{product.description}</p>}
                          <div className='mt-auto'>
                            {viewMode === 'list' ? (
                              <div>
                                <p className='text-lg font-bold text-blue-600'>₴{Number(product.price).toFixed(2)}</p>
                              </div>
                            ) : (
                              <div className='flex items-center justify-between mb-3'>
                                <div>
                                  <p className='text-lg font-bold text-blue-600'>₴{Number(product.price).toFixed(2)}</p>
                                </div>
                                <div>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stockQuantity > 0 ? 'В наявності' : 'Немає'}</span>
                                </div>
                              </div>
                            )}{' '}
                            {viewMode === 'grid' && (
                              <button
                                disabled={product.stockQuantity === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (product.stockQuantity > 0) {
                                    addItem({
                                      id: product.id,
                                      name: product.name,
                                      price: product.price,
                                      image: product.imageUrl,
                                      stockQuantity: product.stockQuantity,
                                    });
                                    setNotificationProductName(product.name);
                                    setShowNotification(true);
                                  }
                                }}
                                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer'
                              >
                                {product.stockQuantity > 0 ? 'Додати до кошику' : 'Немає в наявності'}
                              </button>
                            )}
                          </div>
                        </div>
                        {viewMode === 'list' && (
                          <div className='flex-shrink-0 flex items-center gap-3'>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stockQuantity > 0 ? 'В наявності' : 'Немає'}</span>{' '}
                            <button
                              disabled={product.stockQuantity === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (product.stockQuantity > 0) {
                                  addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.imageUrl,
                                    stockQuantity: product.stockQuantity,
                                  });
                                  setNotificationProductName(product.name);
                                  setShowNotification(true);
                                }
                              }}
                              className='p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer'
                              title={product.stockQuantity > 0 ? 'Додати до кошику' : 'Немає в наявності'}
                            >
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
          )}{' '}
        </div>
      </main>
      <Footer />

      <CartNotification show={showNotification} productName={notificationProductName} onHide={() => setShowNotification(false)} />
    </div>
  );
}
