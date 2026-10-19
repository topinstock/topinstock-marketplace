const https = require('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-Inertia': 'true',
        'X-Inertia-Version': '52864a628b10bbb25991700a2ac57cac'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  const homeData = await fetchUrl('https://teomarket.com/');
  if (homeData.props) {
    console.log('Homepage props keys:', Object.keys(homeData.props));
    if (homeData.props.categories) {
      console.log('Homepage categories count:', homeData.props.categories.length);
      console.log('Sample category structure:', JSON.stringify(homeData.props.categories[0], null, 2));
    }
  }
}

test();
