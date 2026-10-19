import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function fetchText(url) {
  const res = await fetch(url);
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

async function runTests() {
  console.log('========================================================');
  console.log('eMAG & Trendyol Technical & On-Page SEO Test Suite');
  console.log('========================================================\n');

  let passed = 0;

  function test(name, condition) {
    try {
      assert(condition, name);
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      throw err;
    }
  }

  // ── 1. ROBOTS.TXT ──
  console.log('--- 1. Verification of /robots.txt (eMAG.ro Standard) ---');
  const robots = await fetchText(`${BASE_URL}/robots.txt`);
  test('robots.txt returns status 200', robots.status === 200);
  test('robots.txt has User-agent: *', robots.text.includes('User-Agent: *') || robots.text.includes('user-agent: *') || robots.text.includes('User-agent: *'));
  test('robots.txt allows public routes and static assets', robots.text.includes('Allow: /'));
  test('robots.txt disallows admin routes', robots.text.includes('Disallow: /admin'));
  test('robots.txt disallows cart routes', robots.text.includes('Disallow: /cos'));
  test('robots.txt disallows checkout routes', robots.text.includes('Disallow: /checkout'));
  test('robots.txt disallows account routes', robots.text.includes('Disallow: /cont'));
  test('robots.txt blocks sort parameters (/*?sort=)', robots.text.includes('/*?sort='));
  test('robots.txt blocks price parameters (/*?minPrice=)', robots.text.includes('/*?minPrice='));
  test('robots.txt references master sitemap.xml', robots.text.includes('sitemap.xml'));

  // ── 2. MASTER SITEMAP INDEX (/sitemap.xml) ──
  console.log('\n--- 2. Master Sitemap Index (/sitemap.xml) ---');
  const sitemapIndex = await fetchText(`${BASE_URL}/sitemap.xml`);
  test('sitemap.xml returns status 200', sitemapIndex.status === 200);
  test('sitemap.xml returns XML Content-Type', (sitemapIndex.headers.get('content-type') || '').includes('xml'));
  test('sitemap.xml has <sitemapindex> tag', sitemapIndex.text.includes('<sitemapindex'));
  test('sitemap.xml references sitemap-categories.xml', sitemapIndex.text.includes('sitemap-categories.xml'));
  test('sitemap.xml references sitemap-products.xml', sitemapIndex.text.includes('sitemap-products.xml'));
  test('sitemap.xml references sitemap-sellers.xml', sitemapIndex.text.includes('sitemap-sellers.xml'));

  // ── 3. CATEGORIES SITEMAP (/sitemap-categories.xml) ──
  console.log('\n--- 3. Categories Sitemap (/sitemap-categories.xml) ---');
  const sitemapCategories = await fetchText(`${BASE_URL}/sitemap-categories.xml`);
  test('sitemap-categories.xml returns status 200', sitemapCategories.status === 200);
  test('sitemap-categories.xml has <urlset> tag', sitemapCategories.text.includes('<urlset'));
  test('Contains main category URL (e.g. /c)', sitemapCategories.text.includes('/c</loc>'));
  test('Contains faceted Category + Brand URL (/brand/)', sitemapCategories.text.includes('/brand/'));
  test('Has priority tags (0.9 / 0.8)', sitemapCategories.text.includes('<priority>0.9</priority>') || sitemapCategories.text.includes('<priority>0.8</priority>'));
  test('Has changefreq tags', sitemapCategories.text.includes('<changefreq>daily</changefreq>') || sitemapCategories.text.includes('<changefreq>weekly</changefreq>'));

  // ── 4. PRODUCTS SITEMAP (/sitemap-products.xml) ──
  console.log('\n--- 4. Products Sitemap (/sitemap-products.xml) ---');
  const sitemapProducts = await fetchText(`${BASE_URL}/sitemap-products.xml`);
  test('sitemap-products.xml returns status 200', sitemapProducts.status === 200);
  test('sitemap-products.xml has <urlset> tag', sitemapProducts.text.includes('<urlset'));
  test('Contains eMAG PDP format URLs (/pd/)', sitemapProducts.text.includes('/pd/'));
  test('Has lastmod timestamps', sitemapProducts.text.includes('<lastmod>'));
  test('Has product priority (0.9)', sitemapProducts.text.includes('<priority>0.9</priority>'));

  // ── 5. SELLERS SITEMAP (/sitemap-sellers.xml) ──
  console.log('\n--- 5. Sellers Sitemap (/sitemap-sellers.xml) ---');
  const sitemapSellers = await fetchText(`${BASE_URL}/sitemap-sellers.xml`);
  test('sitemap-sellers.xml returns status 200', sitemapSellers.status === 200);
  test('sitemap-sellers.xml has <urlset> tag', sitemapSellers.text.includes('<urlset'));
  test('Contains eMAG Vendor format URLs (/seller/.../v)', sitemapSellers.text.includes('/seller/') && sitemapSellers.text.includes('/v</loc>'));

  // ── 6. POPULAR SEARCHES & CATEGORY SEO GUIDE (Category Page) ──
  console.log('\n--- 6. Popular Searches & SEO Guide (Category Page: /espressoare-cafetiere/c) ---');
  const catPage = await fetchText(`${BASE_URL}/espressoare-cafetiere/c`);
  test('Category page returns status 200', catPage.status === 200);
  test('Contains Popular Searches section', catPage.text.includes('Căutări populare'));
  test('Popular searches contains faceted brand links (e.g. /espressoare-cafetiere/brand/)', catPage.text.includes('/espressoare-cafetiere/brand/'));
  test('Contains SEO Guide section', catPage.text.includes('Ghid Cumpărături') || catPage.text.includes('Ghid de cumpărături'));
  test('SEO Guide contains <h2> tag with question', catPage.text.includes('<h2') && catPage.text.includes('Cum alegi'));
  test('SEO Guide contains multiple <h3> tags for subtopics', catPage.text.includes('<h3') && catPage.text.includes('Calitatea materialelor'));
  test('SEO Guide contains brands recommendation section', catPage.text.includes('Branduri recunoscute') || catPage.text.includes('Branduri de top'));
  test('SEO Guide contains expandable toggle button', catPage.text.includes('Vezi mai mult') || catPage.text.includes('Ghid complet cumpărături'));

  // ── 7. POPULAR SEARCHES & IMAGE SEO (Product Detail Page) ──
  console.log('\n--- 7. Image SEO & Internal Linking (PDP Page) ---');
  const pdpUrl = `${BASE_URL}/espressor-electric-8-in-1-1450w-19-bari-5-adaptoare-petru-capsule-oliver-voltz-gama-nice-crem/pd/OV51171P8R`;
  const pdpPage = await fetchText(pdpUrl);
  test('PDP returns status 200', pdpPage.status === 200);
  test('PDP contains Popular Searches / internal linking section', pdpPage.text.includes('Căutări populare'));
  test('Main LCP Image has alt with product title', pdpPage.text.includes('alt="Espressor electric 8 in 1') && pdpPage.text.includes('Imagine 1"'));
  test('Main Image has fetchpriority="high"', pdpPage.text.includes('fetchpriority="high"') || pdpPage.text.includes('fetchPriority="high"'));
  test('Main Image has loading="eager"', pdpPage.text.includes('loading="eager"'));
  test('Thumbnails have loading="lazy"', pdpPage.text.includes('loading="lazy"'));

  console.log('\n========================================================');
  console.log(`Results: ${passed} passed, 0 failed`);
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('\nTest Suite Failed:', err);
  process.exit(1);
});
