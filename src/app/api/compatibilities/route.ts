import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const compatibilities = await prisma.compatibility.findMany();
    return NextResponse.json(compatibilities);
  } catch (error) {
    console.error('Помилка отримання записів сумісності:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }
  try {
    const data = await request.json();
    const newCompatibility = await prisma.compatibility.create({
      data,
    });
    return NextResponse.json(newCompatibility, { status: 201 });
  } catch (error) {
    console.error('Помилка створення запису сумісності:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
