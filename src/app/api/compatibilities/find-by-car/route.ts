import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const carMakeIdStr = searchParams.get('makeId');
    const carModelIdStr = searchParams.get('modelId');
    const carYearIdStr = searchParams.get('yearId');

    if (!carMakeIdStr || !carModelIdStr || !carYearIdStr) {
      return NextResponse.json({ error: 'Параметри makeId, modelId та yearId є обов\'язковими' }, { status: 400 });
    }

    const carMakeId = parseInt(carMakeIdStr, 10);
    const carModelId = parseInt(carModelIdStr, 10);
    const carYearId = parseInt(carYearIdStr, 10);

    if (isNaN(carMakeId) || isNaN(carModelId) || isNaN(carYearId)) {
      return NextResponse.json({ error: 'Недійсний формат ID для марки, моделі або року' }, { status: 400 });
    }

    const whereClause: {
      carMakeId: number;
      carModelId: number;
      carYearId: number;
      carEngineId?: number;
      carBodyTypeId?: number;
    } = {
      carMakeId,
      carModelId,
      carYearId,
    };

    const carEngineIdStr = searchParams.get('engineId');
    if (carEngineIdStr) {
      const carEngineId = parseInt(carEngineIdStr, 10);
      if (isNaN(carEngineId)) {
        return NextResponse.json({ error: 'Недійсний формат ID для engineId' }, { status: 400 });
      }
      whereClause.carEngineId = carEngineId;
    }

    const carBodyTypeIdStr = searchParams.get('bodyTypeId');
    if (carBodyTypeIdStr) {
      const carBodyTypeId = parseInt(carBodyTypeIdStr, 10);
      if (isNaN(carBodyTypeId)) {
        return NextResponse.json({ error: 'Недійсний формат ID для bodyTypeId' }, { status: 400 });
      }
      whereClause.carBodyTypeId = carBodyTypeId;
    }

    const compatibilities = await prisma.compatibility.findMany({
      where: whereClause,
      include: {
        product: true,
      },
    });

    const compatibleProducts: Product[] = compatibilities.map(comp => comp.product);

    const uniqueProducts = Array.from(new Map(compatibleProducts.map(p => [p.id, p])).values());

    return NextResponse.json(uniqueProducts);

  } catch (error) {
    console.error('Помилка отримання сумісних запчастин для конфігурації автомобіля:', error);
    const errorMessage = 'Внутрішня помилка сервера';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
