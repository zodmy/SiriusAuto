'use client';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error' | 'white';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const weights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colors = {
  default: 'text-gray-900',
  muted: 'text-gray-600',
  accent: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  white: 'text-white',
};

const aligns = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export default function Text({ size = 'md', weight = 'normal', color = 'default', align = 'left', truncate = false, as: Component = 'p', className = '', children, ...props }: TextProps) {
  const textClasses = `
    ${sizes[size]}
    ${weights[weight]}
    ${colors[color]}
    ${aligns[align]}
    ${truncate ? 'truncate' : ''}
    ${className}
  `.trim();

  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
}
