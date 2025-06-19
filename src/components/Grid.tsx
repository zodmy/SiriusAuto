'use client';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const gaps = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6', 
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-10',
};

const getGridCols = (cols?: GridProps['cols']) => {
  if (!cols) return 'grid-cols-1';
  
  const classes = [];
  
  if (cols.default) classes.push(`grid-cols-${cols.default}`);
  else classes.push('grid-cols-1');
  
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  
  return classes.join(' ');
};

export default function Grid({ 
  cols,
  gap = 'md',
  className = '',
  children,
  ...props 
}: GridProps) {
  const gridClasses = `
    grid ${getGridCols(cols)} ${gaps[gap]} ${className}
  `.trim();

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
}
