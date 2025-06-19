'use client';

import Link from 'next/link';
import { HiChevronRight, HiHome } from 'react-icons/hi';
import { useBreadcrumbScroll } from '@/lib/hooks/useBreadcrumbScroll';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { breadcrumbRef } = useBreadcrumbScroll();

  return (
    <div className={`bg-white border-b ${className}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='relative'>
          <nav ref={breadcrumbRef} className='breadcrumb-container flex items-center space-x-1 sm:space-x-2 text-sm overflow-x-auto scrollbar-hide'>
            <div className='flex items-center space-x-1 sm:space-x-2 min-w-max'>
              {items.map((crumb, index) => (
                <div key={index} className='flex items-center'>
                  {index > 0 && <HiChevronRight className='text-gray-400 mx-1 sm:mx-2 flex-shrink-0' />}
                  {index === 0 ? <HiHome className='text-gray-400 mr-1 flex-shrink-0' /> : null}
                  {index === items.length - 1 ? (
                    <span className='text-gray-900 font-medium whitespace-nowrap'>{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className='text-blue-600 hover:text-blue-800 whitespace-nowrap'>
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
