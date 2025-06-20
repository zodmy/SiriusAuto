'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Card from './Card';
import Text from './Text';
import Badge from './Badge';
import Heading from './Heading';
import Divider from './Divider';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: number;
  name: string;
  price: number | string;
  quantity: number;
  imageUrl?: string;
}

interface OrderCardProps {
  id: number;
  status: OrderStatus;
  orderDate: string;
  totalPrice: number | string;
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  trackingNumber?: string;
  deliveryMethod?: string;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
  showItems?: boolean;
  maxItemsToShow?: number;
}

const statusConfig = {
  PENDING: { label: 'Очікування', variant: 'warning' as const },
  PAID: { label: 'Оплачено', variant: 'info' as const },
  PROCESSING: { label: 'В обробці', variant: 'info' as const },
  SHIPPED: { label: 'Відправлено', variant: 'info' as const },
  DELIVERED: { label: 'Доставлено', variant: 'success' as const },
  COMPLETED: { label: 'Завершено', variant: 'success' as const },
  CANCELLED: { label: 'Скасовано', variant: 'error' as const },
};

export function OrderCard({ id, status, orderDate, totalPrice, items, customerName, customerEmail, trackingNumber, deliveryMethod, actions, onClick, className = '', showItems = true, maxItemsToShow = 3 }: OrderCardProps) {
  const statusInfo = statusConfig[status];
  const finalPrice = typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const content = (
    <>
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div>
          <Heading level={3} size='lg' className='mb-1'>
            Замовлення #{id}
          </Heading>
          <Text size='sm' color='muted'>
            {formatDate(orderDate)}
          </Text>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Customer Info */}
      {(customerName || customerEmail) && (
        <div className='mb-4'>
          {customerName && (
            <Text size='sm' weight='medium' className='mb-1'>
              {customerName}
            </Text>
          )}
          {customerEmail && (
            <Text size='sm' color='muted'>
              {customerEmail}
            </Text>
          )}
        </div>
      )}

      {/* Delivery Info */}
      {(trackingNumber || deliveryMethod) && (
        <div className='mb-4'>
          {deliveryMethod && (
            <Text size='sm' className='mb-1'>
              <span className='font-medium'>Доставка:</span> {deliveryMethod}
            </Text>
          )}
          {trackingNumber && (
            <Text size='sm'>
              <span className='font-medium'>Трек-номер:</span> {trackingNumber}
            </Text>
          )}
        </div>
      )}

      {/* Items */}
      {showItems && items.length > 0 && (
        <>
          <Divider className='my-4' />
          <div className='space-y-3'>
            <Text size='sm' weight='medium' color='muted'>
              Товари ({items.length}):
            </Text>
            <div className='space-y-2'>
              {items.slice(0, maxItemsToShow).map((item) => (
                <div key={item.id} className='flex items-center gap-3'>
                  {item.imageUrl && (
                    <div className='w-12 h-12 relative flex-shrink-0 rounded overflow-hidden bg-gray-100'>
                      <Image src={item.imageUrl} alt={item.name} fill className='object-cover' sizes='48px' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <Text size='sm' className='line-clamp-1'>
                      {item.name}
                    </Text>
                    <Text size='xs' color='muted'>
                      {item.quantity} шт. × {formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price))} ₴
                    </Text>
                  </div>
                  <Text size='sm' weight='medium'>
                    {formatPrice((typeof item.price === 'number' ? item.price : parseFloat(item.price)) * item.quantity)} ₴
                  </Text>
                </div>
              ))}
              {items.length > maxItemsToShow && (
                <Text size='xs' color='muted'>
                  та ще {items.length - maxItemsToShow} товар(ів)...
                </Text>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <Divider className='my-4' />
      <div className='flex items-center justify-between'>
        <Text size='lg' weight='bold'>
          Разом: {formatPrice(finalPrice)} ₴
        </Text>
        {actions && <div className='flex gap-2'>{actions}</div>}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`text-left w-full ${className}`}>
        <Card padding='lg' className='cursor-pointer hover:shadow-md transition-shadow'>
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Card padding='lg' className={className}>
      {content}
    </Card>
  );
}

export default OrderCard;
