'use client';

import { HiChevronLeft, HiChevronRight, HiDotsHorizontal } from 'react-icons/hi';
import Button from './Button';
import Text from './Text';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showTotal?: boolean;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showFirstLast?: boolean;
}

const sizeConfig = {
  sm: { button: 'sm' as const, gap: 'gap-1' },
  md: { button: 'md' as const, gap: 'gap-2' },
  lg: { button: 'lg' as const, gap: 'gap-2' },
};

export function Pagination({ currentPage, totalPages, onPageChange, showTotal = false, totalItems, pageSize, siblingCount = 1, className = '', size = 'md', showFirstLast = true }: PaginationProps) {
  const config = sizeConfig[size];

  // Generate array of page numbers to show
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    // Calculate start and end of sibling pages around current page
    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add sibling pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * (pageSize || 10) + 1;
  const endItem = Math.min(currentPage * (pageSize || 10), totalItems || 0);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Total items info */}
      {showTotal && totalItems && pageSize && (
        <Text size='sm' color='muted'>
          Показано {startItem}-{endItem} з {totalItems.toLocaleString()} результатів
        </Text>
      )}

      {/* Pagination controls */}
      <div className={`flex items-center ${config.gap}`}>
        {/* First page button */}
        {showFirstLast && currentPage > 2 && (
          <Button variant='outline' size={config.button} onClick={() => handlePageChange(1)} aria-label='Перша сторінка'>
            ««
          </Button>
        )}

        {/* Previous page button */}
        <Button variant='outline' size={config.button} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} aria-label='Попередня сторінка'>
          <HiChevronLeft className='w-4 h-4' />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className='flex items-center justify-center w-8 h-8'>
                <HiDotsHorizontal className='w-4 h-4 text-gray-400' />
              </div>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button key={page} variant={isActive ? 'primary' : 'outline'} size={config.button} onClick={() => handlePageChange(page)} aria-label={`Сторінка ${page}`} aria-current={isActive ? 'page' : undefined} className={isActive ? 'pointer-events-none' : ''}>
              {page}
            </Button>
          );
        })}

        {/* Next page button */}
        <Button variant='outline' size={config.button} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label='Наступна сторінка'>
          <HiChevronRight className='w-4 h-4' />
        </Button>

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages - 1 && (
          <Button variant='outline' size={config.button} onClick={() => handlePageChange(totalPages)} aria-label='Остання сторінка'>
            »»
          </Button>
        )}
      </div>
    </div>
  );
}

// Simplified pagination for basic use cases
export function SimplePagination({ currentPage, totalPages, onPageChange, className = '' }: Pick<PaginationProps, 'currentPage' | 'totalPages' | 'onPageChange' | 'className'>) {
  return <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} className={className} siblingCount={0} showFirstLast={false} />;
}

export default Pagination;
