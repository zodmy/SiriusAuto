'use client';

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
    if (!newMake.trim()) return;
    await fetch('/api/car-makes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMake }),
    });
    setNewMake('');
    fetch('/api/car-makes')
      .then((r) => r.json())
      .then(setCarMakes);
  };

  const handleEditMake = (make: CarMake) => {
    setEditingMakeId(make.id);
    setEditingMakeName(make.name);
  };
  const handleSaveEditMake = async (id: number) => {
    if (!editingMakeName.trim()) return;
    await fetch(`/api/car-makes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingMakeName }),
    });
    setEditingMakeId(null);
    setEditingMakeName('');
    fetch('/api/car-makes')
      .then((r) => r.json())
      .then(setCarMakes);
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
    if (!newModelName.trim()) return;
    await fetch('/api/car-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newModelName, makeId }),
    });
    setNewModelName('');
    setModelParentMakeId(null);
    fetch('/api/car-models')
      .then((r) => r.json())
      .then(setCarModels);
  };

  const handleEditModel = (model: CarModel) => {
    setEditingModelId(model.id);
    setEditingModelName(model.name);
  };
  const handleSaveEditModel = async (id: number) => {
    if (!editingModelName.trim()) return;
    await fetch(`/api/car-models/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingModelName }),
    });
    setEditingModelId(null);
    setEditingModelName('');
    fetch('/api/car-models')
      .then((r) => r.json())
      .then(setCarModels);
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
    <div className='min-h-screen bg-gray-50 p-4'>
      <main className='bg-white shadow-xl rounded-2xl p-8 max-w-3xl mx-auto border border-gray-200'>
        <h2 className='text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3'>
          <span className='text-blue-700'>
            <HiOutlineCog className='inline-block mr-1' size={32} />
          </span>
          Керування автомобілями
        </h2>
        <div className='mb-6'>
          <label htmlFor='search' className='block text-gray-900 font-semibold mb-2'>
            Пошук по всіх характеристиках
          </label>
          <div className='relative'>
            <input id='search' type='text' className='w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm' placeholder='Пошук марки, моделі, року, двигуна, типу кузова, модифікації...' value={search} onChange={(e) => setSearch(e.target.value)} />
            <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
          </div>
        </div>
        <div className='mb-4 flex gap-2'>
          <input type='text' value={newMake} onChange={(e) => setNewMake(e.target.value)} placeholder='Нова марка' className='border rounded px-2 py-1 flex-1 text-lg font-medium text-gray-900 bg-white' />
          <button onClick={handleAddMake} className='bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-700 transition-colors' title='Додати'>
            <HiOutlinePlus className='text-white' size={28} />
          </button>
        </div>
        <div className='bg-white rounded-lg shadow border border-gray-200'>
          <table className='min-w-full divide-y divide-gray-200 text-lg'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  className='px-6 py-3 text-left text-lg font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none'
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
                  className='px-6 py-3 text-lg font-semibold text-gray-500 uppercase tracking-wider text-center w-full cursor-pointer select-none'
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
                <th className='px-6 py-3 w-12'></th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200 text-lg'>
              {sortedMakes.length === 0 ? (
                <tr>
                  <td colSpan={3} className='px-6 py-4 text-center text-gray-500 text-lg'>
                    Нічого не знайдено
                  </td>
                </tr>
              ) : (
                sortedMakes.map((make) => (
                  <>
                    <tr key={make.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900'>{make.id}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-lg text-gray-900 transition bg-white ${expandedMakeId === make.id ? 'bg-blue-50' : ''} cursor-pointer hover:bg-blue-100`} onClick={() => setExpandedMakeId(expandedMakeId === make.id ? null : make.id)} title='Показати моделі та звʼязки'>
                        <div className='flex justify-center w-full h-full'>
                          {editingMakeId === make.id ? (
                            <input
                              type='text'
                              value={editingMakeName}
                              onChange={(e) => setEditingMakeName(e.target.value)}
                              className='border rounded px-2 py-1 w-full text-lg font-medium text-gray-900 bg-white'
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditMake(make.id);
                                if (e.key === 'Escape') handleCancelEditMake();
                              }}
                            />
                          ) : (
                            <span className='w-full h-full flex items-center'>{make.name}</span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-lg text-gray-900'>
                        <div className='flex justify-end gap-2'>
                          {editingMakeId === make.id ? (
                            <>
                              <button onClick={() => handleSaveEditMake(make.id)} className='bg-green-600 hover:bg-green-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Зберегти'>
                                <HiOutlineCheck className='text-white' size={24} />
                              </button>
                              <button onClick={handleCancelEditMake} className='bg-gray-400 hover:bg-gray-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Скасувати'>
                                <HiOutlineX className='text-white' size={24} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditMake(make)} className='bg-yellow-400 hover:bg-yellow-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Редагувати'>
                                <HiOutlinePencil className='text-white' size={24} />
                              </button>
                              <button onClick={() => handleDeleteMake(make.id)} className='bg-red-600 hover:bg-red-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Видалити'>
                                <HiOutlineTrash className='text-white' size={24} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedMakeId === make.id && (
                      <tr>
                        <td colSpan={3} className='bg-blue-50 px-6 py-4'>
                          <div>
                            <div className='font-bold mb-2 text-xl text-gray-900'>Моделі:</div>
                            <div className='mb-4 flex gap-2'>
                              <input
                                type='text'
                                value={modelParentMakeId === make.id ? newModelName : ''}
                                onChange={(e) => {
                                  setModelParentMakeId(make.id);
                                  setNewModelName(e.target.value);
                                }}
                                placeholder='Нова модель'
                                className='border rounded px-2 py-1 flex-1 text-lg font-medium text-gray-900 bg-white'
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddModel(make.id);
                                }}
                              />
                              <button onClick={() => handleAddModel(make.id)} className='bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-700 transition-colors text-lg font-semibold cursor-pointer' title='Додати'>
                                <HiOutlinePlus className='text-white' size={24} />
                              </button>
                            </div>
                            <table className='min-w-full divide-y divide-gray-200 text-lg'>
                              <thead className='bg-gray-100'>
                                <tr>
                                  <th className='px-4 py-2 text-left text-lg font-semibold text-gray-500 uppercase tracking-wider'>ID</th>
                                  <th className='px-4 py-2 text-lg font-semibold text-gray-500 uppercase tracking-wider text-center'>Модель</th>
                                  <th className='px-4 py-2 w-12'></th>
                                </tr>
                              </thead>
                              <tbody className='bg-white divide-y divide-gray-200 text-lg'>
                                {(debouncedSearch.trim() ? carModels.filter((model) => model.makeId === make.id && normalizeString(model.name).includes(normalizeString(debouncedSearch.trim()))) : carModels.filter((model) => model.makeId === make.id)).length === 0 ? (
                                  <tr>
                                    <td colSpan={3} className='px-4 py-2 text-center text-gray-500 text-lg'>
                                      Немає моделей
                                    </td>
                                  </tr>
                                ) : (
                                  (debouncedSearch.trim() ? carModels.filter((model) => model.makeId === make.id && normalizeString(model.name).includes(normalizeString(debouncedSearch.trim()))) : carModels.filter((model) => model.makeId === make.id)).map((model) => (
                                    <tr key={model.id}>
                                      <td className='px-4 py-2 whitespace-nowrap text-lg font-medium text-gray-900'>{model.id}</td>
                                      <td className={`px-4 py-2 whitespace-nowrap text-lg text-gray-900 transition bg-white cursor-pointer hover:bg-blue-100 ${editingModelId === model.id ? '' : ''}`} onClick={() => handleEditModel(model)} title='Редагувати модель'>
                                        {editingModelId === model.id ? (
                                          <input
                                            type='text'
                                            value={editingModelName}
                                            onChange={(e) => setEditingModelName(e.target.value)}
                                            className='border rounded px-2 py-1 w-full text-lg font-medium text-gray-900 bg-white'
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveEditModel(model.id);
                                              if (e.key === 'Escape') handleCancelEditModel();
                                            }}
                                          />
                                        ) : (
                                          <span className='w-full h-full flex items-center'>{model.name}</span>
                                        )}
                                      </td>
                                      <td className='px-4 py-2 whitespace-nowrap text-lg text-gray-900'>
                                        <div className='flex justify-end gap-2'>
                                          {editingModelId === model.id ? (
                                            <>
                                              <button onClick={() => handleSaveEditModel(model.id)} className='bg-green-600 hover:bg-green-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Зберегти'>
                                                <HiOutlineCheck className='text-white' size={24} />
                                              </button>
                                              <button onClick={handleCancelEditModel} className='bg-gray-400 hover:bg-gray-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Скасувати'>
                                                <HiOutlineX className='text-white' size={24} />
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button onClick={() => handleEditModel(model)} className='bg-yellow-400 hover:bg-yellow-500 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Редагувати'>
                                                <HiOutlinePencil className='text-white' size={24} />
                                              </button>
                                              <button onClick={() => handleDeleteModel(model.id)} className='bg-red-600 hover:bg-red-700 rounded-lg p-2 flex items-center justify-center cursor-pointer' title='Видалити'>
                                                <HiOutlineTrash className='text-white' size={24} />
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
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
