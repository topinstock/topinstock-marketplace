const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function buildHeroBanner() {
  const rawPath = path.join(__dirname, '../public/images/banners/banner-joma-official-raw.jpg');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const TARGET_W = 1376;
  const TARGET_H = 768;

  // Let's create the background image:
  // We want the football player, ball, diagonal divider, and padel player to be beautifully framed.
  // The raw image is 1024 x 317.
  // If we scale the raw image so its height fills or fits the right side, let's test scaling.
  // If raw height is scaled to 768:
  // scale = 768 / 317 = 2.4227
  // scaledWidth = 1024 * 2.4227 = 2480px.
  // If we position the scaled image with an offset X, where do the players end up?
  // In raw (1024):
  // Football player: x=260 to 450 -> in scaled: x=630 to 1090
  // Ball: x=440 -> in scaled: x=1066
  // Divider: x=480..520 -> in scaled: x=1160..1260
  // Padel player: x=600 to 800 -> in scaled: x=1450 to 1940
  // If offset X is -500:
  // Football player is at x = 630 - 500 = 130 (too far left, would be under text!)
  
  // What if instead we use the raw image scaled so its entire content fits within the height or framed with extended atmosphere?
  // Let's test two approaches:
  // Approach A: Scale raw image to height 640px (scale = 2.02).
  // Scaled dimensions: 2068 x 640.
  // Place vertically centered at y = 64.
  // Extend top/bottom with dark stadium on left and green court on right.
  // Offset X: -800 to -1100.
  
  // Approach B: Seamless composition:
  // Let's inspect the scaled player positions:
  const scaledH = 768;
  const scale = scaledH / 317;
  const scaledW = Math.round(1024 * scale); // 2481

  console.log('Scaled dimensions:', scaledW, 'x', scaledH);

  // If offset X = -1100:
  // x=0 is raw x = 1100 / 2.42 = 454 (around ball / player)
  // Let's test multiple X offsets to find the sweet spot where:
  // - Padel player is on the far right (x: 950 to 1350)
  // - Football player is in the middle (x: 500 to 900)
  // - Left (x: 0 to 500) has dark stadium background where the text overlay will sit!

  // For football player to be at x: 500..900:
  // Raw player is at x: 260..450 -> scaled is x: 630..1090.
  // Desired x = 500..900 -> offset X = -(630 - 500) = -130 to -(1090 - 900) = -190.
  // But with offset X = -150:
  // Scaled width is 2481. Canvas width is 1376.
  // The right edge would be at 2481 - 150 = 2331, so the padel player (scaled x: 1450..1940) would be at 1300..1790 (partially off screen)!
  
  // AH! Because in the raw image:
  // Distance between Football player (x=260) and Padel player (x=800) is 540px.
  // Scaled distance is 540 * 2.42 = 1307px!
  // In a 1376px canvas, 1307px spans ALMOST THE ENTIRE CANVAS!
  // If we scale the height to 768, the two players span 1307px, meaning one is on the far left and one is on the far right!
  // THAT'S WHY the football player was on the far left under the text in the screenshot!
}
buildHeroBanner().catch(console.error);
