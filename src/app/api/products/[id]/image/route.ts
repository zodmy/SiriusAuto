import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { processProductImage, generateImageFilename, deleteProductImage } from '@/lib/imageUtils';
import sharp from 'sharp';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не знайдено' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл зображення не знайдено' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Непідтримуваний тип файлу. Дозволені: JPEG, PNG, WebP' },
        { status: 400 }
      );
    } const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Розмір файлу перевищує 10MB' },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    try {
      const metadata = await sharp(imageBuffer).metadata();

      if (!metadata.width || !metadata.height) {
        return NextResponse.json(
          { error: 'Неможливо прочитати зображення. Перевірте, що файл не пошкоджений' },
          { status: 400 }
        );
      }

      if (metadata.width < 100 || metadata.height < 100) {
        return NextResponse.json(
          { error: 'Зображення занадто мале. Мінімальний розмір: 100×100 пікселів' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Неможливо обробити зображення. Перевірте формат файлу' },
        { status: 400 }
      );
    }

    if (product.imageUrl) {
      await deleteProductImage(product.imageUrl);
    }

    const filename = generateImageFilename(file.name, productId);
    const imageUrl = await processProductImage(imageBuffer, filename);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
        baseProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Помилка завантаження зображення продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin({ req: request }))) {
    return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Недійсний ID продукту' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Продукт не знайдено' }, { status: 404 });
    }

    if (!product.imageUrl) {
      return NextResponse.json({ error: 'У продукту немає зображення' }, { status: 400 });
    }

    await deleteProductImage(product.imageUrl);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl: null },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
        baseProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Помилка видалення зображення продукту:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
