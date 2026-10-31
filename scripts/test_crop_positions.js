const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function testPositions() {
  const rawPath = path.join(__dirname, '../public/images/banners/banner-joma-official-raw.jpg');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const W = 1376;
  const H = 768;

  // Let's create the scaled image:
  // The raw image is 1024 x 317.
  // When scaled to height 768:
  // Width is 2481.
  const scaledH = 768;
  const scaledW = Math.round(1024 * (scaledH / 317)); // 2481

  const scaledImg = await sharp(rawPath)
    .resize(scaledW, scaledH, { fit: 'cover' })
    .toBuffer();

  // Test 1: offset X = 200 (shows more left stadium + player)
  const crop1 = await sharp(scaledImg)
    .extract({ left: 200, top: 0, width: W, height: H })
    .toBuffer();
  await sharp(crop1).jpeg({ quality: 95 }).toFile(path.join(artifactDir, 'crop_offset_200.jpg'));

  // Test 2: offset X = 350
  const crop2 = await sharp(scaledImg)
    .extract({ left: 350, top: 0, width: W, height: H })
    .toBuffer();
  await sharp(crop2).jpeg({ quality: 95 }).toFile(path.join(artifactDir, 'crop_offset_350.jpg'));

  // Test 3: offset X = 500 (centers the soccer ball & divider)
  const crop3 = await sharp(scaledImg)
    .extract({ left: 500, top: 0, width: W, height: H })
    .toBuffer();
  await sharp(crop3).jpeg({ quality: 95 }).toFile(path.join(artifactDir, 'crop_offset_500.jpg'));

  // Test 4: offset X = 650 (focuses more on the padel player and center ball)
  const crop4 = await sharp(scaledImg)
    .extract({ left: 650, top: 0, width: W, height: H })
    .toBuffer();
  await sharp(crop4).jpeg({ quality: 95 }).toFile(path.join(artifactDir, 'crop_offset_650.jpg'));

  console.log('Generated test crops 200, 350, 500, 650');
}

testPositions().catch(console.error);
