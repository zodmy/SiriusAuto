'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { HiOutlineCog, HiOutlineSearch, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlinePencil, HiOutlinePlus } from 'react-icons/hi';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';

interface CarMake {
  id: number;
  name: string;
}
interface CarModel {
  id: number;
  name: string;
  makeId: number;
  alt?: string; // додано alt
}
interface CarYear {
  id: number;
  year: number;
  modelId: number;
}
interface CarEngine {
  id: number;
  name: string;
  yearId: number;
}
interface CarBodyType {
  id: number;
  name: string;
  engineId: number;
}
interface CarModification {
  id: number;
  name: string;
  bodyTypeId: number;
}

export default function ManageCarVariationsPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [carYears, setCarYears] = useState<CarYear[]>([]);
  const [carEngines, setCarEngines] = useState<CarEngine[]>([]);
  const [carBodyTypes, setCarBodyTypes] = useState<CarBodyType[]>([]);
  const [carModifications, setCarModifications] = useState<CarModification[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newMake, setNewMake] = useState('');
  const [editingMakeId, setEditingMakeId] = useState<number | null>(null);
  const [editingMakeName, setEditingMakeName] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedMakeId, setExpandedMakeId] = useState<number | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [newYearValue, setNewYearValue] = useState(''); // окремий стейт для року
  const [expandedModelId, setExpandedModelId] = useState<number | null>(null);
  const [modelParentMakeId, setModelParentMakeId] = useState<number | null>(null);
  const [makeError, setMakeError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null); // окремий стейт для помилки року
  const [modelSortBy, setModelSortBy] = useState<'id' | 'name'>('id');
  const [modelSortDir, setModelSortDir] = useState<'asc' | 'desc'>('asc');
  const [yearSortBy, setYearSortBy] = useState<'id' | 'year'>('id');
  const [yearSortDir, setYearSortDir] = useState<'asc' | 'desc'>('asc');
  const [newEngineName, setNewEngineName] = useState('');
  const [engineParentYearId, setEngineParentYearId] = useState<number | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [engineSortBy, setEngineSortBy] = useState<'id' | 'name'>('id');
  const [engineSortDir, setEngineSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedYearId, setExpandedYearId] = useState<number | null>(null);

  useEffect(() => {
    if (isAdmin && !isVerifyingAuth) {
      fetch('/api/car-makes')
        .then((r) => r.json())
        .then(setCarMakes);
      fetch('/api/car-models')
        .then((r) => r.json())
        .then(setCarModels);
      fetch('/api/car-years')
        .then((r) => r.json())
        .then(setCarYears);
      fetch('/api/car-engines')
        .then((r) => r.json())
        .then(setCarEngines);
      fetch('/api/car-body-types')
        .then((r) => r.json())
        .then(setCarBodyTypes);
      fetch('/api/car-modifications')
        .then((r) => r.json())
        .then(setCarModifications);
    }
  }, [isAdmin, isVerifyingAuth]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    const globalSearch = normalizeString(debouncedSearch.trim());
    const foundModel = carModels.find((model) => normalizeString(model.name).includes(globalSearch));
    if (foundModel) {
      setExpandedMakeId(foundModel.makeId);
    }
  }, [debouncedSearch, carModels]);

  if (isVerifyingAuth || isAdmin === null) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
        <p className='text-gray-700 text-lg font-semibold'>Перевірка авторизації...</p>
      </div>
    );
  }
  if (!isAdmin) {
    return null;
  }

  const handleAddMake = async () => {
    setMakeError(null);
    if (!newMake.trim()) {
      setMakeError('Введіть назву марки');
      return;
    }
    const normalizedNew = normalizeString(newMake.trim());
    if (carMakes.some((m) => normalizeString(m.name) === normalizedNew)) {
      setMakeError('Така марка вже існує');
      return;
    }
    try {
      const res = await fetch('/api/car-makes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMake }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMakeError(data?.error || 'Помилка створення марки');
        return;
      }
      setNewMake('');
      fetch('/api/car-makes')
        .then((r) => r.json())
        .then(setCarMakes);
    } catch {
      setMakeError('Помилка мережі');
    }
  };

  const handleEditMake = (make: CarMake) => {
    setEditingMakeId(make.id);
    setEditingMakeName(make.name);
  };
  const handleSaveEditMake = async (id: number) => {
    setMakeError(null);
    if (!editingMakeName.trim()) {
      setMakeError('Введіть назву марки');
      return;
    }
    const normalizedEdit = normalizeString(editingMakeName.trim());
    if (carMakes.some((m) => normalizeString(m.name) === normalizedEdit && m.id !== id)) {
      setMakeError('Така марка вже існує');
      return;
    }
    try {
      const res = await fetch(`/api/car-makes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingMakeName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMakeError(data?.error || 'Помилка редагування марки');
        return;
      }
      setEditingMakeId(null);
      setEditingMakeName('');
      fetch('/api/car-makes')
        .then((r) => r.json())
        .then(setCarMakes);
    } catch {
      setMakeError('Помилка мережі');
    }
  };
  const handleCancelEditMake = () => {
    setEditingMakeId(null);
    setEditingMakeName('');
  };

  const handleDeleteMake = async (id: number) => {
    if (!window.confirm('Видалити цю марку?')) return;
    await fetch(`/api/car-makes/${id}`, { method: 'DELETE' });
    fetch('/api/car-makes')
      .then((r) => r.json())
      .then(setCarMakes);
  };

  const handleAddModel = async (makeId: number) => {
    setModelError(null);
    if (!newModelName.trim()) {
      setModelError('Введіть назву моделі');
      return;
    }
    const normalizedNew = normalizeString(newModelName.trim());
    if (carModels.some((m) => normalizeString(m.name) === normalizedNew && m.makeId === makeId)) {
      setModelError('Така модель вже існує для цієї марки');
      return;
    }
    try {
      const res = await fetch('/api/car-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newModelName, makeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModelError(data?.error || 'Помилка створення моделі');
        return;
      }
      setNewModelName('');
      setModelParentMakeId(null);
      fetch('/api/car-models')
        .then((r) => r.json())
        .then(setCarModels);
    } catch {
      setModelError('Помилка мережі');
    }
  };

  const handleEditModel = (model: CarModel) => {
    setNewModelName(model.name);
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Видалити цю модель?')) return;
    await fetch(`/api/car-models/${id}`, { method: 'DELETE' });
    fetch('/api/car-models')
      .then((r) => r.json())
      .then(setCarModels);
  };

  const handleAddYear = async (modelId: number) => {
    setYearError(null);
    if (!newYearValue.trim() || isNaN(Number(newYearValue))) {
      setYearError('Введіть коректний рік');
      return;
    }
    const yearValue = Number(newYearValue);
    if (carYears.some((y) => y.modelId === modelId && y.year === yearValue)) {
      setYearError('Такий рік вже існує для цієї моделі');
      return;
    }
    try {
      const res = await fetch('/api/car-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: yearValue, modelId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setYearError(data?.error || 'Помилка створення року');
        return;
      }
      setNewYearValue('');
      setModelParentMakeId(null);
      fetch('/api/car-years')
        .then((r) => r.json())
        .then(setCarYears);
    } catch {
      setYearError('Помилка мережі');
    }
  };
  const handleDeleteYear = async (id: number) => {
    if (!window.confirm('Видалити цей рік?')) return;
    await fetch(`/api/car-years/${id}`, { method: 'DELETE' });
    fetch('/api/car-years')
      .then((r) => r.json())
      .then(setCarYears);
  };

  const handleAddEngine = async (yearId: number) => {
    setEngineError(null);
    if (!newEngineName.trim()) {
      setEngineError('Введіть назву двигуна');
      return;
    }
    const normalizedNew = normalizeString(newEngineName.trim());
    if (carEngines.some((e) => normalizeString(e.name) === normalizedNew && e.yearId === yearId)) {
      setEngineError('Такий двигун вже існує для цього року');
      return;
    }
    try {
      const res = await fetch('/api/car-engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEngineName, yearId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEngineError(data?.error || 'Помилка створення двигуна');
        return;
      }
      setNewEngineName('');
      setEngineParentYearId(null);
      fetch('/api/car-engines')
        .then((r) => r.json())
        .then(setCarEngines);
    } catch {
      setEngineError('Помилка мережі');
    }
  };
  const handleDeleteEngine = async (id: number) => {
    if (!window.confirm('Видалити цей двигун?')) return;
    await fetch(`/api/car-engines/${id}`, { method: 'DELETE' });
    fetch('/api/car-engines')
      .then((r) => r.json())
      .then(setCarEngines);
  };
  const getSortedEngines = (yearId: number) => {
    const filtered = carEngines.filter((e) => e.yearId === yearId);
    return [...filtered].sort((a, b) => {
      if (engineSortBy === 'id') {
        return engineSortDir === 'asc' ? a.id - b.id : b.id - a.id;
      } else {
        return engineSortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });
  };

  function normalizeString(str: string) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }

  const globalSearch = normalizeString(debouncedSearch.trim());
  const filteredMakes = carMakes.filter(
    (make) =>
      normalizeString(make.name).includes(globalSearch) ||
      carModels.some((model) => model.makeId === make.id && normalizeString(model.name).includes(globalSearch)) ||
      carYears.some((year) => {
        const model = carModels.find((m) => m.id === year.modelId && m.makeId === make.id);
        return model && year.year.toString().includes(globalSearch);
      }) ||
      carEngines.some((engine) => normalizeString(engine.name).includes(globalSearch)) ||
      carBodyTypes.some((bodyType) => normalizeString(bodyType.name).includes(globalSearch)) ||
      carModifications.some((mod) => normalizeString(mod.name).includes(globalSearch))
  );

  const sortedMakes = [...filteredMakes].sort((a, b) => {
    if (sortBy === 'id') {
      return sortDir === 'asc' ? a.id - b.id : b.id - a.id;
    } else {
      return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
  });

  const getSortedModels = (makeId: number) => {
    const filteredModels = debouncedSearch.trim() ? carModels.filter((model) => model.makeId === makeId && normalizeString(model.name).includes(normalizeString(debouncedSearch.trim()))) : carModels.filter((model) => model.makeId === makeId);
    return [...filteredModels].sort((a, b) => {
      if (modelSortBy === 'id') {
        return modelSortDir === 'asc' ? a.id - b.id : b.id - a.id;
      } else {
        return modelSortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });
  };

  const getSortedYears = (modelId: number) => {
    const filteredYears = carYears.filter((year) => year.modelId === modelId);
    return [...filteredYears].sort((a, b) => {
      if (yearSortBy === 'id') {
        return yearSortDir === 'asc' ? a.id - b.id : b.id - a.id;
      } else {
        return yearSortDir === 'asc' ? a.year - b.year : b.year - a.year;
      }
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-2 sm:p-4'>
      <main className='bg-white shadow-xl rounded-2xl p-4 sm:p-8 max-w-full sm:max-w-3xl mx-auto border border-gray-200'>
        <div className='mb-4'>
          <a href='/admin/dashboard' className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-base sm:text-lg transition-colors shadow-sm border border-gray-300'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-gray-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            На головну
          </a>
        </div>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3'>
          <span className='text-blue-700'>
            <HiOutlineCog className='inline-block mr-1' size={28} />
          </span>
          Керування автомобілями
        </h2>
        <div className='mb-4 sm:mb-6'>
          <label htmlFor='search' className='block text-gray-900 font-semibold mb-1 sm:mb-2 text-base sm:text-lg'>
            Пошук по всіх характеристиках
          </label>
          <div className='relative'>
            <input id='search' type='text' className='w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm text-base sm:text-lg' placeholder='Пошук марки, моделі, року, двигуна, типу кузова, модифікації...' value={search} onChange={(e) => setSearch(e.target.value)} />
            <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
          </div>
        </div>
        <div className='mb-3 sm:mb-4 flex gap-1 sm:gap-2'>
          <input
            type='text'
            value={newMake}
            onChange={(e) => {
              setNewMake(e.target.value);
              setMakeError(null);
            }}
            placeholder='Нова марка'
            className={`border rounded px-2 py-1 flex-1 text-base sm:text-lg font-medium text-gray-900 bg-white ${makeError ? 'border-red-500' : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddMake();
              }
            }}
            aria-invalid={!!makeError}
            aria-describedby={makeError ? 'make-error' : undefined}
          />
          <button onClick={handleAddMake} className='bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-700 transition-colors' title='Додати'>
            <HiOutlinePlus className='text-white' size={22} />
          </button>
        </div>
        {makeError && (
          <div id='make-error' className='text-red-600 text-sm font-medium mb-2 px-1'>
            {makeError}
          </div>
        )}
        <div className='bg-white rounded-lg shadow border border-gray-200 overflow-x-auto'>
          <table className='min-w-[420px] sm:min-w-full divide-y divide-gray-200 text-base sm:text-lg'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  className='px-1 sm:px-3 py-2 sm:py-3 text-left text-base sm:text-lg font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none w-8 sm:w-12 min-w-[32px] sm:min-w-[48px] max-w-[40px] sm:max-w-[56px]'
                  onClick={() => {
                    if (sortBy === 'id') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('id');
                      setSortDir('asc');
                    }
                  }}
                >
                  <span className='flex items-center gap-1'>
                    ID
                    {sortBy === 'id' && (
                      <span className='inline-block align-middle text-xs ml-1' style={{ lineHeight: 1 }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className='px-3 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold text-gray-500 uppercase tracking-wider text-center w-full cursor-pointer select-none'
                  onClick={() => {
                    if (sortBy === 'name') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('name');
                      setSortDir('asc');
                    }
                  }}
                >
                  <span className='flex items-center justify-center gap-1'>
                    Марка
                    {sortBy === 'name' && (
                      <span className='inline-block align-middle text-xs' style={{ lineHeight: 1 }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
                <th className='px-3 sm:px-6 py-2 sm:py-3 w-10 sm:w-12'></th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200 text-base sm:text-lg'>
              {sortedMakes.length === 0 ? (
                <tr>
                  <td colSpan={3} className='px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-500 text-base sm:text-lg'>
                    Нічого не знайдено
                  </td>
                </tr>
              ) : (
                sortedMakes.map((make) => (
                  <React.Fragment key={make.id}>
                    <tr key={make.id} className={`cursor-pointer ${expandedMakeId === make.id ? 'bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'} text-gray-900`}>
                      <td className='px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg font-medium'>{make.id}</td>
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg transition break-words min-w-0`} onClick={() => setExpandedMakeId(expandedMakeId === make.id ? null : make.id)} title='Показати моделі та звʼязки'>
                        <div className='flex justify-center w-full h-full min-w-0'>
                          {editingMakeId === make.id ? (
                            <input
                              type='text'
                              value={editingMakeName}
                              onChange={(e) => setEditingMakeName(e.target.value)}
                              className={`border rounded px-2 py-1 w-full min-w-0 max-w-full truncate text-base sm:text-lg font-medium text-gray-900 bg-white ${makeError ? 'border-red-500' : ''}`}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditMake(make.id);
                                if (e.key === 'Escape') handleCancelEditMake();
                              }}
                              aria-invalid={!!makeError}
                              aria-describedby={makeError ? 'make-error' : undefined}
                            />
                          ) : (
                            <span className='w-full h-full flex items-center break-words truncate'>{make.name}</span>
                          )}
                        </div>
                      </td>
                      <td className='px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg'>
                        <div className='flex justify-end gap-1 sm:gap-2'>
                          {editingMakeId === make.id ? (
                            <>
                              <button onClick={() => handleSaveEditMake(make.id)} className='bg-green-700 hover:bg-green-800 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Зберегти'>
                                <HiOutlineCheck className='text-white' size={20} />
                              </button>
                              <button onClick={handleCancelEditMake} className='bg-gray-500 hover:bg-gray-600 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Скасувати'>
                                <HiOutlineX className='text-white' size={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditMake(make)} className='bg-blue-700 hover:bg-blue-800 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Редагувати'>
                                <HiOutlinePencil className='text-white' size={20} />
                              </button>
                              <button onClick={() => handleDeleteMake(make.id)} className='bg-red-700 hover:bg-red-800 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Видалити'>
                                <HiOutlineTrash className='text-white' size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedMakeId === make.id && (
                      <tr>
                        <td colSpan={3} className='bg-blue-50 p-0 border-t-2 border-blue-200'>
                          <div className='w-full border-l-4 border-blue-300 shadow-md rounded-r-lg bg-blue-50'>
                            <div className='font-bold mb-2 text-lg sm:text-xl text-blue-900 px-3 sm:px-6 pt-3 sm:pt-4 bg-blue-100 rounded-t-lg'>Моделі {make.name}:</div>
                            <div className='mb-3 sm:mb-4 flex gap-1 sm:gap-2 px-3 sm:px-6'>
                              <input
                                type='text'
                                value={modelParentMakeId === make.id ? newModelName : ''}
                                onChange={(e) => {
                                  setModelParentMakeId(make.id);
                                  setNewModelName(e.target.value);
                                  setModelError(null);
                                }}
                                placeholder='Нова модель'
                                className='border rounded px-2 py-1 flex-1 text-base sm:text-lg font-medium text-gray-900 bg-white'
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddModel(make.id);
                                }}
                              />
                              <button onClick={() => handleAddModel(make.id)} className='bg-blue-700 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-800 transition-colors text-base sm:text-lg font-semibold cursor-pointer' title='Додати'>
                                <HiOutlinePlus className='text-white' size={20} />
                              </button>
                            </div>
                            {modelError && modelParentMakeId === make.id && <div className='text-red-600 text-sm font-medium mb-2 px-3 sm:px-6'>{modelError}</div>}
                            <div className='overflow-x-auto w-full'>
                              <table className='w-full min-w-[380px] sm:min-w-full divide-y divide-gray-200 text-base sm:text-lg'>
                                <thead className='bg-blue-100'>
                                  <tr>
                                    <th
                                      className='px-1 sm:px-3 py-2 text-left text-base sm:text-lg font-semibold text-blue-700 uppercase tracking-wider w-8 sm:w-12 min-w-[32px] sm:min-w-[48px] max-w-[40px] sm:max-w-[56px] cursor-pointer select-none'
                                      onClick={() => {
                                        if (modelSortBy === 'id') setModelSortDir(modelSortDir === 'asc' ? 'desc' : 'asc');
                                        else {
                                          setModelSortBy('id');
                                          setModelSortDir('asc');
                                        }
                                      }}
                                    >
                                      <span className='flex items-center gap-1'>
                                        ID
                                        {modelSortBy === 'id' && (
                                          <span className='inline-block align-middle text-xs ml-1' style={{ lineHeight: 1 }}>
                                            {modelSortDir === 'asc' ? '▲' : '▼'}
                                          </span>
                                        )}
                                      </span>
                                    </th>
                                    <th
                                      className='px-2 sm:px-4 py-2 text-base sm:text-lg font-semibold text-blue-700 uppercase tracking-wider text-center cursor-pointer select-none'
                                      onClick={() => {
                                        if (modelSortBy === 'name') setModelSortDir(modelSortDir === 'asc' ? 'desc' : 'asc');
                                        else {
                                          setModelSortBy('name');
                                          setModelSortDir('asc');
                                        }
                                      }}
                                    >
                                      <span className='flex items-center justify-center gap-1'>
                                        Модель
                                        {modelSortBy === 'name' && (
                                          <span className='inline-block align-middle text-xs' style={{ lineHeight: 1 }}>
                                            {modelSortDir === 'asc' ? '▲' : '▼'}
                                          </span>
                                        )}
                                      </span>
                                    </th>
                                    <th className='px-2 sm:px-4 py-2 w-8 sm:w-12'></th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200 text-base sm:text-lg'>
                                  {getSortedModels(make.id).length === 0 ? (
                                    <tr>
                                      <td colSpan={3} className='px-2 sm:px-4 py-2 text-center text-gray-500 text-base sm:text-lg'>
                                        Немає моделей
                                      </td>
                                    </tr>
                                  ) : (
                                    getSortedModels(make.id).map((model: CarModel) => (
                                      <React.Fragment key={model.id}>
                                        <tr className={`cursor-pointer ${expandedModelId === model.id ? 'bg-blue-200' : 'bg-blue-50 hover:bg-blue-100'} text-blue-900`} onClick={() => setExpandedModelId(expandedModelId === model.id ? null : model.id)}>
                                          <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg font-medium'>{model.id}</td>
                                          <td className={`px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg transition break-words min-w-0`}>
                                            <span className='w-full h-full flex items-center break-words'>{model.name}</span>
                                          </td>
                                          <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg'>
                                            <div className='flex justify-end gap-1 sm:gap-2'>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditModel(model);
                                                }}
                                                className='bg-blue-700 hover:bg-blue-800 rounded-lg p-2 flex items-center justify-center cursor-pointer'
                                                title='Редагувати'
                                              >
                                                <HiOutlinePencil className='text-white' size={18} />
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteModel(model.id);
                                                }}
                                                className='bg-red-700 hover:bg-red-800 rounded-lg p-2 flex items-center justify-center cursor-pointer'
                                                title='Видалити'
                                              >
                                                <HiOutlineTrash className='text-white' size={18} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                        {expandedModelId === model.id && (
                                          <tr>
                                            <td colSpan={4} className='bg-yellow-50 border-l-4 border-yellow-400'>
                                              <div className='font-semibold text-base sm:text-lg text-yellow-900 px-3 sm:px-6 mb-1 pt-2'>
                                                Роки {make.name} {model.name}:
                                              </div>
                                              <div className='mb-2 flex gap-1 sm:gap-2 px-3 sm:px-6'>
                                                <input
                                                  type='number'
                                                  min={1970}
                                                  max={new Date().getFullYear()}
                                                  value={modelParentMakeId === make.id && expandedModelId === model.id ? newYearValue : ''}
                                                  onChange={(e) => {
                                                    setModelParentMakeId(make.id);
                                                    setExpandedModelId(model.id);
                                                    setNewYearValue(e.target.value);
                                                    setModelError(null);
                                                  }}
                                                  placeholder='Новий рік'
                                                  className='border rounded px-2 py-1 flex-1 text-base sm:text-lg font-medium text-gray-900 bg-white'
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddYear(model.id);
                                                  }}
                                                />
                                                <button onClick={() => handleAddYear(model.id)} className='bg-yellow-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-yellow-700 transition-colors text-base sm:text-lg font-semibold cursor-pointer' title='Додати рік'>
                                                  <HiOutlinePlus className='text-white' size={20} />
                                                </button>
                                              </div>
                                              {yearError && modelParentMakeId === make.id && expandedModelId === model.id && <div className='text-red-600 text-sm font-medium mb-2 px-3 sm:px-6'>{yearError}</div>}
                                              <div className='overflow-x-auto w-full'>
                                                <table className='w-full min-w-[220px] sm:min-w-full divide-y divide-yellow-200 text-base sm:text-lg'>
                                                  <thead className='bg-yellow-100'>
                                                    <tr>
                                                      <th
                                                        className='px-1 sm:px-3 py-2 text-left text-base sm:text-lg font-semibold text-yellow-700 uppercase tracking-wider w-8 sm:w-12 min-w-[32px] sm:min-w-[48px] max-w-[40px] sm:max-w-[56px] cursor-pointer select-none'
                                                        onClick={() => {
                                                          if (yearSortBy === 'id') setYearSortDir(yearSortDir === 'asc' ? 'desc' : 'asc');
                                                          else {
                                                            setYearSortBy('id');
                                                            setYearSortDir('asc');
                                                          }
                                                        }}
                                                      >
                                                        <span className='flex items-center gap-1'>
                                                          ID
                                                          {yearSortBy === 'id' && (
                                                            <span className='inline-block align-middle text-xs ml-1' style={{ lineHeight: 1 }}>
                                                              {yearSortDir === 'asc' ? '▲' : '▼'}
                                                            </span>
                                                          )}
                                                        </span>
                                                      </th>
                                                      <th
                                                        className='px-2 sm:px-4 py-2 text-base sm:text-lg font-semibold text-yellow-700 uppercase tracking-wider text-center cursor-pointer select-none'
                                                        onClick={() => {
                                                          if (yearSortBy === 'year') setYearSortDir(yearSortDir === 'asc' ? 'desc' : 'asc');
                                                          else {
                                                            setYearSortBy('year');
                                                            setYearSortDir('asc');
                                                          }
                                                        }}
                                                      >
                                                        <span className='flex items-center justify-center gap-1'>
                                                          Рік
                                                          {yearSortBy === 'year' && (
                                                            <span className='inline-block align-middle text-xs' style={{ lineHeight: 1 }}>
                                                              {yearSortDir === 'asc' ? '▲' : '▼'}
                                                            </span>
                                                          )}
                                                        </span>
                                                      </th>
                                                      <th className='px-2 sm:px-4 py-2 w-8 sm:w-12'></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className='bg-yellow-50 divide-y divide-yellow-200 text-base sm:text-lg'>
                                                    {getSortedYears(model.id).length === 0 ? (
                                                      <tr>
                                                        <td colSpan={3} className='px-2 sm:px-4 py-2 text-center text-yellow-600 text-base sm:text-lg'>
                                                          Немає років
                                                        </td>
                                                      </tr>
                                                    ) : (
                                                      getSortedYears(model.id).map((year: CarYear) => (
                                                        <React.Fragment key={year.id}>
                                                          <tr key={year.id} className={`cursor-pointer ${expandedYearId === year.id ? 'bg-green-200' : 'bg-yellow-50 hover:bg-green-50'} text-green-900`} onClick={() => setExpandedYearId(expandedYearId === year.id ? null : year.id)}>
                                                            <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg font-medium'>{year.id}</td>
                                                            <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg'>{year.year}</td>
                                                            <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg'>
                                                              <button
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleDeleteYear(year.id);
                                                                }}
                                                                className='bg-red-700 hover:bg-red-800 rounded-lg p-2 flex items-center justify-center cursor-pointer'
                                                                title='Видалити рік'
                                                              >
                                                                <HiOutlineTrash className='text-white' size={18} />
                                                              </button>
                                                            </td>
                                                          </tr>
                                                          {expandedYearId === year.id && (
                                                            <tr>
                                                              <td colSpan={3} className='bg-green-50 border-l-4 border-green-400'>
                                                                <div className='font-semibold text-base sm:text-lg text-green-900 px-3 sm:px-6 mb-1 pt-2'>
                                                                  Двигуни {make.name} {model.name} {year.year}:
                                                                </div>
                                                                <div className='mb-2 flex gap-1 sm:gap-2 px-3 sm:px-6'>
                                                                  <input
                                                                    type='text'
                                                                    value={engineParentYearId === year.id ? newEngineName : ''}
                                                                    onChange={(e) => {
                                                                      setEngineParentYearId(year.id);
                                                                      setNewEngineName(e.target.value);
                                                                      setEngineError(null);
                                                                    }}
                                                                    placeholder='Новий двигун'
                                                                    className='border rounded px-2 py-1 flex-1 text-base sm:text-lg font-medium text-gray-900 bg-white'
                                                                    onKeyDown={(e) => {
                                                                      if (e.key === 'Enter') handleAddEngine(year.id);
                                                                    }}
                                                                  />
                                                                  <button onClick={() => handleAddEngine(year.id)} className='bg-green-700 text-white rounded-lg p-2 flex items-center justify-center hover:bg-green-800 transition-colors text-base sm:text-lg font-semibold cursor-pointer' title='Додати двигун'>
                                                                    <HiOutlinePlus className='text-white' size={20} />
                                                                  </button>
                                                                </div>
                                                                {engineError && engineParentYearId === year.id && <div className='text-red-600 text-sm font-medium mb-2 px-3 sm:px-6'>{engineError}</div>}
                                                                <div className='overflow-x-auto w-full'>
                                                                  <table className='w-full min-w-[220px] sm:min-w-full divide-y divide-green-200 text-base sm:text-lg'>
                                                                    <thead className='bg-green-100'>
                                                                      <tr>
                                                                        <th
                                                                          className='px-1 sm:px-3 py-2 text-left text-base sm:text-lg font-semibold text-green-700 uppercase tracking-wider w-8 sm:w-12 min-w-[32px] sm:min-w-[48px] max-w-[40px] sm:max-w-[56px] cursor-pointer select-none'
                                                                          onClick={() => {
                                                                            if (engineSortBy === 'id') setEngineSortDir(engineSortDir === 'asc' ? 'desc' : 'asc');
                                                                            else {
                                                                              setEngineSortBy('id');
                                                                              setEngineSortDir('asc');
                                                                            }
                                                                          }}
                                                                        >
                                                                          <span className='flex items-center gap-1'>
                                                                            ID
                                                                            {engineSortBy === 'id' && (
                                                                              <span className='inline-block align-middle text-xs ml-1' style={{ lineHeight: 1 }}>
                                                                                {engineSortDir === 'asc' ? '▲' : '▼'}
                                                                              </span>
                                                                            )}
                                                                          </span>
                                                                        </th>
                                                                        <th
                                                                          className='px-2 sm:px-4 py-2 text-base sm:text-lg font-semibold text-green-700 uppercase tracking-wider text-center cursor-pointer select-none'
                                                                          onClick={() => {
                                                                            if (engineSortBy === 'name') setEngineSortDir(engineSortDir === 'asc' ? 'desc' : 'asc');
                                                                            else {
                                                                              setEngineSortBy('name');
                                                                              setEngineSortDir('asc');
                                                                            }
                                                                          }}
                                                                        >
                                                                          <span className='flex items-center justify-center gap-1'>Двигун{engineSortBy === 'name' && <span className='inline-block align-middle text-xs'>{engineSortDir === 'asc' ? '▲' : '▼'}</span>}</span>
                                                                        </th>
                                                                        <th className='px-2 sm:px-4 py-2 w-8 sm:w-12'></th>
                                                                      </tr>
                                                                    </thead>
                                                                    <tbody className='bg-green-50 divide-y divide-green-200 text-base sm:text-lg'>
                                                                      {getSortedEngines(year.id).length === 0 ? (
                                                                        <tr>
                                                                          <td colSpan={3} className='px-2 sm:px-4 py-2 text-center text-green-600 text-base sm:text-lg'>
                                                                            Немає двигунів
                                                                          </td>
                                                                        </tr>
                                                                      ) : (
                                                                        getSortedEngines(year.id).map((engine) => (
                                                                          <tr key={engine.id} className='cursor-pointer hover:bg-green-100 text-green-900'>
                                                                            <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg font-medium'>{engine.id}</td>
                                                                            <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg'>{engine.name}</td>
                                                                            <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg'>
                                                                              <button onClick={() => handleDeleteEngine(engine.id)} className='bg-red-700 hover:bg-red-800 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Видалити двигун'>
                                                                                <HiOutlineTrash className='text-white' size={18} />
                                                                              </button>
                                                                            </td>
                                                                          </tr>
                                                                        ))
                                                                      )}
                                                                    </tbody>
                                                                  </table>
                                                                </div>
                                                              </td>
                                                            </tr>
                                                          )}
                                                        </React.Fragment>
                                                      ))
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                      </React.Fragment>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
