const https = require('https');

function getWithRedirect(url) {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    console.log('Status:', res.statusCode, 'Location:', res.headers.location);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      let nextUrl = res.headers.location;
      if (!nextUrl.startsWith('http')) nextUrl = 'https://www.joma-sport.com' + nextUrl;
      return getWithRedirect(nextUrl);
    }
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const matches = body.match(/https:\/\/[^"']+\/images\/[^\?"]+\.jpg/g) || [];
      const unique = Array.from(new Set(matches));
      console.log('Images found:', unique.slice(0, 10));
    });
  }).on('error', console.error);
}

getWithRedirect('https://www.joma-sport.com/ro_RO/trening-phoenix-ii-negru-alb/103121.102.html');
