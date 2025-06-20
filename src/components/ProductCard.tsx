'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card from './Card';
import Text from './Text';
import Button from './Button';
import Badge from './Badge';
import StarRating from './StarRating';

interface ProductCardProps {
  id: number;
  name: string;
  price: number | string;
  imageUrl?: string;
  description?: string;
  category?: string;
  inStock?: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  href?: string;
  onAddToCart?: () => void;
  isLoading?: boolean;
  actions?: ReactNode;
  className?: string;
  layout?: 'grid' | 'list';
}

export function ProductCard({ id, name, price, imageUrl, description, category, inStock = true, discount, rating, reviewCount, href, onAddToCart, isLoading = false, actions, className = '', layout = 'grid' }: ProductCardProps) {
  const productHref = href || `/products/${id}`;
  const finalPrice = typeof price === 'number' ? price : parseFloat(price);
  const discountedPrice = discount ? finalPrice * (1 - discount / 100) : finalPrice;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <Card padding='none' className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {layout === 'list' ? (
        // List layout
        <div className='flex gap-4 p-4'>
          {/* Image */}
          <div className='w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-lg bg-white'>
            {' '}
            {imageUrl ? (
              <Link href={productHref}>
                <Image src={imageUrl} alt={name} width={96} height={96} className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-200' />
              </Link>
            ) : (
              <Link href={productHref}>
                <div className='w-full h-full flex items-center justify-center bg-white group-hover:bg-gray-50 transition-colors'>
                  <Text color='muted' size='xs'>
                    Немає фото
                  </Text>
                </div>
              </Link>
            )}{' '}
            {/* Badges */}
            <div className='absolute top-1 left-1 flex flex-col gap-1'>
              {!inStock && (
                <Badge variant='warning' size='sm'>
                  Немає
                </Badge>
              )}
              {discount && discount > 0 && (
                <Badge variant='error' size='sm'>
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex justify-between items-start gap-4'>
              <div className='flex-1 min-w-0'>
                {/* Category */}
                {category && (
                  <Text size='xs' color='muted' className='uppercase tracking-wide mb-1'>
                    {category}
                  </Text>
                )}
                {/* Title */}
                <Link href={productHref}>
                  <Text size='sm' weight='medium' className='line-clamp-2 group-hover:text-blue-600 transition-colors mb-2'>
                    {name}
                  </Text>
                </Link>
                {/* Description */}
                {description && (
                  <Text size='xs' color='muted' className='line-clamp-2 mb-2'>
                    {description}
                  </Text>
                )}
                {/* Rating */}
                {rating && rating > 0 && <StarRating rating={rating} size='xs' showValue={false} showCount={reviewCount !== undefined} count={reviewCount} readonly />}
              </div>

              {/* Price and Actions */}
              <div className='text-right flex-shrink-0'>
                <div className='flex flex-col items-end gap-2 mb-3'>
                  <Text size='lg' weight='bold'>
                    {formatPrice(discountedPrice)} ₴
                  </Text>
                  {discount && discount > 0 && (
                    <Text size='sm' color='muted' className='line-through'>
                      {formatPrice(finalPrice)} ₴
                    </Text>
                  )}
                </div>
                {/* Actions */}
                {actions || onAddToCart ? (
                  <div>
                    {actions || (
                      <Button onClick={onAddToCart} disabled={!inStock || isLoading} isLoading={isLoading} size='sm' className='cursor-pointer'>
                        {!inStock ? 'Немає в наявності' : 'До кошика'}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Grid layout (original)
        <>
          <div className='relative'>
            {/* Image */}
            <div className='aspect-square relative overflow-hidden rounded-t-lg bg-white'>
              {' '}
              {imageUrl ? (
                <Link href={productHref}>
                  <Image src={imageUrl} alt={name} width={400} height={400} className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-200' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' />
                </Link>
              ) : (
                <Link href={productHref}>
                  <div className='w-full h-full flex items-center justify-center bg-white group-hover:bg-gray-50 transition-colors'>
                    <Text color='muted' size='sm'>
                      Немає фото
                    </Text>
                  </div>
                </Link>
              )}
            </div>
            {/* Badges */}
            <div className='absolute top-2 left-2 flex flex-col gap-1'>
              {!inStock && (
                <Badge variant='warning' size='sm'>
                  Немає в наявності
                </Badge>
              )}
              {discount && discount > 0 && (
                <Badge variant='error' size='sm'>
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className='p-4 space-y-3'>
            {/* Category */}
            {category && (
              <Text size='xs' color='muted' className='uppercase tracking-wide'>
                {category}
              </Text>
            )}
            {/* Title */}
            <Link href={productHref}>
              <Text size='sm' weight='medium' className='line-clamp-2 group-hover:text-blue-600 transition-colors'>
                {name}
              </Text>
            </Link>
            {/* Description */}
            {description && (
              <Text size='xs' color='muted' className='line-clamp-2'>
                {description}
              </Text>
            )}
            {/* Rating */}
            {rating && rating > 0 && <StarRating rating={rating} size='xs' showValue={false} showCount={reviewCount !== undefined} count={reviewCount} readonly />}
            {/* Price */}
            <div className='flex items-baseline gap-2'>
              <Text size='lg' weight='bold'>
                {formatPrice(discountedPrice)} ₴
              </Text>
              {discount && discount > 0 && (
                <Text size='sm' color='muted' className='line-through'>
                  {formatPrice(finalPrice)} ₴
                </Text>
              )}
            </div>
            {/* Actions */}
            {actions || onAddToCart ? (
              <div className='pt-2'>
                {actions || (
                  <Button onClick={onAddToCart} disabled={!inStock || isLoading} isLoading={isLoading} size='sm' fullWidth className='cursor-pointer'>
                    {!inStock ? 'Немає в наявності' : 'До кошика'}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </Card>
  );
}

export default ProductCard;
