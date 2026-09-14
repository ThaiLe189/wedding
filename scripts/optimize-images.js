import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve(import.meta.dirname, '../src/design/assets');
const MAX_WIDTH = 1600;
const QUALITY = 78;

async function findImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findImages(fullPath);
    if (/\.(png|jpe?g)$/i.test(entry.name)) return [fullPath];
    return [];
  }));
  return files.flat();
}

async function convert(filePath) {
  const outPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp');
  const image = sharp(filePath);
  const { width } = await image.metadata();
  const resized = width > MAX_WIDTH ? image.resize({ width: MAX_WIDTH }) : image;
  const { size } = await resized.webp({ quality: QUALITY }).toFile(outPath);
  return { outPath, size };
}

const images = await findImages(ASSETS_DIR);
let total = 0;

for (const filePath of images) {
  const { outPath, size } = await convert(filePath);
  total += size;
  console.log(`${path.relative(ASSETS_DIR, filePath)} -> ${path.relative(ASSETS_DIR, outPath)} (${(size / 1024).toFixed(0)} KB)`);
}

console.log(`\nTotal WebP output: ${(total / 1024 / 1024).toFixed(2)} MB across ${images.length} images`);
