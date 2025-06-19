'use client';

import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
  responsive?: boolean;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableHeaderProps extends TableCellProps {
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | null;
}

function Table({ children, className = '', responsive = true }: TableProps) {
  const tableClasses = `min-w-full divide-y divide-gray-200 ${className}`;
  
  if (responsive) {
    return (
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          {children}
        </table>
      </div>
    );
  }
  
  return (
    <table className={tableClasses}>
      {children}
    </table>
  );
}

function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

function TableRow({ children, className = '', onClick, hover = false }: TableRowProps) {
  const rowClasses = `
    ${hover ? 'hover:bg-gray-50' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();
  
  return (
    <tr className={rowClasses} onClick={onClick}>
      {children}
    </tr>
  );
}

function TableCell({ children, className = '', align = 'left', width }: TableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  const cellClasses = `
    px-6 py-4 whitespace-nowrap text-sm text-gray-900
    ${alignClasses[align]}
    ${className}
  `.trim();
  
  return (
    <td className={cellClasses} style={{ width }}>
      {children}
    </td>
  );
}

function TableHeader({ 
  children, 
  className = '', 
  align = 'left', 
  width, 
  sortable = false, 
  onSort, 
  sortDirection 
}: TableHeaderProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right',
  };
  
  const headerClasses = `
    px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
    ${alignClasses[align]}
    ${sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
    ${className}
  `.trim();
  
  return (
    <th className={headerClasses} onClick={sortable ? onSort : undefined} style={{ width }}>
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-gray-400">
            {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  );
}

// Compound component pattern
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Header = TableHeader;

export default Table;
