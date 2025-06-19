'use client';

import { useState, useEffect } from 'react';
import { HiStar } from 'react-icons/hi';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

interface ReviewableOrder {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: string;
  orderItems: OrderItem[];
}

interface ReviewFormData {
  productId: number;
  orderId: number;
  rating: number;
  comment: string;
}

export default function ReviewManagement() {
  const [reviewableOrders, setReviewableOrders] = useState<ReviewableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{ productId: number; orderId: number; productName: string } | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    productId: 0,
    orderId: 0,
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviewableOrders();
  }, []);

  const fetchReviewableOrders = async () => {
    try {
      const response = await fetch('/api/user/orders/reviewable', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReviewableOrders(data);
      } else {
        setError('Помилка завантаження замовлень');
      }
    } catch (error) {
      console.error('Error fetching reviewable orders:', error);
      setError('Мережева помилка');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (productId: number, orderId: number, productName: string) => {
    setSelectedProduct({ productId, orderId, productName });
    setReviewForm({
      productId,
      orderId,
      rating: 5,
      comment: '',
    });
    setError('');
    setSuccess('');
  };

  const closeReviewModal = () => {
    setSelectedProduct(null);
    setReviewForm({
      productId: 0,
      orderId: 0,
      rating: 5,
      comment: '',
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Відгук успішно додано!');
        setTimeout(() => {
          closeReviewModal();
          fetchReviewableOrders();
        }, 2000);
      } else {
        setError(data.error || 'Помилка створення відгуку');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Мережева помилка');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <HiStar key={star} className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`} onClick={interactive ? () => setReviewForm((prev) => ({ ...prev, rating: star })) : undefined} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Завантаження замовлень...</p>
      </div>
    );
  }
  if (reviewableOrders.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='mb-4'>
          <HiStar className='h-12 w-12 text-gray-300 mx-auto' />
        </div>
        <p className='text-gray-600 font-medium'>Немає замовлень для оцінки</p>
        <div className='mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left max-w-md mx-auto'>
          <p className='text-sm text-gray-700 font-medium mb-2'>Щоб залишити відгук:</p>
          <ul className='text-sm text-gray-600 space-y-1'>
            <li>• Зробіть замовлення товару</li>
            <li>• Дочекайтесь його виконання</li>
            <li>• Поверніться сюди для оцінки</li>
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900'>Залишити відгуки</h3>
        <div className='mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h4 className='text-sm font-medium text-blue-900 mb-2'>Як залишити відгук:</h4>{' '}
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>• Відгуки можна залишати тільки на товари з виконаних замовлень (статус &quot;Виконано&quot;)</li>
            <li>• На кожен товар з замовлення можна залишити лише один відгук</li>
            <li>• Натисніть кнопку &quot;Залишити відгук&quot; біля потрібного товару</li>
            <li>• Оцініть товар від 1 до 5 зірок та додайте коментар (необов&apos;язково)</li>
            <li>• Ваш відгук допоможе іншим покупцям зробити правильний вибір</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <p className='text-red-800'>{error}</p>
        </div>
      )}

      <div className='space-y-4'>
        {reviewableOrders.map((order) => (
          <div key={order.id} className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='flex justify-between items-center mb-3'>
              <h4 className='font-medium text-gray-900'>Замовлення #{order.id}</h4>
              <span className='text-sm text-gray-500'>{new Date(order.orderDate).toLocaleDateString('uk-UA')}</span>
            </div>

            <div className='space-y-3'>
              {order.orderItems.map((item) => (
                <div key={item.id} className='flex items-center justify-between bg-gray-50 rounded-lg p-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 relative'>
                      {item.product.imageUrl ? (
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className='object-cover rounded-md' />
                      ) : (
                        <div className='w-full h-full bg-gray-200 rounded-md flex items-center justify-center'>
                          <span className='text-gray-400 text-xs'>Фото</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>{item.product.name}</p>
                      <p className='text-sm text-gray-500'>
                        {item.quantity} шт. × {item.price.toString()} грн
                      </p>
                    </div>
                  </div>
                  <button onClick={() => openReviewModal(item.productId, order.id, item.product.name)} className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'>
                    Залишити відгук
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Відгук на товар</h3>
            <p className='text-gray-600 mb-4'>{selectedProduct.productName}</p>

            {success && (
              <div className='bg-green-50 border border-green-200 rounded-md p-3 mb-4'>
                <p className='text-green-800'>{success}</p>
              </div>
            )}

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-md p-3 mb-4'>
                <p className='text-red-800'>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Оцінка</label>
                {renderStars(reviewForm.rating, true)}
              </div>

              <div>
                <label htmlFor='comment' className='block text-sm font-medium text-gray-700 mb-2'>
                  Коментар (необов&apos;язково)
                </label>
                <textarea id='comment' rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' placeholder='Поділіться своїм досвідом використання товару...' />
              </div>

              <div className='flex space-x-3'>
                <button type='submit' disabled={submitting} className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'>
                  {submitting ? 'Додавання...' : 'Додати відгук'}
                </button>
                <button type='button' onClick={closeReviewModal} className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium'>
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
