'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiTag, HiSearch, HiChevronRight, HiHome, HiViewGrid, HiViewList, HiFilter } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';
import { useCart } from '@/lib/hooks/useCart';
import { useBreadcrumbScroll } from '@/lib/hooks/useBreadcrumbScroll';
import { Header, Footer, Container, Card, Grid, Heading, Text, Button, LoadingSpinner, EmptyState, ProductCard, CartNotification } from '@/components';

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
  averageRating?: number;
  manufacturer?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  compatibleVehicles?: Array<{
    id: number;
    carMake: { id: number; name: string };
    carModel: { id: number; name: string };
    carYear: { id: number; year: number };
    carBodyType: { id: number; name: string };
    carEngine: { id: number; name: string };
  }>;
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

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryName = searchParams.get('category');
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
    let title = 'Товари - Sirius Auto';
    if (currentCategory) {
      title = `${currentCategory.name} - автозапчастини - Sirius Auto`;
    } else if (debouncedSearchQuery) {
      title = `Пошук "${debouncedSearchQuery}" - автозапчастини - Sirius Auto`;
    }
    document.title = title;
  }, [currentCategory, debouncedSearchQuery]);

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
            const category = data.find((cat: Category) => cat.name === decodeURIComponent(categoryName));
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

        if (debouncedSearchQuery) {
          params.append('search', debouncedSearchQuery);
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
  }, [categoryName, debouncedSearchQuery, priceRange, inStockOnly, savedCar, showAllProducts]);
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
          <Container maxWidth='7xl'>
            <div className='py-4'>
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
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </Container>{' '}
        </div>{' '}
        {savedCar && (
          <div className='bg-green-50 border-b border-green-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
              <div className='flex items-center space-x-3'>
                {' '}
                <FaCar className='text-green-600' />{' '}
                <span className='text-sm text-green-800'>
                  <strong>Обраний автомобіль:</strong> {savedCar.makeName} {savedCar.modelName} {savedCar.year} {savedCar.bodyTypeName} {savedCar.engineName}
                </span>
              </div>
            </div>
          </div>
        )}
        <Container maxWidth='7xl' className='py-8'>
          {shouldShowSubcategories() ? (
            <div>
              <Card className='text-center py-2 mb-6'>
                <Heading level={1} className='mb-2'>
                  {currentCategory ? currentCategory.name : 'Категорії товарів'}
                </Heading>{' '}
                {currentCategory?.description && <Text color='muted'>{currentCategory.description}</Text>}
              </Card>

              <Grid cols={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap='md'>
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
              </Grid>
            </div>
          ) : (
            <div className='flex flex-col lg:flex-row gap-8'>
              {' '}
              <aside className='lg:w-64'>
                <Card className='sticky top-8'>
                  <Heading level={3} size='sm' className='mb-4 flex items-center gap-2'>
                    <HiFilter className='text-blue-600' />
                    Фільтри
                  </Heading>
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
                      </div>{' '}
                    </div>{' '}
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
                    )}{' '}
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
                </Card>
              </aside>{' '}
              <div className='flex-1'>
                <Card className='mb-6'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
                    <div>
                      <Heading level={1} size='lg'>
                        {currentCategory ? currentCategory.name : 'Всі товари'}
                      </Heading>
                      {currentCategory?.description && (
                        <Text color='muted' className='mt-1'>
                          {currentCategory.description}
                        </Text>
                      )}
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
                        <input type='text' placeholder='Пошук товарів...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        {searchQuery !== debouncedSearchQuery && (
                          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                          </div>
                        )}
                      </div>
                    </form>{' '}
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                      <option value='name'>За назвою</option>
                      <option value='price_asc'>Спочатку дорожчі</option>
                      <option value='price_desc'>Спочатку дешевші</option>
                      <option value='rating_desc'>За рейтингом</option>
                      <option value='newest'>Спочатку нові</option>
                    </select>
                  </div>
                </Card>{' '}
                {isLoading ? (
                  <Card className='text-center p-8'>
                    <LoadingSpinner size='lg' className='mx-auto mb-4' />
                    <Text color='muted' align='center'>
                      Завантаження...
                    </Text>
                  </Card>
                ) : products.length === 0 ? (
                  <EmptyState
                    type='search'
                    title='Товарів не знайдено'
                    description={debouncedSearchQuery ? `За запитом "${debouncedSearchQuery}" нічого не знайдено` : savedCar && !showAllProducts ? `Немає товарів, сумісних з вашим автомобілем ${savedCar.makeName} ${savedCar.modelName} ${savedCar.year} ${savedCar.bodyTypeName} ${savedCar.engineName}` : 'В цій категорії поки немає товарів'}
                    action={
                      debouncedSearchQuery ? (
                        <Button
                          variant='outline'
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
                        >
                          Очистити пошук
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <Grid
                    cols={{
                      default: viewMode === 'grid' ? 1 : 1,
                      sm: viewMode === 'grid' ? 2 : 1,
                      lg: viewMode === 'grid' ? 3 : 1,
                      xl: viewMode === 'grid' ? 4 : 1,
                    }}
                    gap={viewMode === 'grid' ? 'md' : 'sm'}
                    className={viewMode === 'list' ? 'space-y-4' : ''}
                  >
                    {' '}
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        imageUrl={product.imageUrl}
                        description={product.description}
                        category={product.manufacturer?.name}
                        rating={product.averageRating}
                        inStock={product.stockQuantity > 0}
                        layout={viewMode}
                        onAddToCart={() => {
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.imageUrl,
                            stockQuantity: product.stockQuantity,
                          });
                          setNotificationProductName(product.name);
                          setShowNotification(true);
                        }}
                      />
                    ))}
                  </Grid>
                )}
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />

      <CartNotification show={showNotification} productName={notificationProductName} onHide={() => setShowNotification(false)} />
    </div>
  );
}

function ProductsPageLoading() {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <main className='flex-grow flex items-center justify-center'>
        <div className='text-center'>
          <LoadingSpinner size='lg' className='mx-auto mb-4' />
          <Text color='muted'>Завантаження...</Text>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}
