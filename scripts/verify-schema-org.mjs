// Automated Verification for Schema.org (JSON-LD) Rich Snippets (eMAG Standard)

const BASE = 'http://localhost:3000';

async function fetchPage(path, followRedirect = true) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      'Accept': 'text/html',
    },
    redirect: followRedirect ? 'follow' : 'manual',
  });
  const html = await res.text();
  return { status: res.status, headers: res.headers, html, url: res.url };
}

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonObjects = [];
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m[1]);
      jsonObjects.push(parsed);
    } catch (e) {
      console.error('Failed to parse JSON-LD:', e.message);
    }
  }
  return jsonObjects;
}

async function runTests() {
  console.log('========================================================');
  console.log('eMAG.ro Schema.org (JSON-LD) Rich Snippets Test Suite');
  console.log('========================================================\n');

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

  // ── TEST 1: PDP with Multiple Marketplace Offers & Reviews ──
  console.log('--- 1. PDP Schema: Product, AggregateOffer, Reviews & AggregateRating ---');
  {
    // Product with reviews and multiple sellers (electric heater VC9)
    const path = '/incalzitor-electric-cu-ulei-9-elemente-termostat-3-setari-de-putere-ma-1027437808/pd/cmuvusq7t0078131fxoa8zm73';
    const { status, html } = await fetchPage(path);
    const jsonLds = extractJsonLd(html);

    console.log(`\nTesting Multi-vendor PDP: ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);

    const productSchema = jsonLds.find((j) => j['@type'] === 'Product');
    assert(!!productSchema, `Found Schema.org @type "Product" in JSON-LD`);

    if (productSchema) {
      // 1.1 Core Fields
      assert(typeof productSchema.name === 'string' && productSchema.name.length > 5, `Has product name: "${productSchema.name.slice(0, 45)}..."`);
      assert(Array.isArray(productSchema.image) && productSchema.image.length > 0, `Image is an array of strings (found ${productSchema.image.length} images)`);
      assert(productSchema.image[0].startsWith('http'), `Image URL is absolute: ${productSchema.image[0].slice(0, 50)}...`);
      assert(!!productSchema.description, `Has description`);
      assert(!!productSchema.sku, `Has sku: ${productSchema.sku}`);
      assert(!!productSchema.mpn, `Has mpn: ${productSchema.mpn}`);
      assert(productSchema.brand && productSchema.brand['@type'] === 'Brand' && productSchema.brand.name === 'Victronic', `Brand is properly typed: ${JSON.stringify(productSchema.brand)}`);

      // 1.2 AggregateRating (included only when reviewsCount > 0)
      assert(!!productSchema.aggregateRating, `aggregateRating is present for reviewed product`);
      if (productSchema.aggregateRating) {
        assert(productSchema.aggregateRating['@type'] === 'AggregateRating', `aggregateRating has @type AggregateRating`);
        assert(Number(productSchema.aggregateRating.ratingValue) >= 1 && Number(productSchema.aggregateRating.ratingValue) <= 5, `ratingValue is valid: ${productSchema.aggregateRating.ratingValue}`);
        assert(productSchema.aggregateRating.reviewCount >= 1, `reviewCount >= 1: ${productSchema.aggregateRating.reviewCount}`);
        assert(productSchema.aggregateRating.bestRating === '5' && productSchema.aggregateRating.worstRating === '1', `bestRating=5 and worstRating=1`);
      }

      // 1.3 Real Reviews Array
      assert(Array.isArray(productSchema.review) && productSchema.review.length >= 3, `review is array with latest 3-5 reviews (found ${productSchema.review?.length})`);
      if (Array.isArray(productSchema.review) && productSchema.review[0]) {
        const rev = productSchema.review[0];
        assert(rev['@type'] === 'Review', `Review has @type Review`);
        assert(rev.author && rev.author['@type'] === 'Person' && typeof rev.author.name === 'string', `Review author is Person with name: ${rev.author?.name}`);
        assert(!!rev.datePublished, `Review has datePublished: ${rev.datePublished}`);
        assert(rev.reviewRating && rev.reviewRating['@type'] === 'Rating', `Review rating is typed Rating`);
        assert(!!rev.reviewBody, `Review has reviewBody: "${rev.reviewBody.slice(0, 40)}..."`);
      }

      // 1.4 Marketplace Multi-Seller Offers (AggregateOffer)
      assert(productSchema.offers && productSchema.offers['@type'] === 'AggregateOffer', `Multi-vendor product uses @type "AggregateOffer"`);
      if (productSchema.offers && productSchema.offers['@type'] === 'AggregateOffer') {
        const agg = productSchema.offers;
        assert(agg.priceCurrency === 'RON', `priceCurrency is RON`);
        assert(Number(agg.lowPrice) > 0, `Has lowPrice: ${agg.lowPrice} RON`);
        assert(Number(agg.highPrice) >= Number(agg.lowPrice), `Has highPrice: ${agg.highPrice} RON (>= lowPrice)`);
        assert(agg.offerCount >= 2, `Has offerCount >= 2 (found ${agg.offerCount} sellers)`);
        assert(Array.isArray(agg.offers) && agg.offers.length === agg.offerCount, `offers array contains all ${agg.offerCount} seller offers`);
        if (agg.offers?.[0]) {
          assert(agg.offers[0]['@type'] === 'Offer', `Sub-offer has @type Offer`);
          assert(agg.offers[0].seller && agg.offers[0].seller['@type'] === 'Organization', `Sub-offer has seller Organization: ${agg.offers[0].seller?.name}`);
          assert(agg.offers[0].availability === 'https://schema.org/InStock', `Sub-offer has InStock availability`);
          assert(agg.offers[0].itemCondition === 'https://schema.org/NewCondition', `Sub-offer has NewCondition`);
        }
      }
    }
  }

  // ── TEST 2: PDP with Single Seller Offer ──
  console.log('\n--- 2. Single Seller PDP (@type "Offer") ---');
  {
    const path = '/cos-de-gunoi-pentru-masa-grunberg-rosu-1198437758/pd/cmuvusq8z007e131f6xs9ipd8';
    const { status, html } = await fetchPage(path);
    const jsonLds = extractJsonLd(html);

    console.log(`\nTesting Single Seller PDP: ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);

    const productSchema = jsonLds.find((j) => j['@type'] === 'Product');
    assert(!!productSchema, `Found Schema.org @type "Product"`);

    if (productSchema) {
      assert(productSchema.offers && productSchema.offers['@type'] === 'Offer', `Single seller product uses @type "Offer" (not AggregateOffer)`);
      if (productSchema.offers && productSchema.offers['@type'] === 'Offer') {
        assert(productSchema.offers.priceCurrency === 'RON', `priceCurrency is RON`);
        assert(Number(productSchema.offers.price) > 0, `price is valid: ${productSchema.offers.price} RON`);
        assert(productSchema.offers.seller && productSchema.offers.seller['@type'] === 'Organization', `seller is Organization: ${productSchema.offers.seller?.name}`);
        assert(productSchema.offers.availability === 'https://schema.org/InStock', `availability is InStock`);
        assert(productSchema.offers.itemCondition === 'https://schema.org/NewCondition', `itemCondition is NewCondition`);
      }
    }
  }

  // ── TEST 3: PDP with Zero Reviews (Protection against Fake/Empty Review Penalty) ──
  console.log('\n--- 3. Zero Reviews Condition (No aggregateRating / No review) ---');
  {
    const path = '/smartwatch-ultra-pro-amoled-titanium-editie-limitata-0427/pd/cmv2znkye000rdi3w4jwmmvfs';
    const { status, html } = await fetchPage(path);
    const jsonLds = extractJsonLd(html);

    console.log(`\nTesting Zero Reviews PDP: ${path} (Status: ${status})`);
    assert(status === 200, `Status is 200`);

    const productSchema = jsonLds.find((j) => j['@type'] === 'Product');
    assert(!!productSchema, `Found Schema.org @type "Product"`);

    if (productSchema) {
      assert(productSchema.aggregateRating === undefined, `Zero reviews product does NOT output aggregateRating (avoids Google penalty)`);
      assert(productSchema.review === undefined, `Zero reviews product does NOT output review array`);
    }
  }

  // ── TEST 4: BreadcrumbList Schema (5-Step eMAG Hierarchy) ──
  console.log('\n--- 4. BreadcrumbList 5-Step eMAG Hierarchy ---');
  {
    const path = '/incalzitor-electric-cu-ulei-9-elemente-termostat-3-setari-de-putere-ma-1027437808/pd/cmuvusq7t0078131fxoa8zm73';
    const { status, html } = await fetchPage(path);
    const jsonLds = extractJsonLd(html);

    const breadcrumbSchema = jsonLds.find((j) => j['@type'] === 'BreadcrumbList');
    assert(!!breadcrumbSchema, `Found Schema.org @type "BreadcrumbList" in PDP JSON-LD`);

    if (breadcrumbSchema && Array.isArray(breadcrumbSchema.itemListElement)) {
      const items = breadcrumbSchema.itemListElement;
      console.log(`Breadcrumbs steps (${items.length}):`, items.map(i => `${i.position}. ${i.name}`).join(' > '));
      assert(items.length >= 4, `Breadcrumbs has at least 4-5 steps (found ${items.length})`);
      assert(items[0].name === 'Acasă' && items[0].position === 1, `Step 1 is Acasă`);
      assert(items[1].name.includes('Electrocasnice') && items[1].position === 2, `Step 2 is Parent Category (Electrocasnice)`);
      assert(items[2].name.includes('Calorifere') && items[2].position === 3, `Step 3 is Subcategory (Calorifere tip panou)`);
      assert(items[3].name.includes('Victronic') && items[3].position === 4, `Step 4 is Category + Brand (Calorifere ... Victronic)`);
      assert(items[items.length - 1].position === items.length, `Final step position matches items length`);
    }

    // Verify visual breadcrumbs exist in HTML
    assert(html.includes('aria-label="Breadcrumb"') || html.includes('Acasă'), `Visual breadcrumbs rendered in HTML`);
  }

  // ── TEST 5: Homepage WebSite & Organization Schema & SearchAction ──
  console.log('\n--- 5. Homepage WebSite & Organization Schema & SearchAction ---');
  {
    const { status, html } = await fetchPage('/');
    const jsonLds = extractJsonLd(html);

    console.log(`\nTesting Homepage / (Status: ${status})`);
    assert(status === 200, `Homepage status is 200`);

    let websiteSchema = null;
    let orgSchema = null;

    for (const json of jsonLds) {
      if (json['@graph']) {
        websiteSchema = json['@graph'].find((g) => g['@type'] === 'WebSite') || websiteSchema;
        orgSchema = json['@graph'].find((g) => g['@type'] === 'Organization') || orgSchema;
      }
      if (json['@type'] === 'WebSite') websiteSchema = json;
      if (json['@type'] === 'Organization') orgSchema = json;
    }

    // 5.1 WebSite Schema with SearchAction
    assert(!!websiteSchema, `Found Schema.org @type "WebSite" on Homepage`);
    if (websiteSchema) {
      assert(websiteSchema.name === 'TopinStock', `WebSite name is TopinStock`);
      assert(!!websiteSchema.potentialAction, `WebSite has potentialAction (SearchAction)`);
      if (websiteSchema.potentialAction) {
        const action = websiteSchema.potentialAction;
        assert(action['@type'] === 'SearchAction', `potentialAction @type is SearchAction`);
        assert(action.target && action.target.urlTemplate && action.target.urlTemplate.includes('/search?q={search_term_string}'), `urlTemplate targets /search?q={search_term_string} (got: ${action.target?.urlTemplate})`);
        assert(action['query-input'] === 'required name=search_term_string', `query-input is required name=search_term_string`);
      }
    }

    // 5.2 Organization Schema
    assert(!!orgSchema, `Found Schema.org @type "Organization" on Homepage`);
    if (orgSchema) {
      assert(orgSchema.name === 'TopinStock', `Organization name is TopinStock`);
      assert(orgSchema.legalName === 'TopinStock Marketplace S.R.L.', `legalName is TopinStock Marketplace S.R.L.`);
      assert(!!orgSchema.logo, `Organization has logo`);
      assert(Array.isArray(orgSchema.contactPoint) && orgSchema.contactPoint.length > 0, `Organization has contactPoint`);
      assert(Array.isArray(orgSchema.sameAs) && orgSchema.sameAs.length > 0, `Organization has sameAs social links`);
    }

    // 5.3 Test /search?q=... redirect
    const searchRes = await fetchPage('/search?q=aspirator', false);
    console.log(`Testing /search?q=aspirator (Status: ${searchRes.status})`);
    assert(searchRes.status === 307 || searchRes.status === 308 || searchRes.status === 200, `SearchAction route responds with redirect or 200 (got ${searchRes.status})`);
    if (searchRes.status === 307 || searchRes.status === 308) {
      const location = searchRes.headers.get('location');
      assert(location && location.includes('/produse?search=aspirator'), `Redirects to /produse?search=aspirator (got: ${location})`);
    }
  }

  console.log('\n========================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
