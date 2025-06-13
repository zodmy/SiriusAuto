import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!await checkAdmin({ req: request })) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { productId, carMakeId, carModelId, carYearId, carBodyTypeId, carEngineId } = data;

    if (!productId || !carMakeId) {
      return NextResponse.json({ error: 'productId та carMakeId є обов\'язковими' }, { status: 400 });
    }

    const compatibilityRecords = [];

    if (carEngineId) {
      compatibilityRecords.push({
        productId: parseInt(productId),
        carMakeId: parseInt(carMakeId),
        carModelId: parseInt(carModelId),
        carYearId: parseInt(carYearId),
        carBodyTypeId: parseInt(carBodyTypeId),
        carEngineId: parseInt(carEngineId),
      });
    } else if (carBodyTypeId) {
      const engines = await prisma.carEngine.findMany({
        where: { bodyTypeId: parseInt(carBodyTypeId) }
      });

      for (const engine of engines) {
        compatibilityRecords.push({
          productId: parseInt(productId),
          carMakeId: parseInt(carMakeId),
          carModelId: parseInt(carModelId),
          carYearId: parseInt(carYearId),
          carBodyTypeId: parseInt(carBodyTypeId),
          carEngineId: engine.id,
        });
      }
    } else if (carYearId) {
      const bodyTypes = await prisma.carBodyType.findMany({
        where: { yearId: parseInt(carYearId) },
        include: { engines: true }
      });

      for (const bodyType of bodyTypes) {
        for (const engine of bodyType.engines) {
          compatibilityRecords.push({
            productId: parseInt(productId),
            carMakeId: parseInt(carMakeId),
            carModelId: parseInt(carModelId),
            carYearId: parseInt(carYearId),
            carBodyTypeId: bodyType.id,
            carEngineId: engine.id,
          });
        }
      }
    } else if (carModelId) {
      const years = await prisma.carYear.findMany({
        where: { modelId: parseInt(carModelId) },
        include: {
          bodyTypes: {
            include: { engines: true }
          }
        }
      });

      for (const year of years) {
        for (const bodyType of year.bodyTypes) {
          for (const engine of bodyType.engines) {
            compatibilityRecords.push({
              productId: parseInt(productId),
              carMakeId: parseInt(carMakeId),
              carModelId: parseInt(carModelId),
              carYearId: year.id,
              carBodyTypeId: bodyType.id,
              carEngineId: engine.id,
            });
          }
        }
      }
    } else {
      const models = await prisma.carModel.findMany({
        where: { makeId: parseInt(carMakeId) },
        include: {
          years: {
            include: {
              bodyTypes: {
                include: { engines: true }
              }
            }
          }
        }
      });

      for (const model of models) {
        for (const year of model.years) {
          for (const bodyType of year.bodyTypes) {
            for (const engine of bodyType.engines) {
              compatibilityRecords.push({
                productId: parseInt(productId),
                carMakeId: parseInt(carMakeId),
                carModelId: model.id,
                carYearId: year.id,
                carBodyTypeId: bodyType.id,
                carEngineId: engine.id,
              });
            }
          }
        }
      }
    }

    if (compatibilityRecords.length === 0) {
      return NextResponse.json({ error: 'Не знайдено автомобілів для створення сумісності' }, { status: 400 });
    }

    const results = [];
    for (const record of compatibilityRecords) {
      try {
        const newCompatibility = await prisma.compatibility.create({
          data: record,
        });
        results.push(newCompatibility);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        } else {
          console.error('Помилка створення запису сумісності:', error);
        }
      }
    }

    return NextResponse.json({
      message: `Створено ${results.length} записів сумісності з ${compatibilityRecords.length} можливих`,
      created: results.length,
      total: compatibilityRecords.length
    }, { status: 201 });

  } catch (error) {
    console.error('Помилка створення ієрархічної сумісності:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
