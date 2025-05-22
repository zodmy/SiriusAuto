'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { useState, useEffect, useRef } from 'react';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);

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
          <Link href='/products' className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'>
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
              <button ref={cartButtonRef} onClick={() => setIsCartOpen(!isCartOpen)} className='bg-gray-700 hover:bg-gray-600 p-2 rounded-md text-sm font-medium flex items-center cursor-pointer' aria-label='Open cart'>
                <AiOutlineShoppingCart size={24} />
              </button>
              {isCartOpen && (
                <div ref={cartRef} className='absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white text-gray-800 rounded-md shadow-xl z-50 p-4'>
                  <h3 className='text-lg font-semibold mb-2'>Кошик</h3>
                  <p className='text-sm text-gray-600'>Ваш кошик порожній.</p>
                  <div className='mt-4'>
                    <Link href='/checkout' onClick={() => setIsCartOpen(false)} className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
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
