'use client';

import { useState } from 'react';
import { HiStar } from 'react-icons/hi';
import Text from './Text';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  readonly?: boolean;
}

const sizeConfig = {
  xs: { star: 'w-3 h-3', text: 'xs' as const },
  sm: { star: 'w-4 h-4', text: 'sm' as const },
  md: { star: 'w-5 h-5', text: 'sm' as const },
  lg: { star: 'w-6 h-6', text: 'base' as const },
};

export function StarRating({ rating, maxRating = 5, size = 'sm', showValue = false, showCount = false, count, interactive = false, onChange, className = '', readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const config = sizeConfig[size];
  const displayRating = hoverRating !== null ? hoverRating : rating;
  const isClickable = interactive && onChange && !readonly;

  const handleStarClick = (starRating: number) => {
    if (isClickable) {
      onChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (isClickable) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (isClickable) {
      setHoverRating(null);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars */}
      <div className='flex items-center gap-0.5' onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= displayRating;
          const isPartial = !isActive && starValue - 0.5 <= displayRating;

          return (
            <button
              key={index}
              type='button'
              disabled={!isClickable}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              className={`
                relative
                ${isClickable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                ${!isClickable ? 'pointer-events-none' : ''}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded
              `}
              aria-label={`${starValue} ${starValue === 1 ? 'зірка' : 'зірок'}`}
            >
              {/* Background star (gray) */}
              <HiStar className={`${config.star} text-gray-300`} />

              {/* Active star (colored) */}
              {isActive && (
                <HiStar
                  className={`
                    ${config.star} 
                    absolute top-0 left-0 
                    ${hoverRating !== null ? 'text-blue-400' : 'text-yellow-400'}
                  `}
                />
              )}

              {/* Partial star (half-filled) */}
              {isPartial && (
                <div className='absolute top-0 left-0 overflow-hidden' style={{ width: '50%' }}>
                  <HiStar className={`${config.star} text-yellow-400`} />
                </div>
              )}
            </button>
          );
        })}
      </div>{' '}
      {/* Rating value */}
      {showValue && (
        <Text size={config.text === 'base' ? 'md' : config.text} weight='medium'>
          {rating.toFixed(1)}
        </Text>
      )}
      {/* Review count */}
      {showCount && count !== undefined && (
        <Text size={config.text === 'base' ? 'md' : config.text} color='muted'>
          ({count.toLocaleString()})
        </Text>
      )}
    </div>
  );
}

// Simplified read-only version
export function StarDisplay({ rating, maxRating = 5, size = 'sm', showValue = true, showCount = false, count, className = '' }: Omit<StarRatingProps, 'interactive' | 'onChange' | 'readonly'>) {
  return <StarRating rating={rating} maxRating={maxRating} size={size} showValue={showValue} showCount={showCount} count={count} className={className} readonly />;
}

export default StarRating;
