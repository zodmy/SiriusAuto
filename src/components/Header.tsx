'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  const { user, isAuthenticated, isInitialCheckComplete } = useAuth();
  const { items, getTotalItems, getTotalPrice, isEmpty, removeItem, updateQuantity } = useCart();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCartOpen]);

  return (
    <header className='bg-gray-800 text-white p-4 shadow-md'>
      <div className='relative flex items-center justify-between h-[40px]'>
        <div className='flex items-center space-x-4 z-10'>
          <Link href='/' className='flex items-center'>
            <Image src='/SiriusAutoLogo.svg' alt='Sirius Auto Logo' width={150} height={40} />
          </Link>
          <Link href='/products' className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer'>
            <BiCategory className='mr-1' />
            Каталог
          </Link>
        </div>
        <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
          <div className='w-1/2 max-w-xl pointer-events-auto'>
            <input type='text' placeholder='Пошук товарів...' className='bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#1c5eae]' />
          </div>
        </div>{' '}
        <nav className='flex items-center z-10'>
          <ul className='flex items-center space-x-3'>
            {' '}
            <li className='relative'>
              {!isInitialCheckComplete ? (
                // Показуємо заглушку поки завантажується
                <div className='bg-gray-700 px-3 py-2 rounded-md text-sm font-medium'>
                  <div className='animate-pulse bg-gray-600 h-4 w-16 rounded'></div>
                </div>
              ) : isAuthenticated && user ? (
                <Link href='/profile' className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer'>
                  <svg className='w-5 h-5 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
                  </svg>
                  {user.firstName}
                </Link>
              ) : (
                <div className='flex space-x-2'>
                  <Link href='/login' className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer'>
                    Увійти
                  </Link>
                  <Link href='/register' className='bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer'>
                    Реєстрація
                  </Link>
                </div>
              )}
            </li>{' '}
            <li className='relative'>
              <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 p-2 rounded-md text-sm font-medium flex items-center cursor-pointer relative' aria-label='Open cart'>
                <AiOutlineShoppingCart size={24} />
                {getTotalItems() > 0 && <span className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>{getTotalItems()}</span>}
              </button>
              {isCartOpen && (
                <div ref={cartRef} className='absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white text-gray-800 rounded-md shadow-xl z-50 p-4'>
                  <h3 className='text-lg font-semibold mb-2'>Кошик</h3>
                  {isEmpty() ? (
                    <p className='text-sm text-gray-600'>Ваш кошик порожній.</p>
                  ) : (
                    <>
                      <div className='space-y-3 mb-4'>
                        {items.map((item) => (
                          <div key={item.id} className='flex items-center justify-between border-b border-gray-200 pb-2'>
                            <div className='flex-1'>
                              <h4 className='text-sm font-medium text-gray-900'>{item.name}</h4>
                              <p className='text-xs text-gray-500'>
                                ₴{item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className='text-gray-500 hover:text-gray-700 w-6 h-6 flex items-center justify-center border border-gray-300 rounded'>
                                -
                              </button>
                              <span className='text-sm font-medium'>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className='text-gray-500 hover:text-gray-700 w-6 h-6 flex items-center justify-center border border-gray-300 rounded'>
                                +
                              </button>
                              <button onClick={() => removeItem(item.id)} className='text-red-500 hover:text-red-700 ml-2'>
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='border-t pt-3'>
                        <div className='flex justify-between items-center mb-3'>
                          <span className='font-semibold'>Загальна сума:</span>
                          <span className='font-semibold'>₴{getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {!isEmpty() && (
                    <div className='mt-4'>
                      <Link href='/checkout' onClick={() => setIsCartOpen(false)} className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer'>
                        Оформити замовлення
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
