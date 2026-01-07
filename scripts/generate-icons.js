const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSvg = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);
      await sharp(iconSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate favicon.ico (16x16 and 32x32 combined)
  try {
    const favicon16 = await sharp(iconSvg)
      .resize(16, 16)
      .png()
      .toBuffer();

    const favicon32 = await sharp(iconSvg)
      .resize(32, 32)
      .png()
      .toBuffer();

    // For .ico, we'll just use the 32x32 PNG as favicon.ico
    // (true .ico format requires additional library)
    await sharp(iconSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('✓ Generated favicon.ico (32x32)');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
  }

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);
