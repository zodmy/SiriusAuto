import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface ManufacturerData {
  name: string;
}

interface CategoryData {
  name: string;
  parentName?: string | null;
}

interface CompatibleVehicle {
  carMake: string;
  carModel: string;
  carYear: number;
  carBodyType: string;
  carEngine: string;
}

interface ProductData {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryName: string;
  manufacturerName: string;
  isVariant: boolean;
  baseProductName?: string | null;
  compatibleVehicles?: CompatibleVehicle[];
}

interface SupplyData {
  manufacturers?: ManufacturerData[];
  categories?: CategoryData[];
  products?: ProductData[];
}

interface ProcessingResult {
  type: 'manufacturer' | 'category' | 'product';
  data: Record<string, unknown>;
  status: 'success' | 'error';
  error?: string;
}

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-secret-key';

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function findOrCreateCarMake(name: string) {
  return await prisma.carMake.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function findOrCreateCarModel(makeName: string, modelName: string) {
  const make = await findOrCreateCarMake(makeName);
  return await prisma.carModel.upsert({
    where: {
      makeId_name: {
        makeId: make.id,
        name: modelName
      }
    },
    update: {},
    create: {
      makeId: make.id,
      name: modelName
    },
  });
}

async function findOrCreateCarYear(makeName: string, modelName: string, year: number) {
  const model = await findOrCreateCarModel(makeName, modelName);
  return await prisma.carYear.upsert({
    where: {
      modelId_year: {
        modelId: model.id,
        year
      }
    },
    update: {},
    create: {
      modelId: model.id,
      year
    },
  });
}

async function findOrCreateCarBodyType(makeName: string, modelName: string, year: number, bodyTypeName: string) {
  const carYear = await findOrCreateCarYear(makeName, modelName, year);
  return await prisma.carBodyType.upsert({
    where: {
      yearId_name: {
        yearId: carYear.id,
        name: bodyTypeName
      }
    },
    update: {},
    create: {
      yearId: carYear.id,
      name: bodyTypeName
    },
  });
}

async function findOrCreateCarEngine(makeName: string, modelName: string, year: number, bodyTypeName: string, engineName: string) {
  const bodyType = await findOrCreateCarBodyType(makeName, modelName, year, bodyTypeName);
  return await prisma.carEngine.upsert({
    where: {
      bodyTypeId_name: {
        bodyTypeId: bodyType.id,
        name: engineName
      }
    },
    update: {},
    create: {
      bodyTypeId: bodyType.id,
      name: engineName
    },
  });
}

async function processManufacturers(manufacturers: ManufacturerData[]): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  for (const manufacturerData of manufacturers) {
    try {
      const manufacturer = await prisma.manufacturer.upsert({
        where: { name: manufacturerData.name },
        update: {},
        create: { name: manufacturerData.name },
      });

      results.push({
        type: 'manufacturer',
        data: { name: manufacturer.name },
        status: 'success'
      });
    } catch (error) {
      results.push({
        type: 'manufacturer',
        data: { name: manufacturerData.name },
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

async function processCategories(categories: CategoryData[]): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  for (const categoryData of categories) {
    try {
      let parentId = null;

      if (categoryData.parentName) {
        const parent = await prisma.category.findUnique({
          where: { name: categoryData.parentName }
        });
        if (parent) {
          parentId = parent.id;
        }
      }

      const category = await prisma.category.upsert({
        where: { name: categoryData.name },
        update: { parentId },
        create: {
          name: categoryData.name,
          parentId
        },
      });

      results.push({
        type: 'category',
        data: { name: category.name, parentName: categoryData.parentName },
        status: 'success'
      });
    } catch (error) {
      results.push({
        type: 'category',
        data: { name: categoryData.name, parentName: categoryData.parentName },
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

async function processProducts(products: ProductData[]): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  for (const productData of products) {
    try {
      // Find required relations
      const category = await prisma.category.findUnique({
        where: { name: productData.categoryName }
      });

      const manufacturer = await prisma.manufacturer.findUnique({
        where: { name: productData.manufacturerName }
      });

      if (!category) {
        throw new Error(`Category '${productData.categoryName}' not found`);
      }

      if (!manufacturer) {
        throw new Error(`Manufacturer '${productData.manufacturerName}' not found`);
      }

      let baseProductId = null;
      if (productData.isVariant && productData.baseProductName) {
        const baseProduct = await prisma.product.findFirst({
          where: { name: productData.baseProductName }
        });
        if (baseProduct) {
          baseProductId = baseProduct.id;
        }
      }
      const product = await prisma.product.findFirst({
        where: { name: productData.name }
      });

      let productResult;
      if (product) {
        productResult = await prisma.product.update({
          where: { id: product.id },
          data: {
            description: productData.description,
            price: productData.price,
            stockQuantity: productData.stockQuantity,
            imageUrl: productData.imageUrl,
            categoryId: category.id,
            manufacturerId: manufacturer.id,
            isVariant: productData.isVariant,
            baseProductId,
          }
        });
      } else {
        productResult = await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stockQuantity: productData.stockQuantity,
            imageUrl: productData.imageUrl,
            categoryId: category.id,
            manufacturerId: manufacturer.id,
            isVariant: productData.isVariant,
            baseProductId,
          }
        });
      }
      // Process compatible vehicles
      if (productData.compatibleVehicles && productData.compatibleVehicles.length > 0) {
        // Remove existing compatibility
        await prisma.compatibility.deleteMany({
          where: { productId: productResult.id }
        });

        // Add new compatibility
        for (const vehicle of productData.compatibleVehicles) {
          try {
            const carMake = await findOrCreateCarMake(vehicle.carMake);
            const carModel = await findOrCreateCarModel(vehicle.carMake, vehicle.carModel);
            const carYear = await findOrCreateCarYear(vehicle.carMake, vehicle.carModel, vehicle.carYear);
            const carBodyType = await findOrCreateCarBodyType(vehicle.carMake, vehicle.carModel, vehicle.carYear, vehicle.carBodyType);
            const carEngine = await findOrCreateCarEngine(vehicle.carMake, vehicle.carModel, vehicle.carYear, vehicle.carBodyType, vehicle.carEngine);

            await prisma.compatibility.create({
              data: {
                productId: productResult.id,
                carMakeId: carMake.id,
                carModelId: carModel.id,
                carYearId: carYear.id,
                carBodyTypeId: carBodyType.id,
                carEngineId: carEngine.id,
              }
            });
          } catch (vehicleError) {
            console.error(`Error processing vehicle compatibility for ${productResult.name}:`, vehicleError);
          }
        }
      }

      results.push({
        type: 'product',
        data: {
          name: productResult.name,
          categoryName: productData.categoryName,
          manufacturerName: productData.manufacturerName
        },
        status: 'success'
      });
    } catch (error) {
      results.push({
        type: 'product',
        data: {
          name: productData.name,
          categoryName: productData.categoryName,
          manufacturerName: productData.manufacturerName
        },
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token || !await verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const dataString = formData.get('data') as string;

    if (!dataString) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const data: SupplyData = JSON.parse(dataString);
    const allResults: ProcessingResult[] = [];

    // Process in order: manufacturers -> categories -> products
    if (data.manufacturers && data.manufacturers.length > 0) {
      const manufacturerResults = await processManufacturers(data.manufacturers);
      allResults.push(...manufacturerResults);
    }

    if (data.categories && data.categories.length > 0) {
      const categoryResults = await processCategories(data.categories);
      allResults.push(...categoryResults);
    }

    if (data.products && data.products.length > 0) {
      const productResults = await processProducts(data.products);
      allResults.push(...productResults);
    }

    return NextResponse.json({
      success: true,
      results: allResults,
      summary: {
        total: allResults.length,
        successful: allResults.filter(r => r.status === 'success').length,
        failed: allResults.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
