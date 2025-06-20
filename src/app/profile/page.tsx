'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/components/AuthProvider';
import { Header, Footer, Card, Heading, Button, Text, Alert, LoadingSpinner, FormField, PasswordInput, StarRating, EmptyState, Skeleton, Grid, Modal, StatusWithIcon } from '@/components';

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
  trackingNumber?: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  novaPoshtaCity?: string | null;
  novaPoshtaBranch?: string | null;
  paymentMethod: string;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
          <LoadingSpinner size='lg' text='Перевірка автентифікації...' />
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
          <LoadingSpinner size='lg' text='Перенаправлення на сторінку входу...' />
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
          <LoadingSpinner size='lg' text='Завантаження даних профілю...' />
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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Перенаправляємо на головну сторінку після успішного видалення
        router.push('/');
      } else {
        setDeleteError(data.error || 'Помилка видалення облікового запису');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Мережева помилка');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError('');
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
      <Header />{' '}
      <main className='flex-grow py-12'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='space-y-8'>
            {/* Header */}
            <Card>
              <div className='flex justify-between items-center'>
                <Heading level={1} size='lg'>
                  Особистий кабінет
                </Heading>{' '}
                <Button
                  variant='danger'
                  onClick={async () => {
                    await logout();
                  }}
                  className='cursor-pointer'
                >
                  Вийти
                </Button>
              </div>
            </Card>{' '}
            {/* Profile Info */}
            <Card>
              <div className='border-b border-gray-200 pb-4 mb-6'>
                {' '}
                <div className='flex justify-between items-center'>
                  <Heading level={2} size='md'>
                    Особиста інформація
                  </Heading>
                  <div className='flex space-x-3'>
                    {' '}
                    {!isEditing && (
                      <Button variant='primary' size='sm' onClick={() => setIsEditing(true)} className='cursor-pointer'>
                        Редагувати
                      </Button>
                    )}
                  </div>
                </div>
              </div>{' '}
              {successMessage && <Alert type='success' message={successMessage} className='mb-6' />}
              {error && <Alert type='error' message={error} className='mb-6' />}{' '}
              {isEditing ? (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <Grid cols={{ default: 1, sm: 2 }} gap='md'>
                    <FormField label="Ім'я" name='firstName' type='text' required value={formData.firstName} onChange={handleInputChange} />
                    <FormField label='Прізвище' name='lastName' type='text' value={formData.lastName} onChange={handleInputChange} />
                  </Grid>
                  <FormField label='Email адреса' name='email' type='email' required value={formData.email} onChange={handleInputChange} />{' '}
                  <div className='border-t border-gray-200 pt-6'>
                    <Heading level={3} size='md' className='mb-4'>
                      Зміна пароля
                    </Heading>
                    <Text size='sm' color='muted' className='mb-4'>
                      Залиште поля порожніми, якщо не хочете змінювати пароль
                    </Text>

                    <div className='space-y-4'>
                      <PasswordInput label='Поточний пароль' name='currentPassword' value={formData.currentPassword} onChange={handleInputChange} />
                      <PasswordInput label='Новий пароль' name='newPassword' value={formData.newPassword} onChange={handleInputChange} placeholder='Мін. 6 символів' />
                      <PasswordInput label='Підтвердіть новий пароль' name='confirmNewPassword' value={formData.confirmNewPassword} onChange={handleInputChange} />
                    </div>
                  </div>{' '}
                  <div className='flex justify-end space-x-3'>
                    {' '}
                    <Button type='button' variant='danger' size='sm' onClick={openDeleteModal} className='cursor-pointer'>
                      Видалити обліковий запис
                    </Button>{' '}
                    <Button
                      type='button'
                      variant='secondary'
                      size='sm'
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
                      className='cursor-pointer'
                    >
                      Скасувати
                    </Button>{' '}
                    <Button type='submit' variant='primary' size='sm' disabled={isSubmitting} className='cursor-pointer'>
                      {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className='space-y-6'>
                  <Grid cols={{ default: 1, sm: 2 }} gap='md'>
                    {' '}
                    <div>
                      <Text size='sm' weight='medium' color='muted' className='mb-1'>
                        Ім&apos;я
                      </Text>
                      <Text size='sm'>{profileData.firstName}</Text>
                    </div>
                    <div>
                      <Text size='sm' weight='medium' color='muted' className='mb-1'>
                        Прізвище
                      </Text>
                      <Text size='sm'>{profileData.lastName || 'Не вказано'}</Text>
                    </div>
                  </Grid>
                  <div>
                    <Text size='sm' weight='medium' color='muted' className='mb-1'>
                      Email адреса
                    </Text>
                    <Text size='sm'>{profileData.email}</Text>
                  </div>
                </div>
              )}
            </Card>{' '}
            {/* Orders Section */}
            <Card>
              <Heading level={2} size='md' className='border-b border-gray-200 pb-4 mb-6'>
                Мої замовлення
              </Heading>
              {ordersLoading ? (
                <div className='space-y-4'>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className='h-32' />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <EmptyState title='Замовлень поки немає' description="Коли ви зробите своє перше замовлення, воно з'явиться тут" icon='📦' />
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
                        </div>{' '}
                        <div className='flex flex-col items-end'>
                          <StatusWithIcon status={order.status} />
                          {order.trackingNumber && (
                            <div className='mt-2 text-right'>
                              <Text size='xs' color='muted' className='block'>
                                Номер накладної:
                              </Text>
                              <Text size='sm' className='font-mono text-purple-700 bg-purple-50 py-1 px-2 rounded-md inline-block'>
                                {order.trackingNumber}
                              </Text>
                            </div>
                          )}
                        </div>{' '}
                      </div>{' '}
                      {/* Інформація про замовлення */}
                      <div className='border-t border-b border-gray-200 py-4 mb-4'>
                        <div className='flex flex-row flex-wrap gap-3 sm:gap-6'>
                          <div className='flex-1 min-w-[140px] max-w-[300px]'>
                            <h4 className='text-sm font-medium text-gray-700 mb-2'>Дані</h4>
                            <p className='text-sm text-gray-900 truncate'>
                              {order.customerFirstName} {order.customerLastName}
                            </p>
                            <p className='text-sm text-gray-600 truncate'>{order.customerEmail}</p>
                            <p className='text-sm text-gray-600'>{order.customerPhone}</p>
                          </div>
                          <div className='flex-1 min-w-[140px] max-w-[300px]'>
                            <h4 className='text-sm font-medium text-gray-700 mb-2'>Доставка</h4>
                            <p className='text-sm text-gray-900'>{order.deliveryMethod === 'pickup' ? 'Самовивіз' : order.deliveryMethod === 'nova_poshta' ? 'Нова Пошта' : order.deliveryMethod === 'novaposhta' ? 'Нова Пошта' : order.deliveryMethod}</p>
                            {order.novaPoshtaCity && <p className='text-sm text-gray-600'>Місто: {order.novaPoshtaCity}</p>}
                            {order.novaPoshtaBranch && <p className='text-sm text-gray-600'>Відділення: {order.novaPoshtaBranch}</p>}
                            <p className='text-sm text-gray-600'>Оплата: {order.paymentMethod === 'CASH' ? 'Готівка' : 'Картка'}</p>
                          </div>
                        </div>
                      </div>
                      <div className='grid gap-4 mb-4'>
                        {' '}
                        {order.orderItems.map((item) => (
                          <div key={item.id} className='flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 bg-gray-50 rounded-lg'>
                            <div className='flex items-center space-x-4 flex-1 min-w-0'>
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
                                  <h4 className='text-sm font-medium text-gray-900 break-words hover:text-blue-600 transition-colors'>{item.product.name}</h4>
                                </Link>
                                <p className='text-sm text-gray-500'>Кількість: {item.quantity}</p>
                                <p className='text-sm font-medium text-gray-900 sm:hidden'>{parseFloat(item.price).toFixed(2)} ₴</p>
                              </div>
                            </div>
                            <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0'>
                              {order.status === 'COMPLETED' && reviewableItems.has(`${item.product.id}-${order.id}`) && (
                                <button onClick={() => openReviewModal(item.product.id, order.id, item.product.name)} className='bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium cursor-pointer whitespace-nowrap order-2 sm:order-1'>
                                  Залишити відгук
                                </button>
                              )}
                              <div className='text-right order-1 sm:order-2'>
                                <p className='text-sm font-bold text-gray-900 hidden sm:block'>{(parseFloat(item.price) * item.quantity).toFixed(2)} ₴</p>
                                <p className='text-sm font-bold text-gray-900 sm:hidden'>{(parseFloat(item.price) * item.quantity).toFixed(2)} ₴</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='border-t pt-3 flex justify-between items-center'>
                        <span className='text-sm text-gray-500'>Загальна сума:</span> <span className='font-bold text-lg text-gray-900'>{parseFloat(order.totalPrice).toFixed(2)} ₴</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>{' '}
          </div>
        </div>
      </main>
      {/* Review Modal */}
      <Modal isOpen={!!selectedProduct} onClose={closeReviewModal} title='Відгук на товар' size='md'>
        {selectedProduct && (
          <div className='space-y-4'>
            <Text size='sm' color='muted' className='mb-4'>
              {selectedProduct.productName}
            </Text>

            {reviewSuccess && <Alert type='success' message={reviewSuccess} className='mb-4' />}

            {reviewError && <Alert type='error' message={reviewError} className='mb-4' />}

            <form onSubmit={handleSubmitReview} className='space-y-4'>
              <div>
                <Text size='sm' weight='medium' className='mb-2'>
                  Оцінка
                </Text>
                <StarRating rating={reviewForm.rating} interactive onChange={(rating: number) => setReviewForm((prev) => ({ ...prev, rating }))} />
              </div>
              <div>
                <Text size='sm' weight='medium' className='mb-2'>
                  Коментар (необов&apos;язково)
                </Text>
                <textarea id='comment' rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' placeholder='Поділіться своїм досвідом використання товару...' />
              </div>{' '}
              <div className='flex space-x-3'>
                <Button type='submit' variant='primary' disabled={submittingReview} className='flex-1 cursor-pointer'>
                  {submittingReview ? 'Додавання...' : 'Додати відгук'}
                </Button>
                <Button type='button' variant='secondary' onClick={closeReviewModal} className='cursor-pointer'>
                  Скасувати
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
      {/* Модальне вікно видалення облікового запису */}
      <Modal isOpen={showDeleteModal} onClose={closeDeleteModal} title='Видалення облікового запису' size='md'>
        <div className='space-y-4'>
          <div>
            <Text size='sm' color='muted' className='mb-4'>
              Ця дія незворотна. Всі ваші дані, замовлення та відгуки будуть видалені назавжди.
            </Text>
            <Alert type='warning' message='⚠️ Увага: Після видалення облікового запису ви не зможете його відновити!' className='mb-4' />
          </div>

          {deleteError && <Alert type='error' message={deleteError} className='mb-4' />}

          <form onSubmit={handleDeleteAccount} className='space-y-4'>
            <FormField label='Введіть ваш пароль для підтвердження' name='deletePassword' type='password' value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder='Введіть ваш пароль' required />{' '}
            <div className='flex space-x-3'>
              <Button type='submit' variant='danger' disabled={isDeleting || !deletePassword} className='flex-1 cursor-pointer'>
                {isDeleting ? 'Видалення...' : 'Підтвердити видалення'}
              </Button>
              <Button type='button' variant='secondary' onClick={closeDeleteModal} disabled={isDeleting} className='cursor-pointer'>
                Скасувати
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <Footer />
    </div>
  );
}
