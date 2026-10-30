const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createBannerVariant1() {
  const width = 1280;
  const height = 520;

  // We load 3 tracksuits: Academy IV (101966_331 - navy), Championship VII (103200_600 - red), Phoenix II (103121_700 - royal blue)
  const img1Path = path.join(process.cwd(), 'public/images/joma/101966_331.jpg');
  const img2Path = path.join(process.cwd(), 'public/images/joma/103200_600.jpg');
  const img3Path = path.join(process.cwd(), 'public/images/joma/103121_700.jpg');

  // Resize tracksuit images with transparent background or clean cutout
  const t1 = await sharp(img1Path).resize(360, 460, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();
  const t2 = await sharp(img2Path).resize(380, 480, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();
  const t3 = await sharp(img3Path).resize(340, 440, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();

  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 "${width}" "${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#021B2B"/>
        <stop offset="45%" stop-color="#072A40"/>
        <stop offset="100%" stop-color="#0A1826"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFB800"/>
        <stop offset="100%" stop-color="#FF8A00"/>
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00D2FF"/>
        <stop offset="100%" stop-color="#00A3FF"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

    <!-- Subtle Stadium / Tech geometric lines -->
    <circle cx="1100" cy="260" r="320" fill="#00A3FF" opacity="0.08" filter="url(#glow)"/>
    <circle cx="200" cy="450" r="280" fill="#FFB800" opacity="0.05" filter="url(#glow)"/>
    
    <path d="M -50 480 L 1350 480" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
    <path d="M 580 -20 L 750 540" stroke="#00A3FF" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="8 6"/>

    <!-- LEFT CONTENT: Concise text & clear badges -->
    <g transform="translate(64, 75)">
      <!-- JOMA & CLUB BADGE -->
      <rect x="0" y="0" width="280" height="32" rx="16" fill="#00D2FF" fill-opacity="0.15" stroke="#00D2FF" stroke-opacity="0.4" stroke-width="1"/>
      <text x="140" y="21" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5" text-anchor="middle">
        ★ JOMA TEAMWEAR OFICIAL
      </text>

      <!-- MAIN HEADLINE -->
      <text x="0" y="80" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" letter-spacing="-0.5">
        Treninguri pentru
      </text>
      <text x="0" y="125" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" letter-spacing="-0.5">
        Cluburi de Fotbal
      </text>

      <!-- KEY BULLETS (EXACT REQ: MINIM 8, ORICE MODEL, PE COMANDA, PRET LA CERERE) -->
      <g transform="translate(0, 160)">
        <!-- Bullet 1 -->
        <rect x="0" y="0" width="24" height="24" rx="12" fill="#10B981" fill-opacity="0.2"/>
        <text x="12" y="16" fill="#10B981" font-family="system-ui, sans-serif" font-size="14" font-weight="900" text-anchor="middle">✓</text>
        <text x="36" y="17" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
          Comandă pe Proiect: <tspan fill="#FBBF24" font-weight="900">MINIM 8 BUCĂȚI</tspan> per model
        </text>

        <!-- Bullet 2 -->
        <rect x="0" y="38" width="24" height="24" rx="12" fill="#10B981" fill-opacity="0.2"/>
        <text x="12" y="54" fill="#10B981" font-family="system-ui, sans-serif" font-size="14" font-weight="900" text-anchor="middle">✓</text>
        <text x="36" y="55" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
          Toate modelele oficiale Joma (Academy, Championship, Campus)
        </text>

        <!-- Bullet 3 -->
        <rect x="0" y="76" width="24" height="24" rx="12" fill="#10B981" fill-opacity="0.2"/>
        <text x="12" y="92" fill="#10B981" font-family="system-ui, sans-serif" font-size="14" font-weight="900" text-anchor="middle">✓</text>
        <text x="36" y="93" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
          Personalizare completă: Stemă Club, Numere, Nume, Sponsori
        </text>

        <!-- Bullet 4 -->
        <rect x="0" y="114" width="24" height="24" rx="12" fill="#10B981" fill-opacity="0.2"/>
        <text x="12" y="130" fill="#10B981" font-family="system-ui, sans-serif" font-size="14" font-weight="900" text-anchor="middle">✓</text>
        <text x="36" y="131" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
          Mărimi complete: Copii (4XS-XS) &amp; Seniori (S-3XL)
        </text>
      </g>

      <!-- CTA BADGES -->
      <g transform="translate(0, 335)">
        <rect x="0" y="0" width="210" height="46" rx="10" fill="url(#goldGrad)" />
        <text x="105" y="28" fill="#000000" font-family="system-ui, sans-serif" font-size="15" font-weight="900" letter-spacing="0.5" text-anchor="middle">
          PREȚ LA CERERE →
        </text>

        <rect x="225" y="0" width="250" height="46" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
        <text x="350" y="28" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle">
          Solicită Ofertă Personalizată
        </text>
      </g>
    </g>

    <!-- RIGHT CONTAINER CARD (Backdrop for tracksuits) -->
    <rect x="660" y="40" width="580" height="440" rx="24" fill="#031625" fill-opacity="0.6" stroke="#0284C7" stroke-opacity="0.25" stroke-width="1.5"/>
    <text x="950" y="80" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="2" text-anchor="middle">
      GAMA JOMA TEAMWEAR 2026-2027
    </text>
  </svg>
  `;

  const bannerDir = path.join(process.cwd(), 'public/images/banners');
  if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

  const finalBanner = await sharp(Buffer.from(svgOverlay))
    .composite([
      { input: t1, top: 50, left: 660 },
      { input: t3, top: 60, left: 910 },
      { input: t2, top: 40, left: 770 }, // middle in front
    ])
    .webp({ quality: 92 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.webp'));

  console.log('Variant 1 generated successfully:', finalBanner);
}

createBannerVariant1().catch(console.error);

