const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function buildBanner() {
  const userImgPath = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec/.user_uploaded/media_1793413602285_410e9005.jpg';
  const appPublicBanners = path.join(__dirname, '../public/images/banners');
  const artifactDir = 'C:/Users/Raducanu Igor Daniel/.gemini/antigravity/brain/19d0e857-b06d-41a5-bd0a-1af15803fbec';

  if (!fs.existsSync(appPublicBanners)) {
    fs.mkdirSync(appPublicBanners, { recursive: true });
  }

  // Preserve raw uploaded image
  fs.copyFileSync(userImgPath, path.join(appPublicBanners, 'banner-joma-official-raw.jpg'));

  const W = 1920;
  const H = 594;

  const baseBuffer = await sharp(userImgPath)
    .resize(W, H, { fit: 'cover' })
    .toBuffer();

  // Master Graphic Overlay:
  // Aligns precisely with left Joma logo (X: 68), keeping football player (X > 480) completely untouched.
  const svgOverlay = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gold Gradient for Official Distributor -->
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#D97706" />
        </linearGradient>

        <!-- Cyan Sports Gradient -->
        <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="60%" stop-color="#0284C7" />
          <stop offset="100%" stop-color="#0369A1" />
        </linearGradient>

        <!-- Titanium White-Silver Gradient -->
        <linearGradient id="titaniumGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="70%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>

        <!-- Dark Sports Vignette on Left -->
        <linearGradient id="leftAtmosphere" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(3, 8, 20, 0.92)" />
          <stop offset="25%" stop-color="rgba(3, 8, 20, 0.78)" />
          <stop offset="42%" stop-color="rgba(3, 8, 20, 0.25)" />
          <stop offset="58%" stop-color="rgba(3, 8, 20, 0.0)" />
          <stop offset="100%" stop-color="rgba(3, 8, 20, 0.0)" />
        </linearGradient>

        <!-- Drop shadow for text -->
        <filter id="eliteShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.95" />
        </filter>
      </defs>

      <!-- Soft atmospheric depth vignette for the left text column -->
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#leftAtmosphere)" />

      <!-- Left Text & Badges Structure (X: 68 aligns with official Joma logo above) -->
      <g transform="translate(68, 126)">
        
        <!-- 1. DISTRIBUITOR OFICIAL JOMA Badge -->
        <g filter="url(#eliteShadow)">
          <rect x="0" y="0" width="356" height="42" rx="9" fill="#030D1B" stroke="url(#goldGrad)" stroke-width="2" />
          
          <!-- Shield / Star Emblem -->
          <circle cx="23" cy="21" r="11" fill="url(#goldGrad)" />
          <polygon points="23,14 25.5,19.5 31.5,19.5 26.5,23.5 28.5,29 23,25.5 17.5,29 19.5,23.5 14.5,19.5 20.5,19.5" fill="#030D1B" />
          
          <!-- Text -->
          <text x="44" y="27" fill="#FEF08A" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="14" font-weight="900" letter-spacing="1.4">
            DISTRIBUITOR OFICIAL JOMA
          </text>
        </g>

        <!-- 2. Headline: PREȚ LA CERERE PENTRU ECHIPE -->
        <g transform="translate(0, 72)" filter="url(#eliteShadow)">
          <text x="0" y="38" fill="url(#titaniumGrad)" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="44" font-weight="900" letter-spacing="-0.5">
            PREȚ LA CERERE
          </text>
          <text x="0" y="86" fill="url(#cyanGrad)" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="38" font-weight="900" letter-spacing="0.5">
            PENTRU ECHIPE
          </text>
        </g>

        <!-- 3. Key Order Badges: MINIM 10 COMENZI & PERSONALIZARE LA CERERE -->
        <g transform="translate(0, 192)" filter="url(#eliteShadow)">
          <!-- Badge: MINIM 10 COMENZI -->
          <g>
            <rect x="0" y="0" width="186" height="40" rx="8" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" stroke-width="1.8" />
            <circle cx="20" cy="20" r="4" fill="#F59E0B" />
            <text x="32" y="25" fill="#FEF08A" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="13" font-weight="900" letter-spacing="0.6">
              MINIM 10 COMENZI
            </text>
          </g>

          <!-- Badge: PERSONALIZARE LA CERERE -->
          <g transform="translate(196, 0)">
            <rect x="0" y="0" width="234" height="40" rx="8" fill="rgba(14, 165, 233, 0.22)" stroke="#38BDF8" stroke-width="1.8" />
            <circle cx="20" cy="20" r="4" fill="#38BDF8" />
            <text x="32" y="25" fill="#E0F2FE" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="12.5" font-weight="900" letter-spacing="0.6">
              PERSONALIZARE LA CERERE
            </text>
          </g>
        </g>

        <!-- 4. Subtitle tag: Număr, Nume, Stemă Club Brodată / DTF -->
        <g transform="translate(0, 252)" filter="url(#eliteShadow)">
          <text x="2" y="16" fill="#94A3B8" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" letter-spacing="1">
            ⚽ STEMĂ CLUB • NUMERE • NUME • ORICE MODEL JOMA
          </text>
        </g>

      </g>
    </svg>
  `);

  const compositeImg = sharp(baseBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }]);

  // 1. Save WebP version (optimized for web)
  await compositeImg
    .clone()
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(appPublicBanners, 'banner-joma-cluburi.webp'));

  // 2. Save JPEG version (fallback and OpenGraph)
  await compositeImg
    .clone()
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(path.join(appPublicBanners, 'banner-joma-cluburi.jpg'));

  // 3. Save copy in artifactDir for immediate visual inspection
  await compositeImg
    .clone()
    .jpeg({ quality: 95 })
    .toFile(path.join(artifactDir, 'joma_official_banner_final.jpg'));

  console.log('Official Joma banner successfully built and exported to:');
  console.log('- public/images/banners/banner-joma-cluburi.webp');
  console.log('- public/images/banners/banner-joma-cluburi.jpg');
  console.log('- artifact: joma_official_banner_final.jpg');
}

buildBanner().catch(err => {
  console.error('Error generating banner:', err);
  process.exit(1);
});
