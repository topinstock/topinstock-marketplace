const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function testFullFit() {
  const rawPath = path.join(__dirname, '../public/images/banners/banner-joma-official-raw.jpg');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const W = 1376;
  const H = 768;

  // Scale raw to width 1376
  const scaledH = Math.round(317 * (W / 1024)); // 426px
  const scaledImg = await sharp(rawPath)
    .resize(W, scaledH, { fit: 'cover' })
    .toBuffer();

  // Create an extended 1376 x 768 canvas with matching background gradients:
  // Left half: Dark stadium blue (#020A17 -> #0B1E36)
  // Right half: Dark court green (#022B16 -> #0D5C35)
  // Diagonal split line in background matching the image divider
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stadiumSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020914" />
          <stop offset="50%" stop-color="#041226" />
          <stop offset="100%" stop-color="#081c38" />
        </linearGradient>
        <linearGradient id="stadiumGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0b2419" />
          <stop offset="100%" stop-color="#06150e" />
        </linearGradient>
        <linearGradient id="courtTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#022414" />
          <stop offset="100%" stop-color="#054527" />
        </linearGradient>
        <linearGradient id="courtFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d6338" />
          <stop offset="100%" stop-color="#07381f" />
        </linearGradient>
      </defs>

      <!-- Left Stadium Side -->
      <polygon points="0,0 720,0 560,${H} 0,${H}" fill="url(#stadiumSky)" />
      
      <!-- Right Court Side -->
      <polygon points="720,0 ${W},0 ${W},${H} 560,${H}" fill="url(#courtTop)" />

      <!-- Diagonal Divider extension -->
      <polygon points="710,0 730,0 570,${H} 550,${H}" fill="#FFFFFF" opacity="0.9" />
    </svg>
  `);

  const bgBuffer = await sharp(bgSvg).png().toBuffer();

  // Composite the scaled image onto the background
  const yOffset = Math.round((H - scaledH) / 2); // 171px

  // Subtle gradient feathering on the top and bottom of the scaled image so it blends seamlessly
  const maskSvg = Buffer.from(`
    <svg width="${W}" height="${scaledH}" viewBox="0 0 ${W} ${scaledH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vMask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="6%" stop-color="#000000" stop-opacity="1" />
          <stop offset="94%" stop-color="#000000" stop-opacity="1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${scaledH}" fill="url(#vMask)" />
    </svg>
  `);

  const featheredScaled = await sharp(scaledImg)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const finalComposite = await sharp(bgBuffer)
    .composite([{ input: featheredScaled, top: yOffset, left: 0 }])
    .jpeg({ quality: 95 })
    .toBuffer();

  await sharp(finalComposite).toFile(path.join(artifactDir, 'joma_full_fit_scaled.jpg'));
  console.log('Saved joma_full_fit_scaled.jpg');
}

testFullFit().catch(console.error);
