'use client';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800', 
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  outline: 'bg-transparent text-gray-600 border border-gray-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function Badge({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: BadgeProps) {
  const badgeClasses = `
    inline-flex items-center font-medium rounded-full
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
}
