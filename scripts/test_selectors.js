const fs = require('fs');
const path = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\a1a4b3a2-7665-43bf-afe2-eac367df8a32\\scratch\\victronic_sample_product.html';
const html = fs.readFileSync(path, 'utf8');

// Price search
// Let's find all instances of "lei" or "LEI"
const leiMatches = [...html.matchAll(/([0-9.,]+)\s*(?:lei|LEI)/gi)];
console.log('Lei occurrences:', leiMatches.map(m => m[0]));

// Look for price spans
const priceSpans = [...html.matchAll(/<span[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)];
console.log('Price spans:', priceSpans.map(m => m[0].replace(/\s+/g, ' ')));

// Look for description container
// Earlier we found:
// <span class="ui_component_field_6za58_container ui-rich-text"> ... <span class="ui_component_field_6za58_field"> ... <p>...
const descMatches = [...html.matchAll(/<span[^>]*class="[^"]*ui-rich-text[^"]*"[\s\S]*?<span[^>]*class="[^"]*field[^"]*"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/gi)];
console.log('Desc matches count:', descMatches.length);
if (descMatches.length > 0) {
  console.log('Desc [0]:', descMatches[0][1].slice(0, 300));
}

// Check other description elements:
const descFallback = html.match(/<div[^>]*class="[^"]*tabs[^"]*body[^"]*"[\s\S]*?<p>([\s\S]*?)<\/p>/i);
console.log('Desc fallback:', descFallback ? descFallback[0].slice(0, 200) : 'none');
