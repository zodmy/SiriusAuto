import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
  };
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded?.role === 'admin';
  } catch (error) {
    console.error('Помилка верифікації токена:', error);
    return false;
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    return NextResponse.json({ error: 'Не вдалося отримати категорії' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  try {
    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Потрібно вказати назву категорії' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        parentId: parentId !== undefined ? Number(parentId) : null,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: true,
      },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    const err = error as PrismaError;
    console.error('Помилка створення категорії:', err);
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Категорія з такою назвою вже існує' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Не вдалося створити категорію' }, { status: 500 });
  }
}