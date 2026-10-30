const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildEliteBanner() {
  const width = 1600;
  const height = 620;

  // 1. Prepare trimmed cutouts
  const champBuffer = await sharp('scratch/cutouts/championship_cutout.png')
    .trim()
    .resize({ height: 530 })
    .toBuffer();

  const blueBuffer = await sharp('scratch/cutouts/academy_cutout.png')
    .trim()
    .resize({ height: 490 })
    .toBuffer();

  const yellowBuffer = await sharp('scratch/cutouts/academy_yellow_black.png')
    .trim()
    .resize({ height: 490 })
    .toBuffer();

  const champMeta = await sharp(champBuffer).metadata();
  const blueMeta = await sharp(blueBuffer).metadata();
  const yellowMeta = await sharp(yellowBuffer).metadata();

  console.log('Champ size:', champMeta.width, champMeta.height);
  console.log('Blue size:', blueMeta.width, blueMeta.height);
  console.log('Yellow size:', yellowMeta.width, yellowMeta.height);

  // 2. SVG Background & Master Typography
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Deep Obsidian / Carbon Football Stadium Gradient -->
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#030712"/>
        <stop offset="40%" stop-color="#061222"/>
        <stop offset="75%" stop-color="#08182D"/>
        <stop offset="100%" stop-color="#02050A"/>
      </linearGradient>

      <!-- Gradient for TRENING JOMA -->
      <linearGradient id="whiteSilver" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E2E8F0"/>
      </linearGradient>

      <!-- Gradient for PERSONALIZARE PENTRU ECHIPE -->
      <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#00D2FF"/>
      </linearGradient>

      <!-- Rim Spotlight behind tracksuits -->
      <radialGradient id="rimLight" cx="76%" cy="48%" r="45%">
        <stop offset="0%" stop-color="#0284C7" stop-opacity="0.38"/>
        <stop offset="40%" stop-color="#0369A1" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>

      <!-- Subtle Stadium Floodlight Beams -->
      <radialGradient id="floodlight" cx="80%" cy="10%" r="50%">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.18"/>
        <stop offset="60%" stop-color="#0284C7" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>

      <!-- Floor Shadows -->
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="16" result="blur"/>
      </filter>

      <!-- Crisp Typography Shadow -->
      <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.85"/>
      </filter>
    </defs>

    <!-- Base Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>

    <!-- Lighting Atmosphere -->
    <rect width="${width}" height="${height}" fill="url(#rimLight)"/>
    <rect width="${width}" height="${height}" fill="url(#floodlight)"/>

    <!-- Subtle Stadium Speed Lines / Minimalist Pitch Graphics -->
    <g opacity="0.08">
      <path d="M 0 540 L ${width} 540" stroke="#38BDF8" stroke-width="2"/>
      <path d="M 680 -50 L 860 680" stroke="#ffffff" stroke-width="2"/>
      <path d="M 720 -50 L 900 680" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="14 10"/>
      <circle cx="1200" cy="540" r="320" fill="none" stroke="#ffffff" stroke-width="2"/>
    </g>

    <!-- Floor Reflections and Contact Shadows -->
    <ellipse cx="1210" cy="555" rx="340" ry="24" fill="#000000" opacity="0.7" filter="url(#softShadow)"/>
    <ellipse cx="1060" cy="550" rx="160" ry="18" fill="#0284C7" opacity="0.25" filter="url(#softShadow)"/>
    <ellipse cx="1210" cy="552" rx="160" ry="18" fill="#DC2626" opacity="0.2" filter="url(#softShadow)"/>
    <ellipse cx="1350" cy="550" rx="160" ry="18" fill="#F59E0B" opacity="0.2" filter="url(#softShadow)"/>

    <!-- LEFT COLUMN: PURE, CONFIDENT, MODERN BRAND TYPOGRAPHY -->
    <g transform="translate(100, 160)" filter="url(#titleShadow)">
      
      <!-- Minimalist Sports Pill: JOMA OFFICIAL TEAMWEAR -->
      <g>
        <rect x="0" y="0" width="230" height="34" rx="17" fill="#0284C7" fill-opacity="0.16" stroke="#38BDF8" stroke-opacity="0.4" stroke-width="1.5"/>
        <circle cx="20" cy="17" r="4.5" fill="#38BDF8"/>
        <text x="125" y="22" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" letter-spacing="2" text-anchor="middle">
          JOMA TEAMWEAR
        </text>
      </g>

      <!-- MAIN HEADLINE 1: TRENING JOMA -->
      <text x="0" y="118" fill="url(#whiteSilver)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', 'Impact', sans-serif" font-size="82" font-weight="950" letter-spacing="-1.5">
        TRENING JOMA
      </text>

      <!-- MAIN HEADLINE 2: PERSONALIZARE PENTRU ECHIPE -->
      <text x="0" y="185" fill="url(#cyanNeon)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', sans-serif" font-size="44" font-weight="900" letter-spacing="-0.5">
        PERSONALIZARE PENTRU ECHIPE
      </text>

      <!-- Minimal Subline -->
      <text x="0" y="235" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" letter-spacing="0.5">
        Modele oficiale de club • Broderie stemă, numere &amp; sponsori
      </text>

      <!-- High-End Minimalist Pill CTA Button -->
      <g transform="translate(0, 275)">
        <rect x="0" y="0" width="240" height="52" rx="26" fill="#38BDF8" />
        <text x="120" y="32" fill="#030914" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" letter-spacing="1" text-anchor="middle">
          VEZI TOATE MODELELE →
        </text>
      </g>
    </g>

    <!-- RIGHT CONTAINER PODIUM ACCENT -->
    <rect x="910" y="35" width="620" height="540" rx="32" fill="#040D1B" fill-opacity="0.35" stroke="#38BDF8" stroke-opacity="0.12" stroke-width="1.5"/>
  </svg>
  `;

  // Right Tracksuit Trio Positioning:
  // - Blue (left): x: 940, y: 55
  // - Yellow (right): x: 1290, y: 55
  // - Championship (center-front, overlapping both): x: 1105, y: 35
  const bannerDir = path.join(process.cwd(), 'public/images/banners');

  const finalWebp = await sharp(Buffer.from(svg))
    .composite([
      { input: blueBuffer, top: 55, left: 950 },
      { input: yellowBuffer, top: 55, left: 1300 },
      { input: champBuffer, top: 30, left: 1115 }
    ])
    .webp({ quality: 96 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.webp'));

  console.log('Elite banner webp created:', finalWebp);

  // JPEG version
  await sharp(path.join(bannerDir, 'banner-joma-cluburi.webp'))
    .jpeg({ quality: 94 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.jpg'));

  // Also copy to brain for visual inspection
  await sharp(path.join(bannerDir, 'banner-joma-cluburi.webp'))
    .jpeg({ quality: 94 })
    .toFile('C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity\\brain\\19d0e857-b06d-41a5-bd0a-1af15803fbec\\banner_elite.jpg');

  console.log('Copied to brain: banner_elite.jpg');
}

buildEliteBanner().catch(console.error);
