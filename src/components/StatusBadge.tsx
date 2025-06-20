'use client';

import Badge from './Badge';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineTruck, HiOutlineExclamationCircle } from 'react-icons/hi';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'DISCONTINUED';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | StockStatus | string;
  type?: 'order' | 'payment' | 'stock' | 'custom';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const getStatusIcon = (status: string, className: string = 'h-4 w-4') => {
  switch (status) {
    case 'PENDING':
      return <HiOutlineClock className={`${className} text-amber-700`} />;
    case 'CONFIRMED':
      return <HiOutlineCheckCircle className={`${className} text-blue-700`} />;
    case 'PAID':
      return <HiOutlineCheckCircle className={`${className} text-green-700`} />;
    case 'PROCESSING':
      return <HiOutlineClock className={`${className} text-indigo-700`} />;
    case 'SHIPPED':
      return <HiOutlineTruck className={`${className} text-purple-700`} />;
    case 'DELIVERED':
      return <HiOutlineCheckCircle className={`${className} text-emerald-700`} />;
    case 'COMPLETED':
      return <HiOutlineCheckCircle className={`${className} text-green-700`} />;
    case 'CANCELLED':
      return <HiOutlineExclamationCircle className={`${className} text-red-700`} />;
    default:
      return <HiOutlineClock className={`${className} text-gray-700`} />;
  }
};

const statusConfigs = {
  order: {
    PENDING: { label: 'Очікування', variant: 'warning' as const },
    CONFIRMED: { label: 'Підтверджено', variant: 'info' as const },
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

export function StatusBadge({ status, type = 'order', className = '', size = 'md', showIcon = false }: StatusBadgeProps) {
  if (type === 'custom') {
    return (
      <Badge variant='default' size={size} className={className}>
        {showIcon && getStatusIcon(status, 'h-3 w-3 mr-1')}
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
      <Badge variant='default' size={size} className={className}>
        {showIcon && getStatusIcon(status, 'h-3 w-3 mr-1')}
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} size={size} className={`${className} flex items-center`}>
      {showIcon && type === 'order' && getStatusIcon(status, 'h-3 w-3 mr-1')}
      {config.label}
    </Badge>
  );
}

// Готові компоненти для швидкого використання
export const OrderStatusBadge = ({ status, ...props }: Omit<StatusBadgeProps, 'type'>) => <StatusBadge status={status} type='order' {...props} />;

export const PaymentStatusBadge = ({ status, ...props }: Omit<StatusBadgeProps, 'type'>) => <StatusBadge status={status} type='payment' {...props} />;

export const StockStatusBadge = ({ status, ...props }: Omit<StatusBadgeProps, 'type'>) => <StatusBadge status={status} type='stock' {...props} />;

// Компонент для відображення статусу з іконкою (як в адмін-панелі)
export const StatusWithIcon = ({ status, className = '' }: { status: string; className?: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PROCESSING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Очікування';
      case 'CONFIRMED':
        return 'Підтверджено';
      case 'PAID':
        return 'Оплачено';
      case 'PROCESSING':
        return 'В обробці';
      case 'SHIPPED':
        return 'Відправлено';
      case 'DELIVERED':
        return 'Доставлено';
      case 'COMPLETED':
        return 'Завершено';
      case 'CANCELLED':
        return 'Скасовано';
      default:
        return status;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)} ${className}`}>
      {getStatusIcon(status, 'h-3.5 w-3.5')}
      {getStatusText(status)}
    </div>
  );
};

export default StatusBadge;
