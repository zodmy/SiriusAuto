'use client';

import { useEffect, useState } from 'react';
import { checkAdminClient } from '@/lib/auth-client';

interface ApiRoute {
  method: string;
  path: string;
  description: string;
}

export default function ManageApiPage() {
  const [apiRoutes, setApiRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminClient();
  }, []);

  useEffect(() => {
    try {
      const discoveredRoutes: ApiRoute[] = [
        { method: 'GET', path: '/api/admin/login', description: 'Вхід адміністратора' },
        { method: 'GET, POST', path: '/api/car-body-types', description: 'Керування типами кузовів автомобілів' },
        { method: 'GET, PUT, DELETE', path: '/api/car-body-types/[id]', description: 'Керування конкретним типом кузова автомобіля' },
        { method: 'GET', path: '/api/car-body-types/[id]/modifications', description: 'Керування модифікаціями для типу кузова автомобіля' },
        { method: 'GET, POST', path: '/api/car-engines', description: 'Керування двигунами автомобілів' },
        { method: 'GET, PUT, DELETE', path: '/api/car-engines/[id]', description: 'Керування конкретним двигуном автомобіля' },
        { method: 'GET', path: '/api/car-engines/[id]/body-types', description: 'Керування типами кузовів для двигуна автомобіля' },
        { method: 'GET, POST', path: '/api/car-makes', description: 'Керування марками автомобілів' },
        { method: 'GET, PUT, DELETE', path: '/api/car-makes/[id]', description: 'Керування конкретною маркою автомобіля' },
        { method: 'GET', path: '/api/car-makes/[id]/models', description: 'Керування моделями для марки автомобіля' },
        { method: 'GET, POST', path: '/api/car-models', description: 'Керування моделями автомобілів' },
        { method: 'GET, PUT, DELETE', path: '/api/car-models/[id]', description: 'Керування конкретною моделлю автомобіля' },
        { method: 'GET', path: '/api/car-models/[id]/years', description: 'Керування роками для моделі автомобіля' },
        { method: 'GET, POST', path: '/api/car-modifications', description: 'Керування модифікаціями автомобілів' },
        { method: 'GET, PUT, DELETE', path: '/api/car-modifications/[id]', description: 'Керування конкретною модифікацією автомобіля' },
        { method: 'GET, POST', path: '/api/car-years', description: 'Керування роками випуску автомобілів' },
        { method: 'GET, PUT, DELETE', path: '/api/car-years/[id]', description: 'Керування конкретним роком випуску автомобіля' },
        { method: 'GET', path: '/api/car-years/[id]/engines', description: 'Керування двигунами для року випуску автомобіля' },
        { method: 'GET, POST', path: '/api/categories', description: 'Керування категоріями' },
        { method: 'GET, PUT, DELETE', path: '/api/categories/[id]', description: 'Керування конкретною категорією' },
        { method: 'GET', path: '/api/categories/[id]/children', description: 'Керування дочірніми категоріями' },
        { method: 'GET', path: '/api/categories/[id]/products', description: 'Керування товарами в категорії' },
        { method: 'GET, POST', path: '/api/compatibilities', description: 'Керування сумісностями' },
        { method: 'GET, PUT, DELETE', path: '/api/compatibilities/[id]', description: 'Керування конкретною сумісністю' },
        { method: 'GET', path: '/api/compatibilities/find-by-car', description: 'Пошук сумісностей за автомобілем' },
        { method: 'GET, POST', path: '/api/manufacturers', description: 'Керування виробниками' },
        { method: 'GET, PUT, DELETE', path: '/api/manufacturers/[id]', description: 'Керування конкретним виробником' },
        { method: 'GET', path: '/api/manufacturers/[id]/products', description: 'Керування товарами виробника' },
        { method: 'GET, POST', path: '/api/orders', description: 'Керування замовленнями' },
        { method: 'GET, PUT, DELETE', path: '/api/orders/[id]', description: 'Керування конкретним замовленням' },
        { method: 'GET, POST', path: '/api/products', description: 'Керування товарами' },
        { method: 'GET, PUT, DELETE', path: '/api/products/[id]', description: 'Керування конкретним товаром' },
        { method: 'GET', path: '/api/products/[id]/compatibilities', description: 'Керування сумісностями для товару' },
        { method: 'GET, POST', path: '/api/products/[id]/options', description: 'Керування опціями для товару' },
        { method: 'PUT, DELETE', path: '/api/products/[id]/options/[optionId]', description: 'Керування конкретною опцією товару' },
        { method: 'GET', path: '/api/products/[id]/reviews', description: 'Керування відгуками для товару' },
        { method: 'GET', path: '/api/products/[id]/variants', description: 'Керування варіантами для товару' },
        { method: 'GET, POST', path: '/api/users', description: 'Керування користувачами' },
        { method: 'GET, PUT, DELETE', path: '/api/users/[id]', description: 'Керування конкретним користувачем' },
        { method: 'GET', path: '/api/users/[id]/orders', description: 'Керування замовленнями користувача' },
        { method: 'GET', path: '/api/users/[id]/reviews', description: 'Керування відгуками користувача' },
      ];
      setApiRoutes(discoveredRoutes);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Сталася неочікувана помилка під час завантаження API маршрутів.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className='container mx-auto p-4'>
        <p>Завантаження API маршрутів...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6 text-gray-700'>Керування API</h1>
      <div className='bg-white shadow-md rounded-lg p-6'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Метод
              </th>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Шлях
              </th>
              <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Опис
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {apiRoutes.map((route, index) => (
              <tr key={index}>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{route.method}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono'>{route.path}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{route.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
