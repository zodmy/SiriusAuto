'use client';

import { useCallback, useEffect, useState } from 'react';
import { HiOutlineShoppingBag, HiOutlineTrash, HiOutlineSearch, HiOutlineArrowLeft, HiOutlinePlus, HiOutlinePencil } from 'react-icons/hi';
import { LuCar } from 'react-icons/lu';
import { useAdminAuth } from '@/lib/components/AdminAuthProvider';
import ImageManager from '@/components/ImageManager';
import Image from 'next/image';
import React from 'react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stockQuantity: number;
  imageUrl: string | null;
  categoryId: number;
  manufacturerId: number;
  isVariant: boolean;
  baseProductId: number | null;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  baseProduct?: {
    id: number;
    name: string;
  } | null;
  compatibleVehicles?: Compatibility[];
}

interface Compatibility {
  id: number;
  carMake: {
    id: number;
    name: string;
  };
  carModel: {
    id: number;
    name: string;
  };
  carYear: {
    id: number;
    year: number;
  };
  carBodyType: {
    id: number;
    name: string;
  };
  carEngine: {
    id: number;
    name: string;
  };
}

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
}

interface Manufacturer {
  id: number;
  name: string;
}

const ProductSkeleton = () => (
  <div className='animate-pulse'>
    <div className='hidden sm:block'>
      <table className='w-full divide-y divide-gray-200 table-fixed'>
        <thead className='bg-gray-100'>
          <tr>
            <th className='px-2 py-3 text-left w-12'>
              <div className='h-4 bg-gray-300 rounded w-8'></div>
            </th>
            <th className='px-2 py-3 text-left w-16'>
              <div className='h-4 bg-gray-300 rounded w-12'></div>
            </th>
            <th className='px-3 py-3 text-left w-1/4'>
              <div className='h-4 bg-gray-300 rounded w-16'></div>
            </th>
            <th className='px-3 py-3 text-left w-20'>
              <div className='h-4 bg-gray-300 rounded w-12'></div>
            </th>
            <th className='px-3 py-3 text-left w-16'>
              <div className='h-4 bg-gray-300 rounded w-16'></div>
            </th>
            <th className='px-3 py-3 text-left w-1/6'>
              <div className='h-4 bg-gray-300 rounded w-16'></div>
            </th>
            <th className='px-3 py-3 text-left w-1/6'>
              <div className='h-4 bg-gray-300 rounded w-16'></div>
            </th>
            <th className='px-3 py-3 text-right w-24'>
              <div className='h-4 bg-gray-300 rounded w-12 ml-auto'></div>
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-100'>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className='hover:bg-gray-50'>
              <td className='px-2 py-3'>
                <div className='h-4 bg-gray-300 rounded w-8'></div>
              </td>
              <td className='px-2 py-3'>
                <div className='h-10 w-10 bg-gray-300 rounded mx-auto'></div>
              </td>
              <td className='px-3 py-3'>
                <div className='h-4 bg-gray-300 rounded w-full mb-1'></div>
                <div className='h-3 bg-gray-300 rounded w-3/4'></div>
              </td>
              <td className='px-3 py-3'>
                <div className='h-4 bg-gray-300 rounded w-16'></div>
              </td>
              <td className='px-3 py-3'>
                <div className='h-4 bg-gray-300 rounded w-12'></div>
              </td>
              <td className='px-3 py-3'>
                <div className='h-4 bg-gray-300 rounded w-full'></div>
              </td>
              <td className='px-3 py-3'>
                <div className='h-4 bg-gray-300 rounded w-full'></div>
              </td>
              <td className='px-3 py-3 text-right'>
                <div className='flex justify-end gap-1'>
                  <div className='h-4 w-4 bg-gray-300 rounded'></div>
                  <div className='h-4 w-4 bg-gray-300 rounded'></div>
                  <div className='h-4 w-4 bg-gray-300 rounded'></div>
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
              <div className='h-3 bg-gray-300 rounded w-20 mb-1'></div>
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

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  manufacturerId: string;
  isVariant: boolean;
  baseProductId: string;
  imageFile: File | null;
  compatibilities: Array<{
    carMakeId: string;
    carModelId: string;
    carYearId: string;
    carBodyTypeId: string;
    carEngineId: string;
  }>;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  manufacturerId: '',
  isVariant: false,
  baseProductId: '',
  imageFile: null,
  compatibilities: [],
};

