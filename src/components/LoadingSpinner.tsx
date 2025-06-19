'use client';

import { ReactNode } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
  text?: string;
  children?: ReactNode;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorClasses = {
  blue: 'border-blue-600',
  white: 'border-white',
  gray: 'border-gray-600',
};

export default function LoadingSpinner({ size = 'md', color = 'blue', className = '', text, children }: LoadingSpinnerProps) {
  const spinnerClasses = `animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`;
  if (children) {
    return (
      <div className='flex flex-col items-center gap-3 sm:gap-4'>
        <div className={spinnerClasses}></div>
        {children}
      </div>
    );
  }
  if (text) {
    return (
      <div className='flex flex-col items-center gap-3 sm:gap-4'>
        <div className={spinnerClasses}></div>
        <p className='text-gray-600 text-sm sm:text-base text-center'>{text}</p>
      </div>
    );
  }

  return <div className={spinnerClasses}></div>;
}
