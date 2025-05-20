import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const carYears = await prisma.carYear.findMany();
    return NextResponse.json(carYears);
  } catch (error) {
    console.error('Error fetching car years:', error);
    return NextResponse.json({ error: 'Failed to fetch car years' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { year, modelId } = body;
    if (!year || typeof year !== 'number' || !modelId || typeof modelId !== 'number') {
      return NextResponse.json({ error: 'Invalid year or modelId provided' }, { status: 400 });
    }
    const newCarYear = await prisma.carYear.create({
      data: { year, modelId },
    });
    return NextResponse.json(newCarYear, { status: 201 });
  } catch (error) {
    console.error('Error creating car year:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Car year for this model already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create car year' }, { status: 500 });
  }
}