const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const rawPath = path.join(__dirname, '../public/images/banners/banner-joma-official-raw.jpg');
  const bannersDir = path.join(__dirname, '../public/images/banners');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const W = 1376;
  const H = 768;

  // We want the raw image (1024 x 317) to be scaled and framed so that:
  // - The football player and soccer ball are clearly visible
  // - The white diagonal divider is in place
  // - The padel player and green court are clearly visible on the right
  // - The top and bottom are naturally extended so the aspect ratio matches 1376 x 768 (16:9)
  // - The left side has dark stadium atmosphere where the HTML text overlay will sit with maximum contrast!

  // 1. Scale raw image width to 1376 (height becomes ~426px)
  const scaledH = Math.round(317 * (W / 1024)); // 426px
  const scaledImg = await sharp(rawPath)
    .resize(W, scaledH, { fit: 'cover' })
    .toBuffer();

  // 2. Background canvas matching the stadium (left) and court (right)
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stadiumSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020914" />
          <stop offset="60%" stop-color="#041226" />
          <stop offset="100%" stop-color="#081c38" />
        </linearGradient>
        <linearGradient id="courtWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#012213" />
          <stop offset="60%" stop-color="#043a21" />
          <stop offset="100%" stop-color="#074e2d" />
        </linearGradient>
      </defs>

      <!-- Left Stadium background -->
      <polygon points="0,0 710,0 550,${H} 0,${H}" fill="url(#stadiumSky)" />

      <!-- Right Court background -->
      <polygon points="710,0 ${W},0 ${W},${H} 550,${H}" fill="url(#courtWall)" />

      <!-- Diagonal White Divider extension -->
      <polygon points="704,0 716,0 556,${H} 544,${H}" fill="#FFFFFF" opacity="0.95" />
    </svg>
  `);

  const bgBuffer = await sharp(bgSvg).png().toBuffer();

  // 3. Composite scaled image in the middle vertically
  const yOffset = Math.round((H - scaledH) / 2); // 171px

  // Subtle top/bottom feathering mask
  const maskSvg = Buffer.from(`
    <svg width="${W}" height="${scaledH}" viewBox="0 0 ${W} ${scaledH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vMask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="7%" stop-color="#000000" stop-opacity="1" />
          <stop offset="93%" stop-color="#000000" stop-opacity="1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${scaledH}" fill="url(#vMask)" />
    </svg>
  `);

  const feathered = await sharp(scaledImg)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const finalImg = sharp(bgBuffer)
    .composite([{ input: feathered, top: yOffset, left: 0 }]);

  // Save clean banner WebP & JPEG for production
  await finalImg
    .clone()
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(bannersDir, 'banner-joma-cluburi.webp'));

  await finalImg
    .clone()
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(path.join(bannersDir, 'banner-joma-cluburi.jpg'));

  // Also save in artifactDir
  await finalImg
    .clone()
    .jpeg({ quality: 95 })
    .toFile(path.join(artifactDir, 'joma_clean_banner_final_1376x768.jpg'));

  console.log('Successfully generated clean, scaled Joma hero banner at 1376x768:');
  console.log('- public/images/banners/banner-joma-cluburi.webp');
  console.log('- public/images/banners/banner-joma-cluburi.jpg');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
