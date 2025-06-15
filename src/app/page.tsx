'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { HiSearch, HiTag } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';

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

interface Category {
  id: number;
  name: string;
  description?: string;
  children: Category[];
  parent?: {
    id: number;
    name: string;
  };
}

interface SavedCarSelection {
  makeId: number;
  makeName: string;
  modelId: number;
  modelName: string;
  yearId: number;
  year: number;
  bodyTypeId: number;
  bodyTypeName: string;
  engineId: number;
  engineName: string;
}

export default function Home() {
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [carYears, setCarYears] = useState<CarYear[]>([]);
  const [carBodyTypes, setCarBodyTypes] = useState<CarBodyType[]>([]);
  const [carEngines, setCarEngines] = useState<CarEngine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedMake, setSelectedMake] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<number | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [savedCar, setSavedCar] = useState<SavedCarSelection | null>(null);

  useEffect(() => {
    const savedCarData = localStorage.getItem('selectedCar');
    if (savedCarData) {
      try {
        const car = JSON.parse(savedCarData) as SavedCarSelection;
        setSavedCar(car);
        setSelectedMake(car.makeId);
        setSelectedModel(car.modelId);
        setSelectedYear(car.yearId);
        setSelectedBodyType(car.bodyTypeId);
        setSelectedEngine(car.engineId);
      } catch (error) {
        console.error('Помилка завантаження збереженого автомобіля:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [makesRes, categoriesRes] = await Promise.all([fetch('/api/car-makes'), fetch('/api/categories')]);

        if (makesRes.ok) {
          const makes = await makesRes.json();
          setCarMakes(makes);
        }
        if (categoriesRes.ok) {
          const cats = await categoriesRes.json();
          setCategories(cats);
        }
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedMake) {
      fetch(`/api/car-models?makeId=${selectedMake}`)
        .then((res) => res.json())
        .then((models) => {
          setCarModels(models);
          if (!models.find((m: CarModel) => m.id === selectedModel)) {
            setSelectedModel(null);
            setSelectedYear(null);
            setSelectedBodyType(null);
            setSelectedEngine(null);
          }
        })
        .catch((error) => console.error('Помилка завантаження моделей:', error));
    } else {
      setCarModels([]);
      setSelectedModel(null);
    }
  }, [selectedMake, selectedModel]);

  useEffect(() => {
    if (selectedModel) {
      fetch(`/api/car-years?modelId=${selectedModel}`)
        .then((res) => res.json())
        .then((years) => {
          setCarYears(years);
          if (!years.find((y: CarYear) => y.id === selectedYear)) {
            setSelectedYear(null);
            setSelectedBodyType(null);
            setSelectedEngine(null);
          }
        })
        .catch((error) => console.error('Помилка завантаження років:', error));
    } else {
      setCarYears([]);
      setSelectedYear(null);
    }
  }, [selectedModel, selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      fetch(`/api/car-body-types?yearId=${selectedYear}`)
        .then((res) => res.json())
        .then((bodyTypes) => {
          setCarBodyTypes(bodyTypes);
          if (!bodyTypes.find((bt: CarBodyType) => bt.id === selectedBodyType)) {
            setSelectedBodyType(null);
            setSelectedEngine(null);
          }
        })
        .catch((error) => console.error('Помилка завантаження типів кузова:', error));
    } else {
      setCarBodyTypes([]);
      setSelectedBodyType(null);
    }
  }, [selectedYear, selectedBodyType]);

  useEffect(() => {
    if (selectedBodyType) {
      fetch(`/api/car-engines?bodyTypeId=${selectedBodyType}`)
        .then((res) => res.json())
        .then((engines) => {
          setCarEngines(engines);
          if (!engines.find((e: CarEngine) => e.id === selectedEngine)) {
            setSelectedEngine(null);
          }
        })
        .catch((error) => console.error('Помилка завантаження двигунів:', error));
    } else {
      setCarEngines([]);
      setSelectedEngine(null);
    }
  }, [selectedBodyType, selectedEngine]);

  const saveCarSelection = useCallback(() => {
    if (selectedMake && selectedModel && selectedYear && selectedBodyType && selectedEngine) {
      const make = carMakes.find((m) => m.id === selectedMake);
      const model = carModels.find((m) => m.id === selectedModel);
      const year = carYears.find((y) => y.id === selectedYear);
      const bodyType = carBodyTypes.find((bt) => bt.id === selectedBodyType);
      const engine = carEngines.find((e) => e.id === selectedEngine);

      if (make && model && year && bodyType && engine) {
        const carSelection: SavedCarSelection = {
          makeId: make.id,
          makeName: make.name,
          modelId: model.id,
          modelName: model.name,
          yearId: year.id,
          year: year.year,
          bodyTypeId: bodyType.id,
          bodyTypeName: bodyType.name,
          engineId: engine.id,
          engineName: engine.name,
        };

        localStorage.setItem('selectedCar', JSON.stringify(carSelection));
        setSavedCar(carSelection);

        alert('Автомобіль збережено! Тепер ви можете переглядати товари, сумісні з вашим авто.');
      }
    }
  }, [selectedMake, selectedModel, selectedYear, selectedBodyType, selectedEngine, carMakes, carModels, carYears, carBodyTypes, carEngines]);

  const clearCarSelection = useCallback(() => {
    localStorage.removeItem('selectedCar');
    setSavedCar(null);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedBodyType(null);
    setSelectedEngine(null);
  }, []);

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Завантаження...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />{' '}
      <main className='flex-grow'>
        <section className='py-8 sm:py-12 bg-white'>
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-8'>
              {' '}
              <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2'>
                <FaCar className='text-blue-600' />
                Оберіть ваш автомобіль
              </h2>
              <p className='text-gray-600 max-w-2xl mx-auto'>Вкажіть марку, модель та характеристики вашого автомобіля для підбору сумісних запчастин</p>
            </div>

            {savedCar && (
              <div className='mb-8 p-4 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                  <div className='text-center sm:text-left'>
                    <p className='text-green-800 font-semibold'>Обраний автомобіль:</p>
                    <p className='text-green-700'>
                      {savedCar.makeName} {savedCar.modelName} {savedCar.year} ({savedCar.bodyTypeName}, {savedCar.engineName})
                    </p>
                  </div>
                  <button onClick={clearCarSelection} className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer'>
                    Видалити
                  </button>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Марка</label>
                <select value={selectedMake || ''} onChange={(e) => setSelectedMake(e.target.value ? Number(e.target.value) : null)} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'>
                  <option value=''>Оберіть марку</option>
                  {carMakes.map((make) => (
                    <option key={make.id} value={make.id}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Модель</label>
                <select value={selectedModel || ''} onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : null)} disabled={!selectedMake || carModels.length === 0} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed'>
                  <option value=''>Оберіть модель</option>
                  {carModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Рік</label>
                <select value={selectedYear || ''} onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)} disabled={!selectedModel || carYears.length === 0} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed'>
                  <option value=''>Оберіть рік</option>
                  {carYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Кузов</label>
                <select value={selectedBodyType || ''} onChange={(e) => setSelectedBodyType(e.target.value ? Number(e.target.value) : null)} disabled={!selectedYear || carBodyTypes.length === 0} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed'>
                  <option value=''>Оберіть кузов</option>
                  {carBodyTypes.map((bodyType) => (
                    <option key={bodyType.id} value={bodyType.id}>
                      {bodyType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Двигун</label>
                <select value={selectedEngine || ''} onChange={(e) => setSelectedEngine(e.target.value ? Number(e.target.value) : null)} disabled={!selectedBodyType || carEngines.length === 0} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed'>
                  <option value=''>Оберіть двигун</option>
                  {carEngines.map((engine) => (
                    <option key={engine.id} value={engine.id}>
                      {engine.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='text-center'>
              <button onClick={saveCarSelection} disabled={!selectedMake || !selectedModel || !selectedYear || !selectedBodyType || !selectedEngine} className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg cursor-pointer'>
                Зберегти вибір автомобіля
              </button>
            </div>
          </div>
        </section>{' '}
        <section className='py-8 sm:py-12 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2'>
                <HiTag className='text-blue-600' />
                Категорії товарів
              </h2>
              <p className='text-gray-600 max-w-2xl mx-auto'>Оберіть категорію для перегляду асортименту автозапчастин</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              {categories
                .filter((category) => !category.parent)
                .map((category) => (
                  <div key={category.id} className='bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group'>
                    <Link href={`/products?category=${encodeURIComponent(category.name)}`} className='block p-6 text-center border-b border-gray-100 group-hover:bg-blue-50 transition-colors'>
                      <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors'>
                        <HiTag className='w-8 h-8 text-blue-600' />
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors'>{category.name}</h3>
                      {category.description && <p className='text-gray-600 text-sm mb-2'>{category.description}</p>}
                      {category.children.length > 0 && <p className='text-blue-600 text-xs font-medium'>{category.children.length} підкатегорій</p>}
                    </Link>

                    {category.children.length > 0 && (
                      <div className='p-4 bg-gray-50'>
                        <div className='grid grid-cols-1 gap-2'>
                          {category.children.slice(0, 4).map((child) => (
                            <Link key={child.id} href={`/products?category=${encodeURIComponent(child.name)}`} className='text-sm text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-md transition-all duration-150 flex items-center justify-between group/child'>
                              <span>{child.name}</span>
                              <svg className='w-4 h-4 text-gray-400 group-hover/child:text-blue-600 transition-colors' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                              </svg>
                            </Link>
                          ))}
                          {category.children.length > 4 && (
                            <Link href={`/products?category=${encodeURIComponent(category.name)}`} className='text-sm text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md transition-colors font-medium text-center bg-blue-50 hover:bg-blue-100'>
                              Переглянути всі ({category.children.length})
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className='text-center'>
              <Link href='/products' className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg inline-flex items-center gap-2'>
                <HiSearch />
                Переглянути всі товари
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
