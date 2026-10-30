const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildBannerV2() {
  const width = 1280;
  const height = 540;

  const t1Path = path.join(process.cwd(), 'public/images/joma/academy_iv_royal_navy.jpg');
  const t2Path = path.join(process.cwd(), 'public/images/joma/championship_vii_black_red.jpg');
  const t3Path = path.join(process.cwd(), 'public/images/joma/phoenix_ii_black_white.jpg');
  const ballPath = path.join(process.cwd(), 'public/images/joma/frf_ball.jpg');

  // Resize tracksuits with clean drop-shadow padding
  const t1 = await sharp(t1Path).resize(330, 410, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();
  const t2 = await sharp(t2Path).resize(370, 450, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();
  const t3 = await sharp(t3Path).resize(330, 410, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();
  const ball = await sharp(ballPath).resize(140, 140, { fit: 'contain', background: { r: 10, g: 25, b: 47, alpha: 0 } }).toBuffer();

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#021424"/>
        <stop offset="35%" stop-color="#06253B"/>
        <stop offset="70%" stop-color="#09314F"/>
        <stop offset="100%" stop-color="#031627"/>
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>
      <linearGradient id="redAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="100%" stop-color="#DC2626"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FCD34D"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </linearGradient>
      <radialGradient id="stageLight" cx="75%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#0284C7" stop-opacity="0.35"/>
        <stop offset="60%" stop-color="#0284C7" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#0284C7" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.7"/>
      </filter>
    </defs>

    <!-- Main Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>

    <!-- Dynamic Stage Light -->
    <rect width="${width}" height="${height}" fill="url(#stageLight)"/>

    <!-- Subtle Athletic Pitch Graphic Lines -->
    <path d="M 0 490 L ${width} 490" stroke="#38BDF8" stroke-opacity="0.2" stroke-width="2"/>
    <circle cx="1000" cy="540" r="220" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="2"/>
    <path d="M 570 -50 L 720 590" stroke="#ffffff" stroke-opacity="0.05" stroke-width="2"/>

    <!-- Left Content Column -->
    <g transform="translate(64, 60)">
      <!-- Top Brand Tag -->
      <g>
        <rect x="0" y="0" width="280" height="34" rx="8" fill="#0284C7" fill-opacity="0.18" stroke="#38BDF8" stroke-opacity="0.5" stroke-width="1.5"/>
        <!-- Stylized Joma J -->
        <path d="M 16 12 L 26 12 L 26 22 L 20 22" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
        <text x="145" y="22" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" letter-spacing="1.5" text-anchor="middle">
          JOMA TEAMWEAR ROMÂNIA
        </text>
      </g>

      <!-- Main Headline -->
      <text x="0" y="85" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="900" letter-spacing="-0.8">
        Treninguri Oficiale
      </text>
      <text x="0" y="132" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="900" letter-spacing="-0.8">
        pentru Cluburi &amp; Echipe
      </text>

      <!-- 4 Explicit Highlights -->
      <g transform="translate(0, 168)">
        <!-- Highlight 1: Min 8 bucati -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="460" height="42" rx="8" fill="#082236" stroke="#0F3858" stroke-width="1"/>
          <circle cx="21" cy="21" r="11" fill="#F59E0B" fill-opacity="0.2"/>
          <text x="21" y="26" fill="#F59E0B" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">★</text>
          <text x="44" y="26" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="800">
            Comandă pe proiect: <tspan fill="#FCD34D" font-weight="900">MINIM 8 BUCĂȚI</tspan> per model
          </text>
        </g>

        <!-- Highlight 2: Modele complete -->
        <g transform="translate(0, 48)">
          <rect x="0" y="0" width="460" height="42" rx="8" fill="#082236" stroke="#0F3858" stroke-width="1"/>
          <circle cx="21" cy="21" r="11" fill="#10B981" fill-opacity="0.2"/>
          <text x="21" y="26" fill="#10B981" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">✓</text>
          <text x="44" y="26" fill="#E2E8F0" font-family="sans-serif" font-size="15" font-weight="700">
            Toate modelele Joma (Academy, Championship, Danubio, Phoenix)
          </text>
        </g>

        <!-- Highlight 3: Personalizare -->
        <g transform="translate(0, 96)">
          <rect x="0" y="0" width="460" height="42" rx="8" fill="#082236" stroke="#0F3858" stroke-width="1"/>
          <circle cx="21" cy="21" r="11" fill="#10B981" fill-opacity="0.2"/>
          <text x="21" y="26" fill="#10B981" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">✓</text>
          <text x="44" y="26" fill="#E2E8F0" font-family="sans-serif" font-size="15" font-weight="700">
            Personalizare inclusă: Stemă Club, Numere, Nume &amp; Sponsori
          </text>
        </g>

        <!-- Highlight 4: Marimi -->
        <g transform="translate(0, 144)">
          <rect x="0" y="0" width="460" height="42" rx="8" fill="#082236" stroke="#0F3858" stroke-width="1"/>
          <circle cx="21" cy="21" r="11" fill="#10B981" fill-opacity="0.2"/>
          <text x="21" y="26" fill="#10B981" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">✓</text>
          <text x="44" y="26" fill="#E2E8F0" font-family="sans-serif" font-size="15" font-weight="700">
            Mărimi complete: Copii &amp; Juniori (4XS-XS) • Seniori (S-3XL)
          </text>
        </g>
      </g>

      <!-- Bottom CTAs: Preț la cerere -->
      <g transform="translate(0, 375)">
        <!-- Preț la cerere Badge -->
        <rect x="0" y="0" width="200" height="50" rx="10" fill="url(#gold)" filter="url(#shadow)"/>
        <text x="100" y="31" fill="#0B132B" font-family="sans-serif" font-size="16" font-weight="900" letter-spacing="0.5" text-anchor="middle">
          PREȚ LA CERERE
        </text>

        <!-- Button -->
        <rect x="215" y="0" width="245" height="50" rx="10" fill="#0284C7" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="337" y="31" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle">
          Cere Ofertă Club →
        </text>
      </g>
    </g>

    <!-- Right Showcase Container Card -->
    <rect x="630" y="40" width="600" height="460" rx="24" fill="#021727" fill-opacity="0.85" stroke="#0284C7" stroke-opacity="0.3" stroke-width="2" filter="url(#shadow)"/>
    
    <!-- Header of showcase -->
    <text x="930" y="75" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="900" letter-spacing="2.5" text-anchor="middle">
      COLECȚIA OFICIALĂ CLUBURI 2026-2027
    </text>

    <!-- Stage floor reflection -->
    <ellipse cx="930" cy="460" rx="260" ry="25" fill="#000000" fill-opacity="0.4"/>
  </svg>
  `;

  const bannerDir = path.join(process.cwd(), 'public/images/banners');

  await sharp(Buffer.from(svg))
    .composite([
      { input: t1, top: 75, left: 635 },
      { input: t3, top: 75, left: 885 },
      { input: t2, top: 45, left: 745 }, // Front and center
      { input: ball, top: 350, left: 1090 } // FRF official match ball near bottom right
    ])
    .webp({ quality: 96 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi-v2.webp'));

  console.log('Banner V2 generated successfully at banner-joma-cluburi-v2.webp');

  // Also replace main banner-joma-cluburi.webp with V2 (since V2 is noticeably richer, includes ball and higher resolution)
  await sharp(path.join(bannerDir, 'banner-joma-cluburi-v2.webp'))
    .webp({ quality: 96 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.webp'));

  await sharp(path.join(bannerDir, 'banner-joma-cluburi-v2.webp'))
    .jpeg({ quality: 94 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.jpg'));

  console.log('Main banner assets updated to V2!');
}

buildBannerV2().catch(console.error);

