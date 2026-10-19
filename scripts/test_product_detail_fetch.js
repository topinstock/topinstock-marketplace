const fs = require('fs');

async function testFetch5() {
  const newProducts = JSON.parse(fs.readFileSync('scripts/accurate_unique_new.json', 'utf8'));
  console.log(`Loaded ${newProducts.length} unique new products.`);

  const samples = newProducts.slice(0, 5);

  for (const item of samples) {
    console.log(`\nFetching ${item.url}...`);
    const t0 = Date.now();
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const duration = Date.now() - t0;
    console.log(`Fetched in ${duration}ms. HTML length: ${html.length}`);

    // Extract title
    const ogTitle = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1];
    const title = ogTitle ? ogTitle.replace(/\s*-\s*Victronic\s*$/i, '').trim() : item.cardTitle;

    // Extract images
    const ogImage = (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1];
    const allImgs = [...html.matchAll(/(https:\/\/www\.victronic\.ro\/img\/[^\s"'<>]+\.jpg)/gi)].map(m => m[1]);
    const largeImgs = [...new Set(allImgs.filter(img => img.includes('-large.jpg')))];
    const images = largeImgs.length > 0 ? largeImgs : (ogImage ? [ogImage] : [item.cardImage]);

    // Extract breadcrumbs
    const bcMatches = [...html.matchAll(/<a\s+href="https:\/\/www\.victronic\.ro\/([^"]+)"\s+class="[^"]*breadcrumbs[^"]*item[^"]*">([\s\S]*?)<\/a>/gi)];
    const breadcrumbs = bcMatches.map(m => ({
      slug: m[1],
      name: m[2].replace(/<[^>]+>/g, '').trim()
    })).filter(b => b.slug && b.slug !== '' && b.slug !== '#');

    // Extract description
    const descMatch = html.match(/<span class="[^"]*ui-rich-text[^"]*"[\s\S]*?<span class="[^"]*field[^"]*">([\s\S]*?)<\/span>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract attributes
    const attrRegex = /<span class="[^"]*attribute-name[^"]*">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<span class="[^"]*attribute-value[^"]*">\s*([\s\S]*?)\s*<\/span>/gi;
    const attributes = {};
    let am;
    while ((am = attrRegex.exec(html)) !== null) {
      const key = am[1].replace(/<[^>]+>/g, '').trim();
      const val = am[2].replace(/<[^>]+>/g, '').trim();
      if (key && val) attributes[key] = val;
    }

    console.log('Result:', {
      title,
      price: item.cardPrice,
      basePrice: item.cardBasePrice,
      brand: item.brand,
      breadcrumbs,
      imagesCount: images.length,
      firstImage: images[0],
      descLength: description.length,
      attributes
    });
  }
}

testFetch5().catch(console.error);
