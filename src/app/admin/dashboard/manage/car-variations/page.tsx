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
}
interface CarYear {
  id: number;
  year: number;
  modelId: number;
}
interface CarEngine {
  id: number;
  name: string;
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
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editingModelName, setEditingModelName] = useState('');
  const [modelParentMakeId, setModelParentMakeId] = useState<number | null>(null);
  const [makeError, setMakeError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

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
    setEditingModelId(model.id);
    setEditingModelName(model.name);
  };
  const handleSaveEditModel = async (id: number) => {
    setModelError(null);
    if (!editingModelName.trim()) {
      setModelError('Введіть назву моделі');
      return;
    }
    const model = carModels.find((m) => m.id === id);
    if (!model) return;
    const normalizedEdit = normalizeString(editingModelName.trim());
    if (carModels.some((m) => normalizeString(m.name) === normalizedEdit && m.makeId === model.makeId && m.id !== id)) {
      setModelError('Така модель вже існує для цієї марки');
      return;
    }
    try {
      const res = await fetch(`/api/car-models/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingModelName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModelError(data?.error || 'Помилка редагування моделі');
        return;
      }
      setEditingModelId(null);
      setEditingModelName('');
      fetch('/api/car-models')
        .then((r) => r.json())
        .then(setCarModels);
    } catch {
      setModelError('Помилка мережі');
    }
  };
  const handleCancelEditModel = () => {
    setEditingModelId(null);
    setEditingModelName('');
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Видалити цю модель?')) return;
    await fetch(`/api/car-models/${id}`, { method: 'DELETE' });
    fetch('/api/car-models')
      .then((r) => r.json())
      .then(setCarModels);
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

  return (
    <div className='min-h-screen bg-gray-50 p-2 sm:p-4'>
      <main className='bg-white shadow-xl rounded-2xl p-4 sm:p-8 max-w-full sm:max-w-3xl mx-auto border border-gray-200'>
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
                    <tr key={make.id}>
                      <td className='px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg font-medium text-gray-900 w-8 sm:w-12 min-w-[32px] sm:min-w-[48px] max-w-[40px] sm:max-w-[56px]'>{make.id}</td>
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg text-gray-900 transition bg-white ${expandedMakeId === make.id ? 'bg-blue-50' : ''} cursor-pointer hover:bg-blue-100 break-words min-w-0`} onClick={() => setExpandedMakeId(expandedMakeId === make.id ? null : make.id)} title='Показати моделі та звʼязки'>
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
                      <td className='px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg text-gray-900'>
                        <div className='flex justify-end gap-1 sm:gap-2'>
                          {editingMakeId === make.id ? (
                            <>
                              <button onClick={() => handleSaveEditMake(make.id)} className='bg-green-600 hover:bg-green-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Зберегти'>
                                <HiOutlineCheck className='text-white' size={20} />
                              </button>
                              <button onClick={handleCancelEditMake} className='bg-gray-400 hover:bg-gray-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Скасувати'>
                                <HiOutlineX className='text-white' size={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditMake(make)} className='bg-yellow-400 hover:bg-yellow-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Редагувати'>
                                <HiOutlinePencil className='text-white' size={20} />
                              </button>
                              <button onClick={() => handleDeleteMake(make.id)} className='bg-red-600 hover:bg-red-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Видалити'>
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
                            <div className='font-bold mb-2 text-lg sm:text-xl text-gray-900 px-3 sm:px-6 pt-3 sm:pt-4'>Моделі:</div>
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
                              <button onClick={() => handleAddModel(make.id)} className='bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-700 transition-colors text-base sm:text-lg font-semibold cursor-pointer' title='Додати'>
                                <HiOutlinePlus className='text-white' size={20} />
                              </button>
                            </div>
                            {modelError && modelParentMakeId === make.id && <div className='text-red-600 text-sm font-medium mb-2 px-3 sm:px-6'>{modelError}</div>}
                            <div className='overflow-x-auto w-full'>
                              <table className='w-full min-w-[380px] sm:min-w-full divide-y divide-gray-200 text-base sm:text-lg'>
                                <thead className='bg-gray-100'>
                                  <tr>
                                    <th className='px-1 sm:px-3 py-2 text-left text-base sm:text-lg font-semibold text-gray-500 uppercase tracking-wider w-8 sm:w-12 min-w-[32px] sm:min-w-[48px] max-w-[40px] sm:max-w-[56px]'>ID</th>
                                    <th className='px-2 sm:px-4 py-2 text-base sm:text-lg font-semibold text-gray-500 uppercase tracking-wider text-center'>Модель</th>
                                    <th className='px-2 sm:px-4 py-2 w-8 sm:w-12'></th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200 text-base sm:text-lg'>
                                  {(debouncedSearch.trim() ? carModels.filter((model) => model.makeId === make.id && normalizeString(model.name).includes(normalizeString(debouncedSearch.trim()))) : carModels.filter((model) => model.makeId === make.id)).length === 0 ? (
                                    <tr>
                                      <td colSpan={3} className='px-2 sm:px-4 py-2 text-center text-gray-500 text-base sm:text-lg'>
                                        Немає моделей
                                      </td>
                                    </tr>
                                  ) : (
                                    (debouncedSearch.trim() ? carModels.filter((model) => model.makeId === make.id && normalizeString(model.name).includes(normalizeString(debouncedSearch.trim()))) : carModels.filter((model) => model.makeId === make.id)).map((model) => (
                                      <tr key={model.id}>
                                        <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg font-medium text-gray-900'>{model.id}</td>
                                        <td className={`px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg text-gray-900 transition bg-white cursor-pointer hover:bg-blue-100 break-words min-w-0 ${editingModelId === model.id ? '' : ''}`} onClick={() => handleEditModel(model)} title='Редагувати модель'>
                                          {editingModelId === model.id ? (
                                            <input
                                              type='text'
                                              value={editingModelName}
                                              onChange={(e) => setEditingModelName(e.target.value)}
                                              className='border rounded px-2 py-1 w-full min-w-0 max-w-full truncate text-base sm:text-lg font-medium text-gray-900 bg-white'
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEditModel(model.id);
                                                if (e.key === 'Escape') handleCancelEditModel();
                                              }}
                                            />
                                          ) : (
                                            <span className='w-full h-full flex items-center break-words'>{model.name}</span>
                                          )}
                                        </td>
                                        <td className='px-2 sm:px-4 py-2 whitespace-nowrap text-base sm:text-lg text-gray-900'>
                                          <div className='flex justify-end gap-1 sm:gap-2'>
                                            {editingModelId === model.id ? (
                                              <>
                                                <button onClick={() => handleSaveEditModel(model.id)} className='bg-green-600 hover:bg-green-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Зберегти'>
                                                  <HiOutlineCheck className='text-white' size={18} />
                                                </button>
                                                <button onClick={handleCancelEditModel} className='bg-gray-400 hover:bg-gray-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Скасувати'>
                                                  <HiOutlineX className='text-white' size={18} />
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <button onClick={() => handleEditModel(model)} className='bg-yellow-400 hover:bg-yellow-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Редагувати'>
                                                  <HiOutlinePencil className='text-white' size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteModel(model.id)} className='bg-red-600 hover:bg-red-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Видалити'>
                                                  <HiOutlineTrash className='text-white' size={18} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
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
