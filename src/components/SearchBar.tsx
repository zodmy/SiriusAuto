'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  manufacturer: string;
  stockQuantity: number;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

const SearchBar = ({ className = '', placeholder = 'Пошук товарів...' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (query.trim().length < 2) {
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(data.length > 0);
        }
      } catch (error) {
        console.error('Помилка пошуку:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className='relative'>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={className}
        />
      </form>

      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto'>
          {isLoading ? (
            <div className='p-4 text-center text-gray-500'>
              <div className='animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full'></div>
              <span className='ml-2'>Пошук...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} onClick={handleResultClick} className='block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex-shrink-0 w-12 h-12 relative'>
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className='object-contain rounded border' />
                      ) : (
                        <div className='w-full h-full bg-gray-200 rounded border flex items-center justify-center'>
                          <span className='text-gray-400 text-xs'>Фото</span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-medium text-gray-900 truncate'>{product.name}</h4>
                      <p className='text-xs text-gray-500 truncate'>
                        {product.category} • {product.manufacturer}
                      </p>{' '}
                      <div className='flex items-center justify-between mt-1'>
                        <span className='text-sm font-semibold text-blue-600'>₴{Number(product.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {query.trim() && (
                <Link href={`/products?search=${encodeURIComponent(query.trim())}`} onClick={handleResultClick} className='block p-3 text-center bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-700 font-medium transition-colors'>
                  Показати всі результати для &ldquo;{query.trim()}&rdquo;
                </Link>
              )}
            </>
          ) : query.trim().length >= 2 ? (
            <div className='p-4 text-center text-gray-500'>
              <p>Нічого не знайдено за запитом &ldquo;{query.trim()}&rdquo;</p>
              <Link href={`/products?search=${encodeURIComponent(query.trim())}`} onClick={handleResultClick} className='text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block'>
                Переглянути всі товари
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
