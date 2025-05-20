import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Invalid car year ID' }, { status: 400 });
    }

    const carYear = await prisma.carYear.findUnique({
      where: { id: carYearId },
    });

    if (!carYear) {
      return NextResponse.json({ error: 'Car year not found' }, { status: 404 });
    }

    return NextResponse.json(carYear);
  } catch (error) {
    console.error('Error fetching car year:', error);
    return NextResponse.json({ error: 'Failed to fetch car year' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Invalid car year ID' }, { status: 400 });
    }

    const body = await req.json();
    const { year, modelId } = body;

    if (year !== undefined && typeof year !== 'number') {
      return NextResponse.json({ error: 'Invalid year provided' }, { status: 400 });
    }
    if (modelId !== undefined && typeof modelId !== 'number') {
      return NextResponse.json({ error: 'Invalid modelId provided' }, { status: 400 });
    }

    const dataToUpdate: { year?: number; modelId?: number } = {};
    if (year !== undefined) dataToUpdate.year = year;
    if (modelId !== undefined) dataToUpdate.modelId = modelId;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedCarYear = await prisma.carYear.update({
      where: { id: carYearId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedCarYear);
  } catch (error) {
    console.error('Error updating car year:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Car year for this model already exists' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Car year not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Failed to update car year' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const carYearId = parseInt(params.id, 10);
    if (isNaN(carYearId)) {
      return NextResponse.json({ error: 'Invalid car year ID' }, { status: 400 });
    }

    await prisma.carYear.delete({
      where: { id: carYearId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting car year:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Car year not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete car year' }, { status: 500 });
  }
}