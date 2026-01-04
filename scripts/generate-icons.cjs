#!/usr/bin/env node
/**
 * Icon Generator for SharedPlate PWA
 *
 * This script generates PNG icons from the SVG source.
 *
 * Requirements:
 * - Node.js with canvas support, OR
 * - sharp package (npm install sharp)
 *
 * Usage: node scripts/generate-icons.js
 *
 * If you don't have the required packages, you can use online tools:
 * 1. https://realfavicongenerator.net/
 * 2. https://www.pwabuilder.com/imageGenerator
 *
 * Upload public/icons/icon.svg and download all sizes.
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to use sharp if available
async function generateWithSharp() {
  try {
    const sharp = require('sharp');
    const svgPath = path.join(__dirname, '../public/icons/icon.svg');
    const outputDir = path.join(__dirname, '../public/icons');

    const svgBuffer = fs.readFileSync(svgPath);

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon-${size}x${size}.png`);
    }

    // Also generate Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Generated: apple-touch-icon.png');

    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('Generated: favicon-32x32.png');

    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('Generated: favicon-16x16.png');

    console.log('\nAll icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('sharp not found. Install with: npm install sharp');
      console.log('\nAlternatively, use online tools:');
      console.log('1. https://realfavicongenerator.net/');
      console.log('2. https://www.pwabuilder.com/imageGenerator');
      console.log('\nUpload: public/icons/icon.svg');
      createPlaceholders();
    } else {
      throw error;
    }
  }
}

// Create placeholder PNG files (simple colored squares)
function createPlaceholders() {
  console.log('\nCreating placeholder icons...');

  // Minimal PNG header for a teal square (very basic, just for build to pass)
  // In production, replace these with proper icons
  const outputDir = path.join(__dirname, '../public/icons');

  sizes.forEach(size => {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(outputDir, filename);

    // Create a minimal valid PNG (1x1 teal pixel, will be stretched)
    // This is a placeholder - use proper icons in production
    const minimalPng = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0xD7, 0x63, 0x10, 0x65, 0x60, 0x00, 0x00,
      0x00, 0x21, 0x00, 0x11, 0xA7, 0x5D, 0x7B, 0x3B,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
      0xAE, 0x42, 0x60, 0x82
    ]);

    fs.writeFileSync(filepath, minimalPng);
    console.log(`Created placeholder: ${filename}`);
  });

  // Create apple-touch-icon placeholder
  fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.png'), Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
    0x08, 0xD7, 0x63, 0x10, 0x65, 0x60, 0x00, 0x00,
    0x00, 0x21, 0x00, 0x11, 0xA7, 0x5D, 0x7B, 0x3B,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]));
  console.log('Created placeholder: apple-touch-icon.png');

  console.log('\n⚠️  These are placeholder icons!');
  console.log('For production, generate proper icons from public/icons/icon.svg');
  console.log('Use: https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator');
}

generateWithSharp();
