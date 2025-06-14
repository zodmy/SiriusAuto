'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaUser } from 'react-icons/fa';
import { BsCart3 } from 'react-icons/bs';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/components/AuthProvider';
import { useCart } from '@/lib/hooks/useCart';

interface Category {
  id: number;
  name: string;
  children: Category[];
  parent?: {
    id: number;
    name: string;
  };
}

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const catalogButtonRef = useRef<HTMLButtonElement>(null);
  const { user, isAuthenticated, isInitialCheckComplete } = useAuth();
  const { items, getTotalItems, getTotalPrice, isEmpty, removeItem, updateQuantity } = useCart();

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const parentCategories = data.filter((category: Category) => !category.parent);
        setCategories(parentCategories);
      }
    } catch (error) {
      console.error('Помилка завантаження категорій:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node) && catalogButtonRef.current && !catalogButtonRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
        setIsCatalogOpen(false);
      }
    };

    if (isCartOpen || isMobileMenuOpen || isCatalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCartOpen, isMobileMenuOpen, isCatalogOpen]);
  return (
    <header className='bg-gray-800 text-white shadow-md'>
      <div className='hidden md:block p-4'>
        <div className='relative flex items-center justify-between h-[40px]'>
          {' '}
          <div className='flex items-center space-x-4 z-10'>
            <Link href='/' className='flex items-center'>
              <Image src='/SiriusAutoLogo.svg' alt='Sirius Auto Logo' width={150} height={40} />
            </Link>
            <div className='relative'>
              <button ref={catalogButtonRef} onClick={() => setIsCatalogOpen(!isCatalogOpen)} className='bg-gray-700 hover:bg-gray-600 px-3 rounded-md text-sm font-medium flex items-center cursor-pointer h-10'>
                <BiCategory className='mr-1' size={20} />
                Каталог
                <svg className={`ml-1 w-4 h-4 transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`} fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' />
                </svg>
              </button>{' '}
              {isCatalogOpen && (
                <div ref={catalogRef} className='absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg border z-50 animate-fade-in'>
                  <div className='flex'>
                    <div className='w-64 border-r border-gray-200'>
                      <div className='py-1'>
                        <Link href='/products' onClick={() => setIsCatalogOpen(false)} className='block px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 border-b font-bold'>
                          <BiCategory className='inline mr-2' size={16} />
                          Усі товари
                        </Link>
                        {categories.map((category) => (
                          <div key={category.id} className='relative group'>
                            <Link href={`/products?category=${category.id}`} onClick={() => setIsCatalogOpen(false)} className='block px-4 py-3 text-sm text-gray-900 hover:bg-blue-50 font-semibold transition-colors border-b border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-800'>
                              {category.name}
                              {category.children.length > 0 && (
                                <svg className='float-right w-4 h-4 mt-0.5 text-gray-700' fill='currentColor' viewBox='0 0 20 20'>
                                  <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                                </svg>
                              )}
                            </Link>
                            {category.children.length > 0 && (
                              <div className='absolute left-full top-0 w-64 bg-white border border-gray-200 rounded-r-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                                <div className='py-2'>
                                  <div className='px-4 py-2 text-xs font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 bg-gray-50'>{category.name}</div>
                                  {category.children.map((child) => (
                                    <Link key={child.id} href={`/products?category=${child.id}`} onClick={() => setIsCatalogOpen(false)} className='block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-900 transition-colors font-medium'>
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
            <div className='w-1/2 max-w-xl pointer-events-auto'>
              <input type='text' placeholder='Пошук товарів...' className='bg-gray-700 text-white placeholder-gray-400 px-4 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#1c5eae] h-10' />
            </div>
          </div>
          <nav className='flex items-center z-10'>
            <ul className='flex items-center space-x-3'>
              <li className='relative'>
                {!isInitialCheckComplete ? (
                  <div className='bg-gray-700 px-3 rounded-md text-sm font-medium h-10 flex items-center'>
                    <div className='animate-pulse bg-gray-600 h-4 w-16 rounded'></div>
                  </div>
                ) : isAuthenticated && user ? (
                  <Link href='/profile' className='bg-gray-700 hover:bg-gray-600 px-3 rounded-md flex items-center cursor-pointer min-w-0 h-10'>
                    <FaUser className='w-5 h-5' />
                    <span className='ml-2 truncate'>{user.firstName}</span>
                  </Link>
                ) : (
                  <div className='flex space-x-2'>
                    <Link href='/login' className='bg-gray-700 hover:bg-gray-600 px-3 rounded-md text-sm font-medium flex items-center cursor-pointer h-10'>
                      Увійти
                    </Link>
                    <Link href='/register' className='bg-blue-600 hover:bg-blue-700 px-3 rounded-md text-sm font-medium flex items-center cursor-pointer h-10'>
                      Зареєструватися
                    </Link>
                  </div>
                )}
              </li>
              <li className='relative'>
                <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 px-3 rounded-md text-sm font-medium flex items-center cursor-pointer relative h-10' aria-label='Open cart'>
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
                          <BsCart3 size={80} className='text-gray-400' />
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
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='bg-gray-700 hover:bg-gray-600 px-3 rounded-md flex items-center justify-center h-10' aria-label='Toggle menu'>
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>{' '}
          <Link href='/' className='flex items-center'>
            <Image src='/SiriusAutoLogo.svg' alt='Sirius Auto Logo' width={120} height={32} />
          </Link>
          <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 px-3 rounded-md flex items-center justify-center relative h-10' aria-label='Open cart'>
            <AiOutlineShoppingCart size={24} />
            {getTotalItems() > 0 && <span className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>{getTotalItems()}</span>}
          </button>
        </div>

        <div className='mt-3'>
          <input type='text' placeholder='Пошук товарів...' className='bg-gray-700 text-white placeholder-gray-400 px-4 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#1c5eae] h-10' />
        </div>
      </div>{' '}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className='md:hidden bg-gray-700 border-t border-gray-600'>
          <nav className='px-4 py-3 space-y-3'>
            {' '}
            <div>
              <Link href='/products' onClick={() => setIsMobileMenuOpen(false)} className='flex items-center w-full text-left px-3 py-3 rounded-md hover:bg-gray-600 transition-colors border-b border-gray-600 mb-2 font-semibold'>
                <BiCategory className='mr-2' size={20} />
                Усі товари
              </Link>
              {categories.map((category) => (
                <div key={category.id} className='mb-2'>
                  <Link href={`/products?category=${category.id}`} onClick={() => setIsMobileMenuOpen(false)} className='block w-full text-left px-3 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium'>
                    {category.name}
                  </Link>
                  {category.children.length > 0 && (
                    <div className='ml-4 mt-1 space-y-1 bg-gray-800 rounded p-2'>
                      {category.children.map((child) => (
                        <Link key={child.id} href={`/products?category=${child.id}`} onClick={() => setIsMobileMenuOpen(false)} className='block w-full text-left px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm text-gray-300'>
                          • {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!isInitialCheckComplete ? (
              <div className='px-3 py-2'>
                <div className='animate-pulse bg-gray-600 h-4 w-20 rounded'></div>
              </div>
            ) : isAuthenticated && user ? (
              <Link href='/profile' onClick={() => setIsMobileMenuOpen(false)} className='flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-600 transition-colors'>
                <FaUser className='w-5 h-5 mr-2' />
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
                <BsCart3 size={80} className='text-gray-400' />
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
