const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function cutout(srcPath, outPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4

  // Top-left pixel is background
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  console.log(`Sampling bg color: ${bgR}, ${bgG}, ${bgB}`);

  // Create alpha mask
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Distance to light grey background
    const diff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
    
    // Also check if it's very light uniform grey (above 225 and close channels)
    const isLightGrey = (r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 12 && Math.abs(r - b) < 12);

    if (diff < 15 || isLightGrey) {
      data[i + 3] = 0; // transparent
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png()
  .toFile(outPath);

  console.log(`Cutout saved to ${outPath}`);
}

async function main() {
  const scratchDir = path.join(process.cwd(), 'scratch/cutouts');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  await cutout('public/images/joma/championship_vii_black_red.jpg', path.join(scratchDir, 'championship_cutout.png'));
  await cutout('public/images/joma/academy_iv_royal_navy.jpg', path.join(scratchDir, 'academy_cutout.png'));
  await cutout('scratch/phoenix_views/view_1.jpg', path.join(scratchDir, 'phoenix_cutout.png'));
}

main().catch(console.error);

