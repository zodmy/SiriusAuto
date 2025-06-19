import { useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationCircle, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

interface SupplyRecord {
  type: 'manufacturer' | 'category' | 'product';
  data: Record<string, unknown>;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface SupplyResultsProps {
  results: SupplyRecord[];
  isVisible: boolean;
}

export default function SupplyResults({ results, isVisible }: SupplyResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    manufacturers: false,
    categories: false,
    products: false,
  });

  if (!isVisible || results.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <HiOutlineCheckCircle className='text-green-500' size={20} />;
      case 'error':
        return <HiOutlineXCircle className='text-red-500' size={20} />;
      default:
        return <HiOutlineExclamationCircle className='text-yellow-500' size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const groupedResults = results.reduce((acc, record) => {
    const type = record.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(record);
    return acc;
  }, {} as Record<string, SupplyRecord[]>);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSectionTitle = (type: string) => {
    switch (type) {
      case 'manufacturer':
        return 'Виробники';
      case 'category':
        return 'Категорії';
      case 'product':
        return 'Товари';
      default:
        return type;
    }
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div className='bg-white shadow-lg rounded-xl p-6 mt-6 border border-gray-200'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>Результати завантаження</h2>
        <div className='flex items-center gap-4 text-sm'>
          <span className='flex items-center gap-2 text-green-600'>
            <HiOutlineCheckCircle size={16} />
            Успішно: {successCount}
          </span>
          <span className='flex items-center gap-2 text-red-600'>
            <HiOutlineXCircle size={16} />
            Помилки: {errorCount}
          </span>
        </div>
      </div>

      <div className='space-y-4'>
        {Object.entries(groupedResults).map(([type, records]) => {
          const sectionSuccessCount = records.filter((r) => r.status === 'success').length;
          const sectionErrorCount = records.filter((r) => r.status === 'error').length;
          const isExpanded = expandedSections[type];

          return (
            <div key={type} className='border border-gray-200 rounded-lg overflow-hidden'>
              <button onClick={() => toggleSection(type)} className='w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='font-medium text-gray-900'>{getSectionTitle(type)}</span>
                  <div className='flex items-center gap-3 text-sm'>
                    <span className='flex items-center gap-1 text-green-600'>
                      <HiOutlineCheckCircle size={14} />
                      {sectionSuccessCount}
                    </span>
                    <span className='flex items-center gap-1 text-red-600'>
                      <HiOutlineXCircle size={14} />
                      {sectionErrorCount}
                    </span>
                  </div>
                </div>
                {isExpanded ? <HiOutlineChevronUp className='text-gray-500' size={20} /> : <HiOutlineChevronDown className='text-gray-500' size={20} />}
              </button>

              {isExpanded && (
                <div className='p-4 space-y-3 max-h-64 overflow-y-auto'>
                  {records.map((record, index) => (
                    <div key={index} className={`border rounded-lg p-3 ${getStatusColor(record.status)}`}>
                      <div className='flex items-start gap-3'>
                        {getStatusIcon(record.status)}
                        <div className='flex-1'>
                          {' '}
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-sm text-gray-600'>{String(record.data.name || 'Невідомо')}</span>
                            {record.type === 'category' && record.data.parentName ? <span className='text-xs text-gray-500'>(підкатегорія: {String(record.data.parentName)})</span> : null}
                            {record.type === 'product' && (
                              <div className='flex items-center gap-2 text-xs text-gray-500'>
                                <span>{String(record.data.categoryName || '')}</span>
                                <span>•</span>
                                <span>{String(record.data.manufacturerName || '')}</span>
                              </div>
                            )}
                          </div>
                          {record.error && <p className='text-red-600 text-sm'>{record.error}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
