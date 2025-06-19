'use client';

import { useState, forwardRef } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showToggle?: boolean;
  className?: string;
  labelClassName?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ label, error, showToggle = true, className = '', labelClassName = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClassName = `
      appearance-none block w-full px-3 py-2 ${showToggle ? 'pr-10' : ''} 
      border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      sm:text-sm transition-colors font-semibold text-gray-900 bg-white
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}
    `.trim();

  return (
    <div>
      {label && (
        <label htmlFor={props.id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className='relative'>
        <input ref={ref} type={showPassword ? 'text' : 'password'} className={inputClassName} aria-describedby={error ? `${props.id}-error` : undefined} {...props} />
        {showToggle && (
          <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors touch-manipulation' disabled={props.disabled} aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}>
            {showPassword ? <HiEyeOff className='w-5 h-5' aria-hidden='true' /> : <HiEye className='w-5 h-5' aria-hidden='true' />}
          </button>
        )}
      </div>
      {error && (
        <div id={`${props.id}-error`} className='mt-1 text-sm text-red-600' role='alert'>
          {error}
        </div>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
