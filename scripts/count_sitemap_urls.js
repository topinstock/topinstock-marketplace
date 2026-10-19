const https = require('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function analyzeSitemaps() {
  let totalUrls = 0;
  for (let i = 1; i <= 9; i++) {
    const sitemapUrl = `https://teomarket.com/sitemap-products-${i}.xml`;
    try {
      const xml = await fetchUrl(sitemapUrl);
      const matches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
      console.log(`sitemap-products-${i}.xml: ${matches.length} products`);
      totalUrls += matches.length;
    } catch (err) {
      console.error(`Error fetching sitemap ${i}:`, err.message);
    }
  }
  console.log(`Total product URLs found across sitemaps: ${totalUrls}`);
}

analyzeSitemaps();
