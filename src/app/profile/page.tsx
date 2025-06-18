'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/components/AuthProvider';
import { HiCheckCircle, HiXCircle, HiEye, HiEyeOff, HiOutlineCheckCircle, HiOutlineClock, HiOutlineTruck, HiOutlineExclamationCircle, HiStar } from 'react-icons/hi';

interface ProfileData {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    price: string;
  };
}

interface Order {
  id: number;
  totalPrice: string;
  orderDate: string;
  status: string;
  orderItems: OrderItem[];
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [selectedProduct, setSelectedProduct] = useState<{ productId: number; orderId: number; productName: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({
    productId: 0,
    orderId: 0,
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewableItems, setReviewableItems] = useState<Set<string>>(new Set());

  const router = useRouter();
  const { isAuthenticated, isInitialCheckComplete: authReady, logout } = useAuth();

  useEffect(() => {
    document.title = 'Мій профіль - Sirius Auto';
  }, []);

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.push('/login');
    }
  }, [authReady, isAuthenticated, router]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName || '',
          email: data.email,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setError('Помилка завантаження профілю');
      }
    } catch (error) {
      console.error('Помилка отримання профілю:', error);
      setError('Мережева помилка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch('/api/orders/my', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Не вдалося отримати замовлення');
      }
    } catch (error) {
      console.error('Помилка отримання замовлень:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchReviewableItems = useCallback(async () => {
    try {
      const response = await fetch('/api/user/orders/reviewable', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const reviewableSet = new Set<string>();
        data.forEach((order: { id: number; orderItems: { productId: number }[] }) => {
          order.orderItems.forEach((item: { productId: number }) => {
            reviewableSet.add(`${item.productId}-${order.id}`);
          });
        });

        setReviewableItems(reviewableSet);
      }
    } catch (error) {
      console.error('Error fetching reviewable items:', error);
    }
  }, []);

  const openReviewModal = (productId: number, orderId: number, productName: string) => {
    setSelectedProduct({ productId, orderId, productName });
    setReviewForm({
      productId,
      orderId,
      rating: 5,
      comment: '',
    });
    setReviewError('');
    setReviewSuccess('');
  };

  const closeReviewModal = () => {
    setSelectedProduct(null);
    setReviewForm({
      productId: 0,
      orderId: 0,
      rating: 5,
      comment: '',
    });
    setReviewError('');
    setReviewSuccess('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setReviewSuccess('Відгук успішно додано!');
        setTimeout(() => {
          closeReviewModal();
          fetchReviewableItems();
        }, 2000);
      } else {
        setReviewError(data.error || 'Помилка створення відгуку');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Мережева помилка');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <HiStar key={star} className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`} onClick={interactive ? () => setReviewForm((prev) => ({ ...prev, rating: star })) : undefined} />
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (authReady && isAuthenticated) {
      fetchProfile();
      fetchOrders();
      fetchReviewableItems();
    }
  }, [authReady, isAuthenticated, fetchProfile, fetchOrders, fetchReviewableItems]);

  if (!authReady) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-xl'>Перевірка автентифікації...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-xl'>Перенаправлення на сторінку входу...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-xl'>Завантаження даних профілю...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "Ім'я є обов'язковим";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        return 'Введіть поточний пароль для зміни пароля';
      }

      if (formData.newPassword.length < 6) {
        return 'Новий пароль повинен містити принаймні 6 символів';
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        return 'Паролі не співпадають';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData: {
        firstName: string;
        lastName: string | null;
        email: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName || null,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
        setSuccessMessage('Профіль успішно оновлено');
        setIsEditing(false);
      } else {
        setError(data.error || 'Помилка оновлення профілю');
      }
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      setError('Мережева помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <HiOutlineClock className='h-4 w-4' />;
      case 'CONFIRMED':
        return <HiOutlineCheckCircle className='h-4 w-4' />;
      case 'PROCESSING':
        return <HiOutlineClock className='h-4 w-4' />;
      case 'SHIPPED':
        return <HiOutlineTruck className='h-4 w-4' />;
      case 'DELIVERED':
        return <HiOutlineCheckCircle className='h-4 w-4' />;
      case 'COMPLETED':
        return <HiOutlineCheckCircle className='h-4 w-4' />;
      case 'CANCELLED':
        return <HiOutlineExclamationCircle className='h-4 w-4' />;
      default:
        return <HiOutlineClock className='h-4 w-4' />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Очікує';
      case 'CONFIRMED':
        return 'Підтверджено';
      case 'PROCESSING':
        return 'Обробляється';
      case 'SHIPPED':
        return 'Відправлено';
      case 'DELIVERED':
        return 'Доставлено';
      case 'COMPLETED':
        return 'Виконано';
      case 'CANCELLED':
        return 'Скасовано';
      default:
        return status;
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  if (!authReady) {
    return <div className='min-h-screen bg-gray-50'></div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-xl'>Завантаження даних профілю...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-red-600'>Помилка завантаження профілю</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <div className='flex-grow py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto space-y-8'>
          <div className='bg-white shadow rounded-lg'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-bold text-gray-900'>Особистий кабінет</h1>
                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer'
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>

          <div className='bg-white shadow rounded-lg'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold text-gray-900'>Особиста інформація</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer'>
                    Редагувати
                  </button>
                )}
              </div>
            </div>

            <div className='p-6'>
              {successMessage && (
                <div className='rounded-md bg-green-50 p-4 mb-6'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <HiCheckCircle className='h-5 w-5 text-green-400' />
                    </div>
                    <div className='ml-3'>
                      <div className='text-sm text-green-800'>{successMessage}</div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className='rounded-md bg-red-50 p-4 mb-6'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <HiXCircle className='h-5 w-5 text-red-400' />
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-800'>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div>
                      <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
                        {"Ім'я"} <span className='text-red-500'>*</span>
                      </label>
                      <div className='mt-1'>
                        <input id='firstName' name='firstName' type='text' required value={formData.firstName} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                      </div>
                    </div>

                    <div>
                      <label htmlFor='lastName' className='block text-sm font-medium text-gray-700'>
                        Прізвище
                      </label>
                      <div className='mt-1'>
                        <input id='lastName' name='lastName' type='text' value={formData.lastName} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                      </div>
                    </div>
                  </div>{' '}
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                      Email адреса
                    </label>
                    <div className='mt-1'>
                      <input id='email' name='email' type='email' required value={formData.email} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                    </div>
                  </div>
                  <div className='border-t border-gray-200 pt-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Зміна пароля</h3>
                    <p className='text-sm text-gray-600 mb-4'>Залиште поля порожніми, якщо не хочете змінювати пароль</p>

                    <div className='space-y-4'>
                      <div>
                        <label htmlFor='currentPassword' className='block text-sm font-medium text-gray-700'>
                          Поточний пароль
                        </label>
                        <div className='mt-1 relative'>
                          <input id='currentPassword' name='currentPassword' type={showPasswords.current ? 'text' : 'password'} value={formData.currentPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                          <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => togglePasswordVisibility('current')}>
                            {showPasswords.current ? <HiEyeOff className='h-5 w-5 text-gray-400' /> : <HiEye className='h-5 w-5 text-gray-400' />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>
                          Новий пароль
                        </label>
                        <div className='mt-1 relative'>
                          <input id='newPassword' name='newPassword' type={showPasswords.new ? 'text' : 'password'} value={formData.newPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' placeholder='Мін. 6 символів' />
                          <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => togglePasswordVisibility('new')}>
                            {showPasswords.new ? <HiEyeOff className='h-5 w-5 text-gray-400' /> : <HiEye className='h-5 w-5 text-gray-400' />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor='confirmNewPassword' className='block text-sm font-medium text-gray-700'>
                          Підтвердіть новий пароль
                        </label>
                        <div className='mt-1 relative'>
                          <input id='confirmNewPassword' name='confirmNewPassword' type={showPasswords.confirm ? 'text' : 'password'} value={formData.confirmNewPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                          <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => togglePasswordVisibility('confirm')}>
                            {showPasswords.confirm ? <HiEyeOff className='h-5 w-5 text-gray-400' /> : <HiEye className='h-5 w-5 text-gray-400' />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end space-x-3'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: profileData.firstName,
                          lastName: profileData.lastName || '',
                          email: profileData.email,
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: '',
                        });
                        setError('');
                        setSuccessMessage('');
                      }}
                      className='bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer'
                    >
                      Скасувати
                    </button>
                    <button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'>
                      {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>{"Ім'я"}</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{profileData.firstName}</dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>Прізвище</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{profileData.lastName || 'Не вказано'}</dd>
                    </div>
                  </div>{' '}
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Email адреса</dt>
                    <dd className='mt-1 text-sm text-gray-900'>{profileData.email}</dd>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='bg-white shadow rounded-lg'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>Мої замовлення</h2>
            </div>
            <div className='p-6'>
              {ordersLoading ? (
                <div className='space-y-4'>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className='border border-gray-200 rounded-lg p-4'>
                      <div className='animate-pulse'>
                        <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/3 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/6'></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='text-gray-500'>
                    <svg className='w-12 h-12 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                    </svg>
                    <p className='text-lg font-medium'>Замовлень поки немає</p>
                    <p className='text-sm text-gray-400 mt-1'>Коли ви зробите своє перше замовлення, воно з&apos;явиться тут</p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {orders.map((order) => (
                    <div key={order.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Замовлення #{order.id}</h3>
                          <p className='text-sm text-gray-500'>
                            {new Date(order.orderDate).toLocaleDateString('uk-UA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusIcon(order.status)}
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>{' '}
                      <div className='grid gap-4 mb-4'>
                        {order.orderItems.map((item) => (
                          <div key={item.id} className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg'>
                            <div className='flex-shrink-0'>
                              {item.product.imageUrl ? (
                                <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className='w-16 h-16 object-cover rounded-md' />
                              ) : (
                                <div className='w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center'>
                                  <span className='text-gray-400 text-xs'>Фото</span>
                                </div>
                              )}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <Link href={`/products/${item.product.id}`} className='block'>
                                <h4 className='text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors'>{item.product.name}</h4>
                              </Link>
                              <p className='text-sm text-gray-500'>Кількість: {item.quantity}</p>
                              <p className='text-sm font-medium text-gray-900'>{parseFloat(item.price).toFixed(2)} ₴</p>
                            </div>{' '}
                            <div className='flex items-center space-x-3'>
                              {order.status === 'COMPLETED' && reviewableItems.has(`${item.product.id}-${order.id}`) && (
                                <button onClick={() => openReviewModal(item.product.id, order.id, item.product.name)} className='bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium cursor-pointer'>
                                  Залишити відгук
                                </button>
                              )}
                              <div className='text-right'>
                                <p className='text-sm font-bold text-gray-900'>{(parseFloat(item.price) * item.quantity).toFixed(2)} ₴</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='border-t pt-3 flex justify-between items-center'>
                        <span className='text-sm text-gray-500'>Загальна сума:</span>
                        <span className='font-bold text-lg text-gray-900'>{parseFloat(order.totalPrice).toFixed(2)} ₴</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>{' '}
          </div>
        </div>
      </div>{' '}
      {selectedProduct && (
        <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Відгук на товар</h3>
            <p className='text-gray-600 mb-4'>{selectedProduct.productName}</p>

            {reviewSuccess && (
              <div className='bg-green-50 border border-green-200 rounded-md p-3 mb-4'>
                <p className='text-green-800'>{reviewSuccess}</p>
              </div>
            )}

            {reviewError && (
              <div className='bg-red-50 border border-red-200 rounded-md p-3 mb-4'>
                <p className='text-red-800'>{reviewError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Оцінка</label>
                {renderStars(reviewForm.rating, true)}
              </div>

              <div>
                <label htmlFor='comment' className='block text-sm font-medium text-gray-700 mb-2'>
                  Коментар (необов&apos;язково)
                </label>
                <textarea id='comment' rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' placeholder='Поділіться своїм досвідом використання товару...' />
              </div>

              <div className='flex space-x-3'>
                <button type='submit' disabled={submittingReview} className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer'>
                  {submittingReview ? 'Додавання...' : 'Додати відгук'}
                </button>
                <button type='button' onClick={closeReviewModal} className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer'>
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
