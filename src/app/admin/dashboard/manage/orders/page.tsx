'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import { HiOutlineArrowLeft, HiOutlineEye, HiOutlineCheck, HiOutlineX, HiOutlineClock } from 'react-icons/hi';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: number;
  totalPrice: string;
  orderDate: string;
  status: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryPrice: number;
  novaPoshtaCity?: string;
  novaPoshtaBranch?: string;
  orderItems: OrderItem[];
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName?: string;
  };
}

export default function OrdersManagementPage() {
  const { isAdmin, isLoading } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    document.title = 'Керування замовленнями - Sirius Auto Admin';
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Помилка завантаження замовлень');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Помилка завантаження замовлень');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        setError('Помилка оновлення статусу замовлення');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Помилка оновлення статусу замовлення');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
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
      case 'CONFIRMED':
        return 'Підтверджено';
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

  const filteredOrders = orders.filter((order) => statusFilter === 'all' || order.status === statusFilter);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100 p-4 flex items-center justify-center'>
        <div className='text-gray-600'>Завантаження...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <Link href='/admin/dashboard' className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors'>
            <HiOutlineArrowLeft size={20} />
            Назад до панелі адміністратора
          </Link>
        </div>

        <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold text-gray-900'>Керування замовленнями</h1>
            <div className='flex items-center gap-4'>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value='all'>Всі замовлення</option>
                <option value='PENDING'>Очікують</option>
                <option value='CONFIRMED'>Підтверджені</option>
                <option value='SHIPPED'>Відправлені</option>
                <option value='DELIVERED'>Доставлені</option>
                <option value='CANCELLED'>Скасовані</option>
              </select>
            </div>
          </div>

          {error && <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md'>{error}</div>}

          {loading ? (
            <div className='text-center py-8'>
              <div className='text-gray-600'>Завантаження замовлень...</div>
            </div>
          ) : (
            <div className='grid gap-4'>
              {filteredOrders.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>Замовлення не знайдено</div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <h3 className='font-semibold text-lg text-gray-900'>Замовлення #{order.id}</h3>
                        <p className='text-sm text-gray-500'>
                          {new Date(order.orderDate).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className='text-sm text-gray-600 mt-1'>
                          {order.customerFirstName} {order.customerLastName}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {order.customerEmail} • {order.customerPhone}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                        <button onClick={() => setSelectedOrder(order)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors' title='Переглянути деталі'>
                          <HiOutlineEye size={20} />
                        </button>
                      </div>
                    </div>

                    <div className='flex justify-between items-center'>
                      <div className='text-sm text-gray-600'>
                        Товарів: {order.orderItems.length} • Сума: ₴{parseFloat(order.totalPrice).toFixed(2)}
                      </div>
                      <div className='flex gap-2'>
                        {order.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className='px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors flex items-center gap-1'>
                              <HiOutlineCheck size={14} />
                              Підтвердити
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className='px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors flex items-center gap-1'>
                              <HiOutlineX size={14} />
                              Скасувати
                            </button>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className='px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1'>
                            <HiOutlineClock size={14} />
                            Відправити
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className='px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1'>
                            <HiOutlineCheck size={14} />
                            Доставлено
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>Деталі замовлення #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} className='p-2 hover:bg-gray-100 rounded-md'>
                  <HiOutlineX size={20} />
                </button>
              </div>

              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Інформація про замовника</h3>
                    <p className='text-sm text-gray-600'>
                      {selectedOrder.customerFirstName} {selectedOrder.customerLastName}
                    </p>
                    <p className='text-sm text-gray-600'>{selectedOrder.customerEmail}</p>
                    <p className='text-sm text-gray-600'>{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Доставка</h3>
                    <p className='text-sm text-gray-600'>{selectedOrder.deliveryMethod === 'pickup' ? 'Самовивіз' : 'Нова Пошта'}</p>
                    {selectedOrder.novaPoshtaCity && <p className='text-sm text-gray-600'>{selectedOrder.novaPoshtaCity}</p>}
                    {selectedOrder.novaPoshtaBranch && <p className='text-sm text-gray-600'>{selectedOrder.novaPoshtaBranch}</p>}
                  </div>
                </div>

                <div>
                  <h3 className='font-medium text-gray-900 mb-2'>Товари</h3>
                  <div className='space-y-2'>
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='flex-shrink-0'>
                          {item.product.imageUrl ? (
                            <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className='w-12 h-12 object-cover rounded-md' />
                          ) : (
                            <div className='w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center'>
                              <span className='text-gray-400 text-xs'>Фото</span>
                            </div>
                          )}
                        </div>
                        <div className='flex-1'>
                          <h4 className='text-sm font-medium text-gray-900'>{item.product.name}</h4>
                          <p className='text-sm text-gray-500'>
                            Кількість: {item.quantity} × ₴{parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className='text-sm font-medium text-gray-900'>₴{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='border-t pt-4'>
                  <div className='flex justify-between items-center text-lg font-bold'>
                    <span>Загальна сума:</span>
                    <span>₴{parseFloat(selectedOrder.totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
