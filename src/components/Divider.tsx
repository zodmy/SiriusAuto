'use client';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const spacings = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
};

const verticalSpacings = {
  sm: 'mx-2 h-4',
  md: 'mx-4 h-6',
  lg: 'mx-6 h-8',
};

const variants = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

export default function Divider({ orientation = 'horizontal', variant = 'solid', spacing = 'md', children, className = '', ...props }: DividerProps) {
  if (children && orientation === 'horizontal') {
    return (
      <div className={`relative ${spacings[spacing]} ${className}`}>
        <div className='absolute inset-0 flex items-center' aria-hidden='true'>
          <div className={`w-full border-t border-gray-200 ${variants[variant]}`} />
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-white px-3 text-sm text-gray-500'>{children}</span>
        </div>
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div
        className={`
          inline-block border-l border-gray-200 
          ${variants[variant]} 
          ${verticalSpacings[spacing]} 
          ${className}
        `}
        {...props}
      />
    );
  }

  return (
    <hr
      className={`
        border-0 border-t border-gray-200 
        ${variants[variant]} 
        ${spacings[spacing]} 
        ${className}
      `}
      {...props}
    />
  );
}
