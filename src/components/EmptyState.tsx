'use client';

import { ReactNode } from 'react';
import { HiOutlineExclamationCircle, HiOutlineInboxIn, HiOutlineShoppingCart, HiOutlineDocumentText, HiOutlineSearch } from 'react-icons/hi';
import Text from './Text';
import Heading from './Heading';

export type EmptyStateType = 'default' | 'search' | 'cart' | 'orders' | 'products' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const typeConfig = {
  default: {
    icon: HiOutlineInboxIn,
    title: 'Немає даних',
    description: 'Тут поки що нічого немає',
  },
  search: {
    icon: HiOutlineSearch,
    title: 'Нічого не знайдено',
    description: 'Спробуйте змінити параметри пошуку',
  },
  cart: {
    icon: HiOutlineShoppingCart,
    title: 'Кошик порожній',
    description: 'Додайте товари до кошика, щоб продовжити покупки',
  },
  orders: {
    icon: HiOutlineDocumentText,
    title: 'Немає замовлень',
    description: 'Ви ще не зробили жодного замовлення',
  },
  products: {
    icon: HiOutlineInboxIn,
    title: 'Немає товарів',
    description: 'В цій категорії поки що немає товарів',
  },
  error: {
    icon: HiOutlineExclamationCircle,
    title: 'Щось пішло не так',
    description: 'Спробуйте оновити сторінку або повторити спробу пізніше',
  },
};

const sizeConfig = {
  sm: {
    container: 'py-8',
    iconSize: 'w-12 h-12',
    titleSize: 'lg' as const,
    spacing: 'space-y-3',
  },
  md: {
    container: 'py-12',
    iconSize: 'w-16 h-16',
    titleSize: 'xl' as const,
    spacing: 'space-y-4',
  },
  lg: {
    container: 'py-20',
    iconSize: 'w-20 h-20',
    titleSize: '2xl' as const,
    spacing: 'space-y-6',
  },
};

export function EmptyState({ type = 'default', title, description, icon, action, className = '', size = 'md' }: EmptyStateProps) {
  const config = typeConfig[type];
  const sizeStyles = sizeConfig[size];

  const IconComponent = icon || config.icon;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <div className={`${sizeStyles.container} ${className}`}>
      <div className={`flex flex-col items-center text-center max-w-md mx-auto ${sizeStyles.spacing}`}>
        {typeof IconComponent === 'function' ? <IconComponent className={`${sizeStyles.iconSize} text-gray-400`} /> : IconComponent}

        <div className='space-y-2'>
          <Heading level={2} size={sizeStyles.titleSize} color='muted'>
            {finalTitle}
          </Heading>

          {finalDescription && (
            <Text color='muted' className='max-w-sm'>
              {finalDescription}
            </Text>
          )}
        </div>

        {action && <div className='pt-2'>{action}</div>}
      </div>
    </div>
  );
}

// Готові варіанти для швидкого використання
export const EmptyCart = ({ action, ...props }: Omit<EmptyStateProps, 'type'>) => <EmptyState type='cart' action={action} {...props} />;

export const EmptySearch = ({ action, ...props }: Omit<EmptyStateProps, 'type'>) => <EmptyState type='search' action={action} {...props} />;

export const EmptyOrders = ({ action, ...props }: Omit<EmptyStateProps, 'type'>) => <EmptyState type='orders' action={action} {...props} />;

export const EmptyProducts = ({ action, ...props }: Omit<EmptyStateProps, 'type'>) => <EmptyState type='products' action={action} {...props} />;

export const ErrorState = ({ action, ...props }: Omit<EmptyStateProps, 'type'>) => <EmptyState type='error' action={action} {...props} />;

export default EmptyState;
