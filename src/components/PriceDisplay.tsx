'use client';

import { ReactNode } from 'react';
import Text from './Text';
import Badge from './Badge';

interface PriceDisplayProps {
  price: number | string;
  originalPrice?: number | string;
  currency?: string;
  discount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
  discountType?: 'percentage' | 'amount';
  className?: string;
  layout?: 'horizontal' | 'vertical';
  showCurrency?: boolean;
  locale?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

const sizeConfig = {
  xs: { price: 'xs' as const, original: 'xs' as const, discount: 'xs' as const },
  sm: { price: 'sm' as const, original: 'xs' as const, discount: 'xs' as const },
  md: { price: 'base' as const, original: 'sm' as const, discount: 'sm' as const },
  lg: { price: 'lg' as const, original: 'base' as const, discount: 'sm' as const },
  xl: { price: 'xl' as const, original: 'lg' as const, discount: 'md' as const },
};

export function PriceDisplay({ price, originalPrice, currency = '₴', discount, size = 'md', showDiscount = true, discountType = 'percentage', className = '', layout = 'horizontal', showCurrency = true, locale = 'uk-UA', prefix, suffix }: PriceDisplayProps) {
  const config = sizeConfig[size];

  const formatPrice = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const finalPrice = typeof price === 'string' ? parseFloat(price) : price;
  const finalOriginalPrice = originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice) : null;

  // Calculate discount if not provided
  let calculatedDiscount = discount;
  if (!calculatedDiscount && finalOriginalPrice && finalOriginalPrice > finalPrice) {
    if (discountType === 'percentage') {
      calculatedDiscount = Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100);
    } else {
      calculatedDiscount = finalOriginalPrice - finalPrice;
    }
  }

  const hasDiscount = Boolean(calculatedDiscount && calculatedDiscount > 0);
  const isVertical = layout === 'vertical';

  return (
    <div className={`flex ${isVertical ? 'flex-col items-start' : 'items-baseline'} gap-2 ${className}`}>
      {prefix}

      <div className={`flex ${isVertical ? 'flex-col items-start' : 'items-baseline'} gap-2`}>
        {/* Current price */}
        <Text size={config.price === 'base' ? 'md' : (config.price as 'xs' | 'sm' | 'md' | 'lg' | 'xl')} weight='bold' className={hasDiscount ? 'text-red-600' : undefined}>
          {formatPrice(finalPrice)}
          {showCurrency && ` ${currency}`}
        </Text>

        {/* Original price (if discounted) */}
        {hasDiscount && finalOriginalPrice && (
          <Text size={config.original === 'base' ? 'md' : (config.original as 'xs' | 'sm' | 'md' | 'lg' | 'xl')} color='muted' className='line-through'>
            {formatPrice(finalOriginalPrice)}
            {showCurrency && ` ${currency}`}
          </Text>
        )}

        {/* Discount badge */}
        {hasDiscount && showDiscount && calculatedDiscount && (
          <Badge variant='error' size='sm'>
            {discountType === 'percentage' ? `-${calculatedDiscount}%` : `-${formatPrice(calculatedDiscount)} ${currency}`}
          </Badge>
        )}
      </div>

      {suffix}
    </div>
  );
}

// Simplified price display for basic use cases
export function SimplePrice({ price, currency = '₴', size = 'md', className = '' }: Pick<PriceDisplayProps, 'price' | 'currency' | 'size' | 'className'>) {
  return <PriceDisplay price={price} currency={currency} size={size} className={className} showDiscount={false} />;
}

// Price with discount for sales
export function SalePrice({ price, originalPrice, currency = '₴', size = 'md', className = '' }: Pick<PriceDisplayProps, 'price' | 'originalPrice' | 'currency' | 'size' | 'className'>) {
  return <PriceDisplay price={price} originalPrice={originalPrice} currency={currency} size={size} className={className} showDiscount={true} />;
}

export default PriceDisplay;
