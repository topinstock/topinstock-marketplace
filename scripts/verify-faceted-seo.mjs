// Automated Verification for eMAG / Trendyol Faceted Programmatic SEO

const BASE = 'http://localhost:3000';

async function fetchPage(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      'Accept': 'text/html',
    },
  });
  const html = await res.text();
  return { status: res.status, html, url: res.url };
}

function extractMeta(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : null;

  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["']/i);
  const robots = robotsMatch ? robotsMatch[1] : null;

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                         html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  return { title, h1Matches, robots, canonical };
}

async function runTests() {
  console.log('====================================================');
  console.log('eMAG & Trendyol Faceted Programmatic SEO Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      if (details) console.error(`    Details:`, details);
      failed++;
    }
  }

  // ── TEST GROUP 1: Clean Faceted URLs & Indexability ──
  console.log('--- 1. Clean Faceted URLs (Indexable, self-canonical) ---');

  // 1.1 Simple category
  {
    const path = '/oale/c';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200 (got ${status})`);
    assert(meta.h1Matches.length === 1, `Exactly 1 <h1> tag found (found ${meta.h1Matches.length}: "${meta.h1Matches[0]}")`);
    assert(meta.robots && meta.robots.includes('index') && !meta.robots.includes('noindex'), `Robots is index, follow (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/c'), `Self-canonical points to /oale/c (got: ${meta.canonical})`);
  }

  // 1.2 Category + 1 Brand
  {
    const path = '/oale/brand/bohmann/c';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200 (got ${status})`);
    assert(meta.h1Matches.length === 1, `Exactly 1 <h1> tag found: "${meta.h1Matches[0]}"`);
    assert(meta.h1Matches[0].includes('Oale') && meta.h1Matches[0].includes('Bohmann'), `H1 includes category and brand: "${meta.h1Matches[0]}"`);
    assert(meta.title && meta.title.includes('Bohmann') && meta.title.includes('oferte'), `Title formatted dynamically: "${meta.title}"`);
    assert(meta.robots && meta.robots.includes('index') && !meta.robots.includes('noindex'), `Robots is index, follow (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/brand/bohmann/c'), `Self-canonical points to /oale/brand/bohmann/c (got: ${meta.canonical})`);
  }

  // 1.3 Category + 1 Brand + 1 Attribute
  {
    const path = '/telefoane-mobile/brand/apple/memorie-interna-256-gb/c';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200 (got ${status})`);
    assert(meta.h1Matches.length === 1, `Exactly 1 <h1> tag found: "${meta.h1Matches[0]}"`);
    assert(meta.h1Matches[0].includes('Apple') && meta.h1Matches[0].includes('256 GB'), `H1 includes category, brand, and attribute: "${meta.h1Matches[0]}"`);
    assert(meta.title && meta.title.includes('Apple') && meta.title.includes('256 GB'), `Title includes Category, Brand, and Attribute: "${meta.title}"`);
    assert(meta.robots && meta.robots.includes('index') && !meta.robots.includes('noindex'), `Robots is index, follow (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/telefoane-mobile/brand/apple/memorie-interna-256-gb/c'), `Self-canonical points to /telefoane-mobile/brand/apple/memorie-interna-256-gb/c (got: ${meta.canonical})`);
  }

  // 1.4 Category + 1 Attribute
  {
    const path = '/telefoane-mobile/memorie-interna-256-gb/c';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200 (got ${status})`);
    assert(meta.h1Matches.length === 1, `Exactly 1 <h1> tag found: "${meta.h1Matches[0]}"`);
    assert(meta.h1Matches[0].includes('256 GB'), `H1 includes attribute: "${meta.h1Matches[0]}"`);
    assert(meta.robots && meta.robots.includes('index') && !meta.robots.includes('noindex'), `Robots is index, follow (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/telefoane-mobile/memorie-interna-256-gb/c'), `Self-canonical points to /telefoane-mobile/memorie-interna-256-gb/c (got: ${meta.canonical})`);
  }

  // ── TEST GROUP 2: Non-indexable Rules & Canonical Fallback ──
  console.log('\n--- 2. Crawl Budget Protection (Non-Indexable, Canonical Fallback) ---');

  // 2.1 Price filter on category + brand
  {
    const path = '/oale/brand/bohmann/c?minPrice=100';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);
    assert(meta.robots && meta.robots.includes('noindex'), `Robots has noindex (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/brand/bohmann/c'), `Canonical points to clean brand URL /oale/brand/bohmann/c without ?minPrice (got: ${meta.canonical})`);
  }

  // 2.2 Sorting filter on category + brand
  {
    const path = '/oale/brand/bohmann/c?sort=price_asc';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);
    assert(meta.robots && meta.robots.includes('noindex'), `Robots has noindex (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/brand/bohmann/c'), `Canonical points to clean brand URL /oale/brand/bohmann/c without ?sort (got: ${meta.canonical})`);
  }

  // 2.3 Multiple brands (2+ brands)
  {
    const path = '/oale/c?brand=bohmann,grunberg';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);
    assert(meta.robots && meta.robots.includes('noindex'), `Robots has noindex (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/c'), `Canonical points to main category /oale/c (got: ${meta.canonical})`);
  }

  // 2.4 Query-parameter brand on simple category
  {
    const path = '/oale/c?brand=bohmann';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);
    assert(meta.robots && meta.robots.includes('noindex'), `Query-param brand receives noindex (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/brand/bohmann/c'), `Canonical points to clean URL /oale/brand/bohmann/c (got: ${meta.canonical})`);
  }

  // 2.5 Price filter on simple category
  {
    const path = '/oale/c?minPrice=50';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);
    assert(meta.robots && meta.robots.includes('noindex'), `Robots has noindex (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/oale/c'), `Canonical points to clean /oale/c (got: ${meta.canonical})`);
  }

  // 2.6 Combined filters (3+ filters: Brand + 2 sizes)
  {
    const path = '/incaltaminte/brand/nike/c?sizes=42,43';
    const { status, html } = await fetchPage(path);
    const meta = extractMeta(html);
    console.log(`\nTesting ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);
    assert(meta.robots && meta.robots.includes('noindex'), `Robots has noindex (got: ${meta.robots})`);
    assert(meta.canonical && meta.canonical.endsWith('/incaltaminte/brand/nike/c'), `Canonical points to clean category + brand /incaltaminte/brand/nike/c (got: ${meta.canonical})`);
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
