const fs = require('fs');

function stripDiacritics(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeTitle(text) {
  return stripDiacritics(text)
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractModelCodes(text) {
  if (!text) return [];
  // Look for patterns like VC1234, GR1234, BB22, CP115, etc.
  const regex = /\b([a-z]{1,4}[- ]?[0-9]{2,5}[a-z0-9]*)\b/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const code = m[1].replace(/[- ]/g, '').toUpperCase();
    if (code.length >= 3 && /[0-9]/.test(code) && /[A-Z]/.test(code)) {
      // Exclude simple measurements like 28CM, 100W, 12L, etc.
      if (!/^(CM|MM|W|L|ML|KG|GR|G|V|AH|HZ|DB|RPM|BAR|LEI)$/i.test(code.replace(/[0-9]/g, ''))) {
        matches.push(code);
      }
    }
  }
  return [...new Set(matches)];
}

function getWordTokens(text) {
  return new Set(
    normalizeTitle(text)
      .split(' ')
      .filter(w => w.length >= 3 && !['din', 'pentru', 'sau', 'sub', 'este', 'care', 'set', 'buc'].includes(w))
  );
}

function tokenSimilarity(tokensA, tokensB) {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let common = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) common++;
  }
  return (2 * common) / (tokensA.size + tokensB.size);
}

function testDuplicateMatching() {
  const existing = JSON.parse(fs.readFileSync('scripts/existing_db_products.json', 'utf8'));
  const scraped = JSON.parse(fs.readFileSync('scripts/victronic_all_products_raw.json', 'utf8'));

  console.log(`Comparing ${scraped.length} scraped products against ${existing.length} existing products...`);

  // Index existing products
  const existingByCode = new Map(); // modelCode -> [product]
  const existingTokens = existing.map(e => ({
    product: e,
    tokens: getWordTokens(e.title),
    codes: extractModelCodes(e.title + ' ' + e.slug)
  }));

  existingTokens.forEach(et => {
    et.codes.forEach(c => {
      if (!existingByCode.has(c)) existingByCode.set(c, []);
      existingByCode.get(c).push(et.product);
    });
  });

  const duplicateMatches = [];
  const uniqueNewProducts = [];

  for (const s of scraped) {
    const urlSlug = s.url.replace('https://www.victronic.ro/', '').replace(/^\//, '');
    const scrapedCodes = extractModelCodes(s.url + ' ' + (s.cardTitle || ''));
    const scrapedTokens = getWordTokens(urlSlug.replace(/-/g, ' '));

    let matchedExisting = null;
    let matchReason = '';

    // 1. Direct model code match
    for (const code of scrapedCodes) {
      if (existingByCode.has(code)) {
        matchedExisting = existingByCode.get(code)[0];
        matchReason = `Model Code match [${code}] with "${matchedExisting.title}"`;
        break;
      }
    }

    // 2. High token similarity match
    if (!matchedExisting) {
      let bestSim = 0;
      let bestMatch = null;
      for (const et of existingTokens) {
        const sim = tokenSimilarity(scrapedTokens, et.tokens);
        if (sim > bestSim) {
          bestSim = sim;
          bestMatch = et.product;
        }
      }
      if (bestSim >= 0.70) {
        matchedExisting = bestMatch;
        matchReason = `High Title Token similarity (${(bestSim*100).toFixed(1)}%) with "${bestMatch.title}"`;
      }
    }

    if (matchedExisting) {
      duplicateMatches.push({
        scraped: s,
        matched: matchedExisting,
        reason: matchReason
      });
    } else {
      uniqueNewProducts.push(s);
    }
  }

  console.log(`\n=================== RESULTS ===================`);
  console.log(`Total Scraped: ${scraped.length}`);
  console.log(`Detected Duplicates (already in DB): ${duplicateMatches.length}`);
  console.log(`Unique New Products to Upload: ${uniqueNewProducts.length}`);

  console.log(`\nSample Duplicates (first 10):`);
  duplicateMatches.slice(0, 10).forEach(d => {
    console.log(`- Scraped: ${d.scraped.url.split('/').pop()}`);
    console.log(`  -> Reason: ${d.reason}`);
  });

  fs.writeFileSync('scripts/detected_duplicates.json', JSON.stringify(duplicateMatches, null, 2));
  fs.writeFileSync('scripts/unique_new_products.json', JSON.stringify(uniqueNewProducts, null, 2));
  console.log('\nSaved scripts/detected_duplicates.json and scripts/unique_new_products.json');
}

testDuplicateMatching();
