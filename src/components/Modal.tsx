'use client';

import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full h-full',
};

export default function Modal({ isOpen, onClose, title, size = 'md', closable = true, children, footer, className = '' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closable) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closable]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity' onClick={closable ? onClose : undefined} aria-hidden='true' />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div
          className={`
            relative bg-white rounded-lg shadow-xl w-full 
            ${sizes[size]} ${className}
            animate-fade-in
          `}
          role='dialog'
          aria-modal='true'
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {(title || closable) && (
            <div className='flex items-center justify-between p-4 sm:p-6 border-b border-gray-200'>
              {title && (
                <h2 id='modal-title' className='text-lg font-semibold text-gray-900'>
                  {title}
                </h2>
              )}
              {closable && (
                <Button variant='ghost' size='sm' onClick={onClose} className='ml-auto' aria-label='Закрити'>
                  <HiX className='w-5 h-5' />
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className='p-4 sm:p-6'>{children}</div>

          {/* Footer */}
          {footer && <div className='flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200'>{footer}</div>}
        </div>
      </div>
    </div>
  );
}
