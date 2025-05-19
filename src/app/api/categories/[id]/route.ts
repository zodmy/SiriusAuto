import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';

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

export async function GET(request: Request, context: { params: { id: string } }) {

  const { id } = await context.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Невалідний ID категорії' }, { status: 400 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parsedId },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: `Категорію з ID ${parsedId} не знайдено` }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`Помилка при запиті категорії з ID ${parsedId}:`, error);
    return NextResponse.json({ error: `Не вдалося отримати категорію` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const id = parseInt(context.params.id, 10);

  try {
    const { name, parentId } = await request.json();
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        parentId: parentId !== undefined ? Number(parentId) : null,
      },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true } },
      },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`Не вдалося оновити категорію з ID ${id}:`, error);
    return NextResponse.json({ error: `Не вдалося оновити категорію з ID ${id}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ message: 'Потрібні права адміністратора' }, { status: 401 });
  }

  const id = parseInt(context.params.id, 10);

  try {
    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ message: `Категорію з ID ${id} видалено` }, { status: 200 });
  } catch (error) {
    console.error(`Не вдалося видалити категорію з ID ${id}:`, error);
    return NextResponse.json({ error: `Не вдалося видалити категорію з ID ${id}` }, { status: 500 });
  }
}