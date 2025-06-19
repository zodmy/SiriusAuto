'use client';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'default' | 'muted' | 'accent' | 'white';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl',
  '4xl': 'text-4xl sm:text-5xl',
};

const weights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const colors = {
  default: 'text-gray-900',
  muted: 'text-gray-600',
  accent: 'text-blue-600',
  white: 'text-white',
};

const aligns = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export default function Heading({ level, size, weight = 'bold', color = 'default', align = 'left', className = '', children, ...props }: HeadingProps) {
  // Auto-size based on level if size not provided
  const autoSize =
    size ||
    ({
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'md',
      6: 'sm',
    }[level] as keyof typeof sizes);

  const headingClasses = `
    ${sizes[autoSize]}
    ${weights[weight]}
    ${colors[color]}
    ${aligns[align]}
    ${className}
  `.trim();
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag className={headingClasses} {...props}>
      {children}
    </Tag>
  );
}
