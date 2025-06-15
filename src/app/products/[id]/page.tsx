'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { HiTag, HiChevronRight, HiHome, HiShoppingCart, HiStar, HiCheck, HiX, HiInformationCircle } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';

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
    parent?: {
      id: number;
      name: string;
    };
  };
  compatibleVehicles?: {
    id: number;
    carMake: { name: string };
    carModel: { name: string };
    carYear: { year: number };
    carBodyType: { name: string };
    carEngine: { name: string };
  }[];
  reviews?: Review[];
  variants?: Product[];
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
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

// Функція для відображення рейтингу в зірках
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<HiStar key={i} className='w-5 h-5 text-yellow-400 fill-current' />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className='relative w-5 h-5'>
          <HiStar className='w-5 h-5 text-gray-300 fill-current absolute' />
          <div className='overflow-hidden w-1/2'>
            <HiStar className='w-5 h-5 text-yellow-400 fill-current' />
          </div>
        </div>
      );
    } else {
      stars.push(<HiStar key={i} className='w-5 h-5 text-gray-300 fill-current' />);
    }
  }

  return stars;
};

function ProductPageContent() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [savedCar, setSavedCar] = useState<SavedCarSelection | null>(null);
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

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
    const fetchProduct = async () => {
      if (!productId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          if (savedCar && data.compatibleVehicles) {
            const compatible = data.compatibleVehicles.some((vehicle: { carMake: { name: string }; carModel: { name: string }; carYear: { year: number }; carBodyType: { name: string }; carEngine: { name: string } }) => vehicle.carMake.name === savedCar.makeName && vehicle.carModel.name === savedCar.modelName && vehicle.carYear.year === savedCar.year && vehicle.carBodyType.name === savedCar.bodyTypeName && vehicle.carEngine.name === savedCar.engineName);
            setIsCompatible(compatible);
          }
        } else if (response.status === 404) {
          setError('Товар не знайдено');
        } else {
          setError('Помилка завантаження товару');
        }
      } catch (error) {
        console.error('Помилка:', error);
        setError('Помилка завантаження товару');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, savedCar]);

  const breadcrumbs = () => {
    const crumbs = [{ name: 'Головна', href: '/' }];

    if (product?.category) {
      if (product.category.parent) {
        crumbs.push({
          name: product.category.parent.name,
          href: `/products?category=${encodeURIComponent(product.category.parent.name)}`,
        });
      }
      crumbs.push({
        name: product.category.name,
        href: `/products?category=${encodeURIComponent(product.category.name)}`,
      });
    }

    if (product) {
      crumbs.push({
        name: product.name,
        href: '',
      });
    }

    return crumbs;
  };

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity === 0) return;

    setIsAddingToCart(true);
    try {
      console.log('Додано до кошика:', { productId: product.id, quantity });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Помилка додавання до кошика:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Завантаження товару...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <HiTag className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>{error || 'Товар не знайдено'}</h2>
            <p className='text-gray-600 mb-4'>Перевірте правильність посилання або поверніться до каталогу</p>
            <Link href='/products' className='text-blue-600 hover:text-blue-800 font-medium'>
              Повернутися до каталогу
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          <div className={`border-b ${isCompatible === true ? 'bg-green-50 border-green-200' : isCompatible === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
              <div className='flex items-center gap-3'>
                <FaCar className={`${isCompatible === true ? 'text-green-600' : isCompatible === false ? 'text-red-600' : 'text-blue-600'}`} />
                <span className={`font-medium ${isCompatible === true ? 'text-green-800' : isCompatible === false ? 'text-red-800' : 'text-blue-800'}`}>
                  Обраний автомобіль: {savedCar.makeName} {savedCar.modelName} {savedCar.year} ({savedCar.bodyTypeName}, {savedCar.engineName})
                </span>
                {isCompatible === true && <HiCheck className='w-5 h-5 text-green-600' />}
                {isCompatible === false && <HiX className='w-5 h-5 text-red-600' />}
                {isCompatible !== null && <span className={`text-sm ${isCompatible ? 'text-green-700' : 'text-red-700'}`}>{isCompatible ? 'Сумісний' : 'Не сумісний'}</span>}
              </div>
            </div>
          </div>
        )}

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            <div>
              <div className='aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden mb-4'>
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} width={600} height={600} className='w-full h-full object-contain' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-gray-400'>
                    <HiTag className='w-24 h-24' />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className='mb-4'>
                {product.manufacturer && <p className='text-sm text-gray-600 mb-2'>{product.manufacturer.name}</p>}
                <h1 className='text-3xl font-bold text-gray-900 mb-4'>{product.name}</h1>

                {product.averageRating !== undefined && product.averageRating > 0 && (
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='flex items-center'>{renderStars(Math.round(product.averageRating))}</div>
                    <span className='text-sm text-gray-600'>
                      {product.averageRating.toFixed(1)} ({product.reviews?.length || 0} відгуків)
                    </span>
                  </div>
                )}
              </div>

              <div className='mb-6'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-3xl font-bold text-blue-600'>₴{Number(product.price).toFixed(2)}</span>
                </div>
              </div>

              <div className='mb-6'>
                {' '}
                <div className='flex items-center gap-2'>
                  {product.stockQuantity > 0 ? (
                    <>
                      <HiCheck className='w-5 h-5 text-green-600' />
                      <span className='text-green-600 font-medium'>В наявності</span>
                    </>
                  ) : (
                    <>
                      <HiX className='w-5 h-5 text-red-600' />
                      <span className='text-red-600 font-medium'>Немає в наявності</span>
                    </>
                  )}
                </div>
              </div>

              {product.stockQuantity > 0 && (
                <div className='mb-6'>
                  <div className='flex items-center gap-4 mb-4'>
                    <label className='text-sm font-medium text-gray-700'>Кількість:</label>
                    <div className='flex items-center border border-gray-300 rounded-md'>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className='px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer'>
                        -
                      </button>
                      <input type='number' min='1' max={product.stockQuantity} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))} className='w-16 text-center border-0 focus:ring-0' />
                      <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} className='px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer'>
                        +
                      </button>
                    </div>
                  </div>{' '}
                  <div className='flex gap-4'>
                    <button onClick={handleAddToCart} disabled={isAddingToCart} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer'>
                      <HiShoppingCart className='w-5 h-5' />
                      {isAddingToCart ? 'Додавання...' : 'Додати до кошика'}
                    </button>
                  </div>
                </div>
              )}

              {isCompatible === false && (
                <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
                  <div className='flex items-start gap-3'>
                    <HiInformationCircle className='w-5 h-5 text-red-600 mt-0.5' />
                    <div>
                      <h3 className='text-sm font-medium text-red-800 mb-1'>Увага!</h3>
                      <p className='text-sm text-red-700'>Цей товар не сумісний з вашим обраним автомобілем. Перевірте сумісність або оберіть інший автомобіль.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm'>
            {' '}
            <div className='border-b border-gray-200'>
              <nav className='flex'>
                <button onClick={() => setActiveTab('description')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Опис
                </button>
                <button onClick={() => setActiveTab('reviews')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Відгуки ({product.reviews?.length || 0})
                </button>
              </nav>
            </div>{' '}
            <div className='p-6'>
              {activeTab === 'description' && (
                <div>
                  {product.description ? (
                    <div className='prose max-w-none'>
                      <p className='text-gray-700 leading-relaxed'>{product.description}</p>
                    </div>
                  ) : (
                    <p className='text-gray-500 italic'>Опис товару відсутній</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className='space-y-6'>
                      {product.reviews.map((review) => (
                        <div key={review.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
                          <div className='flex items-start justify-between mb-2'>
                            <div>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='font-medium text-gray-900'>
                                  {review.user.firstName} {review.user.lastName}
                                </span>
                                <div className='flex items-center'>{renderStars(review.rating)}</div>
                              </div>
                              <span className='text-sm text-gray-500'>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</span>
                            </div>
                          </div>
                          {review.comment && <p className='text-gray-700 mt-2'>{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <HiStar className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                      <p className='text-gray-500'>Ще немає відгуків для цього товару</p>
                    </div>
                  )}
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

function ProductPageLoading() {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <main className='flex-grow flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Завантаження товару...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductPageLoading />}>
      <ProductPageContent />
    </Suspense>
  );
}
