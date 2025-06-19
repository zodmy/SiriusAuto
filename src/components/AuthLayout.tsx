'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
};

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  maxWidth = 'md',
  className = '' 
}: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className={`${maxWidthClasses[maxWidth]} w-full space-y-6 sm:space-y-8 ${className}`}>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              {title}
            </h1>
            {subtitle && (
              <div className="text-sm sm:text-base text-gray-600">
                {subtitle}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
