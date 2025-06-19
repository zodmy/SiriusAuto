'use client';

import { useEffect, useState } from 'react';
import { HiCheck, HiShoppingCart } from 'react-icons/hi';

interface CartNotificationProps {
  show: boolean;
  productName: string;
  onHide: () => void;
}

export default function CartNotification({ show, productName, onHide }: CartNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
        (window.navigator as Navigator & { vibrate?: (duration: number) => void }).vibrate?.(100);
      }

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;
  return (
    <div className='fixed top-20 left-4 right-4 sm:right-4 sm:left-auto z-40'>
      <div
        className={`
          bg-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-lg 
          flex items-center gap-3 w-full sm:min-w-[300px] sm:max-w-[400px]
          transition-all duration-300 ease-in-out cursor-pointer
          hover:bg-blue-800
          ${isVisible ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0 opacity-100 scale-100' : '-translate-y-full sm:translate-y-0 sm:translate-x-full opacity-0 scale-95'}
        `}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onHide, 300);
        }}
      >
        {' '}
        <div className='flex-shrink-0'>
          <div className='relative'>
            <HiShoppingCart className='w-5 h-5 sm:w-6 sm:h-6' />{' '}
            <div className='absolute -top-1 -right-1 bg-white rounded-full p-0.5 sm:p-1'>
              <HiCheck className='w-2 h-2 sm:w-3 sm:h-3 text-blue-700' />
            </div>
          </div>
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-sm sm:text-sm'>Товар додано до кошика!</p>
          <p className='text-xs text-blue-100 truncate mt-1'>{productName}</p>
        </div>
      </div>
    </div>
  );
}
