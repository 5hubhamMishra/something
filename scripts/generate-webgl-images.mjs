#!/usr/bin/env node
// Generates right-sized JPEG variants for photos used as Three.js textures.
// The DOM and lightbox keep using the original public image paths through
// Next/Image; these variants are only for R3F `useTexture` callers.

import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('Missing image processor: sharp. Run npm install before regenerating WebGL images.');
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const imageDir = path.join(root, 'public/images');
const outputDir = path.join(imageDir, 'webgl');
const helperPath = path.join(root, 'src/lib/webgl-image.ts');

const imageNames = readdirSync(imageDir)
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .sort((a, b) => a.localeCompare(b));

if (imageNames.length === 0) {
  await writeFile(
    helperPath,
    `export function webglImagePath(image: string, size: 'sm' | 'lg') {\n  void size;\n  return image;\n}\n`,
    'utf8',
  );
  console.log(`No public raster source images found in ${path.relative(root, imageDir)}.`);
  console.log(`Wrote pass-through helper: ${path.relative(root, helperPath)}`);
  process.exit(0);
}

if (existsSync(outputDir)) {
  for (const file of readdirSync(outputDir)) {
    if (/-(sm|lg)\.jpg$/i.test(file)) {
      rmSync(path.join(outputDir, file));
    }
  }
} else {
  mkdirSync(outputDir, { recursive: true });
}

const variants = [
  { suffix: 'sm', size: 900, quality: 78 },
  { suffix: 'lg', size: 1400, quality: 84 },
];

for (const imageName of imageNames) {
  const sourcePath = path.join(imageDir, imageName);
  const parsed = path.parse(imageName);

  for (const variant of variants) {
    await sharp(sourcePath)
      .rotate()
      .resize({
        width: variant.size,
        height: variant.size,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: variant.quality, mozjpeg: true })
      .toFile(path.join(outputDir, `${parsed.name}-${variant.suffix}.jpg`));
  }
}

const webglPaths = imageNames.map((imageName) => `  '/images/${imageName}',`).join('\n');
const helper = `const WEBGL_IMAGE_PATHS = new Set([\n${webglPaths}\n]);\n\nexport function webglImagePath(image: string, size: 'sm' | 'lg') {\n  if (!WEBGL_IMAGE_PATHS.has(image)) return image;\n\n  const dot = image.lastIndexOf('.');\n  const slash = image.lastIndexOf('/');\n  if (dot <= slash) return image;\n\n  return \`\${image.slice(0, slash + 1)}webgl/\${image.slice(slash + 1, dot)}-\${size}.jpg\`;\n}\n`;

await writeFile(helperPath, helper, 'utf8');

const totalBytes = readdirSync(outputDir)
  .filter((file) => /-(sm|lg)\.jpg$/i.test(file))
  .reduce((sum, file) => sum + statSync(path.join(outputDir, file)).size, 0);

console.log(`Generated ${imageNames.length * variants.length} WebGL image variants.`);
console.log(`Output: ${path.relative(root, outputDir)}`);
console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
