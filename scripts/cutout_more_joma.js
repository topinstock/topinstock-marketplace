const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function cutoutFile(srcPath, outPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const diff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
    const isLightGrey = (r > 225 && g > 225 && b > 225 && Math.abs(r - g) < 10 && Math.abs(r - b) < 10);

    if (diff < 14 || isLightGrey) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outPath);

  console.log(`Saved ${outPath}`);
}

async function main() {
  const dir = 'scratch/cutouts';
  await cutoutFile('public/images/joma/academy_iv_red_black.jpg', path.join(dir, 'academy_red_black.png'));
  await cutoutFile('public/images/joma/academy_iv_yellow_black.jpg', path.join(dir, 'academy_yellow_black.png'));
}

main().catch(console.error);
