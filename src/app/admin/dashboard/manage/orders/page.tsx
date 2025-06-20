'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import { HiOutlineArrowLeft, HiOutlineFilter, HiOutlineCheckCircle, HiOutlineClock, HiOutlineTruck, HiOutlineExclamationCircle, HiOutlineShoppingBag, HiOutlineCalendar, HiOutlineChevronDown } from 'react-icons/hi';

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
  novaPoshtaCity?: string;
  novaPoshtaBranch?: string;
  orderItems: OrderItem[];
  trackingNumber?: string | null;
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [orderForTracking, setOrderForTracking] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [editForm, setEditForm] = useState({
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryMethod: '',
    novaPoshtaCity: '',
    novaPoshtaBranch: '',
  });
  useEffect(() => {
    document.title = 'Керування замовленнями - Sirius Auto Admin';
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.status-dropdown')) {
        setOpenStatusDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
  const updateOrderStatus = async (orderId: number, newStatus: string, trackingNumber?: string | null) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, trackingNumber }),
      });

      if (response.ok) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus, trackingNumber: trackingNumber } : order)));
      } else {
        setError('Помилка оновлення статусу замовлення');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Помилка оновлення статусу замовлення');
    }
  };
  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (newStatus === 'SHIPPED') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setOrderForTracking(order);
        setTrackingNumber(order.trackingNumber || '');
      }
    } else {
      // Зберігаємо поточний номер ТТН при зміні статусу
      const order = orders.find((o) => o.id === orderId);
      const currentTrackingNumber = order?.trackingNumber || null;
      updateOrderStatus(orderId, newStatus, currentTrackingNumber);
    }
    setOpenStatusDropdown(null);
  };

  const handleTrackingNumberSubmit = () => {
    if (orderForTracking) {
      updateOrderStatus(orderForTracking.id, 'SHIPPED', trackingNumber);
      setOrderForTracking(null);
    }
  };

  const startEditingOrder = (order: Order) => {
    setEditingOrder(order.id);

    const formatPhoneForEdit = (phone: string) => {
      const normalized = normalizePhoneNumber(phone);
      const template = '+38 (0__) ___-__-__';
      const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];

      let newValue = template;
      const digits = normalized.replace(/[^0-9]/g, '').slice(-9);

      for (let i = 0; i < digits.length; i++) {
        if (digitPositions[i] !== undefined) {
          newValue = newValue.substring(0, digitPositions[i]) + digits[i] + newValue.substring(digitPositions[i] + 1);
        }
      }

      return newValue;
    };

    setEditForm({
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerEmail: order.customerEmail,
      customerPhone: formatPhoneForEdit(order.customerPhone),
      deliveryMethod: order.deliveryMethod,
      novaPoshtaCity: order.novaPoshtaCity || '',
      novaPoshtaBranch: order.novaPoshtaBranch || '',
    });
  };

  const updateOrderDetails = async (orderId: number) => {
    try {
      const normalizedEditForm = {
        ...editForm,
        customerPhone: normalizePhoneNumber(editForm.customerPhone),
      };

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedEditForm),
      });
      if (response.ok) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, ...normalizedEditForm } : order)));
        setEditingOrder(null);
      } else {
        setError('Помилка оновлення деталей замовлення');
      }
    } catch (error) {
      console.error('Error updating order details:', error);
      setError('Помилка оновлення деталей замовлення');
    }
  };
  const cancelEditing = () => {
    setEditingOrder(null);
    setEditForm({
      customerFirstName: '',
      customerLastName: '',
      customerEmail: '',
      customerPhone: '+38 (0__) ___-__-__',
      deliveryMethod: '',
      novaPoshtaCity: '',
      novaPoshtaBranch: '',
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;

    const allowedChars = /[0-9+() -]/;
    const char = value[cursorPosition - 1];

    if (char && !allowedChars.test(char)) {
      return;
    }

    const template = '+38 (0__) ___-__-__';
    const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];

    let newValue = template;
    const digits = value.replace(/[^0-9]/g, '').slice(0, 9);
    for (let i = 0; i < digits.length; i++) {
      if (digitPositions[i] !== undefined) {
        newValue = newValue.substring(0, digitPositions[i]) + digits[i] + newValue.substring(digitPositions[i] + 1);
      }
    }

    setEditForm({ ...editForm, customerPhone: newValue });
    requestAnimationFrame(() => {
      const nextDigitPosition = digitPositions.find((pos) => pos > cursorPosition);
      if (nextDigitPosition !== undefined && digits.length > 0) {
        input.setSelectionRange(nextDigitPosition, nextDigitPosition);
      }
    });
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];

    if (e.key === 'Backspace') {
      e.preventDefault();
      const prevDigitPosition = digitPositions
        .slice()
        .reverse()
        .find((pos) => pos < cursorPosition);
      if (prevDigitPosition !== undefined) {
        const newValue = input.value.substring(0, prevDigitPosition) + '_' + input.value.substring(prevDigitPosition + 1);
        setEditForm({ ...editForm, customerPhone: newValue });

        requestAnimationFrame(() => {
          input.setSelectionRange(prevDigitPosition, prevDigitPosition);
        });
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const currentDigitPosition = digitPositions.find((pos) => pos >= cursorPosition);
      if (currentDigitPosition !== undefined) {
        const newValue = input.value.substring(0, currentDigitPosition) + '_' + input.value.substring(currentDigitPosition + 1);
        setEditForm({ ...editForm, customerPhone: newValue });
      }
    } else if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();

      const nextDigitPosition = digitPositions.find((pos) => pos >= cursorPosition && input.value[pos] === '_');
      if (nextDigitPosition !== undefined) {
        const newValue = input.value.substring(0, nextDigitPosition) + e.key + input.value.substring(nextDigitPosition + 1);
        setEditForm({ ...editForm, customerPhone: newValue });
        requestAnimationFrame(() => {
          const nextEmptyPosition = digitPositions.find((pos) => pos > nextDigitPosition && newValue[pos] === '_');
          const targetPosition = nextEmptyPosition !== undefined ? nextEmptyPosition : nextDigitPosition + 1;
          input.setSelectionRange(targetPosition, targetPosition);
        });
      }
    } else if (!['ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const digitPositions = [6, 7, 10, 11, 12, 14, 15, 17, 18];
    const firstEmptyPosition = digitPositions.find((pos) => input.value[pos] === '_');

    if (firstEmptyPosition !== undefined) {
      requestAnimationFrame(() => {
        input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
      });
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <HiOutlineClock className='h-4 w-4' />;
      case 'CONFIRMED':
        return <HiOutlineCheckCircle className='h-4 w-4' />;
      case 'PAID':
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
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
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Очікує';
      case 'CONFIRMED':
        return 'Підтверджено';
      case 'PAID':
        return 'Оплачено';
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
  const getStatusOptions = () => {
    return [
      { value: 'PENDING', label: 'Очікує' },
      { value: 'CONFIRMED', label: 'Підтверджено' },
      { value: 'PAID', label: 'Оплачено' },
      { value: 'PROCESSING', label: 'Обробляється' },
      { value: 'SHIPPED', label: 'Відправлено' },
      { value: 'DELIVERED', label: 'Доставлено' },
      { value: 'COMPLETED', label: 'Виконано' },
      { value: 'CANCELLED', label: 'Скасовано' },
    ];
  };
  const normalizePhoneNumber = (phone: string) => {
    return phone.replace(/[^\d+]/g, '');
  };

  const formatPhoneNumber = (phone: string) => {
    const normalized = normalizePhoneNumber(phone);
    if (normalized.startsWith('+380') && normalized.length === 13) {
      return `+38 (0${normalized.slice(4, 6)}) ${normalized.slice(6, 9)}-${normalized.slice(9, 11)}-${normalized.slice(11, 13)}`;
    } else if (normalized.startsWith('380') && normalized.length === 12) {
      return `+38 (0${normalized.slice(3, 5)}) ${normalized.slice(5, 8)}-${normalized.slice(8, 10)}-${normalized.slice(10, 12)}`;
    }
    return phone;
  };
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const normalizedSearchQuery = normalizePhoneNumber(searchQuery);
    const normalizedOrderPhone = normalizePhoneNumber(order.customerPhone);

    const matchesSearch = searchQuery === '' || order.id.toString().includes(searchQuery) || order.customerFirstName.toLowerCase().includes(searchQuery.toLowerCase()) || order.customerLastName.toLowerCase().includes(searchQuery.toLowerCase()) || order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) || normalizedOrderPhone.includes(normalizedSearchQuery);
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }
  return (
    <div className='min-h-screen bg-gray-50 p-1 sm:p-4 flex flex-col mobile-container'>
      <main className='bg-white shadow-xl rounded-2xl p-2 sm:p-8 max-w-full mx-auto border border-gray-200 flex flex-col w-full'>
        <div className='mb-3 flex-shrink-0'>
          {' '}
          <a href='/admin/dashboard' className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-base sm:text-lg transition-colors shadow-sm border border-gray-300 cursor-pointer'>
            <HiOutlineArrowLeft className='h-5 w-5 text-gray-500' />
            На головну
          </a>
        </div>
        <h2 className='text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3 flex-shrink-0'>
          <span className='text-purple-700'>
            <HiOutlineShoppingBag className='inline-block mr-1' size={24} />
          </span>{' '}
          Керування замовленнями
        </h2>
        <div className='mb-4 flex justify-between items-center lg:hidden'>
          {' '}
          <button onClick={() => setShowFilters(!showFilters)} className='inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer'>
            <HiOutlineFilter className='h-4 w-4' />
            Фільтри
          </button>
        </div>{' '}
        {showFilters && (
          <div className='lg:hidden mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Пошук замовлень</label>
                <input type='text' placeholder='Пошук за номером, клієнтом, email або телефоном...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Статус замовлення</label>{' '}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer'>
                  <option value='all'>Всі замовлення</option>
                  <option value='PENDING'>Очікують</option>
                  <option value='CONFIRMED'>Підтверджені</option>
                  <option value='PAID'>Оплачені</option>
                  <option value='PROCESSING'>Обробляються</option>
                  <option value='SHIPPED'>Відправлені</option>
                  <option value='DELIVERED'>Доставлені</option>
                  <option value='COMPLETED'>Виконані</option>
                  <option value='CANCELLED'>Скасовані</option>
                </select>
              </div>
            </div>
          </div>
        )}{' '}
        <div className='hidden lg:flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
          <div className='flex items-center space-x-4 flex-1'>
            <div className='flex items-center space-x-2'>
              <HiOutlineFilter className='h-5 w-5 text-gray-400' />
              <span className='text-sm font-medium text-gray-700'>Фільтри:</span>
            </div>{' '}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer'>
              <option value='all'>Всі замовлення</option>
              <option value='PENDING'>Очікують</option>
              <option value='CONFIRMED'>Підтверджені</option>
              <option value='PAID'>Оплачені</option>
              <option value='PROCESSING'>Обробляються</option>
              <option value='SHIPPED'>Відправлені</option>
              <option value='DELIVERED'>Доставлені</option>
              <option value='COMPLETED'>Виконані</option>
              <option value='CANCELLED'>Скасовані</option>
            </select>
            <input type='text' placeholder='Пошук за номером, клієнтом, email або телефоном...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-text mr-4' />
          </div>
          <div className='text-sm text-gray-500 whitespace-nowrap'>Знайдено: {filteredOrders.length}</div>
        </div>
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <HiOutlineExclamationCircle className='h-5 w-5 text-red-400 mr-2' />
              <p className='text-red-700'>{error}</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Завантаження замовлень...</p>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {filteredOrders.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
                <HiOutlineShoppingBag className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Замовлення не знайдено</h3>
                <p className='text-gray-500'>Спробуйте змінити фільтри або додати нові замовлення</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className='bg-white rounded-lg shadow-sm border border-gray-200'>
                  <div className='p-4 sm:p-6 border-b border-gray-100'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                      {' '}
                      <div className='flex items-center space-x-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Замовлення #{order.id}</h3>{' '}
                        <div className='relative status-dropdown'>
                          {' '}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Button clicked, current dropdown:', openStatusDropdown, 'order.id:', order.id);
                              setOpenStatusDropdown(openStatusDropdown === order.id ? null : order.id);
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                            <HiOutlineChevronDown className={`h-4 w-4 transition-transform ${openStatusDropdown === order.id ? 'rotate-180' : ''}`} />
                          </button>
                          {openStatusDropdown === order.id && (
                            <div className='absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20'>
                              {' '}
                              {getStatusOptions().map((option) => (
                                <button
                                  key={option.value}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(order.id, option.value);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer ${order.status === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>{' '}
                      <div className='flex items-center space-x-3'>
                        <div className='text-sm text-gray-500'>
                          <HiOutlineCalendar className='h-4 w-4 inline mr-1' />
                          {new Date(order.orderDate).toLocaleDateString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-4 sm:p-6'>
                    {' '}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Клієнт</h4>
                        <p className='text-sm text-gray-900'>
                          {order.customerFirstName} {order.customerLastName}
                        </p>
                        <p className='text-sm text-gray-600'>{order.customerEmail}</p>
                        <p className='text-sm text-gray-600'>{formatPhoneNumber(order.customerPhone)}</p>
                      </div>
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Доставка</h4>
                        <p className='text-sm text-gray-900'>{order.deliveryMethod === 'pickup' ? 'Самовивіз' : 'Нова Пошта'}</p>
                        {order.novaPoshtaCity && <p className='text-sm text-gray-600'>{order.novaPoshtaCity}</p>}
                        {order.novaPoshtaBranch && <p className='text-sm text-gray-600'>{order.novaPoshtaBranch}</p>}
                        {order.trackingNumber && <p className='text-sm text-gray-600 font-medium'>ТТН: {order.trackingNumber}</p>}
                      </div>
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Замовлення</h4>
                        <p className='text-sm text-gray-900'>{order.orderItems.length} товарів</p>
                        <p className='text-lg font-semibold text-blue-600'>₴{parseFloat(order.totalPrice).toFixed(2)}</p>
                      </div>{' '}
                    </div>{' '}
                    <div className='border-t border-gray-100 pt-4 space-y-6'>
                      {editingOrder === order.id ? (
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <h4 className='text-lg font-medium text-gray-900 mb-4'>Редагування замовлення</h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>Ім&apos;я</label>
                              <input type='text' value={editForm.customerFirstName} onChange={(e) => setEditForm({ ...editForm, customerFirstName: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text' />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>Прізвище</label>
                              <input type='text' value={editForm.customerLastName} onChange={(e) => setEditForm({ ...editForm, customerLastName: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text' />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                              <input type='email' value={editForm.customerEmail} onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text' />
                            </div>{' '}
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>Телефон</label>
                              <input type='tel' value={editForm.customerPhone} onChange={handlePhoneChange} onKeyDown={handlePhoneKeyDown} onClick={handlePhoneClick} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text' />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>Спосіб доставки</label>
                              <select value={editForm.deliveryMethod} onChange={(e) => setEditForm({ ...editForm, deliveryMethod: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'>
                                <option value='pickup'>Самовивіз</option>
                                <option value='nova_poshta'>Нова Пошта</option>
                              </select>
                            </div>
                            {editForm.deliveryMethod === 'nova_poshta' && (
                              <>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>Місто</label>
                                  <input type='text' value={editForm.novaPoshtaCity} onChange={(e) => setEditForm({ ...editForm, novaPoshtaCity: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text' />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>Відділення</label>
                                  <input type='text' value={editForm.novaPoshtaBranch} onChange={(e) => setEditForm({ ...editForm, novaPoshtaBranch: e.target.value })} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text' />
                                </div>
                              </>
                            )}
                          </div>
                          <div className='flex items-center justify-end space-x-3 mt-4'>
                            {' '}
                            <button onClick={cancelEditing} className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer'>
                              Скасувати
                            </button>
                            <button onClick={() => updateOrderDetails(order.id)} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer'>
                              Зберегти
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
                              <HiOutlineShoppingBag className='h-5 w-5 mr-2' />
                              Товари ({order.orderItems.length})
                            </h4>
                            <div className='space-y-3'>
                              {order.orderItems.map((item) => (
                                <Link key={item.id} href={`/products/${item.product.id}`} className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'>
                                  <div className='flex-shrink-0'>
                                    {item.product.imageUrl ? (
                                      <Image src={item.product.imageUrl} alt={item.product.name} width={60} height={60} className='h-15 w-15 object-cover rounded-lg' />
                                    ) : (
                                      <div className='h-15 w-15 bg-gray-200 rounded-lg flex items-center justify-center'>
                                        <span className='text-gray-400 text-xs'>Фото</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className='flex-1 min-w-0'>
                                    <h5 className='text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate'>{item.product.name}</h5>
                                    <p className='text-sm text-gray-500 mt-1'>
                                      {item.quantity} × ₴{parseFloat(item.price).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className='text-sm font-semibold text-gray-900'>₴{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                </Link>
                              ))}
                            </div>
                          </div>{' '}
                          <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                            <button onClick={() => startEditingOrder(order)} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer'>
                              Редагувати замовлення
                            </button>
                          </div>{' '}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}{' '}
        {orderForTracking && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4' onClick={() => setOrderForTracking(null)}>
            <div className='relative z-10 mx-auto p-5 border w-full max-w-sm shadow-lg rounded-md bg-white' onClick={(e) => e.stopPropagation()}>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>Введіть номер накладної</h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>Для замовлення #{orderForTracking.id}</p>
              </div>
              <div className='mt-4'>
                <input type='text' value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Номер накладної' />
              </div>
              <div className='flex items-center justify-end space-x-3 mt-4'>
                <button onClick={() => setOrderForTracking(null)} className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer'>
                  Скасувати
                </button>
                <button onClick={handleTrackingNumberSubmit} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer'>
                  Зберегти
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
