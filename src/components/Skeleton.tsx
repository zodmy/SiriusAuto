'use client';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

const variants = {
  rectangular: 'rounded-md',
  circular: 'rounded-full',
  text: 'rounded-sm',
};

const animations = {
  pulse: 'animate-pulse',
  wave: 'animate-pulse', // Could implement wave animation later
  none: '',
};

export default function Skeleton({ width, height, variant = 'rectangular', lines = 1, animation = 'pulse', className = '', style, ...props }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`bg-gray-200 h-4 ${variants[variant]} ${animations[animation]}`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  const skeletonStyle = {
    width,
    height: height || (variant === 'text' ? '1rem' : undefined),
    ...style,
  };

  return <div className={`bg-gray-200 ${variants[variant]} ${animations[animation]} ${className}`} style={skeletonStyle} {...props} />;
}
