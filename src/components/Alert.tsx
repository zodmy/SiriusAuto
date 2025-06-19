'use client';

import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

const alertStyles = {
  success: {
    container: 'bg-green-50 border border-green-200 text-green-800',
    icon: HiCheckCircle,
    iconColor: 'text-green-400',
  },
  error: {
    container: 'bg-red-50 border border-red-200 text-red-800',
    icon: HiXCircle,
    iconColor: 'text-red-400',
  },
  warning: {
    container: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    icon: HiExclamationCircle,
    iconColor: 'text-yellow-400',
  },
  info: {
    container: 'bg-blue-50 border border-blue-200 text-blue-800',
    icon: HiInformationCircle,
    iconColor: 'text-blue-400',
  },
};

export default function Alert({ type, title, message, className = '', onClose }: AlertProps) {
  const styles = alertStyles[type];
  const IconComponent = styles.icon;

  return (
    <div className={`rounded-lg p-3 sm:p-4 ${styles.container} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${styles.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-opacity-20 hover:bg-gray-600 transition-colors ${styles.iconColor}`}
              aria-label="Закрити повідомлення"
            >
              <HiXCircle className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
