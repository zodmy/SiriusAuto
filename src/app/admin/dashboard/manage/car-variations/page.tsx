'use client';
import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineCog, HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
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
interface CarBodyType {
  id: number;
  name: string;
  yearId: number;
}
interface CarEngine {
  id: number;
  name: string;
  bodyTypeId: number;
}

export default function ManageCarVariationsPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [carYears, setCarYears] = useState<CarYear[]>([]);
  const [carBodyTypes, setCarBodyTypes] = useState<CarBodyType[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newMake, setNewMake] = useState('');
  const [editingMakeId, setEditingMakeId] = useState<number | null>(null);
  const [editingMakeName, setEditingMakeName] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedMakeId, setExpandedMakeId] = useState<number | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [expandedModelId, setExpandedModelId] = useState<number | null>(null);
  const [modelParentMakeId, setModelParentMakeId] = useState<number | null>(null);
  const [makeError, setMakeError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const [modelSortBy, setModelSortBy] = useState<'id' | 'name'>('name');
  const [modelSortDir, setModelSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedYearId, setExpandedYearId] = useState<number | null>(null);
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editingModelName, setEditingModelName] = useState('');
  const [currentEditingModelDetails, setCurrentEditingModelDetails] = useState<CarModel | null>(null);
  const [newYearValue, setNewYearValue] = useState('');
  const [editingYearId, setEditingYearId] = useState<number | null>(null);
  const [editingYearValue, setEditingYearValue] = useState('');
  const [currentEditingYearDetails, setCurrentEditingYearDetails] = useState<CarYear | null>(null);
  const [newBodyTypeName, setNewBodyTypeName] = useState('');
  const [bodyTypeParentYearId, setBodyTypeParentYearId] = useState<number | null>(null);
  const [bodyTypeError, setBodyTypeError] = useState<string | null>(null);
  const [yearSortDir, setYearSortDir] = useState<'asc' | 'desc'>('asc');
  const [bodyTypeSortDir, setBodyTypeSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingBodyTypeId, setEditingBodyTypeId] = useState<number | null>(null);
  const [editingBodyTypeName, setEditingBodyTypeName] = useState('');
  const [enginesByBodyType, setEnginesByBodyType] = useState<Record<number, CarEngine[]>>({});
  const [enginesLoading, setEnginesLoading] = useState<Record<number, boolean>>({});
  const [enginesError, setEnginesError] = useState<Record<number, string | null>>({});
  const [newEngineName, setNewEngineName] = useState<Record<number, string>>({});
  const [editingEngineId, setEditingEngineId] = useState<number | null>(null);
  const [editingEngineName, setEditingEngineName] = useState('');
  const [engineError, setEngineError] = useState<Record<number, string | null>>({});
  const [engineSortDir, setEngineSortDir] = useState<Record<number, 'asc' | 'desc'>>({});
  const [expandedBodyTypeId, setExpandedBodyTypeId] = useState<number | null>(null);
  const bodyTypeRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const modelRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const yearRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const engineRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const currentYear = new Date().getFullYear();

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
      fetch('/api/car-body-types')
        .then((r) => r.json())
        .then(setCarBodyTypes);
    }
  }, [isAdmin, isVerifyingAuth]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const getSortedBodyTypes = React.useCallback(
    (yearIdNum: number) => {
      const filtered = carBodyTypes.filter((e) => e.yearId === yearIdNum);
      return [...filtered].sort((a, b) => {
        return bodyTypeSortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    },
    [carBodyTypes, bodyTypeSortDir]
  );

  useEffect(() => {
    if (expandedYearId !== null) {
      getSortedBodyTypes(expandedYearId).forEach((bt) => {
        if (enginesByBodyType[bt.id] === undefined && !enginesLoading[bt.id]) {
          fetchEnginesForBodyType(bt.id);
        }
      });
    }
  }, [expandedYearId, carBodyTypes, enginesByBodyType, enginesLoading, getSortedBodyTypes]);

  useEffect(() => {
    if (expandedModelId !== null && modelRefs.current[expandedModelId]) {
      modelRefs.current[expandedModelId]?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [expandedModelId]);

  useEffect(() => {
    if (expandedYearId !== null && yearRefs.current[expandedYearId]) {
      yearRefs.current[expandedYearId]?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [expandedYearId]);

  useEffect(() => {
    if (expandedBodyTypeId !== null && bodyTypeRefs.current[expandedBodyTypeId]) {
      bodyTypeRefs.current[expandedBodyTypeId]?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [expandedBodyTypeId]);

  useEffect(() => {
    if (editingEngineId !== null && engineRefs.current[editingEngineId]) {
      engineRefs.current[editingEngineId]?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [editingEngineId]);

  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    const globalSearch = normalizeString(debouncedSearch.trim());
    let foundMakeId: number | null = null;
    let foundModelId: number | null = null;
    for (const make of carMakes) {
      if (normalizeString(make.name).includes(globalSearch)) {
        foundMakeId = make.id;
        break;
      }
      for (const model of carModels.filter((m) => m.makeId === make.id)) {
        if (normalizeString(model.name).includes(globalSearch)) {
          foundMakeId = make.id;
          foundModelId = model.id;
          break;
        }
      }
      if (foundModelId) break;
    }
    if (foundMakeId) setExpandedMakeId(foundMakeId);
    if (foundModelId) setExpandedModelId(foundModelId);
    setExpandedYearId(null);
    setExpandedBodyTypeId(null);
    setEditingEngineId(null);
  }, [debouncedSearch, carMakes, carModels]);

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
      const response = await fetch('/api/car-makes');
      const makes = await response.json();
      setCarMakes(makes);
      const addedMake = makes.find((m: CarMake) => normalizeString(m.name) === normalizedNew);
      if (addedMake) setExpandedMakeId(addedMake.id);
    } catch {
      setMakeError('Помилка мережі');
    }
  };

  const handleEditMake = (make: CarMake) => {
    setEditingMakeId(make.id);
    setEditingMakeName(make.name);
    setMakeError(null);
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
      const response = await fetch('/api/car-makes');
      const makes = await response.json();
      setCarMakes(makes);
      setExpandedMakeId(id);
    } catch {
      setMakeError('Помилка мережі');
    }
  };

  const handleCancelEditMake = () => {
    setEditingMakeId(null);
    setEditingMakeName('');
    setMakeError(null);
  };
  const handleDeleteMake = async (id: number) => {
    if (!window.confirm("Видалити цю марку та всі пов'язані моделі, роки і типи кузовів?")) return;
    try {
      await fetch(`/api/car-makes/${id}`, { method: 'DELETE' });
      const [makesRes, modelsRes, yearsRes, bodyTypesRes] = await Promise.all([fetch('/api/car-makes'), fetch('/api/car-models'), fetch('/api/car-years'), fetch('/api/car-body-types')]);

      const [makes, models, years, bodyTypes] = await Promise.all([makesRes.json(), modelsRes.json(), yearsRes.json(), bodyTypesRes.json()]);

      setCarMakes(makes);
      setCarModels(models);
      setCarYears(years);
      setCarBodyTypes(bodyTypes);

      if (expandedMakeId === id) {
        setExpandedMakeId(null);
        setExpandedModelId(null);
        setExpandedYearId(null);
        setExpandedBodyTypeId(null);
      }
    } catch (error) {
      console.error('Помилка видалення марки:', error);
    }
  };

  const handleAddModel = async (makeId: number) => {
    setModelError(null);
    if (!newModelName.trim()) {
      setModelError('Введіть назву моделі');
      return;
    }
    const normalizedNew = normalizeString(newModelName.trim());
    if (carModels.some((m: CarModel) => normalizeString(m.name) === normalizedNew && m.makeId === makeId)) {
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
      const response = await fetch('/api/car-models');
      const models: CarModel[] = await response.json();
      setCarModels(models);
      setExpandedMakeId(makeId);
      const addedModel = models.find((m: CarModel) => m.makeId === makeId && normalizeString(m.name) === normalizedNew);
      if (addedModel) {
        setExpandedModelId(addedModel.id);
      }
      setNewModelName('');
      setModelParentMakeId(null);
    } catch {
      setModelError('Помилка мережі');
    }
  };

  const handleEditModel = (model: CarModel) => {
    setEditingModelId(model.id);
    setEditingModelName(model.name);
    setCurrentEditingModelDetails(model);
    setModelError(null);
  };

  const handleSaveEditModel = async (modelId: number) => {
    if (!currentEditingModelDetails || currentEditingModelDetails.id !== modelId) {
      setModelError('Помилка: Деталі моделі для редагування не знайдено або ID не співпадає.');
      return;
    }
    if (!editingModelName.trim()) {
      setModelError('Назва моделі не може бути порожньою.');
      return;
    }
    const carMakeId = currentEditingModelDetails.makeId;
    if (carMakeId === undefined || carMakeId === null) {
      setModelError('Помилка: ID марки автомобіля (makeId) не знайдено для цієї моделі.');
      return;
    }
    try {
      const response = await fetch(`/api/car-models/${modelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingModelName, carMakeId: carMakeId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setModelError(errorData.error || `Помилка збереження моделі (HTTP ${response.status}): ${response.statusText}`);
        return;
      }
      const modelsResponse = await fetch('/api/car-models');
      const models = await modelsResponse.json();
      setCarModels(models);
      const updated = models.find((m: CarModel) => m.id === modelId);
      if (updated) {
        setExpandedMakeId(carMakeId);
        setExpandedModelId(modelId);
      } else {
        setExpandedModelId(null);
      }
      setEditingModelId(null);
      setCurrentEditingModelDetails(null);
      setModelError(null);
    } catch (error) {
      console.error('Не вдалося зберегти модель:', error);
      setModelError('Не вдалося зберегти модель. Перевірте консоль для деталей.');
    }
  };

  const handleCancelEditModel = () => {
    setEditingModelId(null);
    setCurrentEditingModelDetails(null);
    setModelError(null);
  };
  const handleDeleteModel = async (id: number) => {
    if (!window.confirm("Видалити цю модель та всі пов'язані роки і типи кузовів?")) return;
    try {
      await fetch(`/api/car-models/${id}`, { method: 'DELETE' });
      const [modelsRes, yearsRes, bodyTypesRes] = await Promise.all([fetch('/api/car-models'), fetch('/api/car-years'), fetch('/api/car-body-types')]);

      const [models, years, bodyTypes] = await Promise.all([modelsRes.json(), yearsRes.json(), bodyTypesRes.json()]);

      setCarModels(models);
      setCarYears(years);
      setCarBodyTypes(bodyTypes);

      if (expandedModelId === id) {
        setExpandedModelId(null);
        setExpandedYearId(null);
        setExpandedBodyTypeId(null);
      }
    } catch (error) {
      console.error('Помилка видалення моделі:', error);
    }
  };

  const handleAddYear = async (modelId: number) => {
    setYearError(null);
    if (!newYearValue.trim() || isNaN(Number(newYearValue)) || Number(newYearValue) < 1970 || Number(newYearValue) > currentYear) {
      setYearError(`Введіть коректний рік (від 1970 до ${currentYear})`);
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
      const response = await fetch('/api/car-years');
      const years: CarYear[] = await response.json();
      setCarYears(years);
      setExpandedModelId(modelId);
      const addedYear = years.find((y: CarYear) => y.modelId === modelId && y.year === yearValue);
      if (addedYear) setExpandedYearId(addedYear.id);
    } catch {
      setYearError('Помилка мережі');
    }
  };

  const handleEditYear = (year: CarYear) => {
    setEditingYearId(year.id);
    setEditingYearValue(year.year.toString());
    setCurrentEditingYearDetails(year);
    setYearError(null);
  };

  const handleSaveEditYear = async (yearIdNum: number) => {
    if (!currentEditingYearDetails || currentEditingYearDetails.id !== yearIdNum) {
      setYearError('Помилка: Деталі року для редагування не знайдено або ID не співпадає.');
      return;
    }
    if (!editingYearValue.trim() || isNaN(Number(editingYearValue)) || Number(editingYearValue) < 1970 || Number(editingYearValue) > currentYear) {
      setYearError(`Введіть коректний рік (від 1970 до ${currentYear}).`);
      return;
    }
    const yearNum = Number(editingYearValue);
    const modelId = currentEditingYearDetails.modelId;
    if (carYears.some((y) => y.modelId === modelId && y.year === yearNum && y.id !== yearIdNum)) {
      setYearError('Такий рік вже існує для цієї моделі.');
      return;
    }
    try {
      const response = await fetch(`/api/car-years/${yearIdNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: yearNum, modelId: modelId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setYearError(errorData.error || `Помилка збереження року (HTTP ${response.status}): ${response.statusText}`);
        return;
      }
      const yearsResponse = await fetch('/api/car-years');
      const years: CarYear[] = await yearsResponse.json();
      setCarYears(years);
      setExpandedModelId(modelId);
      const updated = years.find((y) => y.id === yearIdNum);
      if (updated) setExpandedYearId(yearIdNum);
      setEditingYearId(null);
      setCurrentEditingYearDetails(null);
      setYearError(null);
    } catch (error) {
      console.error('Не вдалося зберегти рік:', error);
      setYearError('Не вдалося зберегти рік. Перевірте консоль для деталей.');
    }
  };

  const handleCancelEditYear = () => {
    setEditingYearId(null);
    setCurrentEditingYearDetails(null);
    setEditingYearValue('');
    setYearError(null);
  };
  const handleDeleteYear = async (id: number) => {
    if (!window.confirm("Видалити цей рік та всі пов'язані типи кузовів?")) return;
    try {
      await fetch(`/api/car-years/${id}`, { method: 'DELETE' });
      const [yearsRes, bodyTypesRes] = await Promise.all([fetch('/api/car-years'), fetch('/api/car-body-types')]);

      const [years, bodyTypes] = await Promise.all([yearsRes.json(), bodyTypesRes.json()]);

      setCarYears(years);
      setCarBodyTypes(bodyTypes);

      if (expandedYearId === id) {
        setExpandedYearId(null);
        setExpandedBodyTypeId(null);
      }
    } catch (error) {
      console.error('Помилка видалення року:', error);
    }
  };

  const handleAddBodyType = async (yearId: number) => {
    setBodyTypeError(null);
    if (!newBodyTypeName.trim()) {
      setBodyTypeError('Введіть назву типу кузова');
      return;
    }
    const normalizedNew = normalizeString(newBodyTypeName.trim());
    if (carBodyTypes.some((bt) => normalizeString(bt.name) === normalizedNew && bt.yearId === yearId)) {
      setBodyTypeError('Такий тип кузова вже існує для цього року');
      return;
    }
    try {
      const res = await fetch('/api/car-body-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBodyTypeName, yearId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBodyTypeError(data?.error || 'Помилка створення типу кузова');
        return;
      }
      setNewBodyTypeName('');
      setBodyTypeParentYearId(null);
      const response = await fetch('/api/car-body-types');
      const bodyTypes: CarBodyType[] = await response.json();
      setCarBodyTypes(bodyTypes);
      setExpandedYearId(yearId);
      const addedBodyType = bodyTypes.find((bt: CarBodyType) => bt.yearId === yearId && normalizeString(bt.name) === normalizedNew);
      if (addedBodyType) setExpandedBodyTypeId(addedBodyType.id);
    } catch {
      setBodyTypeError('Помилка мережі');
    }
  };

  const handleEditBodyType = (bt: CarBodyType) => {
    setEditingBodyTypeId(bt.id);
    setEditingBodyTypeName(bt.name);
    setBodyTypeError(null);
  };

  const handleSaveEditBodyType = async (bodyTypeId: number, yearId: number) => {
    if (!editingBodyTypeName.trim()) {
      setBodyTypeError('Введіть назву типу кузова');
      return;
    }
    const normalizedEdit = normalizeString(editingBodyTypeName.trim());
    if (carBodyTypes.some((bt) => normalizeString(bt.name) === normalizedEdit && bt.yearId === yearId && bt.id !== bodyTypeId)) {
      setBodyTypeError('Такий тип кузова вже існує для цього року');
      return;
    }
    try {
      const response = await fetch(`/api/car-body-types/${bodyTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingBodyTypeName, yearId }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setBodyTypeError(data?.error || 'Помилка збереження типу кузова');
        return;
      }
      const bodyTypesResponse = await fetch('/api/car-body-types');
      const bodyTypes: CarBodyType[] = await bodyTypesResponse.json();
      setCarBodyTypes(bodyTypes);
      setExpandedYearId(yearId);
      const updated = bodyTypes.find((bt) => bt.id === bodyTypeId);
      if (updated) setExpandedBodyTypeId(bodyTypeId);
      setEditingBodyTypeId(null);
      setEditingBodyTypeName('');
      setBodyTypeError(null);
    } catch {
      setBodyTypeError('Помилка мережі');
    }
  };

  const handleCancelEditBodyType = () => {
    setEditingBodyTypeId(null);
    setEditingBodyTypeName('');
    setBodyTypeError(null);
  };
  const handleDeleteBodyType = async (id: number) => {
    if (!window.confirm('Видалити цей тип кузова?')) return;
    try {
      await fetch(`/api/car-body-types/${id}`, { method: 'DELETE' });
      const response = await fetch('/api/car-body-types');
      const bodyTypes = await response.json();
      setCarBodyTypes(bodyTypes);

      if (expandedBodyTypeId === id) {
        setExpandedBodyTypeId(null);
      }
    } catch (error) {
      console.error('Помилка видалення типу кузова:', error);
    }
  };

  const fetchEnginesForBodyType = async (bodyTypeId: number) => {
    setEnginesLoading((prev) => ({ ...prev, [bodyTypeId]: true }));
    setEnginesError((prev) => ({ ...prev, [bodyTypeId]: null }));
    try {
      const res = await fetch(`/api/car-body-types/${bodyTypeId}/engines`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEnginesError((prev) => ({ ...prev, [bodyTypeId]: data?.error || 'Помилка завантаження двигунів' }));
        setEnginesByBodyType((prev) => ({ ...prev, [bodyTypeId]: [] }));
        return;
      }
      const engines: CarEngine[] = await res.json();
      setEnginesByBodyType((prev) => ({ ...prev, [bodyTypeId]: engines }));
    } catch {
      setEnginesError((prev) => ({ ...prev, [bodyTypeId]: 'Помилка мережі' }));
      setEnginesByBodyType((prev) => ({ ...prev, [bodyTypeId]: [] }));
    } finally {
      setEnginesLoading((prev) => ({ ...prev, [bodyTypeId]: false }));
    }
  };

  const getSortedEngines = (bodyTypeId: number) => {
    const engines = enginesByBodyType[bodyTypeId] || [];
    const dir = engineSortDir[bodyTypeId] || 'asc';
    return [...engines].sort((a, b) => (dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  };

  const handleAddEngine = async (bodyTypeId: number) => {
    setEngineError((prev) => ({ ...prev, [bodyTypeId]: null }));
    const name = (newEngineName[bodyTypeId] || '').trim();
    if (!name) {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Введіть назву двигуна' }));
      return;
    }
    if ((enginesByBodyType[bodyTypeId] || []).some((e) => e.name.trim().toLowerCase() === name.toLowerCase())) {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Такий двигун вже існує для цього типу кузова' }));
      return;
    }
    try {
      const res = await fetch('/api/car-engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bodyTypeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEngineError((prev) => ({ ...prev, [bodyTypeId]: data?.error || 'Помилка створення двигуна' }));
        return;
      }
      setNewEngineName((prev) => ({ ...prev, [bodyTypeId]: '' }));
      await fetchEnginesForBodyType(bodyTypeId);
      setExpandedBodyTypeId(bodyTypeId);
    } catch {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Помилка мережі' }));
    }
  };

  const handleEditEngine = (engine: CarEngine) => {
    setEditingEngineId(engine.id);
    setEditingEngineName(engine.name);
    setEngineError((prev) => ({ ...prev, [engine.bodyTypeId]: null }));
  };

  const handleSaveEditEngine = async (engineId: number, bodyTypeId: number) => {
    const name = editingEngineName.trim();
    if (!name) {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Введіть назву двигуна' }));
      return;
    }
    if ((enginesByBodyType[bodyTypeId] || []).some((e) => e.name.trim().toLowerCase() === name.toLowerCase() && e.id !== engineId)) {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Такий двигун вже існує для цього типу кузова' }));
      return;
    }
    try {
      const res = await fetch(`/api/car-engines/${engineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bodyTypeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEngineError((prev) => ({ ...prev, [bodyTypeId]: data?.error || 'Помилка збереження двигуна' }));
        return;
      }
      setEditingEngineId(null);
      setEditingEngineName('');
      await fetchEnginesForBodyType(bodyTypeId);
      setExpandedBodyTypeId(bodyTypeId);
    } catch {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Помилка мережі' }));
    }
  };

  const handleCancelEditEngine = () => {
    setEditingEngineId(null);
    setEditingEngineName('');
  };

  const handleDeleteEngine = async (engineId: number, bodyTypeId: number) => {
    if (!window.confirm('Видалити цей двигун?')) return;
    try {
      await fetch(`/api/car-engines/${engineId}`, { method: 'DELETE' });
      fetchEnginesForBodyType(bodyTypeId);
    } catch {
      setEngineError((prev) => ({ ...prev, [bodyTypeId]: 'Помилка мережі' }));
    }
  };

  function normalizeString(str: string) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }

  const globalSearch = normalizeString(debouncedSearch.trim());
  const filteredMakes = carMakes.filter((make) => normalizeString(make.name).includes(globalSearch) || carModels.some((model) => model.makeId === make.id && normalizeString(model.name).includes(globalSearch)));

  const sortedMakes = [...filteredMakes].sort((a, b) => {
    return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  const getSortedModels = (makeIdNum: number) => {
    const filteredModels = debouncedSearch.trim() ? carModels.filter((model) => model.makeId === makeIdNum && normalizeString(model.name).includes(normalizeString(debouncedSearch.trim()))) : carModels.filter((model) => model.makeId === makeIdNum);
    return [...filteredModels].sort((a, b) => {
      return modelSortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
  };

  const getSortedYears = (modelIdNum: number) => {
    const filteredYears = carYears.filter((year) => year.modelId === modelIdNum);
    return [...filteredYears].sort((a, b) => {
      return yearSortDir === 'asc' ? a.year - b.year : b.year - a.year;
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-2 sm:p-4 overflow-y-auto' style={{ maxHeight: '100vh' }}>
      <main className='bg-white shadow-xl rounded-2xl p-4 sm:p-8 max-w-full sm:max-w-4xl mx-auto border border-gray-200'>
        <div className='mb-4'>
          <a href='/admin/dashboard' className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-base sm:text-lg transition-colors shadow-sm border border-gray-300'>
            <HiOutlineArrowLeft className='h-5 w-5 text-gray-500' />
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
            Глобальний пошук
          </label>
          <div className='relative'>
            <input id='search' type='text' className='w-full border border-gray-300 rounded-lg px-3 py-2 pl-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm text-base sm:text-lg font-semibold' placeholder='Пошук марки та моделі...' value={search} onChange={(e) => setSearch(e.target.value)} />
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
            placeholder='Нова марка автомобіля'
            className={`border rounded-lg px-3 py-2 flex-1 text-base sm:text-lg font-semibold text-gray-900 bg-white ${makeError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddMake();
              if (e.key === 'Escape') {
                setNewMake('');
                setMakeError(null);
              }
            }}
            aria-invalid={!!makeError}
            aria-describedby={makeError ? 'make-error-text' : undefined}
          />
          <button onClick={handleAddMake} className='bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg w-10 h-10 flex items-center justify-center hover:cursor-pointer transition-colors shadow' title='Додати марку'>
            <HiOutlinePlus className='text-gray-800' size={22} />
          </button>
        </div>
        {makeError && (
          <div id='make-error-text' className='text-red-600 text-sm font-medium mb-2 px-1'>
            {makeError}
          </div>
        )}

        <div className='bg-white rounded-lg shadow border border-gray-200 overflow-y-auto -mx-2 px-2 sm:mx-0 sm:px-0'>
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
            <tbody className={`bg-white divide-y divide-gray-100 block sm:table-row-group ${expandedMakeId === null ? 'max-h-[340px] overflow-y-auto' : ''}`}>
              {sortedMakes.length === 0 ? (
                <tr className='block sm:table-row'>
                  <td colSpan={3} className='px-6 py-4 text-center text-gray-500 font-semibold block sm:table-cell'>
                    Нічого не знайдено
                  </td>
                </tr>
              ) : (
                sortedMakes.map((make) => (
                  <React.Fragment key={make.id}>
                    <tr className={`group ${expandedMakeId === make.id ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer transition-colors duration-100 block sm:table-row mb-2 sm:mb-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none`} onClick={() => setExpandedMakeId(expandedMakeId === make.id ? null : make.id)}>
                      <td className='px-4 py-3 whitespace-nowrap font-semibold text-gray-800 block sm:table-cell'>
                        <span className='sm:hidden text-xs text-gray-500 font-semibold'>ID:</span> {make.id}
                      </td>
                      <td className='px-6 py-3 whitespace-nowrap block sm:table-cell'>
                        <span className='sm:hidden text-xs text-gray-500 font-semibold'>Марка:</span>
                        {editingMakeId === make.id ? (
                          <input
                            type='text'
                            value={editingMakeName}
                            onChange={(e) => setEditingMakeName(e.target.value)}
                            className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${makeError && editingMakeId === make.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditMake(make.id);
                              if (e.key === 'Escape') handleCancelEditMake();
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className='block w-full font-semibold text-gray-900'>{make.name}</span>
                        )}
                      </td>
                      <td className='px-6 py-3 whitespace-nowrap text-right block sm:table-cell'>
                        <span className='sm:hidden text-xs text-gray-500 font-semibold'>Дії:</span>
                        <div className='flex justify-end gap-2'>
                          {editingMakeId === make.id ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEditMake(make.id);
                                }}
                                className='text-green-600 hover:text-green-800 hover:cursor-pointer'
                                title='Зберегти марку'
                              >
                                <HiOutlineCheck size={20} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditMake();
                                }}
                                className='text-gray-600 hover:text-gray-800 hover:cursor-pointer'
                                title='Скасувати редагування'
                              >
                                <HiOutlineX size={20} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMake(make);
                              }}
                              className='text-gray-500 hover:text-gray-700 hover:cursor-pointer'
                              title='Редагувати марку'
                            >
                              <HiOutlinePencil size={20} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMake(make.id);
                            }}
                            className='text-red-600 hover:text-red-800 hover:cursor-pointer'
                            title='Видалити марку'
                          >
                            <HiOutlineTrash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedMakeId === make.id && (
                      <tr>
                        <td colSpan={3} className='p-0'>
                          <div className='bg-blue-50 p-4 border-l-4 border-blue-400 rounded-b-xl'>
                            <h4 className='text-lg font-bold text-blue-700 mb-3'>Моделі {make.name}:</h4>
                            <div className='mb-3 flex gap-2'>
                              <input
                                type='text'
                                value={modelParentMakeId === make.id ? newModelName : ''}
                                onChange={(e) => {
                                  setNewModelName(e.target.value);
                                  setModelError(null);
                                  setModelParentMakeId(make.id);
                                }}
                                placeholder='Нова модель'
                                className={`border rounded-lg px-3 py-2 flex-1 text-base font-semibold text-gray-900 bg-white ${modelError && modelParentMakeId === make.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddModel(make.id);
                                }}
                              />
                              <button onClick={() => handleAddModel(make.id)} className='flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-10 h-10 transition-colors shadow hover:cursor-pointer' title='Додати модель'>
                                <HiOutlinePlus size={22} />
                              </button>
                            </div>
                            {modelError && modelParentMakeId === make.id && <div className='text-red-500 text-sm mb-2'>{modelError}</div>}
                            {getSortedModels(make.id).length === 0 ? (
                              <p className='text-gray-500 text-base font-semibold'>Моделей не знайдено.</p>
                            ) : (
                              <table className='min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow block sm:table'>
                                <thead className='bg-gray-50 hidden sm:table-header-group'>
                                  <tr>
                                    <th
                                      className='px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12 cursor-pointer select-none'
                                      onClick={() => {
                                        if (modelSortBy === 'id') setModelSortDir(modelSortDir === 'asc' ? 'desc' : 'asc');
                                        else {
                                          setModelSortBy('id');
                                          setModelSortDir('asc');
                                        }
                                      }}
                                    >
                                      ID {modelSortBy === 'id' && (modelSortDir === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th
                                      className='px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none'
                                      onClick={() => {
                                        if (modelSortBy === 'name') setModelSortDir(modelSortDir === 'asc' ? 'desc' : 'asc');
                                        else {
                                          setModelSortBy('name');
                                          setModelSortDir('asc');
                                        }
                                      }}
                                    >
                                      Назва {modelSortBy === 'name' && (modelSortDir === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th className='px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-28'>Дії</th>
                                  </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 block sm:table-row-group'>
                                  {getSortedModels(make.id).map((model) => (
                                    <React.Fragment key={model.id}>
                                      <tr
                                        ref={(el) => {
                                          modelRefs.current[model.id] = el;
                                        }}
                                        className={`group ${expandedModelId === model.id ? 'bg-blue-100' : 'hover:bg-blue-50'} cursor-pointer transition-colors duration-100 block sm:table-row mb-2 sm:mb-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none`}
                                        onClick={() => {
                                          const newId = expandedModelId === model.id ? null : model.id;
                                          setExpandedModelId(newId);
                                          if (newId !== null) {
                                            setTimeout(() => {
                                              const el = modelRefs.current[newId];
                                              if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                                              }
                                            }, 100);
                                          }
                                        }}
                                      >
                                        <td className='px-3 py-2 whitespace-nowrap text-base font-semibold text-gray-800 group-hover:bg-blue-200 group-[.bg-blue-100]:bg-blue-100 transition-colors duration-100 block sm:table-cell'>
                                          <span className='sm:hidden text-xs text-gray-500 font-semibold'>ID:</span> {model.id}
                                        </td>
                                        <td className='px-4 py-2 whitespace-nowrap text-base group-hover:bg-blue-200 group-[.bg-blue-100]:bg-blue-100 transition-colors duration-100 block sm:table-cell'>
                                          <span className='sm:hidden text-xs text-gray-500 font-semibold'>Назва:</span>
                                          {editingModelId === model.id ? (
                                            <input
                                              type='text'
                                              value={editingModelName}
                                              onChange={(e) => setEditingModelName(e.target.value)}
                                              className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${modelError && editingModelId === model.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}
                                              autoFocus
                                              placeholder='Введіть назву моделі'
                                              onClick={(e) => e.stopPropagation()}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEditModel(model.id);
                                                if (e.key === 'Escape') handleCancelEditModel();
                                              }}
                                            />
                                          ) : (
                                            <span className='block w-full font-semibold text-gray-800'>{model.name}</span>
                                          )}
                                        </td>
                                        <td className='px-4 py-2 whitespace-nowrap text-base text-right group-hover:bg-blue-200 group-[.bg-blue-100]:bg-blue-100 transition-colors duration-100 block sm:table-cell'>
                                          <span className='sm:hidden text-xs text-gray-500 font-semibold'>Дії:</span>
                                          <div className='flex justify-end gap-2'>
                                            {editingModelId === model.id ? (
                                              <>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveEditModel(model.id);
                                                  }}
                                                  className='text-green-600 hover:text-green-800 hover:cursor-pointer'
                                                  title='Зберегти модель'
                                                >
                                                  <HiOutlineCheck size={20} />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelEditModel();
                                                  }}
                                                  className='text-gray-600 hover:text-gray-800 hover:cursor-pointer'
                                                  title='Скасувати'
                                                >
                                                  <HiOutlineX size={20} />
                                                </button>
                                              </>
                                            ) : (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditModel(model);
                                                }}
                                                className='text-blue-600 hover:text-blue-800 hover:cursor-pointer'
                                                title='Редагувати модель'
                                              >
                                                <HiOutlinePencil size={20} />
                                              </button>
                                            )}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteModel(model.id);
                                              }}
                                              className='text-red-600 hover:text-red-800 hover:cursor-pointer'
                                              title='Видалити модель'
                                            >
                                              <HiOutlineTrash size={20} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                      {expandedModelId === model.id && (
                                        <tr>
                                          <td colSpan={3} className='p-0'>
                                            <div className='bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-b-xl'>
                                              <h5 className='text-lg font-bold text-yellow-700 mb-3'>
                                                Роки {make.name} {model.name}:
                                              </h5>
                                              <div className='mb-3 flex gap-2'>
                                                <input
                                                  type='number'
                                                  min={1970}
                                                  max={currentYear}
                                                  value={newYearValue}
                                                  onChange={(e) => {
                                                    setNewYearValue(e.target.value);
                                                    setYearError(null);
                                                  }}
                                                  placeholder='Новий рік'
                                                  className={`border rounded-lg px-3 py-2 flex-1 text-base font-semibold text-gray-900 bg-white ${yearError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400`}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddYear(model.id);
                                                  }}
                                                />
                                                <button onClick={() => handleAddYear(model.id)} className='flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg w-10 h-10 transition-colors shadow hover:cursor-pointer' title='Додати рік'>
                                                  <HiOutlinePlus size={22} />
                                                </button>
                                              </div>
                                              {yearError && <div className='text-red-500 text-base mb-2'>{yearError}</div>}
                                              {getSortedYears(model.id).length === 0 ? (
                                                <p className='text-gray-500 text-base font-semibold'>Років не знайдено.</p>
                                              ) : (
                                                <table className='min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-sm block sm:table'>
                                                  <thead className='bg-gray-50 hidden sm:table-header-group'>
                                                    <tr>
                                                      <th className='px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10'>ID</th>
                                                      <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none' onClick={() => setYearSortDir(yearSortDir === 'asc' ? 'desc' : 'asc')}>
                                                        Рік {yearSortDir === 'asc' ? '▲' : '▼'}
                                                      </th>
                                                      <th className='px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-24'>Дії</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className='divide-y divide-gray-100 block sm:table-row-group'>
                                                    {getSortedYears(model.id).map((year) => (
                                                      <React.Fragment key={year.id}>
                                                        <tr
                                                          ref={(el) => {
                                                            yearRefs.current[year.id] = el;
                                                          }}
                                                          className={`group ${expandedYearId === year.id ? 'bg-yellow-200' : 'hover:bg-yellow-100'} cursor-pointer transition-colors duration-100 block sm:table-row mb-2 sm:mb-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none`}
                                                          onClick={() => {
                                                            const newId = expandedYearId === year.id ? null : year.id;
                                                            setExpandedYearId(newId);
                                                            if (newId !== null) {
                                                              setTimeout(() => {
                                                                const el = yearRefs.current[newId];
                                                                if (el) {
                                                                  el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                                                                }
                                                              }, 100);
                                                            }
                                                          }}
                                                        >
                                                          <td className='px-3 py-2 whitespace-nowrap text-base font-semibold text-gray-700 group-hover:bg-yellow-300 group-[.bg-yellow-200]:bg-yellow-200 transition-colors duration-100 block sm:table-cell'>
                                                            <span className='sm:hidden text-xs text-gray-500 font-semibold'>ID:</span> {year.id}
                                                          </td>
                                                          <td className='px-4 py-2 whitespace-nowrap text-base group-hover:bg-yellow-300 group-[.bg-yellow-200]:bg-yellow-200 transition-colors duration-100 block sm:table-cell'>
                                                            <span className='sm:hidden text-xs text-gray-500 font-semibold'>Рік:</span>
                                                            {editingYearId === year.id ? (
                                                              <input
                                                                type='number'
                                                                min={1970}
                                                                max={currentYear}
                                                                value={editingYearValue}
                                                                onChange={(e) => setEditingYearValue(e.target.value)}
                                                                className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${yearError && editingYearId === year.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400`}
                                                                autoFocus
                                                                placeholder='Введіть рік'
                                                                onClick={(e) => e.stopPropagation()}
                                                                onKeyDown={(e) => {
                                                                  if (e.key === 'Enter') handleSaveEditYear(year.id);
                                                                  if (e.key === 'Escape') handleCancelEditYear();
                                                                }}
                                                              />
                                                            ) : (
                                                              <span className='block w-full font-semibold text-gray-800'>{year.year}</span>
                                                            )}
                                                          </td>
                                                          <td className='px-4 py-2 whitespace-nowrap text-base text-right group-hover:bg-yellow-300 group-[.bg-yellow-200]:bg-yellow-200 transition-colors duration-100 block sm:table-cell'>
                                                            <span className='sm:hidden text-xs text-gray-500 font-semibold'>Дії:</span>
                                                            <div className='flex justify-end gap-2'>
                                                              {editingYearId === year.id ? (
                                                                <>
                                                                  <button onClick={() => handleSaveEditYear(year.id)} className='text-green-600 hover:text-green-800 hover:cursor-pointer' title='Зберегти рік'>
                                                                    <HiOutlineCheck size={20} />
                                                                  </button>
                                                                  <button onClick={handleCancelEditYear} className='text-gray-600 hover:text-gray-800 hover:cursor-pointer' title='Скасувати'>
                                                                    <HiOutlineX size={20} />
                                                                  </button>
                                                                </>
                                                              ) : (
                                                                <button onClick={() => handleEditYear(year)} className='text-yellow-600 hover:text-yellow-700 hover:cursor-pointer' title='Редагувати рік'>
                                                                  <HiOutlinePencil size={20} />
                                                                </button>
                                                              )}
                                                              <button onClick={() => handleDeleteYear(year.id)} className='text-red-600 hover:text-red-800 hover:cursor-pointer' title='Видалити рік'>
                                                                <HiOutlineTrash size={20} />
                                                              </button>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                        {expandedYearId === year.id && (
                                                          <tr>
                                                            <td colSpan={3} className='p-0'>
                                                              <div className='bg-green-50 p-4 border-l-4 border-green-400 rounded-b-xl'>
                                                                <h6 className='text-lg font-bold text-green-700 mb-3'>
                                                                  Типи кузовів {make.name} {model.name} {year.year}:
                                                                </h6>
                                                                <div className='mb-3 flex gap-2'>
                                                                  <input
                                                                    type='text'
                                                                    value={bodyTypeParentYearId === year.id ? newBodyTypeName : ''}
                                                                    onChange={(e) => {
                                                                      setNewBodyTypeName(e.target.value);
                                                                      setBodyTypeError(null);
                                                                      setBodyTypeParentYearId(year.id);
                                                                    }}
                                                                    placeholder='Новий тип кузова'
                                                                    className={`border rounded-lg px-3 py-2 flex-1 text-base font-semibold text-gray-900 bg-white ${bodyTypeError && bodyTypeParentYearId === year.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-400 focus:border-green-400`}
                                                                    onKeyDown={(e) => {
                                                                      if (e.key === 'Enter') handleAddBodyType(year.id);
                                                                    }}
                                                                  />
                                                                  <button onClick={() => handleAddBodyType(year.id)} className='flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg w-10 h-10 transition-colors shadow hover:cursor-pointer' title='Додати'>
                                                                    <HiOutlinePlus size={22} />
                                                                  </button>
                                                                </div>
                                                                {bodyTypeError && bodyTypeParentYearId === year.id && <div className='text-red-500 text-base mb-2'>{bodyTypeError}</div>}
                                                                {getSortedBodyTypes(year.id).length === 0 ? (
                                                                  <p className='text-gray-500 text-base font-semibold'>Типів кузовів не знайдено.</p>
                                                                ) : (
                                                                  <table className='min-w-full divide-y divide-gray-100 bg-white rounded-xl shadow-xs block sm:table'>
                                                                    <thead className='bg-gray-50 hidden sm:table-header-group'>
                                                                      <tr>
                                                                        <th className='px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8'>ID</th>
                                                                        <th className='px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none' onClick={() => setBodyTypeSortDir(bodyTypeSortDir === 'asc' ? 'desc' : 'asc')}>
                                                                          Назва {bodyTypeSortDir === 'asc' ? '▲' : '▼'}
                                                                        </th>
                                                                        <th className='px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12'>Дії</th>
                                                                      </tr>
                                                                    </thead>
                                                                    <tbody className='divide-y divide-gray-50 block sm:table-row-group'>
                                                                      {getSortedBodyTypes(year.id).map((bt) => (
                                                                        <React.Fragment key={bt.id}>
                                                                          <tr
                                                                            ref={(el) => {
                                                                              bodyTypeRefs.current[bt.id] = el;
                                                                            }}
                                                                            className={`group ${expandedBodyTypeId === bt.id ? 'bg-green-100' : ''} hover:bg-green-100 transition-colors duration-100 block sm:table-row mb-0 sm:mb-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none hover:cursor-pointer`}
                                                                            onClick={() => {
                                                                              const newId = expandedBodyTypeId === bt.id ? null : bt.id;
                                                                              setExpandedBodyTypeId(newId);
                                                                              if (newId !== null) {
                                                                                setTimeout(() => {
                                                                                  const el = bodyTypeRefs.current[newId];
                                                                                  if (el) {
                                                                                    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                                                                                  }
                                                                                }, 100);
                                                                              }
                                                                            }}
                                                                          >
                                                                            <td className='px-3 py-2 whitespace-nowrap text-base font-semibold text-gray-700 block sm:table-cell'>
                                                                              <span className='sm:hidden text-xs text-gray-500 font-semibold'>ID:</span> {bt.id}
                                                                            </td>
                                                                            <td className='px-4 py-2 whitespace-nowrap text-base text-gray-900 block sm:table-cell'>
                                                                              <span className='sm:hidden text-xs text-gray-500 font-semibold'>Назва:</span>
                                                                              {editingBodyTypeId === bt.id ? (
                                                                                <input
                                                                                  type='text'
                                                                                  value={editingBodyTypeName}
                                                                                  onChange={(e) => setEditingBodyTypeName(e.target.value)}
                                                                                  className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${bodyTypeError && editingBodyTypeId === bt.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-400 focus:border-green-400`}
                                                                                  autoFocus
                                                                                  placeholder='Введіть тип кузова'
                                                                                  onClick={(e) => e.stopPropagation()}
                                                                                  onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') handleSaveEditBodyType(bt.id, year.id);
                                                                                    if (e.key === 'Escape') handleCancelEditBodyType();
                                                                                  }}
                                                                                />
                                                                              ) : (
                                                                                <span className='block w-full font-semibold text-gray-900'>{bt.name}</span>
                                                                              )}
                                                                            </td>
                                                                            <td className='px-4 py-2 whitespace-nowrap text-base text-right block sm:table-cell'>
                                                                              <span className='sm:hidden text-xs text-gray-500 font-semibold'>Дії:</span>
                                                                              <div className='flex justify-end gap-2'>
                                                                                {editingBodyTypeId === bt.id ? (
                                                                                  <>
                                                                                    <button onClick={() => handleSaveEditBodyType(bt.id, year.id)} className='text-green-600 hover:text-green-800 hover:cursor-pointer' title='Зберегти тип кузова'>
                                                                                      <HiOutlineCheck size={20} />
                                                                                    </button>
                                                                                    <button onClick={handleCancelEditBodyType} className='text-gray-600 hover:text-gray-800 hover:cursor-pointer' title='Скасувати'>
                                                                                      <HiOutlineX size={20} />
                                                                                    </button>
                                                                                  </>
                                                                                ) : (
                                                                                  <button onClick={() => handleEditBodyType(bt)} className='text-green-600 hover:text-green-800 hover:cursor-pointer' title='Редагувати тип кузова'>
                                                                                    <HiOutlinePencil size={20} />
                                                                                  </button>
                                                                                )}
                                                                                <button onClick={() => handleDeleteBodyType(bt.id)} className='text-red-600 hover:text-red-800 hover:cursor-pointer' title='Видалити тип кузова'>
                                                                                  <HiOutlineTrash size={20} />
                                                                                </button>
                                                                              </div>
                                                                            </td>
                                                                          </tr>
                                                                          {expandedBodyTypeId === bt.id && (
                                                                            <tr>
                                                                              <td colSpan={3} className='p-0'>
                                                                                <div className='bg-teal-50 p-4 border-l-4 border-teal-400 rounded-b-xl'>
                                                                                  <h6 className='text-base font-bold text-teal-700 mb-3'>
                                                                                    Двигуни {make.name} {model.name} {year.year} {bt.name}:
                                                                                  </h6>
                                                                                  <div className='mb-3 flex gap-2'>
                                                                                    <input
                                                                                      type='text'
                                                                                      value={newEngineName[bt.id] || ''}
                                                                                      onChange={(event) => setNewEngineName((prev) => ({ ...prev, [bt.id]: event.target.value }))}
                                                                                      placeholder='Новий двигун'
                                                                                      className={`border rounded-lg px-3 py-2 flex-1 text-base font-semibold text-gray-900 bg-white ${engineError[bt.id] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-teal-400 focus:border-teal-400`}
                                                                                      onKeyDown={(event) => {
                                                                                        if (event.key === 'Enter') handleAddEngine(bt.id);
                                                                                      }}
                                                                                    />
                                                                                    <button onClick={() => handleAddEngine(bt.id)} className='flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-lg w-10 h-10 transition-colors shadow hover:cursor-pointer' title='Додати'>
                                                                                      <HiOutlinePlus size={22} />
                                                                                    </button>
                                                                                  </div>
                                                                                  {engineError[bt.id] && <div className='text-red-500 text-base mt-1'>{engineError[bt.id]}</div>}
                                                                                  {enginesLoading[bt.id] ? (
                                                                                    <div className='text-teal-700 text-base'>Завантаження...</div>
                                                                                  ) : enginesError[bt.id] ? (
                                                                                    <div className='text-red-500 text-base'>{enginesError[bt.id]}</div>
                                                                                  ) : (
                                                                                    <div>
                                                                                      {getSortedEngines(bt.id).length === 0 ? (
                                                                                        <p className='text-gray-500 text-base font-semibold'>Двигунів не знайдено.</p>
                                                                                      ) : (
                                                                                        <table className='min-w-full divide-y divide-gray-100 bg-white rounded-xl shadow-xs block sm:table'>
                                                                                          <thead className='bg-gray-50 hidden sm:table-header-group'>
                                                                                            <tr>
                                                                                              <th className='px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8'>ID</th>
                                                                                              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none' onClick={() => setEngineSortDir((prev) => ({ ...prev, [bt.id]: (prev[bt.id] || 'asc') === 'asc' ? 'desc' : 'asc' }))}>
                                                                                                Назва {(engineSortDir[bt.id] || 'asc') === 'asc' ? '▲' : '▼'}
                                                                                              </th>
                                                                                              <th className='px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12'>Дії</th>
                                                                                            </tr>
                                                                                          </thead>
                                                                                          <tbody className='divide-y divide-gray-50 block sm:table-row-group'>
                                                                                            {getSortedEngines(bt.id).map((engine) => (
                                                                                              <tr
                                                                                                key={engine.id}
                                                                                                ref={(el) => {
                                                                                                  engineRefs.current[engine.id] = el;
                                                                                                }}
                                                                                                className={`group ${editingEngineId === engine.id ? 'bg-teal-100' : ''} hover:bg-teal-100 transition-colors duration-100 block sm:table-row mb-2 sm:mb-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none hover:cursor-pointer`}
                                                                                              >
                                                                                                <td className='px-3 py-2 whitespace-nowrap text-base font-semibold text-gray-700 block sm:table-cell'>
                                                                                                  <span className='sm:hidden text-xs text-gray-500 font-semibold'>ID:</span> {engine.id}
                                                                                                </td>
                                                                                                <td className='px-4 py-2 whitespace-nowrap text-base text-gray-900 block sm:table-cell'>
                                                                                                  <span className='sm:hidden text-xs text-gray-500 font-semibold'>Назва:</span>
                                                                                                  {editingEngineId === engine.id ? (
                                                                                                    <input
                                                                                                      type='text'
                                                                                                      value={editingEngineName}
                                                                                                      onChange={(e) => setEditingEngineName(e.target.value)}
                                                                                                      className={`border rounded-lg px-3 py-2 w-full text-base font-semibold text-gray-900 bg-white ${engineError[bt.id] && editingEngineId === engine.id ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-teal-400 focus:border-teal-400`}
                                                                                                      autoFocus
                                                                                                      placeholder='Введіть назву двигуна'
                                                                                                      onClick={(e) => e.stopPropagation()}
                                                                                                      onKeyDown={(e) => {
                                                                                                        if (e.key === 'Enter') handleSaveEditEngine(engine.id, bt.id);
                                                                                                        if (e.key === 'Escape') handleCancelEditEngine();
                                                                                                      }}
                                                                                                    />
                                                                                                  ) : (
                                                                                                    <span className='block w-full font-semibold text-gray-900'>{engine.name}</span>
                                                                                                  )}
                                                                                                </td>
                                                                                                <td className='px-4 py-2 whitespace-nowrap text-base text-right block sm:table-cell'>
                                                                                                  <span className='sm:hidden text-xs text-gray-500 font-semibold'>Дії:</span>
                                                                                                  <div className='flex justify-end gap-2'>
                                                                                                    {editingEngineId === engine.id ? (
                                                                                                      <>
                                                                                                        <button onClick={() => handleSaveEditEngine(engine.id, bt.id)} className='text-teal-600 hover:text-teal-800 hover:cursor-pointer' title='Зберегти двигун'>
                                                                                                          <HiOutlineCheck size={20} />
                                                                                                        </button>
                                                                                                        <button onClick={handleCancelEditEngine} className='text-gray-600 hover:text-gray-800 hover:cursor-pointer' title='Скасувати'>
                                                                                                          <HiOutlineX size={20} />
                                                                                                        </button>
                                                                                                      </>
                                                                                                    ) : (
                                                                                                      <button onClick={() => handleEditEngine(engine)} className='text-teal-600 hover:text-teal-800 hover:cursor-pointer' title='Редагувати двигун'>
                                                                                                        <HiOutlinePencil size={20} />
                                                                                                      </button>
                                                                                                    )}
                                                                                                    <button onClick={() => handleDeleteEngine(engine.id, bt.id)} className='text-red-600 hover:text-red-800 hover:cursor-pointer' title='Видалити двигун'>
                                                                                                      <HiOutlineTrash size={20} />
                                                                                                    </button>
                                                                                                  </div>
                                                                                                </td>
                                                                                              </tr>
                                                                                            ))}
                                                                                          </tbody>
                                                                                        </table>
                                                                                      )}
                                                                                    </div>
                                                                                  )}
                                                                                </div>
                                                                              </td>
                                                                            </tr>
                                                                          )}
                                                                        </React.Fragment>
                                                                      ))}
                                                                    </tbody>
                                                                  </table>
                                                                )}
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        )}
                                                      </React.Fragment>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
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
        </div>
      </main>
    </div>
  );
}
