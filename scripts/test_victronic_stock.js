async function checkVictronic() {
  try {
    const res = await fetch('https://www.victronic.ro/toate-produsele?page=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    console.log('HTTP status:', res.status);
    
    // Check stock indicators in HTML
    const inStockMatches = [...html.matchAll(/(stoc[^<"'\n\r]+)/gi)].map(m => m[1]);
    console.log('First 10 stoc occurrences:', inStockMatches.slice(0, 10));

    // Check button occurrences
    const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    console.log('Sample button texts:', buttons.slice(0, 10));

    // Test a single product page from victronic
    const sampleProductUrl = 'https://www.victronic.ro/umbrela-pentru-gradina-diametrul-280-cm-rotunda-grunberg-b0123-diverse-culori';
    const pRes = await fetch(sampleProductUrl);
    const pHtml = await pRes.text();
    console.log('\nSample Product Page status:', pRes.status);
    const pStockMatches = [...pHtml.matchAll(/(stoc[^<"'\n\r]+)/gi)].map(m => m[1]);
    console.log('Product page stock occurrences:', pStockMatches.slice(0, 10));
    const pAddBtn = pHtml.includes('Adauga in cos') || pHtml.includes('Adaugă în coș');
    const pEpuizat = pHtml.includes('Stoc epuizat') || pHtml.includes('Indisponibil');
    console.log({ pAddBtn, pEpuizat });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkVictronic();
