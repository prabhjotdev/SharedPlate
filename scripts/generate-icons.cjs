#!/usr/bin/env node
/**
 * Generate proper PWA icons using pngjs (pure JavaScript)
 * Creates teal-colored icons with a simple design
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Colors
const TEAL = { r: 13, g: 148, b: 136 };
const LIGHT_TEAL = { r: 20, g: 184, b: 166 };
const WHITE = { r: 250, g: 249, b: 247 };
const ORANGE = { r: 249, g: 115, b: 22 };

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const outerRadius = size * 0.47;
  const innerRadius = size * 0.39;
  const plateRadius = size * 0.31;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dist = distance(x, y, center, center);

      let color;

      if (dist <= plateRadius) {
        color = WHITE;
      } else if (dist <= innerRadius) {
        color = LIGHT_TEAL;
      } else if (dist <= outerRadius) {
        color = TEAL;
      } else {
        color = TEAL; // Background for maskable
      }

      // Simple heart in center
      const heartY = center - size * 0.02;
      const heartSize = size * 0.15;
      const leftX = center - heartSize * 0.5;
      const rightX = center + heartSize * 0.5;
      const circleY = heartY - heartSize * 0.3;
      const radius = heartSize * 0.55;

      const inLeft = distance(x, y, leftX, circleY) <= radius;
      const inRight = distance(x, y, rightX, circleY) <= radius;

      let inTriangle = false;
      const triTop = circleY;
      const triBottom = heartY + heartSize * 0.8;
      if (y >= triTop && y <= triBottom) {
        const progress = (y - triTop) / (triBottom - triTop);
        const halfWidth = heartSize * (1 - progress);
        if (x >= center - halfWidth && x <= center + halfWidth) {
          inTriangle = true;
        }
      }

      if ((inLeft || inRight || inTriangle) && dist <= plateRadius * 1.1) {
        color = ORANGE;
      }

      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255;
    }
  }

  return png;
}

console.log('Generating PWA icons with pngjs...\n');

sizes.forEach(size => {
  const png = createIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`✓ ${filename} (${buffer.length} bytes)`);
});

// Apple touch icon
const apple = createIcon(180);
const appleBuffer = PNG.sync.write(apple);
fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.png'), appleBuffer);
console.log(`✓ apple-touch-icon.png (${appleBuffer.length} bytes)`);

// Favicons
[32, 16].forEach(size => {
  const png = createIcon(size);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(outputDir, `favicon-${size}x${size}.png`), buffer);
  console.log(`✓ favicon-${size}x${size}.png (${buffer.length} bytes)`);
});

console.log('\n✅ Done! Icons are now valid PNGs for PWA installation.');
