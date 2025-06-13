'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/hooks/useAuth';
import { HiCheckCircle, HiXCircle, HiEye, HiEyeOff } from 'react-icons/hi';

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
  const router = useRouter();
  const { isAuthenticated, isInitialCheckComplete: authReady, logout } = useAuth();
  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchProfile();
      fetchOrders();
    }
  }, [isAuthenticated, authReady, router]);

  const fetchProfile = async () => {
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
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setError('Помилка завантаження профілю');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Мережева помилка');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch('/api/orders/my', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

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
        currentPassword?: string;
        newPassword?: string;
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName || null,
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
      console.error('Profile update error:', error);
      setError('Мережева помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Очікує обробки';
      case 'confirmed':
        return 'Підтверджено';
      case 'shipped':
        return 'Відправлено';
      case 'delivered':
        return 'Доставлено';
      case 'cancelled':
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
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='w-full max-w-2xl mx-auto'>
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='h-6 w-1/3 bg-gray-200 rounded mb-6 animate-pulse'></div>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6'>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
              </div>
              <div className='h-5 w-1/2 bg-gray-200 rounded mb-4 animate-pulse'></div>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
              </div>
            </div>
          </div>
        </div>
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
                  </div>

                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                      Email адреса
                    </label>
                    <div className='mt-1'>
                      <input id='email' type='email' value={profileData.email} disabled className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed' />
                      <p className='mt-1 text-xs text-gray-500'>Email адресу неможливо змінити</p>
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
                            {showPasswords.current ? (
                              <HiEyeOff className='h-5 w-5 text-gray-400' />
                            ) : (
                              <HiEye className='h-5 w-5 text-gray-400' />
                            )}
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
                            {showPasswords.new ? (
                              <HiEyeOff className='h-5 w-5 text-gray-400' />
                            ) : (
                              <HiEye className='h-5 w-5 text-gray-400' />
                            )}
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
                            {showPasswords.confirm ? (
                              <HiEyeOff className='h-5 w-5 text-gray-400' />
                            ) : (
                              <HiEye className='h-5 w-5 text-gray-400' />
                            )}
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
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Email адреса</dt>
                    <dd className='mt-1 text-sm text-gray-900'>{profileData.email}</dd>
                  </div>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>Дата реєстрації</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{new Date(profileData.createdAt).toLocaleDateString('uk-UA')}</dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>Останнє оновлення</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{new Date(profileData.updatedAt).toLocaleDateString('uk-UA')}</dd>
                    </div>{' '}
                  </div>{' '}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>{getOrderStatusText(order.status)}</span>
                      </div>

                      <div className='space-y-2 mb-3'>
                        {order.orderItems.map((item) => (
                          <div key={item.id} className='flex justify-between items-center text-sm'>
                            <span className='text-gray-700'>
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className='font-medium'>{parseFloat(item.price).toFixed(2)} ₴</span>
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
