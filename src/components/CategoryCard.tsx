'use client';

import Link from 'next/link';
import { HiTag } from 'react-icons/hi';

interface Category {
  id: number;
  name: string;
  description?: string;
  children?: Category[];
}

interface CategoryCardProps {
  category: Category;
  showChildren?: boolean;
}

export default function CategoryCard({ category, showChildren = false }: CategoryCardProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'>
      <Link href={`/categories/${encodeURIComponent(category.name)}`} className='block group'>
        <div className='p-6 text-center'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
            <HiTag className='w-8 h-8 text-white' />
          </div>
          <h3 className='font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors'>{category.name}</h3>
          {category.description && <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{category.description}</p>}
        </div>
      </Link>

      {showChildren && category.children && category.children.length > 0 && (
        <div className='px-6 pb-6 pt-0'>
          <div className='border-t border-gray-100 pt-4'>
            <div className='grid grid-cols-1 gap-2'>
              {category.children.map((child) => (
                <Link key={child.id} href={`/categories/${encodeURIComponent(child.name)}`} className='text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-all duration-150 flex items-center justify-between group/child'>
                  <span>• {child.name}</span>
                  <svg className='w-4 h-4 text-gray-400 group-hover/child:text-blue-600 transition-colors' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