export default function ManageProductsPage() {
  const { isAdmin, isLoading: isVerifyingAuth } = useAdminAuth();

  const normalizeString = useCallback((str: string) => {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [carYears, setCarYears] = useState<CarYear[]>([]);
  const [carBodyTypes, setCarBodyTypes] = useState<CarBodyType[]>([]);
  const [carEngines, setCarEngines] = useState<CarEngine[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ProductFormData>(initialFormData);
  const [editError, setEditError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'price' | 'stockQuantity' | 'category' | 'manufacturer'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [managingCompatibilityId, setManagingCompatibilityId] = useState<number | null>(null);
  const [compatibilityFormData, setCompatibilityFormData] = useState({
    carMakeId: '',
    carModelId: '',
    carYearId: '',
    carBodyTypeId: '',
    carEngineId: '',
  });
  const [newProductCompatibilityData, setNewProductCompatibilityData] = useState({
    carMakeId: '',
    carModelId: '',
    carYearId: '',
    carBodyTypeId: '',
    carEngineId: '',
  });
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити товари');
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Помилка завантаження товарів:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    }
  }, []);
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
    }
  }, []);
  const fetchCarMakes = useCallback(async () => {
    try {
      const res = await fetch('/api/car-makes');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити марки автомобілів');
      }
      const data = await res.json();
      setCarMakes(data);
    } catch (error) {
      console.error('Помилка завантаження марок автомобілів:', error);
    }
  }, []);

  const fetchAllCarModels = useCallback(async () => {
    try {
      const res = await fetch('/api/car-models');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити моделі автомобілів');
      }
      const data = await res.json();
      setCarModels(data);
    } catch (error) {
      console.error('Помилка завантаження моделей автомобілів:', error);
    }
  }, []);

  const fetchAllCarYears = useCallback(async () => {
    try {
      const res = await fetch('/api/car-years');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити роки автомобілів');
      }
      const data = await res.json();
      setCarYears(data);
    } catch (error) {
      console.error('Помилка завантаження років автомобілів:', error);
    }
  }, []);

  const fetchAllCarBodyTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/car-body-types');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити типи кузова');
      }
      const data = await res.json();
      setCarBodyTypes(data);
    } catch (error) {
      console.error('Помилка завантаження типів кузова:', error);
    }
  }, []);
  const fetchAllCarEngines = useCallback(async () => {
    try {
      const res = await fetch('/api/car-engines');
      if (!res.ok) {
        throw new Error('Не вдалося завантажити двигуни');
      }
      const data = await res.json();
      setCarEngines(data);
    } catch (error) {
      console.error('Помилка завантаження двигунів:', error);
    }
  }, []);
  useEffect(() => {
    const loadData = async () => {
      if (!isAdmin || isVerifyingAuth) return;

      await Promise.all([fetchProducts(), fetchCategories(), fetchManufacturers(), fetchCarMakes(), fetchAllCarModels(), fetchAllCarYears(), fetchAllCarBodyTypes(), fetchAllCarEngines()]);
    };

    loadData();
  }, [isAdmin, isVerifyingAuth, fetchProducts, fetchCategories, fetchManufacturers, fetchCarMakes, fetchAllCarModels, fetchAllCarYears, fetchAllCarBodyTypes, fetchAllCarEngines]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const getFilteredProducts = useCallback(() => {
    const searchTerm = normalizeString(debouncedSearch.trim());

    let filtered = products;

    if (searchTerm) {
      filtered = products.filter((product) => normalizeString(product.name).includes(searchTerm) || normalizeString(product.category.name).includes(searchTerm) || normalizeString(product.manufacturer.name).includes(searchTerm) || (product.description && normalizeString(product.description).includes(searchTerm)));
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'id') {
        return sortDir === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortBy === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortDir === 'asc' ? parseFloat(a.price) - parseFloat(b.price) : parseFloat(b.price) - parseFloat(a.price);
      } else if (sortBy === 'stockQuantity') {
        return sortDir === 'asc' ? a.stockQuantity - b.stockQuantity : b.stockQuantity - a.stockQuantity;
      } else if (sortBy === 'category') {
        return sortDir === 'asc' ? a.category.name.localeCompare(b.category.name) : b.category.name.localeCompare(a.category.name);
      } else if (sortBy === 'manufacturer') {
        return sortDir === 'asc' ? a.manufacturer.name.localeCompare(b.manufacturer.name) : b.manufacturer.name.localeCompare(a.manufacturer.name);
      }
      return 0;
    });
  }, [products, debouncedSearch, sortBy, sortDir, normalizeString]);
  const validateFormData = (data: ProductFormData): string | null => {
    if (!data.name.trim()) return 'Введіть назву товару';
    if (!data.price.trim()) return 'Введіть ціну товару';
    if (isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) return 'Ціна повинна бути позитивним числом';
    if (!data.stockQuantity.trim()) return 'Введіть кількість на складі';
    if (isNaN(parseInt(data.stockQuantity)) || parseInt(data.stockQuantity) < 0) return "Кількість повинна бути невід'ємним числом";
    if (!data.categoryId) return 'Оберіть категорію';
    if (!data.manufacturerId) return 'Оберіть виробника';
    if (data.isVariant && !data.baseProductId) return 'Для варіанту оберіть базовий товар';

    if (data.imageFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.imageFile.type)) {
        return 'Непідтримуваний тип файлу зображення. Дозволені: JPEG, PNG, WebP';
      }
      const maxSize = 10 * 1024 * 1024;
      if (data.imageFile.size > maxSize) {
        return 'Розмір файлу зображення перевищує 10MB';
      }
    }

    return null;
  };
  const handleAddProduct = useCallback(async () => {
    setCreateError(null);
    const validationError = validateFormData(formData);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId),
        manufacturerId: parseInt(formData.manufacturerId),
        isVariant: formData.isVariant,
        baseProductId: formData.isVariant && formData.baseProductId ? parseInt(formData.baseProductId) : null,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data?.error || 'Помилка створення товару');
        return;
      }

      const newProduct = await res.json();
      if (formData.compatibilities.length > 0) {
        for (const compatibility of formData.compatibilities) {
          const compatibilityData = {
            productId: newProduct.id,
            carMakeId: parseInt(compatibility.carMakeId),
            carModelId: compatibility.carModelId ? parseInt(compatibility.carModelId) : undefined,
            carYearId: compatibility.carYearId ? parseInt(compatibility.carYearId) : undefined,
            carBodyTypeId: compatibility.carBodyTypeId ? parseInt(compatibility.carBodyTypeId) : undefined,
            carEngineId: compatibility.carEngineId ? parseInt(compatibility.carEngineId) : undefined,
          };

          await fetch('/api/compatibilities/hierarchical', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(compatibilityData),
          });
        }
      }

      if (formData.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.imageFile);

        const imageRes = await fetch(`/api/products/${newProduct.id}/image`, {
          method: 'POST',
          body: imageFormData,
        });

        if (!imageRes.ok) {
          console.warn('Товар створено, але зображення не вдалося завантажити');
        }
      }

      setFormData(initialFormData);
      setShowCreateForm(false);
      await fetchProducts();
    } catch {
      setCreateError('Помилка мережі');
    }
  }, [formData, fetchProducts]);
  const handleEditProduct = useCallback((product: Product) => {
    setEditingProductId(product.id);
    setEditFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.categoryId.toString(),
      manufacturerId: product.manufacturerId.toString(),
      isVariant: product.isVariant,
      baseProductId: product.baseProductId?.toString() || '',
      imageFile: null,
      compatibilities: [],
    });
    setEditError(null);
  }, []);
  const handleCancelEdit = useCallback(() => {
    setEditingProductId(null);
    setEditFormData(initialFormData);
    setEditError(null);
  }, []);

  const handleSaveEditProduct = useCallback(
    async (id: number) => {
      setEditError(null);
      const validationError = validateFormData(editFormData);
      if (validationError) {
        setEditError(validationError);
        return;
      }

      try {
        const productData = {
          name: editFormData.name.trim(),
          description: editFormData.description.trim() || null,
          price: parseFloat(editFormData.price),
          stockQuantity: parseInt(editFormData.stockQuantity),
          categoryId: parseInt(editFormData.categoryId),
          manufacturerId: parseInt(editFormData.manufacturerId),
          isVariant: editFormData.isVariant,
          baseProductId: editFormData.isVariant && editFormData.baseProductId ? parseInt(editFormData.baseProductId) : null,
        };

        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEditError(data?.error || 'Помилка редагування товару');
          return;
        }

        setEditingProductId(null);
        setEditFormData(initialFormData);
        await fetchProducts();
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [editFormData, fetchProducts]
  );
  const handleDeleteProduct = useCallback(
    async (id: number) => {
      if (!window.confirm('Видалити цей товар?')) return;

      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEditError(data?.error || 'Помилка видалення товару');
          return;
        }

        await fetchProducts();
      } catch {
        setEditError('Помилка мережі');
      }
    },
    [fetchProducts]
  );

  const handleManageCompatibility = useCallback((productId: number) => {
    setManagingCompatibilityId(productId);
    setCompatibilityFormData({
      carMakeId: '',
      carModelId: '',
      carYearId: '',
      carBodyTypeId: '',
      carEngineId: '',
    });
  }, []);
  const handleAddCompatibility = useCallback(
    async (productId: number) => {
      try {
        const compatibilityData = {
          productId,
          carMakeId: parseInt(compatibilityFormData.carMakeId),
          carModelId: compatibilityFormData.carModelId ? parseInt(compatibilityFormData.carModelId) : undefined,
          carYearId: compatibilityFormData.carYearId ? parseInt(compatibilityFormData.carYearId) : undefined,
          carBodyTypeId: compatibilityFormData.carBodyTypeId ? parseInt(compatibilityFormData.carBodyTypeId) : undefined,
          carEngineId: compatibilityFormData.carEngineId ? parseInt(compatibilityFormData.carEngineId) : undefined,
        };

        const res = await fetch('/api/compatibilities/hierarchical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(compatibilityData),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error('Помилка додавання сумісності:', data?.error);
          return;
        }

        const result = await res.json();
        console.log(`Створено ${result.created} записів сумісності з ${result.total} можливих`);

        await fetchProducts();

        setCompatibilityFormData({
          carMakeId: '',
          carModelId: '',
          carYearId: '',
          carBodyTypeId: '',
          carEngineId: '',
        });
      } catch (error) {
        console.error('Помилка мережі при додаванні сумісності:', error);
      }
    },
    [compatibilityFormData, fetchProducts]
  );
  const handleDeleteCompatibility = useCallback(
    async (compatibilityId: number) => {
      if (!window.confirm('Видалити цю сумісність?')) return;

      try {
        const res = await fetch(`/api/compatibilities/${compatibilityId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          console.error('Помилка видалення сумісності');
          return;
        }

        await fetchProducts();
      } catch (error) {
        console.error('Помилка мережі при видаленні сумісності:', error);
      }
    },
    [fetchProducts]
  );
  const handleAddCompatibilityToNewProduct = useCallback(() => {
    if (!newProductCompatibilityData.carMakeId) return;

    const newCompatibility = {
      carMakeId: newProductCompatibilityData.carMakeId,
      carModelId: newProductCompatibilityData.carModelId || '',
      carYearId: newProductCompatibilityData.carYearId || '',
      carBodyTypeId: newProductCompatibilityData.carBodyTypeId || '',
      carEngineId: newProductCompatibilityData.carEngineId || '',
    };

    setFormData({
      ...formData,
      compatibilities: [...formData.compatibilities, newCompatibility],
    });

    setNewProductCompatibilityData({
      carMakeId: '',
      carModelId: '',
      carYearId: '',
      carBodyTypeId: '',
      carEngineId: '',
    });
  }, [formData, newProductCompatibilityData]);

  const handleRemoveCompatibilityFromNewProduct = useCallback(
    (index: number) => {
      const updatedCompatibilities = formData.compatibilities.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        compatibilities: updatedCompatibilities,
      });
    },
    [formData]
  );
  const getCompatibilityLevelDescription = useCallback(
    (carMakeId: string, carModelId: string, carYearId: string, carBodyTypeId: string, carEngineId: string) => {
      const make = carMakes.find((m) => m.id === parseInt(carMakeId));
      const makeName = make?.name || '';

      if (carEngineId) {
        const model = carModels.find((m) => m.id === parseInt(carModelId));
        const year = carYears.find((y) => y.id === parseInt(carYearId));
        const bodyType = carBodyTypes.find((bt) => bt.id === parseInt(carBodyTypeId));
        const engine = carEngines.find((e) => e.id === parseInt(carEngineId));

        return `Сумісність з ${makeName} ${model?.name || ''} ${year?.year || ''} ${bodyType?.name || ''} ${engine?.name || ''}`.trim();
      } else if (carBodyTypeId) {
        const model = carModels.find((m) => m.id === parseInt(carModelId));
        const year = carYears.find((y) => y.id === parseInt(carYearId));
        const bodyType = carBodyTypes.find((bt) => bt.id === parseInt(carBodyTypeId));

        return `Сумісність з усіма автомобілями ${makeName} ${model?.name || ''} ${year?.year || ''} ${bodyType?.name || ''}`.trim();
      } else if (carYearId) {
        const model = carModels.find((m) => m.id === parseInt(carModelId));
        const year = carYears.find((y) => y.id === parseInt(carYearId));

        return `Сумісність з усіма автомобілями ${makeName} ${model?.name || ''} ${year?.year || ''}`.trim();
      } else if (carModelId) {
        const model = carModels.find((m) => m.id === parseInt(carModelId));

        return `Сумісність з усіма автомобілями ${makeName} ${model?.name || ''}`.trim();
      } else if (carMakeId) {
        return `Сумісність з усіма автомобілями ${makeName}`;
      }
      return '';
    },
    [carMakes, carModels, carYears, carBodyTypes, carEngines]
  );

  const getModelsForMake = useCallback(
    (makeId: number) => {
      return carModels.filter((model) => model.makeId === makeId);
    },
    [carModels]
  );

  const getYearsForModel = useCallback(
    (modelId: number) => {
      return carYears.filter((year) => year.modelId === modelId);
    },
    [carYears]
  );

  const getBodyTypesForYear = useCallback(
    (yearId: number) => {
      return carBodyTypes.filter((bodyType) => bodyType.yearId === yearId);
    },
    [carBodyTypes]
  );

  const getEnginesForBodyType = useCallback(
    (bodyTypeId: number) => {
      return carEngines.filter((engine) => engine.bodyTypeId === bodyTypeId);
    },
    [carEngines]
  );

  const getModelsForMakeEdit = useCallback(
    (makeId: string) => {
      if (!makeId) return carModels;
      return carModels.filter((model) => model.makeId === parseInt(makeId));
    },
    [carModels]
  );

  const getYearsForModelEdit = useCallback(
    (modelId: string) => {
      if (!modelId) return carYears;
      return carYears.filter((year) => year.modelId === parseInt(modelId));
    },
    [carYears]
  );

  const getBodyTypesForYearEdit = useCallback(
    (yearId: string) => {
      if (!yearId) return carBodyTypes;
      return carBodyTypes.filter((bodyType) => bodyType.yearId === parseInt(yearId));
    },
    [carBodyTypes]
  );

  const getEnginesForBodyTypeEdit = useCallback(
    (bodyTypeId: string) => {
      if (!bodyTypeId) return carEngines;
      return carEngines.filter((engine) => engine.bodyTypeId === parseInt(bodyTypeId));
    },
    [carEngines]
  );

  const handleImageUpdate = useCallback((productId: number, newImageUrl: string | null) => {
    setProducts((prevProducts) => prevProducts.map((product) => (product.id === productId ? { ...product, imageUrl: newImageUrl } : product)));
  }, []);

  const handleOpenImageModal = useCallback((imageUrl: string, productName: string) => {
    setSelectedImage({ url: imageUrl, alt: productName });
    setImageModalOpen(true);
  }, []);
  const handleCloseImageModal = useCallback(() => {
    setImageModalOpen(false);
    setSelectedImage(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && imageModalOpen) {
        handleCloseImageModal();
      }
    };

    if (imageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [imageModalOpen, handleCloseImageModal]);

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

  const filteredProducts = getFilteredProducts();
  const baseProducts = products.filter((p) => !p.isVariant);
  return (
    <div className='min-h-screen bg-gray-50 p-1 sm:p-4 overflow-y-auto' style={{ maxHeight: '100vh' }}>
      <main className='bg-white shadow-xl rounded-2xl p-2 sm:p-8 max-w-full mx-auto border border-gray-200'>
        <div className='mb-3'>
          <a href='/admin/dashboard' className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-base sm:text-lg transition-colors shadow-sm border border-gray-300 cursor-pointer'>
            <HiOutlineArrowLeft className='h-5 w-5 text-gray-500' />
            На головну
          </a>
        </div>
        <h2 className='text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3'>
          <span className='text-purple-700'>
            <HiOutlineShoppingBag className='inline-block mr-1' size={24} />
          </span>
          Керування товарами
        </h2>
        <div className='mb-3 sm:mb-6'>
          <label htmlFor='search' className='block text-gray-900 font-semibold mb-1 sm:mb-2 text-base sm:text-lg'>
            Пошук товарів
          </label>
          <div className='relative'>
            <input id='search' type='text' className='w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white shadow-sm text-base sm:text-lg font-semibold' placeholder='Пошук товарів...' value={search} onChange={(e) => setSearch(e.target.value)} />
            <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
          </div>
        </div>
        <div className='mb-6'>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className='bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors shadow font-semibold cursor-pointer'>
            <HiOutlinePlus size={20} />
            {showCreateForm ? 'Скасувати' : 'Додати товар'}
          </button>

          {showCreateForm && (
            <div className='mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Додати новий товар</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Назва товару *</label>
                  <input type='text' value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='Назва товару' />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Ціна *</label>
                  <input type='number' step='0.01' min='0' value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='0.00' />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Кількість на складі *</label>
                  <input type='number' min='0' value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='0' />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Категорія *</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'>
                    <option value=''>Оберіть категорію</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Виробник *</label>
                  <select value={formData.manufacturerId} onChange={(e) => setFormData({ ...formData, manufacturerId: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'>
                    <option value=''>Оберіть виробника</option>
                    {manufacturers.map((manufacturer) => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex items-center'>
                  <input type='checkbox' id='isVariant' checked={formData.isVariant} onChange={(e) => setFormData({ ...formData, isVariant: e.target.checked, baseProductId: e.target.checked ? formData.baseProductId : '' })} className='h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded' />
                  <label htmlFor='isVariant' className='ml-2 block text-sm text-gray-900'>
                    Це варіант товару
                  </label>
                </div>
              </div>
              {formData.isVariant && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Базовий товар *</label>{' '}
                  <select value={formData.baseProductId} onChange={(e) => setFormData({ ...formData, baseProductId: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'>
                    <option value=''>Оберіть базовий товар</option>
                    {baseProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Опис</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='Опис товару' rows={3} />
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Зображення товару</label>
                <input type='file' accept='image/jpeg,image/png,image/webp' onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })} className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100' />
                <p className='text-xs text-gray-500 mt-1'>
                  Підтримувані формати: JPEG, PNG, WebP. Максимальний розмір: 10MB.
                  <br />
                  Зображення буде автоматично обрізане до розміру 400×400 пікселів та конвертоване в WebP.
                </p>
              </div>{' '}
              <div className='mb-6 border-t border-gray-200 pt-6'>
                <h4 className='text-md font-semibold text-gray-800 mb-4'>Сумісність з автомобілями</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Марка</label>
                    <select
                      value={newProductCompatibilityData.carMakeId}
                      onChange={(e) => {
                        const makeId = e.target.value;
                        setNewProductCompatibilityData({
                          ...newProductCompatibilityData,
                          carMakeId: makeId,
                          carModelId: '',
                          carYearId: '',
                          carBodyTypeId: '',
                          carEngineId: '',
                        });
                      }}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                    >
                      <option value=''>Оберіть марку</option>
                      {carMakes.map((make) => (
                        <option key={make.id} value={make.id}>
                          {make.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Модель</label>
                    <select
                      value={newProductCompatibilityData.carModelId}
                      onChange={(e) => {
                        const modelId = e.target.value;
                        setNewProductCompatibilityData({
                          ...newProductCompatibilityData,
                          carModelId: modelId,
                          carYearId: '',
                          carBodyTypeId: '',
                          carEngineId: '',
                        });
                      }}
                      disabled={!newProductCompatibilityData.carMakeId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть модель</option>
                      {getModelsForMake(parseInt(newProductCompatibilityData.carMakeId || '0')).map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Рік</label>
                    <select
                      value={newProductCompatibilityData.carYearId}
                      onChange={(e) => {
                        const yearId = e.target.value;
                        setNewProductCompatibilityData({
                          ...newProductCompatibilityData,
                          carYearId: yearId,
                          carBodyTypeId: '',
                          carEngineId: '',
                        });
                      }}
                      disabled={!newProductCompatibilityData.carModelId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть рік</option>
                      {getYearsForModel(parseInt(newProductCompatibilityData.carModelId || '0')).map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Тип кузова</label>
                    <select
                      value={newProductCompatibilityData.carBodyTypeId}
                      onChange={(e) => {
                        const bodyTypeId = e.target.value;
                        setNewProductCompatibilityData({
                          ...newProductCompatibilityData,
                          carBodyTypeId: bodyTypeId,
                          carEngineId: '',
                        });
                      }}
                      disabled={!newProductCompatibilityData.carYearId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть тип кузова</option>
                      {getBodyTypesForYear(parseInt(newProductCompatibilityData.carYearId || '0')).map((bodyType) => (
                        <option key={bodyType.id} value={bodyType.id}>
                          {bodyType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Двигун</label>
                    <select
                      value={newProductCompatibilityData.carEngineId}
                      onChange={(e) =>
                        setNewProductCompatibilityData({
                          ...newProductCompatibilityData,
                          carEngineId: e.target.value,
                        })
                      }
                      disabled={!newProductCompatibilityData.carBodyTypeId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть двигун</option>
                      {getEnginesForBodyType(parseInt(newProductCompatibilityData.carBodyTypeId || '0')).map((engine) => (
                        <option key={engine.id} value={engine.id}>
                          {engine.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <button onClick={handleAddCompatibilityToNewProduct} disabled={!newProductCompatibilityData.carMakeId} className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer'>
                      Додати
                    </button>
                  </div>
                </div>
                <div className='mb-4'>
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 h-[3rem] flex items-center'>
                    <p className={`text-sm font-medium ${newProductCompatibilityData.carMakeId ? 'text-blue-800' : 'text-gray-500'}`}>{newProductCompatibilityData.carMakeId ? `${getCompatibilityLevelDescription(newProductCompatibilityData.carMakeId, newProductCompatibilityData.carModelId, newProductCompatibilityData.carYearId, newProductCompatibilityData.carBodyTypeId, newProductCompatibilityData.carEngineId)}` : 'Оберіть марку автомобіля для відображення рівня сумісності'}</p>
                  </div>
                </div>
                {formData.compatibilities.length > 0 && (
                  <div>
                    {' '}
                    <h5 className='text-sm font-medium text-gray-700 mb-2'>Додані сумісності:</h5>
                    <div className='space-y-2'>
                      {formData.compatibilities.map((compatibility, index) => {
                        const make = carMakes.find((m) => m.id.toString() === compatibility.carMakeId);
                        const model = compatibility.carModelId ? carModels.find((m) => m.id.toString() === compatibility.carModelId) : null;
                        const year = compatibility.carYearId ? carYears.find((y) => y.id.toString() === compatibility.carYearId) : null;
                        const bodyType = compatibility.carBodyTypeId ? carBodyTypes.find((bt) => bt.id.toString() === compatibility.carBodyTypeId) : null;
                        const engine = compatibility.carEngineId ? carEngines.find((e) => e.id.toString() === compatibility.carEngineId) : null;

                        let displayText = make?.name || '';
                        if (model) displayText += ` ${model.name}`;
                        if (year) displayText += ` (${year.year})`;
                        if (bodyType) displayText += ` • ${bodyType.name}`;
                        if (engine) displayText += ` • ${engine.name}`;

                        const levelDescription = getCompatibilityLevelDescription(compatibility.carMakeId, compatibility.carModelId, compatibility.carYearId, compatibility.carBodyTypeId, compatibility.carEngineId);

                        return (
                          <div key={index} className='flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-gray-50'>
                            <div className='text-sm text-gray-900'>
                              <div className='font-medium'>{displayText}</div>
                              <div className='text-xs text-blue-600 mt-1'>{levelDescription}</div>
                            </div>
                            <button onClick={() => handleRemoveCompatibilityFromNewProduct(index)} className='text-red-600 hover:text-red-800 cursor-pointer' title='Видалити'>
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>{' '}
              {createError && <div className='text-red-600 text-sm font-medium mb-4 px-1'>{createError}</div>}
              <div className='flex gap-2'>
                <button onClick={handleAddProduct} className='bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors cursor-pointer'>
                  Додати товар {formData.compatibilities.length > 0 && `(${formData.compatibilities.length} сумісностей)`}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData(initialFormData);
                    setCreateError(null);
                    setNewProductCompatibilityData({
                      carMakeId: '',
                      carModelId: '',
                      carYearId: '',
                      carBodyTypeId: '',
                      carEngineId: '',
                    });
                  }}
                  className='bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-4 py-2 font-semibold transition-colors cursor-pointer'
                >
                  Скасувати
                </button>
              </div>
            </div>
          )}
        </div>
        <div className='sm:hidden'>
          {isLoading ? (
            <ProductSkeleton />
          ) : filteredProducts.length === 0 ? (
            <div className='text-center text-gray-700 font-semibold py-6'>Нічого не знайдено</div>
          ) : (
            <div className='flex flex-col gap-3'>
              {filteredProducts.map((product) => (
                <div key={product.id} className='rounded-xl border border-gray-200 bg-white shadow-sm p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex gap-3 flex-1'>
                      {' '}
                      {product.imageUrl ? (
                        <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mx-auto relative flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity' onClick={() => handleOpenImageModal(product.imageUrl!, product.name)} title='Натисніть для перегляду зображення'>
                          <Image src={product.imageUrl} alt={product.name} width={64} height={64} className='w-full h-full object-contain' />
                        </div>
                      ) : (
                        <div className='w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0'>
                          <span className='text-xs text-gray-400'>Немає</span>
                        </div>
                      )}
                      <div className='flex-1'>
                        <div className='font-bold text-gray-900 text-base mb-1'>
                          {product.name}
                          {product.isVariant && product.baseProduct && <span className='ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded'>Варіант: {product.baseProduct.name}</span>}
                        </div>
                        <div className='text-sm text-gray-600 space-y-1'>
                          {' '}
                          <div>
                            Ціна: <span className='font-semibold text-green-600'>{product.price} грн</span>
                          </div>
                          <div>
                            На складі: <span className='font-medium'>{product.stockQuantity} шт</span>
                          </div>
                          <div>
                            Категорія: <span className='font-medium'>{product.category.name}</span>
                          </div>
                          <div>
                            Виробник: <span className='font-medium'>{product.manufacturer.name}</span>
                          </div>
                          {product.averageRating !== null && product.averageRating > 0 && (
                            <div>
                              Рейтинг: <span className='font-medium text-yellow-600'>★ {product.averageRating.toFixed(1)}</span>
                            </div>
                          )}{' '}
                          {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
                            <div>
                              Автомобілів: <span className='font-medium text-blue-600'>{product.compatibleVehicles.length} сумісних</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>{' '}
                    <div className='flex gap-1'>
                      {' '}
                      <button onClick={() => handleManageCompatibility(product.id)} className='text-green-600 hover:text-green-800 cursor-pointer' title='Керування сумісністю з авто'>
                        <LuCar size={18} />
                      </button>
                      <button onClick={() => {}} className='text-purple-600 hover:text-purple-800 cursor-pointer' title='Поставки товару'>
                        <HiOutlinePlus size={18} />
                      </button>
                      <button onClick={() => handleEditProduct(product)} className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                        <HiOutlinePencil size={18} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className='text-red-600 hover:text-red-800 cursor-pointer'>
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>{' '}
        <div className='bg-white rounded-lg shadow border border-gray-200 w-full hidden sm:block'>
          {isLoading ? (
            <ProductSkeleton />
          ) : (
            <div className='w-full'>
              <table className='w-full divide-y divide-gray-200 text-sm table-fixed'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th
                      className='px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-12'
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
                    <th className='px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16'>Фото</th>
                    <th
                      className='px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-1/4'
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
                    <th
                      className='px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-20'
                      onClick={() => {
                        if (sortBy === 'price') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else {
                          setSortBy('price');
                          setSortDir('asc');
                        }
                      }}
                    >
                      {' '}
                      Ціна {sortBy === 'price' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th
                      className='px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-16'
                      onClick={() => {
                        if (sortBy === 'stockQuantity') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else {
                          setSortBy('stockQuantity');
                          setSortDir('asc');
                        }
                      }}
                    >
                      Склад {sortBy === 'stockQuantity' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th
                      className='px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-1/6'
                      onClick={() => {
                        if (sortBy === 'category') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else {
                          setSortBy('category');
                          setSortDir('asc');
                        }
                      }}
                    >
                      Категорія {sortBy === 'category' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th
                      className='px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none w-1/6'
                      onClick={() => {
                        if (sortBy === 'manufacturer') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        else {
                          setSortBy('manufacturer');
                          setSortDir('asc');
                        }
                      }}
                    >
                      Виробник {sortBy === 'manufacturer' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className='px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-24'>Дії</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-100 max-h-[400px] overflow-y-auto'>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='px-6 py-4 text-center text-gray-700 font-semibold'>
                        {debouncedSearch ? 'Товарів за запитом не знайдено' : 'Товарів не знайдено'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className='hover:bg-gray-50'>
                        <td className='px-2 py-3 font-semibold text-gray-900 text-center'>{product.id}</td>
                        <td className='px-2 py-3'>
                          {product.imageUrl ? (
                            <div className='w-10 h-10 rounded-lg overflow-hidden bg-gray-100 mx-auto relative flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity' onClick={() => handleOpenImageModal(product.imageUrl!, product.name)} title='Натисніть для перегляду зображення'>
                              <Image src={product.imageUrl} alt={product.name} width={40} height={40} className='w-full h-full object-contain' />
                            </div>
                          ) : (
                            <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto'>
                              <span className='text-xs text-gray-400'>Немає</span>
                            </div>
                          )}
                        </td>
                        <td className='px-3 py-3'>
                          <div className='font-semibold text-gray-900 break-words'>{product.name}</div>
                          {product.isVariant && product.baseProduct && <div className='text-xs text-blue-600 mt-1 break-words'>Варіант: {product.baseProduct.name}</div>}
                          {product.averageRating !== null && product.averageRating > 0 && <div className='text-xs text-yellow-600 mt-1'>★ {product.averageRating.toFixed(1)}</div>}
                          {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
                            <div className='text-xs text-blue-600 mt-1 flex items-center gap-1'>
                              <LuCar size={12} /> {product.compatibleVehicles.length} авто
                            </div>
                          )}
                        </td>
                        <td className='px-3 py-3'>
                          <span className='font-semibold text-green-600 break-words'>{product.price} грн</span>
                        </td>
                        <td className='px-3 py-3'>
                          <span className={`font-medium break-words ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>{product.stockQuantity} шт</span>
                        </td>
                        <td className='px-3 py-3'>
                          <span className='font-medium text-gray-900 break-words'>{product.category.name}</span>
                        </td>
                        <td className='px-3 py-3'>
                          <span className='font-medium text-gray-900 break-words'>{product.manufacturer.name}</span>
                        </td>
                        <td className='px-3 py-3 text-right'>
                          <div className='flex justify-end gap-1 flex-wrap'>
                            {' '}
                            <button onClick={() => handleManageCompatibility(product.id)} className='text-green-600 hover:text-green-800 cursor-pointer' title='Керування сумісністю з авто'>
                              <LuCar size={16} />
                            </button>
                            <button onClick={() => {}} className='text-purple-600 hover:text-purple-800 cursor-pointer' title='Поставки товару'>
                              <HiOutlinePlus size={16} />
                            </button>
                            <button onClick={() => handleEditProduct(product)} className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                              <HiOutlinePencil size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className='text-red-600 hover:text-red-800 cursor-pointer'>
                              <HiOutlineTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {managingCompatibilityId && (
          <div className='fixed inset-0 flex items-center justify-center p-4 z-50' style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <div className='bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>Керування сумісністю з автомобілями - Товар #{managingCompatibilityId}</h3>
                <button onClick={() => setManagingCompatibilityId(null)} className='text-gray-500 hover:text-gray-700 cursor-pointer'>
                  ✕
                </button>
              </div>
              <div className='border-b border-gray-200 pb-6 mb-6'>
                <h4 className='text-md font-semibold text-gray-800 mb-4'>Додати сумісність</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Марка автомобіля</label>
                    <select
                      value={compatibilityFormData.carMakeId}
                      onChange={(e) => {
                        const makeId = e.target.value;
                        setCompatibilityFormData({
                          ...compatibilityFormData,
                          carMakeId: makeId,
                          carModelId: '',
                          carYearId: '',
                          carBodyTypeId: '',
                          carEngineId: '',
                        });
                      }}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                    >
                      <option value=''>Оберіть марку</option>
                      {carMakes.map((make) => (
                        <option key={make.id} value={make.id}>
                          {make.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Модель</label>
                    <select
                      value={compatibilityFormData.carModelId}
                      onChange={(e) => {
                        const modelId = e.target.value;
                        setCompatibilityFormData({
                          ...compatibilityFormData,
                          carModelId: modelId,
                          carYearId: '',
                          carBodyTypeId: '',
                          carEngineId: '',
                        });
                      }}
                      disabled={!compatibilityFormData.carMakeId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть модель</option>
                      {getModelsForMakeEdit(compatibilityFormData.carMakeId).map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Рік</label>
                    <select
                      value={compatibilityFormData.carYearId}
                      onChange={(e) => {
                        const yearId = e.target.value;
                        setCompatibilityFormData({
                          ...compatibilityFormData,
                          carYearId: yearId,
                          carBodyTypeId: '',
                          carEngineId: '',
                        });
                      }}
                      disabled={!compatibilityFormData.carModelId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть рік</option>
                      {getYearsForModelEdit(compatibilityFormData.carModelId).map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Тип кузова</label>
                    <select
                      value={compatibilityFormData.carBodyTypeId}
                      onChange={(e) => {
                        const bodyTypeId = e.target.value;
                        setCompatibilityFormData({
                          ...compatibilityFormData,
                          carBodyTypeId: bodyTypeId,
                          carEngineId: '',
                        });
                      }}
                      disabled={!compatibilityFormData.carYearId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть тип кузова</option>
                      {getBodyTypesForYearEdit(compatibilityFormData.carYearId).map((bodyType) => (
                        <option key={bodyType.id} value={bodyType.id}>
                          {bodyType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Двигун</label>
                    <select
                      value={compatibilityFormData.carEngineId}
                      onChange={(e) =>
                        setCompatibilityFormData({
                          ...compatibilityFormData,
                          carEngineId: e.target.value,
                        })
                      }
                      disabled={!compatibilityFormData.carBodyTypeId}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:bg-gray-100'
                    >
                      <option value=''>Оберіть двигун</option>
                      {getEnginesForBodyTypeEdit(compatibilityFormData.carBodyTypeId).map((engine) => (
                        <option key={engine.id} value={engine.id}>
                          {engine.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <button onClick={() => managingCompatibilityId && handleAddCompatibility(managingCompatibilityId)} disabled={!compatibilityFormData.carMakeId} className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer'>
                      Додати сумісність
                    </button>
                  </div>
                </div>
                <div className='mb-4'>
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 h-[3rem] flex items-center'>
                    <p className={`text-sm font-medium ${compatibilityFormData.carMakeId ? 'text-blue-800' : 'text-gray-500'}`}>{compatibilityFormData.carMakeId ? `${getCompatibilityLevelDescription(compatibilityFormData.carMakeId, compatibilityFormData.carModelId, compatibilityFormData.carYearId, compatibilityFormData.carBodyTypeId, compatibilityFormData.carEngineId)}` : 'Оберіть марку автомобіля для відображення рівня сумісності'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className='text-md font-semibold text-gray-800 mb-4'>Існуючі сумісності</h4>
                {(() => {
                  const currentProduct = products.find((p) => p.id === managingCompatibilityId);
                  const compatibilities = currentProduct?.compatibleVehicles || [];

                  if (compatibilities.length === 0) {
                    return <div className='text-center text-gray-500 py-6'>Сумісності ще не додано</div>;
                  }

                  return (
                    <div className='space-y-3'>
                      {compatibilities.map((compatibility) => (
                        <div key={compatibility.id} className='flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50'>
                          <div className='flex-1'>
                            <div className='font-medium text-gray-900'>
                              {compatibility.carMake.name} {compatibility.carModel.name} ({compatibility.carYear.year})
                            </div>
                            <div className='text-sm text-gray-600'>
                              {compatibility.carBodyType.name} • {compatibility.carEngine.name}
                            </div>{' '}
                          </div>
                          <button onClick={() => handleDeleteCompatibility(compatibility.id)} className='text-red-600 hover:text-red-800 ml-3 cursor-pointer' title='Видалити сумісність'>
                            <HiOutlineTrash size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>{' '}
              <div className='flex justify-end mt-6 pt-6 border-t border-gray-200'>
                <button onClick={() => setManagingCompatibilityId(null)} className='bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-4 py-2 font-semibold transition-colors cursor-pointer'>
                  Закрити
                </button>
              </div>
            </div>
          </div>
        )}
        {editingProductId && (
          <div className='fixed inset-0 flex items-center justify-center p-4 z-50' style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <div className='bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Редагувати товар</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Назва товару *</label>
                  <input type='text' value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='Назва товару' />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Ціна *</label>
                  <input type='number' step='0.01' min='0' value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='0.00' />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Кількість на складі *</label>
                  <input type='number' min='0' value={editFormData.stockQuantity} onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='0' />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Категорія *</label>
                  <select value={editFormData.categoryId} onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'>
                    <option value=''>Оберіть категорію</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Виробник *</label>
                  <select value={editFormData.manufacturerId} onChange={(e) => setEditFormData({ ...editFormData, manufacturerId: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'>
                    <option value=''>Оберіть виробника</option>
                    {manufacturers.map((manufacturer) => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex items-center'>
                  <input type='checkbox' id='editIsVariant' checked={editFormData.isVariant} onChange={(e) => setEditFormData({ ...editFormData, isVariant: e.target.checked, baseProductId: e.target.checked ? editFormData.baseProductId : '' })} className='h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded' />
                  <label htmlFor='editIsVariant' className='ml-2 block text-sm text-gray-900'>
                    Це варіант товару
                  </label>
                </div>
              </div>
              {editFormData.isVariant && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Базовий товар *</label>
                  <select value={editFormData.baseProductId} onChange={(e) => setEditFormData({ ...editFormData, baseProductId: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400'>
                    <option value=''>Оберіть базовий товар</option>
                    {baseProducts
                      .filter((p) => p.id !== editingProductId)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Опис</label>
                <textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400' placeholder='Опис товару' rows={3} />
              </div>
              <div className='mb-4'>
                <ImageManager productId={editingProductId} currentImageUrl={products.find((p) => p.id === editingProductId)?.imageUrl || null} onImageUpdate={(newImageUrl) => editingProductId && handleImageUpdate(editingProductId, newImageUrl)} />
              </div>
              {editError && <div className='text-red-600 text-sm font-medium mb-4 px-1'>{editError}</div>}{' '}
              <div className='flex gap-2'>
                <button onClick={() => editingProductId && handleSaveEditProduct(editingProductId)} className='bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors cursor-pointer'>
                  Зберегти
                </button>
                <button onClick={handleCancelEdit} className='bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-4 py-2 font-semibold transition-colors cursor-pointer'>
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        )}{' '}
        {imageModalOpen && selectedImage && (
          <div className='fixed inset-0 flex items-center justify-center p-4 z-50' style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }} onClick={handleCloseImageModal}>
            <div className='bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-[90vw] h-[90vh] flex flex-col' onClick={(e) => e.stopPropagation()}>
              <div className='flex justify-between items-center mb-3 flex-shrink-0'>
                <h3 className='text-lg font-semibold text-gray-900 truncate mr-4'>Перегляд зображення - {selectedImage.alt}</h3>
                <button onClick={handleCloseImageModal} className='text-gray-500 hover:text-gray-700 cursor-pointer text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors'>
                  ✕
                </button>
              </div>
              <div className='flex-1 flex items-center justify-center min-h-0'>
                <div className='relative w-full h-full flex items-center justify-center'>
                  <Image src={selectedImage.url} alt={selectedImage.alt} fill className='object-contain rounded-lg' sizes='90vw' />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
