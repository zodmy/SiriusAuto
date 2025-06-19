'use client';

import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

const variants = {
  default: 'bg-white shadow-sm border border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-200',
  outlined: 'bg-white border-2 border-gray-300',
  flat: 'bg-white',
};

const sizes = {
  sm: 'rounded-md',
  md: 'rounded-lg', 
  lg: 'rounded-xl',
};

const paddings = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default',
    size = 'md',
    padding = 'md',
    hover = false,
    clickable = false,
    className = '',
    children,
    ...props 
  }, ref) => {
    
    const baseClasses = `
      ${variants[variant]}
      ${sizes[size]}
      ${paddings[padding]}
      ${hover ? 'hover:shadow-md transition-shadow duration-300' : ''}
      ${clickable ? 'cursor-pointer touch-manipulation active:scale-[0.98] transition-transform' : ''}
      ${className}
    `.trim();

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
