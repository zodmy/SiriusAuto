'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { HiMenu, HiX } from 'react-icons/hi';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isInitialCheckComplete } = useAuth();
  const { items, getTotalItems, getTotalPrice, isEmpty, removeItem, updateQuantity } = useCart();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isCartOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCartOpen, isMobileMenuOpen]);
  return (
    <header className='bg-gray-800 text-white shadow-md'>
      <div className='hidden md:block p-4'>
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
          </div>
          <nav className='flex items-center z-10'>
            <ul className='flex items-center space-x-3'>
              <li className='relative'>
                {!isInitialCheckComplete ? (
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
              </li>
              <li className='relative'>
                <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 p-2 rounded-md text-sm font-medium flex items-center cursor-pointer relative' aria-label='Open cart'>
                  <AiOutlineShoppingCart size={24} />
                  {getTotalItems() > 0 && <span className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>{getTotalItems()}</span>}
                </button>
                {isCartOpen && (
                  <div ref={cartRef} className='fixed inset-0 z-50 flex items-end md:items-start justify-center md:justify-end pointer-events-none'>
                    <div className='bg-white text-gray-800 rounded-t-2xl md:rounded-md shadow-2xl w-full max-w-md md:w-96 p-4 md:mt-24 md:mr-8 pointer-events-auto animate-slide-up md:animate-fade-in' style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold'>Кошик</h3>
                        <button onClick={() => setIsCartOpen(false)} className='text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer' aria-label='Закрити кошик'>
                          ×
                        </button>
                      </div>
                      {isEmpty() ? (
                        <div className='flex flex-col items-center justify-center py-8'>
                          <svg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <rect width='80' height='80' rx='40' fill='#F1F5F9' />
                            <path d='M24 32h32l-4 20a6 6 0 01-6 5H34a6 6 0 01-6-5l-4-20z' stroke='#64748B' strokeWidth='2' fill='#fff' />
                            <circle cx='32' cy='40' r='2' fill='#64748B' />
                            <circle cx='48' cy='40' r='2' fill='#64748B' />
                            <path d='M36 50c2 2 6 2 8 0' stroke='#64748B' strokeWidth='2' strokeLinecap='round' />
                            <path d='M28 28v-2a4 4 0 014-4h16a4 4 0 014 4v2' stroke='#64748B' strokeWidth='2' />
                          </svg>
                          <p className='text-sm text-gray-600 mt-4'>Ваш кошик порожній.</p>
                        </div>
                      ) : (
                        <>
                          <div className='divide-y divide-gray-200 mb-4'>
                            {items.map((item) => (
                              <div key={item.id} className='flex items-center py-3 gap-3'>
                                {item.image && (
                                  <div className='flex-shrink-0 w-14 h-14 relative'>
                                    <Image src={item.image} alt={item.name} fill className='object-contain rounded-md border' />
                                  </div>
                                )}
                                <div className='flex-1 min-w-0'>
                                  <div className='truncate font-medium text-gray-900 text-sm'>{item.name}</div>
                                  <div className='text-xs text-gray-500 mt-1'>₴{item.price.toFixed(2)}</div>
                                  <div className='flex items-center mt-2 gap-2'>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className='w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:text-gray-700' aria-label='Зменшити кількість'>
                                      –
                                    </button>
                                    <span className='text-sm font-medium w-6 text-center'>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className='w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:text-gray-700' aria-label='Збільшити кількість'>
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className='flex flex-col items-end gap-2'>
                                  <span className='text-sm font-semibold text-gray-900'>₴{(item.price * item.quantity).toFixed(2)}</span>
                                  <button onClick={() => removeItem(item.id)} className='text-red-500 hover:text-red-700 text-lg cursor-pointer' aria-label='Видалити товар'>
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className='border-t pt-4'>
                            <div className='flex justify-between items-center mb-3'>
                              <span className='font-semibold'>Загальна сума:</span>
                              <span className='font-semibold text-lg'>₴{getTotalPrice().toFixed(2)}</span>
                            </div>
                            <Link
                              href='/checkout'
                              onClick={() => {
                                setIsCartOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium mt-2'
                            >
                              Оформити замовлення
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className='md:hidden p-4'>
        <div className='flex items-center justify-between'>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='bg-gray-700 hover:bg-gray-600 p-2 rounded-md flex items-center justify-center' aria-label='Toggle menu'>
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>{' '}
          <Link href='/' className='flex items-center'>
            <Image src='/SiriusAutoLogo.svg' alt='Sirius Auto Logo' width={120} height={32} />
          </Link>
          <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 p-2 rounded-md flex items-center justify-center relative' aria-label='Open cart'>
            <AiOutlineShoppingCart size={24} />
            {getTotalItems() > 0 && <span className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>{getTotalItems()}</span>}
          </button>
        </div>

        <div className='mt-3'>
          <input type='text' placeholder='Пошук товарів...' className='bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#1c5eae]' />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className='md:hidden bg-gray-700 border-t border-gray-600'>
          <nav className='px-4 py-3 space-y-3'>
            <Link href='/products' onClick={() => setIsMobileMenuOpen(false)} className='flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-600 transition-colors'>
              <BiCategory className='mr-2' />
              Каталог
            </Link>

            {!isInitialCheckComplete ? (
              <div className='px-3 py-2'>
                <div className='animate-pulse bg-gray-600 h-4 w-20 rounded'></div>
              </div>
            ) : isAuthenticated && user ? (
              <Link href='/profile' onClick={() => setIsMobileMenuOpen(false)} className='flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-600 transition-colors'>
                <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
                </svg>
                {user.firstName}
              </Link>
            ) : (
              <div className='space-y-2'>
                <Link href='/login' onClick={() => setIsMobileMenuOpen(false)} className='block w-full text-left px-3 py-2 rounded-md hover:bg-gray-600 transition-colors'>
                  Увійти
                </Link>
                <Link href='/register' onClick={() => setIsMobileMenuOpen(false)} className='block w-full text-left px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors'>
                  Реєстрація
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {isCartOpen && (
        <div ref={cartRef} className='fixed inset-0 z-50 flex items-end md:items-start justify-center md:justify-end pointer-events-none'>
          <div className='bg-white text-gray-800 rounded-t-2xl md:rounded-md shadow-2xl w-full max-w-md md:w-96 p-4 md:mt-24 md:mr-8 pointer-events-auto animate-slide-up md:animate-fade-in' style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Кошик</h3>
              <button onClick={() => setIsCartOpen(false)} className='text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer' aria-label='Закрити кошик'>
                ×
              </button>
            </div>
            {isEmpty() ? (
              <div className='flex flex-col items-center justify-center py-8'>
                <svg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <rect width='80' height='80' rx='40' fill='#F1F5F9' />
                  <path d='M24 32h32l-4 20a6 6 0 01-6 5H34a6 6 0 01-6-5l-4-20z' stroke='#64748B' strokeWidth='2' fill='#fff' />
                  <circle cx='32' cy='40' r='2' fill='#64748B' />
                  <circle cx='48' cy='40' r='2' fill='#64748B' />
                  <path d='M36 50c2 2 6 2 8 0' stroke='#64748B' strokeWidth='2' strokeLinecap='round' />
                  <path d='M28 28v-2a4 4 0 014-4h16a4 4 0 014 4v2' stroke='#64748B' strokeWidth='2' />
                </svg>
                <p className='text-sm text-gray-600 mt-4'>Ваш кошик порожній.</p>
              </div>
            ) : (
              <>
                <div className='divide-y divide-gray-200 mb-4'>
                  {items.map((item) => (
                    <div key={item.id} className='flex items-center py-3 gap-3'>
                      {item.image && (
                        <div className='flex-shrink-0 w-14 h-14 relative'>
                          <Image src={item.image} alt={item.name} fill className='object-contain rounded-md border' />
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='truncate font-medium text-gray-900 text-sm'>{item.name}</div>
                        <div className='text-xs text-gray-500 mt-1'>₴{item.price.toFixed(2)}</div>
                        <div className='flex items-center mt-2 gap-2'>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className='w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:text-gray-700' aria-label='Зменшити кількість'>
                            –
                          </button>
                          <span className='text-sm font-medium w-6 text-center'>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className='w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:text-gray-700' aria-label='Збільшити кількість'>
                            +
                          </button>
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        <span className='text-sm font-semibold text-gray-900'>₴{(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeItem(item.id)} className='text-red-500 hover:text-red-700 text-lg cursor-pointer' aria-label='Видалити товар'>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='border-t pt-4'>
                  <div className='flex justify-between items-center mb-3'>
                    <span className='font-semibold'>Загальна сума:</span>
                    <span className='font-semibold text-lg'>₴{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Link
                    href='/checkout'
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium mt-2'
                  >
                    Оформити замовлення
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
