'use client';

import { useState, useEffect } from 'react';
import { HiStar } from 'react-icons/hi';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string | null;
  };
}

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`);

        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          setError('Помилка завантаження відгуків');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Мережева помилка');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const renderStars = (rating: number) => {
    return (
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <HiStar key={star} className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className='py-8'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-4'>
        <p className='text-red-600 text-sm'>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className='py-8 text-center'>
        <HiStar className='h-8 w-8 text-gray-300 mx-auto mb-2' />
        <p className='text-gray-500'>Поки що немає відгуків на цей товар</p>
        <p className='text-sm text-gray-400 mt-1'>Будьте першим, хто залишить відгук!</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className='space-y-6'>
      <div className='bg-gray-50 rounded-lg p-4'>
        <div className='flex items-center space-x-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900'>{averageRating.toFixed(1)}</div>
            <div className='flex justify-center mb-1'>{renderStars(Math.round(averageRating))}</div>
            <div className='text-sm text-gray-500'>
              {reviews.length} {reviews.length === 1 ? 'відгук' : reviews.length < 5 ? 'відгуки' : 'відгуків'}
            </div>
          </div>
          <div className='flex-1'>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <div key={rating} className='flex items-center space-x-2 text-sm'>
                  <span className='w-3 text-gray-600'>{rating}</span>
                  <HiStar className='h-3 w-3 text-yellow-400' />
                  <div className='flex-1 bg-gray-200 rounded-full h-2'>
                    <div className='bg-yellow-400 h-2 rounded-full' style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className='w-8 text-gray-500 text-right'>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Відгуки покупців</h3>
        {reviews.map((review) => (
          <div key={review.id} className='border border-gray-200 rounded-lg p-4'>
            <div className='flex items-start space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-blue-600 font-semibold text-sm'>{getInitials(review.user.firstName, review.user.lastName)}</span>
              </div>
              <div className='flex-1'>
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='font-medium text-gray-900'>
                    {review.user.firstName} {review.user.lastName || ''}
                  </span>
                  <div className='flex items-center space-x-1'>{renderStars(review.rating)}</div>
                  <span className='text-sm text-gray-500'>
                    {new Date(review.createdAt).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {review.comment && <p className='text-gray-700 text-sm leading-relaxed'>{review.comment}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
