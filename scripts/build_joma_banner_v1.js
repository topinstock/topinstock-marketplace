const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildBanner() {
  const width = 1200;
  const height = 500;

  const t1Path = path.join(process.cwd(), 'public/images/joma/academy_iv_royal_navy.jpg');
  const t2Path = path.join(process.cwd(), 'public/images/joma/championship_vii_black_red.jpg');
  const t3Path = path.join(process.cwd(), 'public/images/joma/phoenix_ii_black_white.jpg');

  // Resize tracksuits with clean drop-shadow padding
  const t1 = await sharp(t1Path).resize(320, 380, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();
  const t2 = await sharp(t2Path).resize(350, 420, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();
  const t3 = await sharp(t3Path).resize(310, 370, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#021526"/>
        <stop offset="50%" stop-color="#072A40"/>
        <stop offset="100%" stop-color="#081A2A"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FBBF24"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>

    <!-- Tech Grid Lines / Stadium Atmosphere -->
    <circle cx="950" cy="250" r="280" fill="#0284C7" opacity="0.12"/>
    <circle cx="150" cy="400" r="220" fill="#FBBF24" opacity="0.04"/>
    <path d="M 0 450 L 1200 450" stroke="#38BDF8" stroke-opacity="0.15" stroke-width="2"/>
    <path d="M 520 -50 L 680 550" stroke="#ffffff" stroke-opacity="0.06" stroke-width="2"/>

    <!-- Left Content Column -->
    <g transform="translate(60, 60)">
      <!-- Badge -->
      <rect x="0" y="0" width="260" height="30" rx="15" fill="#38BDF8" fill-opacity="0.12" stroke="#38BDF8" stroke-opacity="0.35" stroke-width="1.5"/>
      <text x="130" y="20" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" letter-spacing="1.5" text-anchor="middle">
        ★ JOMA TEAMWEAR OFICIAL
      </text>

      <!-- Main Headline -->
      <text x="0" y="76" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" letter-spacing="-0.5">
        Treninguri pentru
      </text>
      <text x="0" y="118" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" letter-spacing="-0.5">
        Cluburi de Fotbal
      </text>

      <!-- Value Props (Simple, Short, Explicit) -->
      <g transform="translate(0, 155)">
        <!-- Bullet 1 -->
        <circle cx="10" cy="10" r="10" fill="#10B981" fill-opacity="0.2"/>
        <text x="10" y="14" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">✓</text>
        <text x="28" y="14" fill="#F8FAFC" font-family="sans-serif" font-size="15" font-weight="700">
          Comandă pe Proiect: <tspan fill="#FBBF24" font-weight="900">MINIM 8 BUCĂȚI</tspan> per model
        </text>

        <!-- Bullet 2 -->
        <circle cx="10" cy="46" r="10" fill="#10B981" fill-opacity="0.2"/>
        <text x="10" y="50" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">✓</text>
        <text x="28" y="50" fill="#F8FAFC" font-family="sans-serif" font-size="15" font-weight="700">
          Orice model Joma: Academy, Championship, Phoenix
        </text>

        <!-- Bullet 3 -->
        <circle cx="10" cy="82" r="10" fill="#10B981" fill-opacity="0.2"/>
        <text x="10" y="86" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">✓</text>
        <text x="28" y="86" fill="#F8FAFC" font-family="sans-serif" font-size="15" font-weight="700">
          Personalizare completă: Stemă Club, Numere &amp; Sponsori
        </text>

        <!-- Bullet 4 -->
        <circle cx="10" cy="118" r="10" fill="#10B981" fill-opacity="0.2"/>
        <text x="10" y="122" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">✓</text>
        <text x="28" y="122" fill="#F8FAFC" font-family="sans-serif" font-size="15" font-weight="700">
          Gama completă de mărimi: Copii (4XS-XS) &amp; Adulți (S-3XL)
        </text>
      </g>

      <!-- Action Button / Price Tag -->
      <g transform="translate(0, 315)">
        <rect x="0" y="0" width="180" height="48" rx="10" fill="url(#gold)" filter="url(#shadow)"/>
        <text x="90" y="30" fill="#0F172A" font-family="sans-serif" font-size="15" font-weight="900" letter-spacing="0.5" text-anchor="middle">
          PREȚ LA CERERE
        </text>

        <rect x="195" y="0" width="240" height="48" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <text x="315" y="30" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="800" text-anchor="middle">
          Cere Ofertă Echipă →
        </text>
      </g>
    </g>

    <!-- Right Showcase Card for Tracksuit Photography -->
    <rect x="580" y="40" width="580" height="420" rx="20" fill="#031627" fill-opacity="0.8" stroke="#38BDF8" stroke-opacity="0.25" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="870" y="75" fill="#94A3B8" font-family="sans-serif" font-size="12" font-weight="900" letter-spacing="2" text-anchor="middle">
      GAMA OFICIALĂ JOMA FOTBAL 2026-2027
    </text>
  </svg>
  `;

  const bannerDir = path.join(process.cwd(), 'public/images/banners');
  if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

  const finalBuffer = await sharp(Buffer.from(svg))
    .composite([
      { input: t1, top: 70, left: 590 },
      { input: t3, top: 80, left: 840 },
      { input: t2, top: 50, left: 700 } // Front center
    ])
    .webp({ quality: 95 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.webp'));

  console.log('Banner generated successfully at public/images/banners/banner-joma-cluburi.webp', finalBuffer);

  // Also export as jpg for maximum compatibility
  await sharp(path.join(bannerDir, 'banner-joma-cluburi.webp'))
    .jpeg({ quality: 92 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.jpg'));

  console.log('JPEG export ready at public/images/banners/banner-joma-cluburi.jpg');
}

buildBanner().catch(console.error);

