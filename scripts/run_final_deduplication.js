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
  const clean = text.replace(/(\d+)\s*[xX]\s*(\d+)/g, ' ').replace(/\b\d+([.,]\d+)?\s*(cm|mm|m|l|ml|w|kw|kg|g|bar)\b/gi, ' ');
  const regex = /\b([a-zA-Z]{1,5}[- ]?[0-9]{1,5}[a-zA-Z0-9]*)\b/g;
  const matches = [];
  let m;

  while ((m = regex.exec(clean)) !== null) {
    const raw = m[1].replace(/[- ]/g, '').toUpperCase();
    const letters = raw.replace(/[0-9]/g, '');
    const digits = raw.replace(/[^0-9]/g, '');

    if (!digits || !letters) continue;
    const hasValidPrefix = VALID_PREFIXES.some(pref => raw.startsWith(pref));
    if (!hasValidPrefix) continue;

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

function runDeduplication() {
  const existing = JSON.parse(fs.readFileSync('scripts/existing_db_products.json', 'utf8'));
  const scraped = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));

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
    const fullText = (s.title || '') + ' ' + urlSlug.replace(/-/g, ' ');
    const scrapedCodes = extractAccurateModelCodes(fullText);
    const scrapedTokens = getWordTokens(fullText);
    const scrapedNumbers = extractKeyNumbers(fullText);

    let matched = null;
    let reason = '';

    // 1. Direct Model Code Match
    for (const code of scrapedCodes) {
      if (existingByCode.has(code)) {
        const candidate = existingByCode.get(code)[0];
        matched = candidate;
        reason = `Cod model identic [${code}] cu existentul "${candidate.product.title}"`;
        break;
      }
    }

    // 2. High Title Similarity Match
    if (!matched) {
      let bestSim = 0;
      let bestCandidate = null;

      for (const ep of existingProcessed) {
        if (scrapedCodes.length > 0 && ep.codes.length > 0) {
          const hasCommonCode = scrapedCodes.some(sc => ep.codes.includes(sc));
          if (!hasCommonCode) continue;
        }

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
        reason = `Titlu foarte similar (${(bestSim * 100).toFixed(1)}%) cu "${bestCandidate.product.title}"`;
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

  console.log(`=============================================`);
  console.log(`TOTAL PRODUSE PE VICTRONIC.RO: ${scraped.length}`);
  console.log(`DUPLICATE DEJA PE SITE (IGNORATE): ${duplicateMatches.length}`);
  console.log(`PRODUSE UNICE NOI DE URCAT PE SITE: ${uniqueNewProducts.length}`);
  console.log(`=============================================`);

  fs.writeFileSync('scripts/final_duplicates.json', JSON.stringify(duplicateMatches, null, 2));
  fs.writeFileSync('scripts/final_unique_to_upload.json', JSON.stringify(uniqueNewProducts, null, 2));
  console.log('Salvat scripts/final_duplicates.json și scripts/final_unique_to_upload.json');
}

runDeduplication();
