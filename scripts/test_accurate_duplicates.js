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

const VALID_PREFIXES = [
  'GR', 'IGR', 'VC', 'BB', 'BF', 'BM', 'CB', 'CD', 'CP', 'GF', 'GP', 'K', 'PC', 'TGR',
  'IDC', 'ICB', 'IMM', 'IDB', 'ICI', 'HCP', 'MFP', 'PCM', 'SFP', 'HXG', 'JN', 'OB',
  'SF', 'MC', 'F', 'CDB', 'MM', 'DS', 'CT', 'LH', 'BJDQ', 'A', 'B'
];

function extractAccurateModelCodes(text) {
  if (!text) return [];
  // Remove dimensions like 30x20, 41x13x42
  const clean = text.replace(/(\d+)\s*[xX]\s*(\d+)/g, ' ').replace(/\b\d+([.,]\d+)?\s*(cm|mm|m|l|ml|w|kw|kg|g|bar)\b/gi, ' ');
  const regex = /\b([a-zA-Z]{1,5}[- ]?[0-9]{1,5}[a-zA-Z0-9]*)\b/g;
  const matches = [];
  let m;

  while ((m = regex.exec(clean)) !== null) {
    const raw = m[1].replace(/[- ]/g, '').toUpperCase();
    const letters = raw.replace(/[0-9]/g, '');
    const digits = raw.replace(/[^0-9]/g, '');

    if (!digits || !letters) continue;

    // Check if starts with a known model prefix
    const hasValidPrefix = VALID_PREFIXES.some(pref => raw.startsWith(pref));
    if (!hasValidPrefix) continue;

    // Disallow false positives
    if (['SET', 'ULEI', 'VAS', 'LITRI', 'PERS', 'BUC', 'PIESE', 'IN1', 'DE', 'SI', 'CU'].includes(letters)) continue;
    if (letters === 'X') continue;
    if (letters === 'A' && digits.length === 1 && parseInt(digits) > 5) continue;

    matches.push(raw);
  }
  return [...new Set(matches)];
}

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
      .filter(w => w.length >= 3 && !['din', 'pentru', 'sau', 'sub', 'este', 'care', 'set', 'buc', 'piese', 'cu', 'si', 'de'].includes(w))
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

function runAccurateMatching() {
  const existing = JSON.parse(fs.readFileSync('scripts/existing_db_products.json', 'utf8'));
  const scraped = JSON.parse(fs.readFileSync('scripts/victronic_all_products_raw.json', 'utf8'));

  const existingProcessed = existing.map(e => ({
    product: e,
    normTitle: normalizeTitle(e.title),
    tokens: getWordTokens(e.title),
    codes: extractAccurateModelCodes(e.title + ' ' + e.slug),
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
    const scrapedCodes = extractAccurateModelCodes(scrapedText);
    const scrapedTokens = getWordTokens(scrapedText);
    const scrapedNumbers = extractKeyNumbers(scrapedText);

    let matched = null;
    let reason = '';

    // 1. Exact Model Code Match
    for (const code of scrapedCodes) {
      if (existingByCode.has(code)) {
        const candidate = existingByCode.get(code)[0];
        matched = candidate;
        reason = `Identical model code [${code}] with "${candidate.product.title}"`;
        break;
      }
    }

    // 2. Title similarity match
    if (!matched) {
      let bestSim = 0;
      let bestCandidate = null;

      for (const ep of existingProcessed) {
        // If both have model codes and none matched, they are different models!
        if (scrapedCodes.length > 0 && ep.codes.length > 0) {
          const hasCommonCode = scrapedCodes.some(sc => ep.codes.includes(sc));
          if (!hasCommonCode) continue;
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

      if (bestSim >= 0.78) {
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

  console.log(`\n=================== ACCURATE RESULTS ===================`);
  console.log(`Total Scraped: ${scraped.length}`);
  console.log(`Duplicates (Already on TopinStock): ${duplicateMatches.length}`);
  console.log(`Unique New Products to Upload: ${uniqueNewProducts.length}`);

  console.log(`\nSample Duplicates (first 20):`);
  duplicateMatches.slice(0, 20).forEach((d, i) => {
    console.log(`${(i+1).toString().padStart(2)}. [${d.scraped.url.split('/').pop()}]`);
    console.log(`    -> ${d.reason}`);
  });

  fs.writeFileSync('scripts/accurate_duplicates.json', JSON.stringify(duplicateMatches, null, 2));
  fs.writeFileSync('scripts/accurate_unique_new.json', JSON.stringify(uniqueNewProducts, null, 2));
  console.log('\nSaved accurate_duplicates.json and accurate_unique_new.json');
}

runAccurateMatching();
