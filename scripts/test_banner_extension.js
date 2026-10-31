const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function testComposite() {
  const rawPath = path.join(__dirname, '../public/images/banners/banner-joma-official-raw.jpg');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const TARGET_W = 1600;
  const TARGET_H = 740;

  // Let's inspect edges of the raw image to sample colors
  const rawImg = sharp(rawPath);
  const rawMeta = await rawImg.metadata();
  const rawBuffer = await rawImg.raw().toBuffer();

  // Helper to sample RGB at x, y
  function getPixel(x, y) {
    const idx = (y * rawMeta.width + x) * rawMeta.channels;
    return { r: rawBuffer[idx], g: rawBuffer[idx+1], b: rawBuffer[idx+2] };
  }

  const topLeft = getPixel(10, 5);
  const topMidLeft = getPixel(300, 5);
  const topMidRight = getPixel(700, 5);
  const topRight = getPixel(1010, 5);

  const botLeft = getPixel(10, 310);
  const botMidLeft = getPixel(300, 310);
  const botMidRight = getPixel(700, 310);
  const botRight = getPixel(1010, 310);

  console.log('Top colors:', { topLeft, topMidLeft, topMidRight, topRight });
  console.log('Bot colors:', { botLeft, botMidLeft, botMidRight, botRight });
}

testComposite().catch(console.error);
