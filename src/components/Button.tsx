'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white border-transparent',
  secondary: 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 border-transparent',
  outline: 'bg-transparent hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 disabled:bg-gray-50 text-blue-600 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white border-transparent',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base sm:text-lg',
};

const focusClasses = {
  primary: 'focus:ring-blue-500',
  secondary: 'focus:ring-gray-500',
  outline: 'focus:ring-gray-500',
  ghost: 'focus:ring-blue-500',
  danger: 'focus:ring-red-500',
};

export default function Button({ variant = 'primary', size = 'md', isLoading = false, children, fullWidth = false, icon, iconPosition = 'left', className = '', disabled, ...props }: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed border touch-manipulation select-none';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${focusClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    active:scale-95 sm:active:scale-100
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center gap-2'>
          <LoadingSpinner size='sm' color={variant === 'primary' || variant === 'danger' ? 'white' : 'blue'} />
          <span>Завантаження...</span>
        </div>
      );
    }

    if (icon) {
      return (
        <div className='flex items-center justify-center gap-2'>
          {iconPosition === 'left' && icon}
          <span>{children}</span>
          {iconPosition === 'right' && icon}
        </div>
      );
    }

    return children;
  };

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {renderContent()}
    </button>
  );
}
