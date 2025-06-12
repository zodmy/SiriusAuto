'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const { isAuthenticated, isInitialCheckComplete: authReady } = useAuth();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authReady, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Помилка завантаження замовлень');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      setError('Мережева помилка');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Очікує';
      case 'PROCESSING':
        return 'Обробляється';
      case 'SHIPPED':
        return 'Відправлено';
      case 'DELIVERED':
        return 'Доставлено';
      case 'CANCELLED':
        return 'Скасовано';
      default:
        return status;
    }
  };

  if (!authReady || isLoading) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-700'>Завантаження...</p>
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
        <div className='max-w-6xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Мої замовлення</h1>
            <p className='mt-2 text-sm text-gray-600'>Перегляд історії ваших замовлень та їх статусів</p>
          </div>

          {error && (
            <div className='rounded-md bg-red-50 p-4 mb-6'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                  </svg>
                </div>
                <div className='ml-3'>
                  <div className='text-sm text-red-800'>{error}</div>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className='bg-white shadow rounded-lg p-6 text-center'>
              <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
              <h3 className='mt-2 text-sm font-medium text-gray-900'>Немає замовлень</h3>
              <p className='mt-1 text-sm text-gray-500'>Ви ще не зробили жодного замовлення.</p>
              <div className='mt-6'>
                <button onClick={() => router.push('/products')} className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer'>
                  Переглянути товари
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {orders.map((order) => (
                <div key={order.id} className='bg-white shadow rounded-lg overflow-hidden'>
                  <div className='px-6 py-4 border-b border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='text-lg font-medium text-gray-900'>Замовлення #{order.id}</h3>
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
                      <div className='flex items-center space-x-4'>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                        <span className='text-lg font-semibold text-gray-900'>₴{parseFloat(order.totalPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className='px-6 py-4'>
                    <h4 className='text-sm font-medium text-gray-900 mb-3'>Товари в замовленні:</h4>
                    <div className='space-y-3'>
                      {order.orderItems.map((item) => (
                        <div key={item.id} className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900'>{item.product.name}</p>
                            <p className='text-xs text-gray-500'>Кількість: {item.quantity}</p>
                          </div>
                          <div className='text-sm font-medium text-gray-900'>₴{parseFloat(item.price).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
