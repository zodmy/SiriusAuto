'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageManagerProps {
  productId: number;
  currentImageUrl: string | null;
  onImageUpdate: (newImageUrl: string | null) => void;
}

export default function ImageManager({ productId, currentImageUrl, onImageUpdate }: ImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Непідтримуваний тип файлу. Дозволені: JPEG, PNG, WebP');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Розмір файлу перевищує 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка завантаження зображення');
      }

      const updatedProduct = await response.json();
      onImageUpdate(updatedProduct.imageUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Помилка завантаження зображення');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch(`/api/products/${productId}/image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка видалення зображення');
      }

      onImageUpdate(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Помилка видалення зображення');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <h4 className='text-sm font-medium text-gray-700'>Зображення товару</h4>
        {isUploading && (
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
            <span className='text-sm text-gray-600'>Завантаження...</span>
          </div>
        )}
      </div>

      {uploadError && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-sm text-red-600'>{uploadError}</p>
        </div>
      )}

      <div className='flex items-start gap-4'>
        {' '}
        {currentImageUrl ? (
          <div className='relative group'>
            <div className='w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center'>
              <Image src={currentImageUrl} alt='Зображення товару' width={128} height={128} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <button onClick={handleDeleteImage} disabled={isUploading} className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center' title='Видалити зображення'>
              ×
            </button>
          </div>
        ) : (
          <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50'>
            <span className='text-sm text-gray-500'>Немає зображення</span>
          </div>
        )}
        <div className='flex-1 space-y-2'>
          <input ref={fileInputRef} type='file' accept='image/jpeg,image/png,image/webp' onChange={handleFileSelect} disabled={isUploading} className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer file:cursor-pointer' />{' '}
          <p className='text-xs text-gray-500'>
            Підтримувані формати: JPEG, PNG, WebP. Максимальний розмір: 10MB.
            <br />
            Зображення буде конвертоване в WebP для оптимізації, зберігаючи оригінальні розміри.
          </p>
        </div>
      </div>
    </div>
  );
}
