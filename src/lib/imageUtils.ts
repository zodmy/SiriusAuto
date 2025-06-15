import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

export const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

export async function ensureImageDir() {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  }
}

export async function processProductImage(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  await ensureImageDir();

  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, ext);

  const webpFilename = `${baseName}.webp`;
  const processedImagePath = path.join(IMAGES_DIR, webpFilename);

  await sharp(imageBuffer)
    .webp({
      quality: 85,
      effort: 4
    })
    .toFile(processedImagePath);

  return `/images/products/${webpFilename}`;
}

export async function deleteProductImage(imageUrl: string) {
  if (!imageUrl) return;

  try {
    const filename = path.basename(imageUrl);
    const imagePath = path.join(IMAGES_DIR, filename);
    await fs.unlink(imagePath);
  } catch (error) {
    console.error('Помилка видалення зображення:', error);
  }
}

export function generateImageFilename(originalName: string, productId: number): string {
  const timestamp = Date.now();
  return `product-${productId}-${timestamp}.webp`;
}
