import Link from 'next/link';
import { checkAdmin } from '@/lib/auth';

export default async function AdminDashboard() {
  await checkAdmin({ redirectOnFail: true });
  const apiEndpoints = [
    { name: 'Типи кузовів автомобілів', path: '/api/car-body-types' },
    { name: 'Двигуни автомобілів', path: '/api/car-engines' },
    { name: 'Марки автомобілів', path: '/api/car-makes' },
    { name: 'Моделі автомобілів', path: '/api/car-models' },
    { name: 'Модифікації автомобілів', path: '/api/car-modifications' },
    { name: 'Роки випуску автомобілів', path: '/api/car-years' },
    { name: 'Категорії', path: '/api/categories' },
    { name: 'Сумісності', path: '/api/compatibilities' },
    { name: 'Виробники', path: '/api/manufacturers' },
    { name: 'Замовлення', path: '/api/orders' },
    { name: 'Товари', path: '/api/products' },
    { name: 'Користувачі', path: '/api/users' },
  ];

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <main className='bg-white shadow-md rounded-lg p-4'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>Керування API</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {apiEndpoints.map((endpoint) => (
            <div key={endpoint.path} className='bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow'>
              <h3 className='text-lg font-medium text-gray-800'>{endpoint.name}</h3>
              <p className='text-sm text-gray-600 mt-1'>
                Шлях: <code className='bg-gray-200 px-1 rounded'>{endpoint.path}</code>
              </p>
              <div className='mt-4'>
                <Link href={`/admin/dashboard/manage${endpoint.path.replace('/api', '')}`} className='text-indigo-600 hover:text-indigo-900 font-medium'>
                  Керувати
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
