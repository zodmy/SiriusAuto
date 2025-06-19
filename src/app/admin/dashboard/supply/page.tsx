'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineUpload, HiOutlineDownload, HiOutlineDocumentText, HiOutlineArrowLeft } from 'react-icons/hi';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import SupplyResults from '@/components/SupplyResults';

interface SupplyRecord {
  type: 'manufacturer' | 'category' | 'product';
  data: Record<string, unknown>;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function SupplyPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<SupplyRecord[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100 p-4 flex items-center justify-center'>
        <div className='text-gray-600'>Завантаження...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Будь ласка, оберіть JSON файл');
      return;
    }

    setIsProcessing(true);
    setShowResults(false);
    setUploadResults([]);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      const response = await fetch('/api/admin/supply/bulk-import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults(result.results || []);
        setShowResults(true);
      } else {
        alert(result.error || 'Помилка завантаження даних');
      }
    } catch (error) {
      console.error('Помилка обробки файлу:', error);
      alert('Помилка обробки файлу. Перевірте формат JSON.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const template = {
      manufacturers: [
        {
          name: 'Назва виробника 1',
        },
      ],
      categories: [
        {
          name: 'Назва категорії 1',
          parentName: null, // або назва батьківської категорії
        },
      ],
      products: [
        {
          name: 'Назва товару 1',
          description: 'Опис товару',
          price: 1000.0,
          stockQuantity: 10,
          imageUrl: 'https://example.com/image.jpg',
          categoryName: 'Назва категорії 1',
          manufacturerName: 'Назва виробника 1',
          isVariant: false,
          baseProductName: null, // для варіантів товару
          compatibleVehicles: [
            {
              carMake: 'BMW',
              carModel: 'X5',
              carYear: 2020,
              carBodyType: 'SUV',
              carEngine: '3.0i',
            },
          ],
        },
      ],
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'supply-template.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button onClick={() => router.back()} className='flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors'>
                <HiOutlineArrowLeft size={20} />
                Назад
              </button>
              <h1 className='text-2xl font-bold text-gray-900'>Централізований розділ постачання</h1>
            </div>
          </div>
          <p className='text-gray-600 mt-2'>Додавайте виробників, категорії та товари масово за один раз</p>
        </div>
        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Upload Section */}
          <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <HiOutlineUpload className='text-blue-600' size={24} />
              Завантаження даних
            </h2>

            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                <HiOutlineDocumentText className='mx-auto text-gray-400 mb-4' size={48} />
                <p className='text-gray-600 mb-4'>Оберіть JSON файл з даними для завантаження</p>
                <input ref={fileInputRef} type='file' accept='.json' onChange={handleFileUpload} className='hidden' />
                <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className='bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isProcessing ? 'Обробка...' : 'Обрати файл'}
                </button>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h3 className='font-semibold text-blue-900 mb-2'>Формат файлу:</h3>
                <ul className='text-blue-800 text-sm space-y-1'>
                  <li>• JSON файл з розділами: manufacturers, categories, products</li>
                  <li>• Підтримує створення зв&apos;язків між сутностями</li>
                  <li>• Автоматично створює відсутні залежності</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Section */}
          <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <HiOutlineDownload className='text-green-600' size={24} />
              Шаблон файлу
            </h2>

            <div className='space-y-4'>
              <p className='text-gray-600'>Завантажте шаблон JSON файлу з прикладами структури даних</p>

              <button onClick={downloadTemplate} className='w-full bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2'>
                <HiOutlineDownload size={20} />
                Завантажити шаблон
              </button>

              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <h3 className='font-semibold text-green-900 mb-2'>Можливості:</h3>
                <ul className='text-green-800 text-sm space-y-1'>
                  <li>• Масове додавання виробників</li>
                  <li>• Створення ієрархії категорій</li>
                  <li>• Додавання товарів з варіантами</li>
                  <li>• Налаштування сумісності з автомобілями</li>
                </ul>
              </div>
            </div>
          </div>
        </div>{' '}
        {/* Results Section */}
        <SupplyResults results={uploadResults} isVisible={showResults} />
      </div>
    </div>
  );
}
