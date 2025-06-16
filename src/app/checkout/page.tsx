'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { HiTrash, HiMinus, HiPlus } from 'react-icons/hi';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const { items, removeItem, getTotalPrice, clearCart, increaseQuantity, decreaseQuantity } = useCart();
  const { user, isAuthenticated, isInitialCheckComplete } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    if (isInitialCheckComplete && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isInitialCheckComplete, isAuthenticated, router]);

  useEffect(() => {
    if (user && isAuthenticated) {
      setCustomerInfo((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [user, isAuthenticated]);

  if (!isInitialCheckComplete) {
    return (
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <Header />
        <main className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Завантаження...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isInitialCheckComplete && !isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <Header />
        <main className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Перенаправлення на авторизацію...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      setError('Кошик порожній');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        clearCart();
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        setError(data.error || 'Помилка створення замовлення');
      }
    } catch (error) {
      console.error('Помилка:', error);
      setError("Помилка з'єднання із сервером");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };
  if (items.length === 0) {
    return (
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <Header />
        <main className='flex-1 flex items-center justify-center'>
          <div className='max-w-2xl mx-auto text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>Кошик порожній</h1>
            <p className='text-gray-600 mb-8'>Додайте товари до кошика для оформлення замовлення</p>
            <button onClick={() => router.push('/products')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md cursor-pointer'>
              Перейти до товарів
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      <Header />
      <main className='flex-1 container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>Оформлення замовлення</h1>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-semibold mb-6'>Контактна інформація</h2>

              {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{error}</div>}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Ім&apos;я *</label>
                    <input type='text' required value={customerInfo.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Прізвище</label>
                    <input type='text' value={customerInfo.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                  <input type='email' required value={customerInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Телефон *</label>
                  <input type='tel' required value={customerInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Адреса</label>
                  <input type='text' value={customerInfo.address} onChange={(e) => handleInputChange('address', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Місто</label>
                    <input type='text' value={customerInfo.city} onChange={(e) => handleInputChange('city', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Поштовий індекс</label>
                    <input type='text' value={customerInfo.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
                  </div>
                </div>{' '}
                <button type='submit' disabled={isSubmitting} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-md font-medium cursor-pointer disabled:cursor-not-allowed'>
                  {isSubmitting ? 'Оформлення...' : 'Оформити замовлення'}
                </button>
              </form>
            </div>{' '}
            <div className='bg-white rounded-lg shadow-md p-6 flex flex-col max-h-[70vh] min-h-[500px]'>
              <h2 className='text-xl font-semibold mb-6 flex-shrink-0'>Ваше замовлення</h2>

              <div className='flex-1 overflow-y-auto mb-4 pr-2 checkout-scroll'>
                <div className='space-y-4'>
                  {items.map((item) => (
                    <div key={item.id} className='flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg'>
                      {item.image && (
                        <div className='flex-shrink-0 w-16 h-16 relative'>
                          <Image src={item.image} alt={item.name} fill className='object-contain rounded-md' />
                        </div>
                      )}

                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-gray-900 mb-1 break-words'>{item.name}</h3>
                        <p className='text-sm text-gray-600'>₴{Number(item.price).toFixed(2)}</p>
                      </div>

                      <div className='flex items-center justify-between sm:justify-start gap-4'>
                        <div className='flex items-center gap-2'>
                          <button onClick={() => decreaseQuantity(item.id)} className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer'>
                            <HiMinus className='w-4 h-4' />
                          </button>

                          <span className='w-8 text-center font-medium'>{item.quantity}</span>

                          <button onClick={() => increaseQuantity(item.id)} className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer' disabled={!!(item.stockQuantity && item.quantity >= item.stockQuantity)}>
                            <HiPlus className='w-4 h-4' />
                          </button>

                          <button onClick={() => removeItem(item.id)} className='ml-2 text-red-500 hover:text-red-700 cursor-pointer'>
                            <HiTrash className='w-5 h-5' />
                          </button>
                        </div>

                        <div className='text-right'>
                          <p className='font-medium'>₴{(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='border-t pt-4 flex-shrink-0'>
                <div className='flex justify-between items-center text-lg font-semibold'>
                  <span>Загальна сума:</span>
                  <span>₴{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
