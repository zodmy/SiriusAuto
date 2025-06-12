'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const { user, isAuthenticated, isLoading, logout } = useAuth();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) && userButtonRef.current && !userButtonRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isCartOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCartOpen, isUserMenuOpen]);

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
            {!isLoading && (
              <li className='relative'>
                {isAuthenticated && user ? (
                  <>
                    <button ref={userButtonRef} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer' aria-label='User menu'>
                      <svg className='w-5 h-5 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
                      </svg>
                      {user.firstName}
                    </button>
                    {isUserMenuOpen && (
                      <div ref={userMenuRef} className='absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-xl z-50 py-1'>
                        <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-200'>
                          <div className='font-medium'>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className='text-gray-500'>{user.email}</div>
                        </div>
                        <Link href='/profile' onClick={() => setIsUserMenuOpen(false)} className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'>
                          Особистий кабінет
                        </Link>
                        <Link href='/orders' onClick={() => setIsUserMenuOpen(false)} className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'>
                          Мої замовлення
                        </Link>
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await logout();
                          }}
                          className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                        >
                          Вийти
                        </button>
                      </div>
                    )}
                  </>
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
              </li>
            )}

            <li className='relative'>
              <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 p-2 rounded-md text-sm font-medium flex items-center cursor-pointer' aria-label='Open cart'>
                <AiOutlineShoppingCart size={24} />
              </button>
              {isCartOpen && (
                <div ref={cartRef} className='absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white text-gray-800 rounded-md shadow-xl z-50 p-4'>
                  <h3 className='text-lg font-semibold mb-2'>Кошик</h3>
                  <p className='text-sm text-gray-600'>Ваш кошик порожній.</p>
                  <div className='mt-4'>
                    <Link href='/checkout' onClick={() => setIsCartOpen(false)} className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer'>
                      Оформити замовлення
                    </Link>
                  </div>
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
