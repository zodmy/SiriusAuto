import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Invalid car year ID' }, { status: 400 });
    }

    const carYear = await prisma.carYear.findUnique({
      where: { id: carYearId },
      include: {
        engines: true,
      },
    });

    if (!carYear) {
      return NextResponse.json({ error: 'Car year not found' }, { status: 404 });
    }

    return NextResponse.json(carYear.engines);
  } catch (error) {
    console.error('Error fetching car engines:', error);
    return NextResponse.json({ error: 'Failed to fetch car engines' }, { status: 500 });
  }
}
