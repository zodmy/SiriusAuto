'use client';

import { useState, useEffect } from 'react';
import { HiOutlineShoppingCart, HiOutlineCube, HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalCategories: number;
    totalRevenue: number;
    recentOrders: number;
    pendingOrders: number;
    completedOrders: number;
  };
  dailyOrders: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: number;
    _sum: { quantity: number };
    _count: { id: number };
    product: {
      name: string;
      price: number;
    };
  }>;
  categoryStats: Array<{
    id: number;
    name: string;
    _count: {
      products: number;
    };
  }>;
  latestOrders: Array<{
    id: number;
    totalPrice: number;
    status: string;
    orderDate: string;
    customerFirstName: string;
    customerLastName: string;
  }>;
  orderStatusStats: Array<{
    status: string;
    _count: { id: number };
  }>;
  paymentMethodStats: Array<{
    paymentMethod: string;
    _count: { id: number };
  }>;
}

const statusTranslations: { [key: string]: string } = {
  PENDING: 'Очікування',
  PAID: 'Оплачено',
  PROCESSING: 'В обробці',
  SHIPPED: 'Відправлено',
  DELIVERED: 'Доставлено',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
};

const paymentMethodTranslations: { [key: string]: string } = {
  CASH: 'Готівка',
  CARD: 'Картка',
};

// Кольори для графіків
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Помилка завантаження аналітики');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Завантаження аналітики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>Помилка: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Немає даних для відображення</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Аналітика</h1>

        {/* Основні показники */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-blue-100 text-blue-600'>
                <HiOutlineShoppingCart size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Всього замовлень</p>
                <p className='text-2xl font-semibold text-gray-900'>{data.summary.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-green-100 text-green-600'>
                <HiOutlineCurrencyDollar size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Загальний дохід</p>
                <p className='text-2xl font-semibold text-gray-900'>{Number(data.summary.totalRevenue).toLocaleString('uk-UA')} ₴</p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-purple-100 text-purple-600'>
                <HiOutlineCube size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Всього товарів</p>
                <p className='text-2xl font-semibold text-gray-900'>{data.summary.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-orange-100 text-orange-600'>
                <HiOutlineUsers size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Всього користувачів</p>
                <p className='text-2xl font-semibold text-gray-900'>{data.summary.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Додаткові показники */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-yellow-100 text-yellow-600'>
                <HiOutlineClock size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Очікують обробки</p>
                <p className='text-2xl font-semibold text-gray-900'>{data.summary.pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-green-100 text-green-600'>
                <HiOutlineCheckCircle size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Завершено замовлень</p>
                <p className='text-2xl font-semibold text-gray-900'>{data.summary.completedOrders}</p>
              </div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-indigo-100 text-indigo-600'>
                <HiOutlineClipboardList size={24} />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>За останні 30 днів</p>
                <p className='text-2xl font-semibold text-gray-900'>{data.summary.recentOrders}</p>
              </div>
            </div>
          </div>{' '}
        </div>

        {/* Графіки аналітики */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Графік доходу за останній місяць */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Дохід за останні дні</h2>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={data.dailyOrders}>
                  <defs>
                    <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#22c55e' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#22c55e' stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tickFormatter={(value) => new Date(value).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })} />
                  <YAxis tickFormatter={(value) => `${value.toLocaleString()} ₴`} />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} ₴`, 'Дохід']} labelFormatter={(label) => new Date(label).toLocaleDateString('uk-UA')} />
                  <Area type='monotone' dataKey='revenue' stroke='#22c55e' fillOpacity={1} fill='url(#colorRevenue)' strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Графік замовлень за статусом */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Розподіл замовлень за статусом</h2>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data.orderStatusStats.map((stat) => ({
                      name: statusTranslations[stat.status] || stat.status,
                      value: stat._count.id,
                      status: stat.status,
                    }))}
                    dataKey='value'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.orderStatusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Графік кількості замовлень за день */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Кількість замовлень за день</h2>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data.dailyOrders}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tickFormatter={(value) => new Date(value).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Замовлень']} labelFormatter={(label) => new Date(label).toLocaleDateString('uk-UA')} />
                  <Bar dataKey='count' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Топ товари (графік) */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Топ товари (продажі)</h2>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={data.topProducts.slice(0, 5).map((item) => ({
                    name: item.product.name.length > 20 ? item.product.name.substring(0, 20) + '...' : item.product.name,
                    sales: item._sum.quantity,
                    fullName: item.product.name,
                  }))}
                  layout='horizontal'
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' />
                  <YAxis type='category' dataKey='name' width={150} fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`${value} шт.`, 'Продано']}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.fullName || label;
                    }}
                  />
                  <Bar dataKey='sales' fill='#8b5cf6' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Топ товари */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Топ товари за місяць</h2>
            <div className='space-y-4'>
              {data.topProducts.map((item, index) => (
                <div key={item.productId} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3'>{index + 1}</div>
                    <div>
                      <p className='font-medium text-gray-900'>{item.product.name}</p>
                      <p className='text-sm text-gray-600'>{Number(item.product.price).toLocaleString('uk-UA')} ₴</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-900'>{item._sum.quantity} шт.</p>
                    <p className='text-sm text-gray-600'>{item._count.id} замовлень</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Останні замовлення */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Останні замовлення</h2>
            <div className='space-y-4'>
              {data.latestOrders.map((order) => (
                <div key={order.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-gray-900'>
                      {order.customerFirstName} {order.customerLastName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      #{order.id} • {new Date(order.orderDate).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-900'>{Number(order.totalPrice).toLocaleString('uk-UA')} ₴</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{statusTranslations[order.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Статистика по статусах */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Статуси замовлень</h2>
            <div className='space-y-3'>
              {data.orderStatusStats.map((stat) => (
                <div key={stat.status} className='flex items-center justify-between'>
                  <span className='text-gray-700'>{statusTranslations[stat.status]}</span>
                  <span className='font-semibold text-gray-900'>{stat._count.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Методи оплати */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Методи оплати</h2>
            <div className='space-y-3'>
              {data.paymentMethodStats.map((stat) => (
                <div key={stat.paymentMethod} className='flex items-center justify-between'>
                  <span className='text-gray-700'>{paymentMethodTranslations[stat.paymentMethod]}</span>
                  <span className='font-semibold text-gray-900'>{stat._count.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
