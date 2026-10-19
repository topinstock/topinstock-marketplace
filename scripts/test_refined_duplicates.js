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

// Clean and extract model codes accurately
function extractModelCodes(text) {
  if (!text) return [];
  const clean = text.replace(/(\d+)\s*[xX]\s*(\d+)/g, ' '); // remove dimensions like 30x20
  const regex = /\b([a-zA-Z]{1,4}[- ]?[0-9]{1,5}[a-zA-Z0-9]*)\b/g;
  const matches = [];
  let m;
  
  const ignored = new Set([
    'CM', 'MM', 'M', 'W', 'KW', 'L', 'ML', 'KG', 'GR', 'G', 'V', 'AH', 'HZ', 'DB', 
    'RPM', 'BAR', 'LEI', 'RON', 'BUC', 'PIESE', 'IN1', 'DE', 'SI', 'CU', 'LA', 'PE',
    'X', 'XL', 'XXL', 'XS', 'S', 'M', 'L'
  ]);

  while ((m = regex.exec(clean)) !== null) {
    const raw = m[1].replace(/[- ]/g, '').toUpperCase();
    const letters = raw.replace(/[0-9]/g, '');
    const digits = raw.replace(/[^0-9]/g, '');

    if (!digits || !letters) continue;
    if (ignored.has(letters)) continue;

    // Reject "X13", "X20" etc. which are dimensions
    if (letters === 'X') continue;
    if (letters === 'IN' && digits === '1') continue; // 2in1, 3in1
    if (letters === 'D' && digits === '3') continue; // 3D

    // Minimum length check
    if (raw.length >= 3) {
      matches.push(raw);
    }
  }
  return [...new Set(matches)];
}

// Extract key numbers (liters, cm, pieces)
function extractKeyNumbers(text) {
  const norm = stripDiacritics(text);
  const liters = (norm.match(/(\d+(?:[.,]\d+)?)\s*(?:l|litri)\b/) || [])[1];
  const cm = (norm.match(/(\d+)\s*cm\b/) || [])[1];
  const pieces = (norm.match(/(\d+)\s*(?:piese|buc)\b/) || [])[1];
  return { liters, cm, pieces };
}

function getWordTokens(text) {
  return new Set(
    normalizeTitle(text)
      .split(' ')
      .filter(w => w.length >= 3 && !['din', 'pentru', 'sau', 'sub', 'este', 'care', 'set', 'buc', 'piese'].includes(w))
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

function runRefinedMatching() {
  const existing = JSON.parse(fs.readFileSync('scripts/existing_db_products.json', 'utf8'));
  const scraped = JSON.parse(fs.readFileSync('scripts/victronic_all_products_raw.json', 'utf8'));

  const existingProcessed = existing.map(e => ({
    product: e,
    normTitle: normalizeTitle(e.title),
    tokens: getWordTokens(e.title),
    codes: extractModelCodes(e.title + ' ' + e.slug),
    numbers: extractKeyNumbers(e.title)
  }));

  const existingByCode = new Map();
  existingProcessed.forEach(ep => {
    ep.codes.forEach(code => {
      if (!existingByCode.has(code)) existingByCode.set(code, []);
      existingByCode.get(code).push(ep);
    });
  });

  const duplicateMatches = [];
  const uniqueNewProducts = [];

  for (const s of scraped) {
    const urlSlug = s.url.replace('https://www.victronic.ro/', '').replace(/^\//, '');
    const scrapedText = urlSlug.replace(/-/g, ' ') + ' ' + (s.cardTitle || '');
    const scrapedNorm = normalizeTitle(scrapedText);
    const scrapedCodes = extractModelCodes(scrapedText);
    const scrapedTokens = getWordTokens(scrapedText);
    const scrapedNumbers = extractKeyNumbers(scrapedText);

    let matched = null;
    let reason = '';

    // 1. Direct Model Code Match
    for (const code of scrapedCodes) {
      if (existingByCode.has(code)) {
        const candidate = existingByCode.get(code)[0];
        matched = candidate;
        reason = `Identical model code [${code}] with "${candidate.product.title}"`;
        break;
      }
    }

    // 2. Exact or very high Title / Token match
    if (!matched) {
      let bestSim = 0;
      let bestCandidate = null;

      for (const ep of existingProcessed) {
        // If both have model codes and none matched, they are different models!
        if (scrapedCodes.length > 0 && ep.codes.length > 0) {
          const hasCommonCode = scrapedCodes.some(sc => ep.codes.includes(sc));
          if (!hasCommonCode) continue; // Different models, skip!
        }

        // Check key numbers conflict (e.g. 7L vs 9L, 120cm vs 210cm)
        if (scrapedNumbers.liters && ep.numbers.liters && scrapedNumbers.liters !== ep.numbers.liters) {
          continue;
        }
        if (scrapedNumbers.cm && ep.numbers.cm && Math.abs(parseInt(scrapedNumbers.cm) - parseInt(ep.numbers.cm)) > 10) {
          continue;
        }

        const sim = tokenSimilarity(scrapedTokens, ep.tokens);
        if (sim > bestSim) {
          bestSim = sim;
          bestCandidate = ep;
        }
      }

      if (bestSim >= 0.75) {
        matched = bestCandidate;
        reason = `High token similarity (${(bestSim * 100).toFixed(1)}%) with "${bestCandidate.product.title}"`;
      }
    }

    if (matched) {
      duplicateMatches.push({
        scraped: s,
        matched: matched.product,
        reason
      });
    } else {
      uniqueNewProducts.push(s);
    }
  }

  console.log(`\n=================== REFINED RESULTS ===================`);
  console.log(`Total Scraped Products: ${scraped.length}`);
  console.log(`Duplicates Identified (already on TopinStock): ${duplicateMatches.length}`);
  console.log(`Unique New Products to Upload: ${uniqueNewProducts.length}`);

  console.log(`\nSample Duplicates (first 15):`);
  duplicateMatches.slice(0, 15).forEach((d, i) => {
    console.log(`${i+1}. [${d.scraped.url.split('/').pop()}]`);
    console.log(`   -> ${d.reason}`);
  });

  fs.writeFileSync('scripts/refined_duplicates.json', JSON.stringify(duplicateMatches, null, 2));
  fs.writeFileSync('scripts/refined_unique_new.json', JSON.stringify(uniqueNewProducts, null, 2));
}

runRefinedMatching();
