const fs = require('fs');

async function enrichTitles() {
  const data = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));
  const needTitle = data.filter(p => !p.title || p.title.endsWith('...'));
  console.log(`Enriching titles for ${needTitle.length} products...`);

  const concurrency = 15;
  for (let i = 0; i < needTitle.length; i += concurrency) {
    const chunk = needTitle.slice(i, i + concurrency);
    await Promise.all(chunk.map(async item => {
      try {
        const res = await fetch(item.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(8000)
        });
        const html = await res.text();
        const ogTitle = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1];
        if (ogTitle) {
          item.title = ogTitle.replace(/\s*-\s*Victronic\s*$/i, '').trim();
        }
      } catch (e) {
        // Fallback: format title from slug
        if (!item.title || item.title.endsWith('...')) {
          const rawSlug = item.url.split('/').pop().replace(/-/g, ' ');
          item.title = rawSlug.charAt(0).toUpperCase() + rawSlug.slice(1);
        }
      }
    }));
    console.log(`Enriched ${Math.min(i + concurrency, needTitle.length)} / ${needTitle.length}...`);
  }

  // Update original data
  fs.writeFileSync('scripts/victronic_complete_scraped.json', JSON.stringify(data, null, 2));
  console.log('Saved enriched titles to scripts/victronic_complete_scraped.json');
}

enrichTitles().catch(console.error);
