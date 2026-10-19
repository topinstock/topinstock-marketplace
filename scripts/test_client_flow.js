async function runClientFlow() {
  console.log('=== TEST FLOW: CLIENT LOG IN & BROWSE ===');
  
  // 1. Authenticate as client
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@topinstock.ro', password: 'parola123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('1. Login status:', loginRes.status, '| Success:', loginData.success, '| User:', loginData.user?.name, `(${loginData.user?.email})`);

  // 2. Fetch /api/auth/me using the cookie
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: { cookie: cookie || '' }
  });
  const meData = await meRes.json();
  console.log('2. Authenticated Session User:', meData.user?.name, '| Role:', meData.user?.role);

  // 3. Search query test: 'rucsac'
  const searchRes = await fetch('http://localhost:3000/search?q=rucsac', {
    headers: { cookie: cookie || '' }
  });
  const searchHtml = await searchRes.text();
  console.log('3. Search page HTTP status:', searchRes.status);
  console.log('   Contains "Flippy" in search page?', /flippy/i.test(searchHtml));
  console.log('   Contains "TOPinStock" in search page?', searchHtml.includes('TOPinStock'));

  // 4. Check specific product page as client
  const prodSlug = 'rucsac-troler-de-calatorie-topinstock-maner-telescopic-roti-compartiment-pentru';
  const prodRes = await fetch(`http://localhost:3000/produse/${prodSlug}`, {
    headers: { cookie: cookie || '' }
  });
  const prodHtml = await prodRes.text();
  console.log('4. Product page HTTP status:', prodRes.status);
  
  // Extract Title, Brand, Distributor, Seller
  const h1Match = prodHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  console.log('   Title (H1):', h1Match ? h1Match[1].trim() : 'N/A');

  const brandMatch = prodHtml.match(/Brand<\/span>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
  console.log('   Brand attribute:', brandMatch ? brandMatch[1].trim() : 'N/A');

  const sellerIdx = prodHtml.indexOf('Vândut și expediat de:');
  if (sellerIdx !== -1) {
    const snippet = prodHtml.slice(sellerIdx, sellerIdx + 200).replace(/\s+/g, ' ');
    console.log('   Seller box snippet:', snippet);
  }

  // 5. Test another former Flippy product: 'set-7-recipiente'
  const prod2Slug = 'set-7-recipiente-organizare-alimente-topinstock-inchidere-etansa-etichete-reuti';
  const prod2Res = await fetch(`http://localhost:3000/produse/${prod2Slug}`, {
    headers: { cookie: cookie || '' }
  });
  const prod2Html = await prod2Res.text();
  console.log('5. Second Product (Recipiente) HTTP status:', prod2Res.status);
  const h1Prod2 = prod2Html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  console.log('   Title (H1):', h1Prod2 ? h1Prod2[1].trim() : 'N/A');

  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runClientFlow().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
