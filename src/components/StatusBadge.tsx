'use client';

import Badge from './Badge';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'DISCONTINUED';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | StockStatus | string;
  type?: 'order' | 'payment' | 'stock' | 'custom';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfigs = {
  order: {
    PENDING: { label: 'Очікування', variant: 'warning' as const },
    PAID: { label: 'Оплачено', variant: 'info' as const },
    PROCESSING: { label: 'В обробці', variant: 'info' as const },
    SHIPPED: { label: 'Відправлено', variant: 'info' as const },
    DELIVERED: { label: 'Доставлено', variant: 'success' as const },
    COMPLETED: { label: 'Завершено', variant: 'success' as const },
    CANCELLED: { label: 'Скасовано', variant: 'error' as const },
  },
  payment: {
    PENDING: { label: 'Очікує оплати', variant: 'warning' as const },
    PAID: { label: 'Оплачено', variant: 'success' as const },
    FAILED: { label: 'Помилка оплати', variant: 'error' as const },
    REFUNDED: { label: 'Повернуто', variant: 'info' as const },
  },
  stock: {
    IN_STOCK: { label: 'В наявності', variant: 'success' as const },
    OUT_OF_STOCK: { label: 'Немає в наявності', variant: 'error' as const },
    LOW_STOCK: { label: 'Мало в наявності', variant: 'warning' as const },
    DISCONTINUED: { label: 'Знято з виробництва', variant: 'default' as const },
  },
};

export function StatusBadge({
  status,
  type = 'order',
  className = '',
  size = 'md',
}: StatusBadgeProps) {
  if (type === 'custom') {
    return (
      <Badge variant="default" size={size} className={className}>
        {status}
      </Badge>
    );
  }

  let config: { label: string; variant: 'warning' | 'info' | 'success' | 'error' | 'default' } | undefined;
  
  if (type === 'order') {
    config = statusConfigs.order[status as keyof typeof statusConfigs.order];
  } else if (type === 'payment') {
    config = statusConfigs.payment[status as keyof typeof statusConfigs.payment];
  } else if (type === 'stock') {
    config = statusConfigs.stock[status as keyof typeof statusConfigs.stock];
  }
  
  if (!config) {
    // Fallback for unknown statuses
    return (
      <Badge variant="default" size={size} className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      className={className}
    >
      {config.label}
    </Badge>
  );
}

// Готові компоненти для швидкого використання
export const OrderStatusBadge = ({ status, ...props }: Omit<StatusBadgeProps, 'type'>) => (
  <StatusBadge status={status} type="order" {...props} />
);

export const PaymentStatusBadge = ({ status, ...props }: Omit<StatusBadgeProps, 'type'>) => (
  <StatusBadge status={status} type="payment" {...props} />
);

export const StockStatusBadge = ({ status, ...props }: Omit<StatusBadgeProps, 'type'>) => (
  <StatusBadge status={status} type="stock" {...props} />
);

export default StatusBadge;
