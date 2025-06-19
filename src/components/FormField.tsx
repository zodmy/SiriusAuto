'use client';

import { forwardRef } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({ label, error, helperText, className = '', labelClassName = '', inputClassName = '', required = false, ...props }, ref) => {
  const baseInputClassName = `
      appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      sm:text-sm transition-colors font-semibold text-gray-900 bg-white
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
      ${inputClassName}
    `.trim();

  return (
    <div className={className}>
      <label htmlFor={props.id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
        {label}
        {required && (
          <span className='text-red-500 ml-1' aria-label="Обов'язкове поле">
            *
          </span>
        )}
      </label>
      <input ref={ref} className={baseInputClassName} aria-describedby={`${props.id}-helper ${error ? `${props.id}-error` : ''}`} aria-invalid={error ? 'true' : 'false'} {...props} />
      {helperText && !error && (
        <div id={`${props.id}-helper`} className='mt-1 text-sm text-gray-500'>
          {helperText}
        </div>
      )}
      {error && (
        <div id={`${props.id}-error`} className='mt-1 text-sm text-red-600' role='alert'>
          {error}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
