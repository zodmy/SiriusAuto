'use client';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
  children: React.ReactNode;
}

const maxWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddings = {
  none: '',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12',
};

export default function Container({ maxWidth = '7xl', padding = 'md', center = true, className = '', children, ...props }: ContainerProps) {
  const containerClasses = `
    ${maxWidths[maxWidth]}
    ${paddings[padding]}
    ${center ? 'mx-auto' : ''}
    ${className}
  `.trim();

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
}
