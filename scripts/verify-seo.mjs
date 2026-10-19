// Automated SEO Architecture Verification Script (eMAG & Trendyol Compliance)

async function testSeo() {
  console.log('====================================================');
  console.log('  TESTING eMAG.ro & TRENDYOL SEO ARCHITECTURE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  // ── 1. TEST CATEGORY ROUTE (/{slug-categorie}/c) ─────────────────
  console.log('\n--- 1. Testing Category Page: /oale/c ---');
  const catRes = await fetch('http://localhost:3000/oale/c');
  assert(catRes.status === 200, 'Category page returns HTTP 200', `Status was ${catRes.status}`);

  const catHtml = await catRes.text();

  // Title tag
  const catTitleMatch = catHtml.match(/<title>([^<]+)<\/title>/i);
  const catTitle = catTitleMatch ? catTitleMatch[1] : '';
  console.log(`   <title>: "${catTitle}"`);
  assert(
    catTitle.startsWith('Cauți Oale') && catTitle.includes('produse') && catTitle.includes('Lei | TopinStock'),
    'Category <title> matches eMAG formula ("Cauți {Categorie}? Alege din {N} produse - Prețuri de la {Pret} Lei | {Marketplace}")',
    `Found: "${catTitle}"`
  );

  // Meta description
  const catDescMatch = catHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const catDesc = catDescMatch ? catDescMatch[1] : '';
  console.log(`   <meta description>: "${catDesc}"`);
  assert(
    catDesc.startsWith('Ai căutat Oale') &&
    catDesc.includes('promoțiile zilei, deschiderea coletului la livrare, livrare rapidă prin curier (DPD, Fan Courier) și retur gratuit în 30 de zile'),
    'Category <meta description> matches eMAG conversion formula',
    `Found: "${catDesc}"`
  );

  // Canonical tag
  const catCanonMatch = catHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const catCanon = catCanonMatch ? catCanonMatch[1] : '';
  console.log(`   <link canonical>: "${catCanon}"`);
  assert(
    catCanon.endsWith('/oale/c'),
    'Category <link rel="canonical"> matches /{slug}/c',
    `Found: "${catCanon}"`
  );

  // Single <h1> tag
  const catH1Matches = [...catHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert(
    catH1Matches.length === 1,
    `Category page has exactly ONE <h1> tag (found ${catH1Matches.length})`,
    catH1Matches.map(m => m[1].trim().replace(/\s+/g, ' ')).join(' | ')
  );
  if (catH1Matches[0]) {
    console.log(`   <h1>: "${catH1Matches[0][1].trim().replace(/\s+/g, ' ')}"`);
  }

  // JSON-LD structured data
  assert(
    catHtml.includes('"@type":"CollectionPage"') && catHtml.includes('"@type":"BreadcrumbList"'),
    'Category page includes JSON-LD for CollectionPage and BreadcrumbList'
  );

  // ── 2. TEST PRODUCT ROUTE (/{slug}/pd/{code}/) ───────────────────
  const testProductSlug = 'incalzitor-electric-cu-ulei-9-elemente-termostat-3-setari-de-putere-ma-1027437808';
  const testProductId = 'cmuvusq7t0078131fxoa8zm73';
  const testPdpUrl = `http://localhost:3000/${testProductSlug}/pd/${testProductId}/`;
  console.log(`\n--- 2. Testing Product Detail Page (PDP): /${testProductSlug}/pd/${testProductId}/ ---`);
  const pdpRes = await fetch(testPdpUrl);
  assert(pdpRes.status === 200, 'PDP returns HTTP 200', `Status was ${pdpRes.status}`);

  const pdpHtml = await pdpRes.text();

  // Title tag
  const pdpTitleMatch = pdpHtml.match(/<title>([^<]+)<\/title>/i);
  const pdpTitle = pdpTitleMatch ? pdpTitleMatch[1] : '';
  console.log(`   <title>: "${pdpTitle}"`);
  assert(
    (pdpTitle.includes('Calorifer') || pdpTitle.includes('Încălzitor') || pdpTitle.includes('VC9')) && pdpTitle.includes('TopinStock'),
    'PDP <title> matches eMAG technical attributes composition ("{Categorie} {Brand} {Model}, {Atribute}, {Culoare} - {Marketplace}")',
    `Found: "${pdpTitle}"`
  );

  // Meta description
  const pdpDescMatch = pdpHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const pdpDesc = pdpDescMatch ? pdpDescMatch[1] : '';
  console.log(`   <meta description>: "${pdpDesc}"`);
  assert(
    pdpDesc.startsWith('Cumpara') &&
    pdpDesc.includes('de la TopinStock! Ai libertatea sa platesti in rate, beneficiezi de promotiile zilei, deschiderea coletului la livrare, retur gratuit in 30 de zile si Instant Money Back.'),
    'PDP <meta description> matches eMAG conversion formula',
    `Found: "${pdpDesc}"`
  );

  // Canonical tag
  const pdpCanonMatch = pdpHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const pdpCanon = pdpCanonMatch ? pdpCanonMatch[1] : '';
  console.log(`   <link canonical>: "${pdpCanon}"`);
  assert(
    pdpCanon.includes('/pd/'),
    'PDP <link rel="canonical"> contains /pd/ code suffix',
    `Found: "${pdpCanon}"`
  );

  // Single <h1> tag
  const pdpH1Matches = [...pdpHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert(
    pdpH1Matches.length === 1,
    `PDP has exactly ONE <h1> tag (found ${pdpH1Matches.length})`,
    pdpH1Matches.map(m => m[1].trim().replace(/\s+/g, ' ')).join(' | ')
  );
  if (pdpH1Matches[0]) {
    console.log(`   <h1>: "${pdpH1Matches[0][1].trim().replace(/\s+/g, ' ')}"`);
  }

  // JSON-LD structured data
  assert(
    pdpHtml.includes('"@type":"Product"') && pdpHtml.includes('"@type":"Offer"'),
    'PDP includes JSON-LD for Schema.org Product and Offer'
  );

  // ── 3. TEST SELLER ROUTE (/seller/{vendorSlug}/v) ────────────────
  console.log('\n--- 3. Testing Seller Page: /seller/topinstock-oficial/v ---');
  const sellerRes = await fetch('http://localhost:3000/seller/topinstock-oficial/v');
  assert(sellerRes.status === 200, 'Seller page returns HTTP 200', `Status was ${sellerRes.status}`);

  const sellerHtml = await sellerRes.text();

  // Title tag
  const sellerTitleMatch = sellerHtml.match(/<title>([^<]+)<\/title>/i);
  const sellerTitle = sellerTitleMatch ? sellerTitleMatch[1] : '';
  console.log(`   <title>: "${sellerTitle}"`);
  assert(
    sellerTitle.startsWith('TopinStock Oficial - Informații, produse și recenzii') && sellerTitle.includes('TopinStock'),
    'Seller <title> matches eMAG formula ("{Nume Seller} - Informații, produse și recenzii ({Rating}/5) | {Marketplace}")',
    `Found: "${sellerTitle}"`
  );

  // Canonical tag
  const sellerCanonMatch = sellerHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const sellerCanon = sellerCanonMatch ? sellerCanonMatch[1] : '';
  console.log(`   <link canonical>: "${sellerCanon}"`);
  assert(
    sellerCanon.endsWith('/seller/topinstock-oficial/v'),
    'Seller <link rel="canonical"> matches /seller/{slug}/v',
    `Found: "${sellerCanon}"`
  );

  // Single <h1> tag
  const sellerH1Matches = [...sellerHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert(
    sellerH1Matches.length === 1,
    `Seller page has exactly ONE <h1> tag (found ${sellerH1Matches.length})`,
    sellerH1Matches.map(m => m[1].trim().replace(/\s+/g, ' ')).join(' | ')
  );
  if (sellerH1Matches[0]) {
    console.log(`   <h1>: "${sellerH1Matches[0][1].trim().replace(/\s+/g, ' ')}"`);
  }

  // JSON-LD structured data
  assert(
    sellerHtml.includes('"@type":"Store"') && sellerHtml.includes('"@type":"BreadcrumbList"'),
    'Seller page includes JSON-LD for Schema.org Store and BreadcrumbList'
  );

  // ── 4. TEST LEGACY 308 REDIRECTS ─────────────────────────────────
  console.log('\n--- 4. Testing Legacy Permanent Redirects (HTTP 308) ---');
  const legacyProdRes = await fetch(`http://localhost:3000/produse/${testProductSlug}`, { redirect: 'manual' });
  const prodLocation = legacyProdRes.headers.get('location');
  console.log(`   /produse/${testProductSlug} -> HTTP ${legacyProdRes.status} to: ${prodLocation}`);
  assert(
    legacyProdRes.status === 308 && prodLocation && prodLocation.includes('/pd/'),
    'Legacy /produse/[slug] redirects with 308 to canonical eMAG PDP /pd/ URL'
  );

  const legacyVendorRes = await fetch('http://localhost:3000/vanzator/topinstock-oficial', { redirect: 'manual' });
  const vendorLocation = legacyVendorRes.headers.get('location');
  console.log(`   /vanzator/topinstock-oficial -> HTTP ${legacyVendorRes.status} to: ${vendorLocation}`);
  assert(
    legacyVendorRes.status === 308 && vendorLocation && vendorLocation.endsWith('/seller/topinstock-oficial/v'),
    'Legacy /vanzator/[slug] redirects with 308 to canonical eMAG Seller /seller/[slug]/v URL'
  );

  const legacyCatQueryRes = await fetch('http://localhost:3000/produse?category=oale', { redirect: 'manual' });
  const catLocation = legacyCatQueryRes.headers.get('location');
  console.log(`   /produse?category=oale -> HTTP ${legacyCatQueryRes.status} to: ${catLocation}`);
  assert(
    legacyCatQueryRes.status === 308 && catLocation && catLocation.endsWith('/oale/c'),
    'Legacy /produse?category=oale redirects with 308 to canonical eMAG Category /oale/c URL'
  );

  console.log('\n====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

testSeo().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
