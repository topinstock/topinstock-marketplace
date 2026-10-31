const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildProBanner() {
  const width = 1600;
  const height = 640;

  // 1. Prepare Cutouts
  const champPath = path.join(process.cwd(), 'scratch/cutouts/championship_cutout.png');
  const academyPath = path.join(process.cwd(), 'scratch/cutouts/academy_cutout.png');
  const phoenixPath = path.join(process.cwd(), 'scratch/cutouts/phoenix_cutout.png');

  // Resize tracksuits for a dynamic 3D layered sports lineup:
  // Center Hero: Championship Black/Red (tallest, in front)
  // Left: Academy Royal Blue (angled/stepped back)
  // Right: Phoenix Black/White with Hood (stepped back)
  const champ = await sharp(champPath)
    .resize(460, 560, { fit: 'contain' })
    .toBuffer();

  const academy = await sharp(academyPath)
    .resize(420, 510, { fit: 'contain' })
    .toBuffer();

  const phoenix = await sharp(phoenixPath)
    .resize(410, 500, { fit: 'contain' })
    .toBuffer();

  // 2. SVG Background and Typography:
  // Sleek, minimal, high-impact, athletic dark aesthetic.
  // TEXT AS REQUESTED: "TRENING JOMA" + "PERSONALIZARE PENTRU ECHIPE" - NO OTHER CLUTTER!
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradient: Deep carbon slate to midnight blue -->
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050811"/>
        <stop offset="35%" stop-color="#080F1F"/>
        <stop offset="70%" stop-color="#0B152A"/>
        <stop offset="100%" stop-color="#03060C"/>
      </linearGradient>

      <!-- Text Gradient for JOMA: Pure White to Ice Cyan -->
      <linearGradient id="textCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </linearGradient>

      <!-- Text Gradient for ECHIPE: Electric Amber Gold -->
      <linearGradient id="accentGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="60%" stop-color="#0284C7"/>
        <stop offset="100%" stop-color="#0369A1"/>
      </linearGradient>

      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>

      <!-- Dramatic Stage Rim Spotlight -->
      <radialGradient id="spotlight" cx="72%" cy="45%" r="48%">
        <stop offset="0%" stop-color="#0284C7" stop-opacity="0.32"/>
        <stop offset="50%" stop-color="#0369A1" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="glowRed" cx="62%" cy="50%" r="35%">
        <stop offset="0%" stop-color="#EF4444" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>

      <!-- Text Shadow -->
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
      </filter>

      <!-- Shadow for Stand -->
      <filter id="standShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="24" result="blur"/>
      </filter>
    </defs>

    <!-- Base Canvas -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>

    <!-- Atmospheric Stage Lighting -->
    <rect width="${width}" height="${height}" fill="url(#spotlight)"/>
    <rect width="${width}" height="${height}" fill="url(#glowRed)"/>

    <!-- Subtle Athletic Pitch / Architecture Geometrics -->
    <g opacity="0.12">
      <!-- Angled speed diagonals -->
      <path d="M 680 -50 L 880 700" stroke="#38BDF8" stroke-width="2"/>
      <path d="M 720 -50 L 920 700" stroke="#ffffff" stroke-width="1" stroke-dasharray="12 8"/>
      <path d="M 640 -50 L 840 700" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.5"/>
      
      <!-- Subtle pitch circle arc -->
      <circle cx="1180" cy="320" r="340" fill="none" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="1180" cy="320" r="342" fill="none" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.4"/>
      
      <!-- Ground line -->
      <path d="M 0 570 L ${width} 570" stroke="#38BDF8" stroke-width="1.5"/>
    </g>

    <!-- Floor Reflections / Stage Shadows for the 3 tracksuits -->
    <ellipse cx="1180" cy="580" rx="360" ry="24" fill="#000000" opacity="0.6" filter="url(#standShadow)"/>
    <ellipse cx="1030" cy="585" rx="180" ry="16" fill="#0284C7" opacity="0.2" filter="url(#standShadow)"/>
    <ellipse cx="1260" cy="585" rx="180" ry="16" fill="#EF4444" opacity="0.15" filter="url(#standShadow)"/>

    <!-- LEFT HERO TYPOGRAPHY: PUNCHY, BOLD, ULTRA-CLEAN -->
    <g transform="translate(110, 150)" filter="url(#textShadow)">
      
      <!-- Category Tag Pill -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="180" height="32" rx="16" fill="#0284C7" fill-opacity="0.2" stroke="#38BDF8" stroke-opacity="0.5" stroke-width="1.5"/>
        <text x="90" y="21" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" letter-spacing="2.5" text-anchor="middle">
          TEAMWEAR PRO
        </text>
      </g>

      <!-- BIG HEADLINE 1: TRENING JOMA -->
      <text x="0" y="115" fill="url(#textCyan)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', Roboto, 'Arial Black', sans-serif" font-size="78" font-weight="950" letter-spacing="-1.5">
        TRENING JOMA
      </text>

      <!-- BIG HEADLINE 2: PERSONALIZARE PENTRU ECHIPE -->
      <g transform="translate(0, 185)">
        <text x="0" y="0" fill="#F8FAFC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', Roboto, sans-serif" font-size="42" font-weight="900" letter-spacing="-0.5">
          PERSONALIZARE
        </text>
        <text x="375" y="0" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', Roboto, sans-serif" font-size="42" font-weight="900" letter-spacing="-0.5">
          PENTRU ECHIPE
        </text>
      </g>

      <!-- Subtitle line: strictly minimal, elegant -->
      <text x="0" y="235" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" letter-spacing="1">
        Modele oficiale de club • Mărimi complete Copii &amp; Seniori
      </text>

      <!-- Modern Minimalist CTA Button -->
      <g transform="translate(0, 275)">
        <!-- Outer glow button -->
        <rect x="0" y="0" width="260" height="54" rx="27" fill="#38BDF8" />
        <text x="130" y="34" fill="#040D1A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" letter-spacing="1" text-anchor="middle">
          SOLICITĂ OFERTĂ →
        </text>
      </g>
    </g>

    <!-- RIGHT BACKGROUND AMBIENCE ACCENT: Modern Tech Box Outline -->
    <rect x="910" y="45" width="620" height="550" rx="28" fill="#071324" fill-opacity="0.3" stroke="#38BDF8" stroke-opacity="0.12" stroke-width="1.5"/>
  </svg>
  `;

  const bannerDir = path.join(process.cwd(), 'public/images/banners');
  if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

  // Composite:
  // Left tracksuit: Academy IV (left side: x: 920, y: 70)
  // Right tracksuit: Phoenix II (right side: x: 1220, y: 80)
  // Center tracksuit: Championship VII (front center: x: 1060, y: 40)
  const finalImage = await sharp(Buffer.from(svg))
    .composite([
      { input: academy, top: 75, left: 930 },
      { input: phoenix, top: 85, left: 1220 },
      { input: champ, top: 40, left: 1060 }
    ])
    .webp({ quality: 96 })
    .toFile(path.join(bannerDir, 'banner-joma-pro.webp'));

  console.log('Pro banner generated:', finalImage);

  // Also write to banner-joma-cluburi.webp & .jpg so the site automatically displays the new pro design!
  await sharp(path.join(bannerDir, 'banner-joma-pro.webp'))
    .webp({ quality: 96 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.webp'));

  await sharp(path.join(bannerDir, 'banner-joma-pro.webp'))
    .jpeg({ quality: 94 })
    .toFile(path.join(bannerDir, 'banner-joma-cluburi.jpg'));

  // Copy to brain for inspection
  await sharp(path.join(bannerDir, 'banner-joma-pro.webp'))
    .jpeg({ quality: 94 })
    .toFile('C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity\\brain\\19d0e857-b06d-41a5-bd0a-1af15803fbec\\banner-joma-pro.jpg');

  console.log('Copied to brain for inspection!');
}

buildProBanner().catch(console.error);

