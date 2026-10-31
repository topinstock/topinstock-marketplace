const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function buildCleanHero() {
  const rawPath = path.join(__dirname, '../public/images/banners/banner-joma-official-raw.jpg');
  const bannersDir = path.join(__dirname, '../public/images/banners');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const W = 1376;
  const H = 768;

  // Let's analyze how to scale the raw image (1024 x 317):
  // We want the football player, soccer ball, divider, and padel player to fit within H = 768.
  // If we scale the raw image to H = 768:
  // scaledWidth = Math.round(1024 * (768 / 317)) = 2481px.
  // In raw (1024):
  // Football player begins at x = 260.
  // Ball is at x = 440.
  // Divider is at x = 480..520.
  // Padel player is at x = 600..820.
  // Right edge of padel player is x = 820.
  // In the 2481px scaled image:
  // Football player is at x = 260 * 2.423 = 630px.
  // Padel player ends at x = 820 * 2.423 = 1987px.
  // Notice: 1987 - 630 = 1357px!
  // So the two players span 1357px when height is 768!
  //
  // But what if the scaled height is 680px or 650px?
  // Let's test scaledH = 680px:
  // scale = 680 / 317 = 2.145
  // scaledW = Math.round(1024 * 2.145) = 2196px.
  // Football player: x = 260 * 2.145 = 558px.
  // Padel player right edge: x = 820 * 2.145 = 1759px.
  // If we align the right edge of padel court with canvas right edge (x = 1376):
  // offsetLeft = 1376 - (1000 * 2.145) = 1376 - 2145 = -769px.
  // Then football player is at 558 - 769 = -211px (partially cut off).
  //
  // What if we fit the ENTIRE width of the raw image into the right ~1000px of the canvas?
  // If raw image width is scaled to 1180px:
  // scale = 1180 / 1024 = 1.152
  // height = 317 * 1.152 = 365px.
  // But canvas height is 768px, so 365px would leave large top/bottom gaps.
  //
  // What if we scale the raw image to fill the canvas height (768px),
  // and we place it with object-position: right or center?
  // Let's test different crops and positions to see what looks best!

  // Variant A: Natural Full Bleed (scaled to H=768, aligned right so padel player + football player & ball are centered/right)
  const scaledImgA = await sharp(rawPath)
    .resize(2481, 768, { fit: 'cover' })
    .toBuffer();

  // Offset X = -500:
  // Canvas width is 1376.
  // Left 0..1376 extracts x = 500..1876 from the 2481px image.
  // In 2481px image:
  // x=630 is football player's torso.
  // x=1066 is the soccer ball.
  // x=1200 is the diagonal divider.
  // x=1500..1900 is the padel player.
  // So in the 1376px canvas:
  // Football player is at x = 630 - 500 = 130px.
  // Soccer ball is at x = 1066 - 500 = 566px.
  // Diagonal divider is at x = 1200 - 500 = 700px (right in the middle!).
  // Padel player is at x = 1000..1350px (on the right half!).
  // AND what about x: 0..500 on the left?
  // We apply a dark stadium vignette on the left (x: 0..600) so the text overlay is 100% readable!

  const cropA = await sharp(scaledImgA)
    .extract({ left: 450, top: 0, width: W, height: H })
    .toBuffer();

  // Add subtle left stadium depth gradient (no text! just clean lighting for text overlay)
  const leftVignetteSvg = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stadiumDark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(2, 6, 23, 0.94)" />
          <stop offset="35%" stop-color="rgba(2, 6, 23, 0.75)" />
          <stop offset="55%" stop-color="rgba(2, 6, 23, 0.30)" />
          <stop offset="75%" stop-color="rgba(2, 6, 23, 0.0)" />
          <stop offset="100%" stop-color="rgba(2, 6, 23, 0.0)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#stadiumDark)" />
    </svg>
  `);

  const finalA = await sharp(cropA)
    .composite([{ input: leftVignetteSvg, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toBuffer();

  await sharp(finalA).toFile(path.join(artifactDir, 'joma_clean_backdrop_A.jpg'));
  console.log('Saved joma_clean_backdrop_A.jpg');

  // Variant B: Slightly wider view with offset 350
  const cropB = await sharp(scaledImgA)
    .extract({ left: 300, top: 0, width: W, height: H })
    .toBuffer();

  const finalB = await sharp(cropB)
    .composite([{ input: leftVignetteSvg, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toBuffer();

  await sharp(finalB).toFile(path.join(artifactDir, 'joma_clean_backdrop_B.jpg'));
  console.log('Saved joma_clean_backdrop_B.jpg');
}

buildCleanHero().catch(console.error);
