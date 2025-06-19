'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { HiOutlineTag, HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import React from 'react';

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parent?: { name: string };
  children?: Category[];
}

const CategorySkeleton = () => (
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
              <div className='h-5 w-5 bg-gray-300 rounded'></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ManageCategoriesPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();

  useEffect(() => {
    document.title = 'Управління категоріями - Адміністратор - Sirius Auto';
  }, []);

  const normalizeString = useCallback((str: string) => {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [parentSearch, setParentSearch] = useState('');
  const [parentSearchFocused, setParentSearchFocused] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingParentSearch, setEditingParentSearch] = useState('');
  const [editingParentSearchFocused, setEditingParentSearchFocused] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCreateError, setSubCreateError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'id' | 'name'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  const categoryRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const parentInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const nameInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [editingNameFocused, setEditingNameFocused] = useState(false);
  const [editingParentFocused, setEditingParentFocused] = useState(false);
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити категорії');
      }
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Помилка завантаження категорій:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (isAdmin && !isVerifyingAuth) {
      fetchCategories();
    }
  }, [isAdmin, isVerifyingAuth, fetchCategories]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 100);
    return () => clearTimeout(handler);
  }, [search]);
  useEffect(() => {
    if (expandedCategoryId !== null && categoryRefs.current[expandedCategoryId]) {
      const element = categoryRefs.current[expandedCategoryId];

      if (element) {
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);

        if (!isInViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }
    }
  }, [expandedCategoryId]);

  useEffect(() => {
    if (editingCategoryId !== null && editingParentSearchFocused && parentInputRefs.current[editingCategoryId]) {
      parentInputRefs.current[editingCategoryId]?.focus();
    }
  }, [editingCategoryId, editingParentSearchFocused]);

  useEffect(() => {
    if (editingCategoryId !== null && editingNameFocused && nameInputRefs.current[editingCategoryId]) {
      nameInputRefs.current[editingCategoryId]?.focus();
    }
  }, [editingCategoryId, editingNameFocused]);
  useEffect(() => {
    if (editingCategoryId !== null && editingParentFocused && parentInputRefs.current[editingCategoryId]) {
      parentInputRefs.current[editingCategoryId]?.focus();
    }
  }, [editingCategoryId, editingParentFocused]);

  const handleCancelEdit = useCallback(() => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingNameFocused(false);
    setEditingParentFocused(false);
    setEditError(null);
  }, []);

  useEffect(() => {
    if (editingCategoryId === null) return;
    function handleDocumentClick() {
      const nameInput = nameInputRefs.current[editingCategoryId!];
      const parentInput = parentInputRefs.current[editingCategoryId!];
      if (nameInput && parentInput && document.activeElement !== nameInput && document.activeElement !== parentInput) {
        handleCancelEdit();
      }
    }
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [editingCategoryId, handleCancelEdit]);

  const getFilteredParentOptions = useCallback(
    (searchTerm: string) => {
      const normalizedSearch = normalizeString(searchTerm.trim());
      return categories.filter((c) => normalizeString(c.name).includes(normalizedSearch) && c.id !== editingCategoryId).sort((a, b) => a.name.localeCompare(b.name));
    },
    [categories, editingCategoryId, normalizeString]
  );
  const handleAddCategory = useCallback(async () => {
    setCreateError(null);
    if (!newCategoryName.trim()) {
      setCreateError('Введіть назву категорії');
      return;
    }

    try {
      const parentIdForSub = selectedParentId;
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          parentId: selectedParentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data?.error || 'Помилка створення категорії');
        return;
      }

      setNewCategoryName('');
      if (selectedParentId === null) setSelectedParentId(null);
      await fetchCategories();
      setSortBy('name');
      setSortDir('asc');

      if (parentIdForSub) {
        setExpandedCategoryId(parentIdForSub);
      } else {
        const response = await fetch('/api/categories');
        const updatedCategories = await response.json();
        const addedCategory = updatedCategories.find((c: Category) => normalizeString(c.name) === normalizeString(newCategoryName.trim()) && c.parentId === null);
        if (addedCategory) {
          setExpandedCategoryId(addedCategory.id);
        }
      }
    } catch {
      setCreateError('Помилка мережі');
    }
  }, [newCategoryName, selectedParentId, fetchCategories, normalizeString]);

  const handleAddSubCategory = useCallback(
    async (parentId: number) => {
      setSubCreateError(null);
      if (!subCategoryName.trim()) {
        setSubCreateError('Введіть назву категорії');
        return;
      }
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: subCategoryName.trim(), parentId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSubCreateError(data?.error || 'Помилка створення категорії');
          return;
        }
        setSubCategoryName('');
        await fetchCategories();
        setSortBy('name');
        setSortDir('asc');
        setExpandedCategoryId(parentId);
      } catch {
        setSubCreateError('Помилка мережі');
      }
    },
    [subCategoryName, fetchCategories]
  );

  const handleEditCategory = useCallback(
    (category: Category) => {
      setNewCategoryName('');
      setSelectedParentId(null);
      setParentSearch('');
      setEditingCategoryId(category.id);
      setEditingCategoryName(category.name);
      if (category.parentId) {
        const parentCategory = categories.find((c) => c.id === category.parentId);
        setEditingParentSearch(parentCategory?.name || '');
      } else {
        setEditingParentSearch('');
      }
      setEditingParentSearchFocused(true);
      setEditError(null);
    },
    [categories]
  );

  const handleSaveEditCategory = useCallback(
    async (id: number) => {
      setEditError(null);
      if (!editingCategoryName.trim()) {
        setEditError('Введіть назву категорії');
        return;
      }

      let parentIdToSave: number | null = null;
      const trimmedParent = editingParentSearch.trim();
      if (!trimmedParent || trimmedParent === 'Немає') {
        parentIdToSave = null;
      } else {
        const found = categories.find((c) => c.name === trimmedParent);
        if (found) {
          parentIdToSave = found.id;
        } else {
          parentIdToSave = null;
        }
      }

      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingCategoryName.trim(),
            parentId: parentIdToSave,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEditError(data?.error || 'Помилка редагування категорії');
          return;
        }

        setEditingCategoryId(null);
        setEditingCategoryName('');
        setEditingParentSearchFocused(false);
        await fetchCategories();
        setExpandedCategoryId(id);
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [editingCategoryName, editingParentSearch, categories, fetchCategories]
  );

  const handleSaveEditCategoryWithParent = useCallback(
    async (id: number, parentIdOverride: number | null) => {
      setEditError(null);
      if (!editingCategoryName.trim()) {
        setEditError('Введіть назву категорії');
        return;
      }
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingCategoryName.trim(), parentId: parentIdOverride }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEditError(data?.error || 'Помилка редагування категорії');
          return;
        }
        setEditingCategoryId(null);
        setEditingCategoryName('');
        setEditingParentSearchFocused(false);
        await fetchCategories();
        setExpandedCategoryId(id);
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [editingCategoryName, fetchCategories]
  );

  const handleDeleteCategory = useCallback(
    async (id: number) => {
      if (!window.confirm('Видалити цю категорію та всі її підкатегорії?')) return;

      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEditError(data?.error || 'Помилка видалення категорії');
          return;
        }

        await fetchCategories();

        if (expandedCategoryId === id) {
          setExpandedCategoryId(null);
        }
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [expandedCategoryId, fetchCategories]
  );

  const getChildCategories = useCallback(
    (parentId: number) => {
      return categories.filter((c) => c.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
    },
    [categories]
  );
  const getFilteredCategories = useCallback(() => {
    const searchTerm = normalizeString(debouncedSearch.trim());

    let filtered = categories;

    if (searchTerm) {
      filtered = categories.filter((category) => normalizeString(category.name).includes(searchTerm));
    }

    return [...filtered].sort((a, b) => {
      if ((a.parentId === null || a.parentId === undefined) && b.parentId !== null && b.parentId !== undefined) return -1;
      if ((b.parentId === null || b.parentId === undefined) && a.parentId !== null && a.parentId !== undefined) return 1;
      if (sortBy === 'id') {
        return sortDir === 'asc' ? a.id - b.id : b.id - a.id;
      } else {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });
  }, [categories, debouncedSearch, sortBy, sortDir, normalizeString]);

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

  const filteredCategories = getFilteredCategories();

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
          <span className='text-green-700'>
            <HiOutlineTag className='inline-block mr-1' size={24} />
          </span>
          Керування категоріями
        </h2>
        <div className='mb-3 sm:mb-6'>
          <label htmlFor='search' className='block text-gray-900 font-semibold mb-1 sm:mb-2 text-base sm:text-lg'>
            Пошук категорій
          </label>
          <div className='relative'>
            <input id='search' type='text' className='w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm text-base sm:text-lg font-semibold' placeholder='Пошук категорій...' value={search} onChange={(e) => setSearch(e.target.value)} />
            <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
          </div>
        </div>
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row gap-2 mb-2'>
            <input
              type='text'
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setCreateError(null);
              }}
              placeholder='Нова категорія'
              className={`border rounded-lg px-3 py-2 flex-1 text-base sm:text-lg font-semibold text-gray-900 bg-white ${createError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory();
                if (e.key === 'Escape') {
                  setNewCategoryName('');
                  setCreateError(null);
                }
              }}
            />{' '}
            <div className='relative sm:w-1/3'>
              <input
                type='text'
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                onFocus={() => setParentSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setParentSearchFocused(false), 200);
                }}
                placeholder='Батьківська категорія'
                className='border border-gray-300 rounded-lg px-3 py-2 text-base sm:text-lg font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full'
              />
              {parentSearchFocused && (
                <div className='absolute z-10 mt-1 w-max bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto overflow-x-hidden'>
                  <div
                    className='p-2 text-base font-semibold text-gray-500 hover:bg-blue-100 cursor-pointer'
                    onClick={() => {
                      setSelectedParentId(null);
                      setParentSearch('');
                    }}
                  >
                    Без батьківської
                  </div>
                  {getFilteredParentOptions(parentSearch).map((cat) => (
                    <div
                      key={cat.id}
                      className='p-2 text-base font-semibold text-gray-900 hover:bg-blue-100 cursor-pointer'
                      onClick={() => {
                        setSelectedParentId(cat.id);
                        setParentSearch(cat.name);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleAddCategory} className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:w-10 h-10 flex items-center justify-center hover:cursor-pointer transition-colors shadow p-2 cursor-pointer' title='Додати категорію'>
              <HiOutlinePlus className='text-white' size={22} />
            </button>
          </div>
          {createError && <div className='text-red-600 text-xs sm:text-sm font-medium mt-1 px-1'>{createError}</div>}
        </div>{' '}
        <div className='sm:hidden'>
          {isLoading ? (
            <CategorySkeleton />
          ) : filteredCategories.length === 0 ? (
            <div className='text-center text-gray-700 font-semibold py-6'>Нічого не знайдено</div>
          ) : (
            <div className='flex flex-col gap-3'>
              {filteredCategories.map((category) => (
                <div key={category.id} className={`rounded-xl border border-gray-200 bg-white shadow-sm p-3 ${expandedCategoryId === category.id ? 'bg-gray-100' : ''}`} onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='font-bold text-gray-900 text-base flex-1'>
                      {editingCategoryId === category.id && editingNameFocused ? (
                        <input
                          type='text'
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${editError && editingCategoryId === category.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditCategory(category.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={() => setEditingNameFocused(false)}
                        />
                      ) : (
                        <span
                          className='block w-full font-semibold text-gray-900 text-[17px] cursor-pointer hover:text-blue-600 transition-colors'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                            setEditingNameFocused(true);
                            setEditingParentFocused(false);
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                      {category.parent && (
                        <span
                          className='text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ml-2'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                            setEditingParentFocused(true);
                            setEditingNameFocused(false);
                          }}
                        >
                          (батьківська: {category.parent.name})
                        </span>
                      )}
                      <span className='ml-2 text-xs text-gray-600 font-normal'>ID: {category.id}</span>
                    </div>
                    <div className='flex gap-1'>
                      {!category.parent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                            setEditingParentFocused(true);
                            setEditingNameFocused(false);
                          }}
                          className='text-blue-600 hover:text-blue-800 hover:cursor-pointer'
                          title='Додати батьківську категорію'
                        >
                          <HiOutlinePlus size={20} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className='text-red-600 hover:text-red-800 hover:cursor-pointer'
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>
                  </div>
                  {editingCategoryId === category.id && editingParentFocused && (
                    <div className='relative mt-2'>
                      <input
                        ref={(el) => {
                          parentInputRefs.current[category.id] = el;
                        }}
                        type='text'
                        value={editingParentSearch}
                        onChange={(e) => setEditingParentSearch(e.target.value)}
                        onFocus={(e) => {
                          setEditingParentFocused(true);
                          e.target.select();
                        }}
                        onBlur={() => setTimeout(() => setEditingParentFocused(false), 200)}
                        placeholder='Батьківська категорія'
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditCategory(category.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      {editingParentFocused && (
                        <div className='absolute z-10 mt-1 w-max bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto overflow-x-hidden'>
                          <div
                            className='p-2 text-base font-semibold text-gray-500 hover:bg-blue-100 cursor-pointer'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEditCategoryWithParent(category.id, null);
                            }}
                          >
                            Без батьківської
                          </div>
                          {getFilteredParentOptions(editingParentSearch).map((cat) => (
                            <div
                              key={cat.id}
                              className='p-2 text-base font-semibold text-gray-900 hover:bg-blue-100 cursor-pointer'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEditCategoryWithParent(category.id, cat.id);
                              }}
                            >
                              {cat.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {expandedCategoryId === category.id && (
                    <div className='mt-3 flex flex-col gap-3 p-2 bg-gray-50 rounded-lg sm:hidden'>
                      <input
                        type='text'
                        value={subCategoryName}
                        onChange={(e) => {
                          setSubCategoryName(e.target.value);
                          setSubCreateError(null);
                        }}
                        placeholder={`Додати підкатегорію для "${category.name}"`}
                        className='border border-gray-300 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSubCategory(category.id);
                        }}
                        className='self-start bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 hover:cursor-pointer transition-colors'
                      >
                        Додати підкатегорію
                      </button>
                      {subCreateError && <div className='text-red-600 text-sm'>{subCreateError}</div>}
                      <div className='mt-2'>
                        {getChildCategories(category.id).length === 0 ? (
                          <div className='text-gray-700 text-sm'>Підкатегорій не знайдено.</div>
                        ) : (
                          getChildCategories(category.id).map((child) => (
                            <div key={child.id} className='flex justify-between items-center py-1'>
                              <span className='text-gray-900 font-medium'>{child.name}</span>
                              <button onClick={() => handleDeleteCategory(child.id)} className='text-red-600 hover:text-red-800 hover:cursor-pointer' title='Видалити підкатегорію'>
                                <HiOutlineTrash size={18} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>{' '}
        <div className='bg-white rounded-lg shadow border border-gray-200 -mx-2 px-2 sm:mx-0 sm:px-0 hidden sm:block'>
          {isLoading ? (
            <CategorySkeleton />
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
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Батьківська категорія</th>
                  <th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32'>Дії</th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-gray-100 block sm:table-row-group ${expandedCategoryId === null ? 'max-h-[340px] overflow-y-auto' : ''}`}>
                {filteredCategories.length === 0 ? (
                  <tr className='block sm:table-row'>
                    <td colSpan={4} className='px-6 py-4 text-center text-gray-700 font-semibold block sm:table-cell'>
                      {debouncedSearch ? 'Категорій за запитом не знайдено' : 'Категорій не знайдено'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <React.Fragment key={category.id}>
                      <tr
                        ref={(el) => {
                          categoryRefs.current[category.id] = el;
                        }}
                        className={`group ${expandedCategoryId === category.id ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer transition-colors duration-100 block sm:table-row mb-2 sm:mb-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none`}
                        onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                      >
                        <td className='px-4 py-3 whitespace-nowrap font-semibold text-gray-900 block sm:table-cell'>
                          <span className='sm:hidden text-xs text-gray-700 font-semibold'>ID:</span> {category.id}
                        </td>
                        <td className='px-6 py-3 whitespace-nowrap block sm:table-cell'>
                          <span className='sm:hidden text-xs text-gray-700 font-semibold'>Категорія:</span>
                          {editingCategoryId === category.id && editingNameFocused ? (
                            <>
                              <input
                                ref={(el) => {
                                  nameInputRefs.current[category.id] = el;
                                }}
                                type='text'
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${editError && editingCategoryId === category.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
                                autoFocus
                                onFocus={() => setEditingNameFocused(true)}
                                onBlur={() => setEditingNameFocused(false)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditCategory(category.id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              {editError && editingCategoryId === category.id && <div className='text-red-600 text-xs mt-1 px-1'>{editError}</div>}
                            </>
                          ) : (
                            <span
                              className='inline-block font-semibold text-gray-900 text-[17px] pl-3 sm:text-lg sm:pl-0 cursor-pointer hover:text-blue-600 transition-colors'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                                setEditingNameFocused(true);
                                setEditingParentFocused(false);
                              }}
                            >
                              {category.name}
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-3 whitespace-nowrap block sm:table-cell'>
                          <span className='sm:hidden text-xs text-gray-700 font-semibold'>Батьківська категорія:</span>
                          {editingCategoryId === category.id && editingParentFocused ? (
                            <div className='relative'>
                              <input
                                ref={(el) => {
                                  parentInputRefs.current[category.id] = el;
                                }}
                                type='text'
                                value={editingParentSearch}
                                onChange={(e) => setEditingParentSearch(e.target.value)}
                                onFocus={(e) => {
                                  setEditingParentFocused(true);
                                  e.target.select();
                                }}
                                onBlur={() => setTimeout(() => setEditingParentFocused(false), 200)}
                                placeholder='Батьківська категорія'
                                className='border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditCategory(category.id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                              />{' '}
                              {editingParentFocused && (
                                <div className='absolute z-10 mt-1 w-max bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto overflow-x-hidden'>
                                  <div
                                    className='p-2 text-base font-bold text-gray-500 hover:bg-blue-100 cursor-pointer'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveEditCategoryWithParent(category.id, null);
                                    }}
                                  >
                                    Без батьківської
                                  </div>
                                  {getFilteredParentOptions(editingParentSearch).map((cat) => (
                                    <div
                                      key={cat.id}
                                      className='p-2 text-base font-bold text-gray-900 hover:bg-blue-100 cursor-pointer'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveEditCategoryWithParent(category.id, cat.id);
                                      }}
                                    >
                                      {cat.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              className='text-gray-800 font-semibold cursor-pointer hover:text-blue-600 transition-colors'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                                setEditingParentFocused(true);
                                setEditingNameFocused(false);
                              }}
                            >
                              {category.parent?.name || ''}
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-3 whitespace-nowrap text-right block sm:table-cell'>
                          <span className='sm:hidden text-xs text-gray-700 font-semibold'>Дії:</span>
                          <div className='flex justify-end gap-2'>
                            {!category.parent && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategory(category);
                                  setEditingParentFocused(true);
                                  setEditingNameFocused(false);
                                }}
                                className='text-blue-600 hover:text-blue-800 hover:cursor-pointer'
                                title='Додати батьківську категорію'
                              >
                                <HiOutlinePlus size={20} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              className='text-red-600 hover:text-red-800 hover:cursor-pointer'
                              title='Видалити категорію'
                            >
                              <HiOutlineTrash size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedCategoryId === category.id && (
                        <tr>
                          <td colSpan={4} className='p-0'>
                            <div className='bg-blue-50 p-4 border-l-4 border-blue-400 rounded-b-xl'>
                              <div className='mb-4'>
                                <div className='flex gap-2'>
                                  <input
                                    type='text'
                                    value={subCategoryName}
                                    onChange={(e) => {
                                      setSubCategoryName(e.target.value);
                                      setSubCreateError(null);
                                    }}
                                    placeholder={`Створити підкатегорію для "${category.name}"`}
                                    className='border rounded-lg px-3 py-2 flex-1 text-base font-semibold text-gray-900 bg-white border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddSubCategory(category.id);
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddSubCategory(category.id);
                                    }}
                                    className='bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white rounded-lg w-10 h-10 flex items-center justify-center transition-colors shadow'
                                    title='Додати підкатегорію'
                                  >
                                    <HiOutlinePlus size={22} />
                                  </button>
                                </div>
                                {subCreateError && <div className='text-red-600 text-xs mt-1 px-1'>{subCreateError}</div>}
                              </div>
                              <h4 className='text-lg font-bold text-blue-700 mb-3'>Підкатегорії {category.name}:</h4>
                              {getChildCategories(category.id).length === 0 ? (
                                <p className='text-gray-700 text-base font-semibold'>Підкатегорій не знайдено.</p>
                              ) : (
                                <table className='min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow block sm:table'>
                                  <thead className='bg-gray-50 hidden sm:table-header-group'>
                                    <tr>
                                      <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>ID</th>
                                      <th className='px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Назва</th>
                                      <th className='px-6 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32'>Дії</th>
                                    </tr>
                                  </thead>
                                  <tbody className='divide-y divide-gray-100 block sm:table-row-group'>
                                    {getChildCategories(category.id).map((child) => (
                                      <tr key={child.id} className='hover:bg-gray-50 block sm:table-row mb-2 sm:mb-0'>
                                        <td className='px-4 py-2 whitespace-nowrap font-semibold text-gray-900 block sm:table-cell'>
                                          <span className='sm:hidden text-xs text-gray-700 font-semibold'>ID:</span> {child.id}
                                        </td>
                                        <td className='px-6 py-2 whitespace-nowrap block sm:table-cell'>
                                          <span
                                            className='font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditCategory(child);
                                              setExpandedCategoryId(category.id);
                                            }}
                                          >
                                            {child.name}
                                          </span>
                                        </td>
                                        <td className='px-6 py-2 whitespace-nowrap text-right block sm:table-cell'>
                                          <div className='flex justify-end gap-2'>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(child.id);
                                              }}
                                              className='text-red-600 hover:text-red-800 hover:cursor-pointer'
                                              title='Видалити підкатегорію'
                                            >
                                              <HiOutlineTrash size={18} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
