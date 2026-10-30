const https = require('https');
const fs = require('fs');

const url = 'https://www.joma-sport.com/ro_RO/barbati/imbracaminte/treninguri/';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'Body length:', body.length);
    fs.writeFileSync('scratch/joma_tracksuits_page.html', body);

    // Regex match products
    const imgMatches = body.match(/https:\/\/[^"']+\/images\/medium\/[^"']+/g) || [];
    const uniqueImgs = Array.from(new Set(imgMatches));
    console.log(`Found ${uniqueImgs.length} images`);
    uniqueImgs.slice(0, 15).forEach(img => console.log('  ', img));
  });
}).on('error', e => console.error(e));
