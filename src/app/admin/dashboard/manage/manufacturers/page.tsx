'use client';

import { useCallback, useEffect, useState } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineTrash, HiOutlineSearch, HiOutlineArrowLeft, HiOutlinePlus } from 'react-icons/hi';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import React from 'react';

interface Manufacturer {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const ManufacturerSkeleton = () => (
  <div className='animate-pulse'>
    <div className='hidden sm:block'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-100'>
          <tr>
            <th className='px-4 py-3 text-left'>
              <div className='h-4 bg-gray-300 rounded w-8'></div>
            </th>
            <th className='px-6 py-3 text-left'>
              <div className='h-4 bg-gray-300 rounded w-16'></div>
            </th>
            <th className='px-6 py-3 text-left'>
              <div className='h-4 bg-gray-300 rounded w-32'></div>
            </th>
            <th className='px-6 py-3 text-right'>
              <div className='h-4 bg-gray-300 rounded w-12 ml-auto'></div>
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-100'>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className='hover:bg-gray-50'>
              <td className='px-4 py-3'>
                <div className='h-4 bg-gray-300 rounded w-8'></div>
              </td>
              <td className='px-6 py-3'>
                <div className='h-4 bg-gray-300 rounded w-32'></div>
              </td>
              <td className='px-6 py-3'>
                <div className='h-4 bg-gray-300 rounded w-24'></div>
              </td>
              <td className='px-6 py-3 text-right'>
                <div className='flex justify-end gap-2'>
                  <div className='h-5 w-5 bg-gray-300 rounded'></div>
                  <div className='h-5 w-5 bg-gray-300 rounded'></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className='sm:hidden flex flex-col gap-3'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='rounded-xl border border-gray-200 bg-white shadow-sm p-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex-1'>
              <div className='h-4 bg-gray-300 rounded w-32 mb-1'></div>
              <div className='h-3 bg-gray-300 rounded w-16'></div>
            </div>
            <div className='flex gap-1'>
              <div className='h-5 w-5 bg-gray-300 rounded'></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ManageManufacturersPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();

  const normalizeString = useCallback((str: string) => {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }, []);

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingManufacturerId, setEditingManufacturerId] = useState<number | null>(null);
  const [editingManufacturerName, setEditingManufacturerName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'name'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const fetchManufacturers = useCallback(async () => {
    try {
      const res = await fetch('/api/manufacturers');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити виробників');
      }
      const data = await res.json();
      setManufacturers(data);
    } catch (error) {
      console.error('Помилка завантаження виробників:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    const loadManufacturers = async () => {
      if (!isAdmin || isVerifyingAuth) return;

      try {
        const res = await fetch('/api/manufacturers');
        if (!res.ok) {
          throw new Error('Не вдалося завантажити виробників');
        }
        const data = await res.json();
        setManufacturers(data);
      } catch (error) {
        console.error('Помилка завантаження виробників:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadManufacturers();
  }, [isAdmin, isVerifyingAuth]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const getFilteredManufacturers = useCallback(() => {
    const searchTerm = normalizeString(debouncedSearch.trim());

    let filtered = manufacturers;

    if (searchTerm) {
      filtered = manufacturers.filter((manufacturer) => normalizeString(manufacturer.name).includes(searchTerm));
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'id') {
        return sortDir === 'asc' ? a.id - b.id : b.id - a.id;
      } else {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });
  }, [manufacturers, debouncedSearch, sortBy, sortDir, normalizeString]);

  const handleAddManufacturer = useCallback(async () => {
    setCreateError(null);
    if (!newManufacturerName.trim()) {
      setCreateError('Введіть назву виробника');
      return;
    }

    try {
      const res = await fetch('/api/manufacturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newManufacturerName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setCreateError('Виробник з такою назвою вже існує');
        } else {
          setCreateError(data?.error || 'Помилка створення виробника');
        }
        return;
      }

      setNewManufacturerName('');
      await fetchManufacturers();
    } catch {
      setCreateError('Помилка мережі');
    }
  }, [newManufacturerName, fetchManufacturers]);

  const handleEditManufacturer = useCallback((manufacturer: Manufacturer) => {
    setEditingManufacturerId(manufacturer.id);
    setEditingManufacturerName(manufacturer.name);
    setEditError(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingManufacturerId(null);
    setEditingManufacturerName('');
    setEditError(null);
  }, []);

  const handleSaveEditManufacturer = useCallback(
    async (id: number) => {
      setEditError(null);
      if (!editingManufacturerName.trim()) {
        setEditError('Введіть назву виробника');
        return;
      }

      try {
        const res = await fetch(`/api/manufacturers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingManufacturerName.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 409) {
            setEditError('Виробник з такою назвою вже існує');
          } else {
            setEditError(data?.error || 'Помилка редагування виробника');
          }
          return;
        }
        setEditingManufacturerId(null);
        setEditingManufacturerName('');
        await fetchManufacturers();
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [editingManufacturerName, fetchManufacturers]
  );

  const handleDeleteManufacturer = useCallback(
    async (id: number) => {
      if (!window.confirm('Видалити цього виробника?')) return;

      try {
        const res = await fetch(`/api/manufacturers/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEditError(data?.error || 'Помилка видалення виробника');
          return;
        }

        await fetchManufacturers();
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [fetchManufacturers]
  );
  if (isVerifyingAuth) {
    return (
      <div className='min-h-screen bg-gray-50 p-4 flex justify-center items-center'>
        <p className='text-gray-600'>Перевірка авторизації...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gray-50 p-4 flex justify-center items-center'>
        <p className='text-gray-600'>Не авторизовано. Перенаправлення...</p>
      </div>
    );
  }

  const filteredManufacturers = getFilteredManufacturers();

  return (
    <div className='min-h-screen bg-gray-50 p-1 sm:p-4 overflow-y-auto' style={{ maxHeight: '100vh' }}>
      <main className='bg-white shadow-xl rounded-2xl p-2 sm:p-8 max-w-full sm:max-w-4xl mx-auto border border-gray-200'>
        <div className='mb-3'>
          <a href='/admin/dashboard' className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-base sm:text-lg transition-colors shadow-sm border border-gray-300'>
            <HiOutlineArrowLeft className='h-5 w-5 text-gray-500' />
            На головну
          </a>
        </div>{' '}
        <h2 className='text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3'>
          <span className='text-purple-700'>
            <HiOutlineOfficeBuilding className='inline-block mr-1' size={24} />
          </span>
          Керування виробниками
        </h2>
        <div className='mb-3 sm:mb-6'>
          <label htmlFor='search' className='block text-gray-900 font-semibold mb-1 sm:mb-2 text-base sm:text-lg'>
            Пошук виробників
          </label>
          <div className='relative'>
            <input id='search' type='text' className='w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white shadow-sm text-base sm:text-lg font-semibold' placeholder='Пошук виробників...' value={search} onChange={(e) => setSearch(e.target.value)} />
            <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
          </div>
        </div>
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row gap-2 mb-2'>
            <input
              type='text'
              value={newManufacturerName}
              onChange={(e) => {
                setNewManufacturerName(e.target.value);
                setCreateError(null);
              }}
              placeholder='Новий виробник'
              className={`border rounded-lg px-3 py-2 flex-1 text-base sm:text-lg font-semibold text-gray-900 bg-white ${createError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-pink-400 focus:border-pink-400`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddManufacturer();
                if (e.key === 'Escape') {
                  setNewManufacturerName('');
                  setCreateError(null);
                }
              }}
            />
            <button onClick={handleAddManufacturer} className='bg-pink-600 hover:bg-pink-700 text-white rounded-lg sm:w-10 h-10 flex items-center justify-center hover:cursor-pointer transition-colors shadow p-2 cursor-pointer' title='Додати виробника'>
              <HiOutlinePlus className='text-white' size={22} />
            </button>
          </div>
          {createError && <div className='text-red-600 text-xs sm:text-sm font-medium mt-1 px-1'>{createError}</div>}
        </div>
        <div className='sm:hidden'>
          {isLoading ? (
            <ManufacturerSkeleton />
          ) : filteredManufacturers.length === 0 ? (
            <div className='text-center text-gray-700 font-semibold py-6'>Нічого не знайдено</div>
          ) : (
            <div className='flex flex-col gap-3'>
              {filteredManufacturers.map((manufacturer) => (
                <div key={manufacturer.id} className='rounded-xl border border-gray-200 bg-white shadow-sm p-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='font-bold text-gray-900 text-base flex-1'>
                      {editingManufacturerId === manufacturer.id ? (
                        <input
                          type='text'
                          value={editingManufacturerName}
                          onChange={(e) => setEditingManufacturerName(e.target.value)}
                          className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${editError && editingManufacturerId === manufacturer.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-pink-400 focus:border-pink-400`}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditManufacturer(manufacturer.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={() => handleSaveEditManufacturer(manufacturer.id)}
                        />
                      ) : (
                        <span
                          className='block w-full font-semibold text-gray-900 text-[17px] cursor-pointer hover:text-pink-600 transition-colors'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditManufacturer(manufacturer);
                          }}
                        >
                          {manufacturer.name}
                        </span>
                      )}
                      <span className='ml-2 text-xs text-gray-600 font-normal'>ID: {manufacturer.id}</span>
                    </div>
                    <div className='flex gap-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteManufacturer(manufacturer.id);
                        }}
                        className='text-red-600 hover:text-red-800 hover:cursor-pointer'
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>
                  </div>
                  {editError && editingManufacturerId === manufacturer.id && <div className='text-red-600 text-xs mt-1'>{editError}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='bg-white rounded-lg shadow border border-gray-200 -mx-2 px-2 sm:mx-0 sm:px-0 hidden sm:block'>
          {isLoading ? (
            <ManufacturerSkeleton />
          ) : (
            <table className='min-w-full divide-y divide-gray-200 text-base sm:text-lg block sm:table'>
              <thead className='bg-gray-100 hidden sm:table-header-group'>
                <tr>
                  <th
                    className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-16'
                    onClick={() => {
                      if (sortBy === 'id') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('id');
                        setSortDir('asc');
                      }
                    }}
                  >
                    ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none'
                    onClick={() => {
                      if (sortBy === 'name') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('name');
                        setSortDir('asc');
                      }
                    }}
                  >
                    Назва {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32'>Дії</th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-gray-100 block sm:table-row-group max-h-[400px] overflow-y-auto`}>
                {filteredManufacturers.length === 0 ? (
                  <tr className='block sm:table-row'>
                    <td colSpan={3} className='px-6 py-4 text-center text-gray-700 font-semibold block sm:table-cell'>
                      {debouncedSearch ? 'Виробників за запитом не знайдено' : 'Виробників не знайдено'}
                    </td>
                  </tr>
                ) : (
                  filteredManufacturers.map((manufacturer) => (
                    <tr key={manufacturer.id} className='hover:bg-gray-50 block sm:table-row border-b border-gray-100 sm:border-b-0'>
                      <td className='px-4 py-3 whitespace-nowrap font-semibold text-gray-900 block sm:table-cell text-left'>
                        <span className='sm:hidden font-medium text-gray-500 text-sm'>ID: </span>
                        {manufacturer.id}
                      </td>
                      <td className='px-6 py-3 whitespace-nowrap block sm:table-cell text-left'>
                        <span className='sm:hidden font-medium text-gray-500 text-sm'>Назва: </span>
                        {editingManufacturerId === manufacturer.id ? (
                          <input
                            type='text'
                            value={editingManufacturerName}
                            onChange={(e) => setEditingManufacturerName(e.target.value)}
                            className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${editError && editingManufacturerId === manufacturer.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-pink-400 focus:border-pink-400`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditManufacturer(manufacturer.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            onBlur={() => handleSaveEditManufacturer(manufacturer.id)}
                          />
                        ) : (
                          <span className='font-semibold text-gray-900 cursor-pointer hover:text-pink-600 transition-colors' onClick={() => handleEditManufacturer(manufacturer)}>
                            {manufacturer.name}
                          </span>
                        )}
                        {editError && editingManufacturerId === manufacturer.id && <div className='text-red-600 text-xs mt-1'>{editError}</div>}
                      </td>
                      <td className='px-6 py-3 whitespace-nowrap text-right block sm:table-cell'>
                        {editingManufacturerId === manufacturer.id ? (
                          <div className='flex justify-end gap-2'>
                            <button onClick={() => handleSaveEditManufacturer(manufacturer.id)} className='bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-3 py-2 hover:cursor-pointer transition-colors shadow text-sm'>
                              Зберегти
                            </button>
                            <button onClick={handleCancelEdit} className='bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-3 py-2 hover:cursor-pointer transition-colors shadow text-sm'>
                              Скасувати
                            </button>
                          </div>
                        ) : (
                          <div className='flex justify-end gap-2'>
                            <button onClick={() => handleDeleteManufacturer(manufacturer.id)} className='text-red-600 hover:text-red-800 hover:cursor-pointer'>
                              <HiOutlineTrash size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
