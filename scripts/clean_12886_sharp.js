const sharp = require('sharp');
const path = require('path');

async function clean12886() {
  const inputPath = path.join(__dirname, '..', 'scratch', 'trees_to_clean', 'TIS-TEO-12886_raw.jpg');
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'brazi', 'TIS-TEO-12886.jpg');

  // Watermark "FLIPPY" is around y: 835 to 885, x: 465 to 645
  // We can overlay a white patch sampled from surrounding snow
  const width = 190;
  const height = 55;
  
  // Sample color from y: 830, x: 460
  // In sample_tree_12886, the background there is pure white / snow rgb(245, 245, 245) to rgb(255, 255, 255)
  // Let's create an SVG rectangle or clean patch
  const patchSvg = Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#f8f9fa" opacity="0.98"/>
    </svg>`
  );

  await sharp(inputPath)
    .composite([
      {
        input: patchSvg,
        top: 835,
        left: 465
      }
    ])
    .toFile(outputPath);

  console.log(`Cleaned 12886 to ${outputPath}`);
}

clean12886().catch(console.error);

