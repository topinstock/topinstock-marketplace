const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const userImgPath = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec/.user_uploaded/media_1793413602285_410e9005.jpg';
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  const W = 1920;
  const H = 594;

  const baseBuffer = await sharp(userImgPath)
    .resize(W, H, { fit: 'cover' })
    .toBuffer();

  // VARIANT 1: Sleek Athletic Typography on Left (Night Stadium side)
  // Highlights: DISTRIBUITOR OFICIAL JOMA, PREȚ LA CERERE PENTRU ECHIPE, MINIM 10 COMENZI, PERSONALIZARE LA CERERE
  const svgVariant1 = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>
        <linearGradient id="cyanGrad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#0284C7" />
        </linearGradient>
        <linearGradient id="darkVignette1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(3, 7, 18, 0.90)" />
          <stop offset="28%" stop-color="rgba(3, 7, 18, 0.70)" />
          <stop offset="48%" stop-color="rgba(3, 7, 18, 0.15)" />
          <stop offset="65%" stop-color="rgba(3, 7, 18, 0.0)" />
          <stop offset="100%" stop-color="rgba(3, 7, 18, 0.0)" />
        </linearGradient>
        <filter id="textGlow1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <!-- Soft gradient on the left so the text pops with 100% legibility while football player remains fully visible -->
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#darkVignette1)" />

      <!-- Left Text Block -->
      <g transform="translate(90, 140)">
        <!-- DISTRIBUITOR OFICIAL JOMA Pill -->
        <g filter="url(#textGlow1)">
          <rect x="0" y="0" width="350" height="42" rx="10" fill="#091422" stroke="url(#goldGrad1)" stroke-width="2" />
          <circle cx="24" cy="21" r="10" fill="url(#goldGrad1)" />
          <polygon points="24,15 26.5,20 32,20 27.5,23.5 29,28.5 24,25.5 19,28.5 20.5,23.5 16,20 21.5,20" fill="#091422" />
          <text x="44" y="27" fill="#FDE047" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="14" font-weight="900" letter-spacing="1.5">DISTRIBUITOR OFICIAL JOMA</text>
        </g>

        <!-- Main Headline -->
        <g filter="url(#textGlow1)">
          <text x="0" y="112" fill="#FFFFFF" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="46" font-weight="900" letter-spacing="-0.5">
            PREȚ LA CERERE
          </text>
          <text x="0" y="166" fill="url(#cyanGrad1)" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="38" font-weight="900" letter-spacing="0.5">
            PENTRU ECHIPE
          </text>
        </g>

        <!-- Requirement Pills -->
        <g transform="translate(0, 206)" filter="url(#textGlow1)">
          <!-- Minim 10 Comenzi -->
          <rect x="0" y="0" width="185" height="40" rx="8" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" stroke-width="1.8" />
          <text x="92" y="25" fill="#FEF08A" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="0.5">
            MINIM 10 COMENZI
          </text>

          <!-- Personalizare la Cerere -->
          <rect x="200" y="0" width="245" height="40" rx="8" fill="rgba(14, 165, 233, 0.25)" stroke="#38BDF8" stroke-width="1.8" />
          <text x="322" y="25" fill="#E0F2FE" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="0.5">
            PERSONALIZARE LA CERERE
          </text>
        </g>
      </g>
    </svg>
  `);

  // VARIANT 2: Pro Sports Broadcast Bar at the Bottom
  // Span across the lower third with sleek frosted bar holding all 4 elements
  const svgVariant2 = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(1, 10, 22, 0.0)" />
          <stop offset="25%" stop-color="rgba(1, 10, 22, 0.70)" />
          <stop offset="100%" stop-color="rgba(1, 10, 22, 0.98)" />
        </linearGradient>
        <filter id="shadow2">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <!-- Bottom Gradient Veil -->
      <rect x="0" y="${H - 180}" width="${W}" height="180" fill="url(#barGrad2)" />

      <!-- Bottom Broadcast Bar -->
      <g transform="translate(60, ${H - 110})">
        <!-- Floating Glass Container -->
        <rect x="0" y="0" width="${W - 120}" height="84" rx="18" fill="rgba(7, 24, 46, 0.92)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="2" filter="url(#shadow2)" />

        <!-- 1. Distribuitor Oficial Joma Badge -->
        <g transform="translate(30, 20)">
          <rect x="0" y="0" width="310" height="44" rx="10" fill="#030E1C" stroke="url(#goldGrad2)" stroke-width="2" />
          <circle cx="24" cy="22" r="10" fill="url(#goldGrad2)" />
          <polygon points="24,16 26.5,21 32,21 27.5,24.5 29,29.5 24,26.5 19,29.5 20.5,24.5 16,21 21.5,21" fill="#030E1C" />
          <text x="44" y="28" fill="#FDE047" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="13" font-weight="900" letter-spacing="1">DISTRIBUITOR OFICIAL JOMA</text>
        </g>

        <!-- 2. Preț la Cerere pentru Echipe -->
        <g transform="translate(380, 20)">
          <text x="0" y="24" fill="#FFFFFF" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="22" font-weight="900" letter-spacing="0.5">
            PREȚ LA CERERE PENTRU ECHIPE
          </text>
          <text x="0" y="42" fill="#94A3B8" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" letter-spacing="1">
            TRENINGURI ȘI ECHIPAMENTE COMPLETE PENTRU CLUBURI
          </text>
        </g>

        <!-- 3. Minim 10 Comenzi & Personalizare la Cerere -->
        <g transform="translate(${W - 680}, 22)">
          <rect x="0" y="0" width="180" height="40" rx="8" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" stroke-width="1.8" />
          <text x="90" y="25" fill="#FEF08A" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="0.5">
            MINIM 10 COMENZI
          </text>

          <rect x="195" y="0" width="225" height="40" rx="8" fill="rgba(14, 165, 233, 0.25)" stroke="#38BDF8" stroke-width="1.8" />
          <text x="307" y="25" fill="#E0F2FE" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="0.5">
            PERSONALIZARE LA CERERE
          </text>
        </g>
      </g>
    </svg>
  `);

  // VARIANT 3: Balanced Split Design
  // Distribuitor Oficial badge top-left under logo, Preț la cerere center-bottom, Minim 10 & Personalizare badges
  const svgVariant3 = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>
        <linearGradient id="cyanGrad3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#0284C7" />
        </linearGradient>
        <linearGradient id="centerBadgeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(3, 14, 28, 0.95)" />
          <stop offset="100%" stop-color="rgba(2, 6, 23, 0.98)" />
        </linearGradient>
        <filter id="shadow3">
          <feDropShadow dx="0" dy="5" stdDeviation="10" flood-color="#000000" flood-opacity="0.85" />
        </filter>
      </defs>

      <!-- Badge under top-left Joma logo -->
      <g transform="translate(68, 115)" filter="url(#shadow3)">
        <rect x="0" y="0" width="310" height="38" rx="8" fill="rgba(8, 20, 36, 0.95)" stroke="url(#goldGrad3)" stroke-width="1.8" />
        <circle cx="20" cy="19" r="8" fill="url(#goldGrad3)" />
        <polygon points="20,14 22,18 26.5,18 23,21 24,25 20,22.5 16,25 17,21 13.5,18 18,18" fill="#081424" />
        <text x="38" y="24" fill="#FDE047" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="12.5" font-weight="900" letter-spacing="1.2">DISTRIBUITOR OFICIAL JOMA</text>
      </g>

      <!-- Bottom Floating Center Card -->
      <g transform="translate(${W / 2 - 460}, ${H - 120})" filter="url(#shadow3)">
        <rect x="0" y="0" width="920" height="96" rx="16" fill="url(#centerBadgeGrad)" stroke="rgba(56, 189, 248, 0.5)" stroke-width="2" />
        
        <!-- Headline -->
        <text x="460" y="38" fill="#FFFFFF" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="25" font-weight="900" text-anchor="middle" letter-spacing="0.5">
          PREȚ LA CERERE PENTRU ECHIPE
        </text>

        <!-- Sub Badges -->
        <g transform="translate(195, 48)">
          <!-- Minim 10 Comenzi -->
          <rect x="0" y="0" width="220" height="34" rx="7" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" stroke-width="1.6" />
          <text x="110" y="22" fill="#FEF08A" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="0.8">
            MINIM 10 COMENZI
          </text>

          <!-- Personalizare la Cerere -->
          <rect x="235" y="0" width="280" height="34" rx="7" fill="rgba(14, 165, 233, 0.25)" stroke="#38BDF8" stroke-width="1.6" />
          <text x="375" y="22" fill="#BAE6FD" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="0.8">
            PERSONALIZARE LA CERERE
          </text>
        </g>
      </g>
    </svg>
  `);

  await sharp(baseBuffer)
    .composite([{ input: svgVariant1, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.join(artifactDir, 'joma_banner_variant_1.jpg'));

  await sharp(baseBuffer)
    .composite([{ input: svgVariant2, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.join(artifactDir, 'joma_banner_variant_2.jpg'));

  await sharp(baseBuffer)
    .composite([{ input: svgVariant3, top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.join(artifactDir, 'joma_banner_variant_3.jpg'));

  console.log('Successfully generated all 3 variants into artifactDir');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

