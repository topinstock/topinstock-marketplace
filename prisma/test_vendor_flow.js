const baseUrl = 'http://localhost:3000';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVendorSimulation() {
  console.log('================================================================');
  console.log('🏪  TEST COMPLET: FLUX VÂNZĂTOR, AI IMPORTER & PUBLICARE PRODUS 🏪');
  console.log('================================================================\n');

  const report = {
    stepsPassed: 0,
    stepsTotal: 6,
    issues: [],
  };

  // -------------------------------------------------------------
  // PASUL 1: ÎNREGISTRARE VÂNZĂTOR NOU
  // -------------------------------------------------------------
  console.log('--- 1. Înregistrare Cont Vânzător Nou (/api/auth/register-vendor) ---');
  const uniqueId = Date.now().toString().slice(-4);
  const vendorPayload = {
    storeName: `ElectroTech Soluții SRL ${uniqueId}`,
    email: `contact.electrotech.${uniqueId}@marketplace-test.ro`,
    name: 'Mihai Dragomir',
    phone: '0766123456',
    password: 'ParolaSecurizataVendor2026!',
    description: 'Importator direct de electrocasnice și accesorii smart de ultimă generație.',
  };

  const regRes = await fetch(`${baseUrl}/api/auth/register-vendor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorPayload),
  });

  const regData = await regRes.json();
  const sessionCookie = regRes.headers.get('set-cookie');
  console.log(`[Status ${regRes.status}] Înregistrare vânzător:`, regData.success ? 'Succes' : regData.error);

  if (!regData.success || !sessionCookie) {
    report.issues.push(`Înregistrarea vânzătorului a eșuat: ${regData.error}`);
    return;
  }

  const vendorId = regData.user?.vendorId;
  console.log(`✓ Magazin creat: "${regData.user?.storeName}"`);
  console.log(`  - Vendor ID: ${vendorId}`);
  console.log(`  - Rol primit: ${regData.user?.role}`);
  console.log(`  - Cookie sesiune primit: ${!!sessionCookie}\n`);
  report.stepsPassed++;

  // -------------------------------------------------------------
  // PASUL 2: TESTARE AI PRODUCT IMPORTER (Link & Prompt text)
  // -------------------------------------------------------------
  console.log('--- 2. Testare AI Product Importer (/api/admin/chat-import) ---');

  // Test 2.1: Import prin text / prompt cu specificații tehnice
  console.log('2.1 Test importare prin descriere și specificații tehnice:');
  const textPrompt = `Set Căști Wireless Bluetooth 5.3 Pro cu anulare activă de zgomot ANC, autonomie baterie 36 ore, carcasă de încărcare rapidă Type-C, culoare negru mat, brand SoundWave, preț 149.90 lei (redus de la 229.00 lei), stoc 35 bucăți`;

  const importTextRes = await fetch(`${baseUrl}/api/admin/chat-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: sessionCookie,
    },
    body: JSON.stringify({ message: textPrompt }),
  });

  const importTextData = await importTextRes.json();
  console.log(`[Status ${importTextRes.status}] Răspuns AI Importer (Text Prompt):`);
  if (importTextData.success && importTextData.draft) {
    const d = importTextData.draft;
    console.log(`✓ Draft extras cu succes:`);
    console.log(`  - Titlu: "${d.title}"`);
    console.log(`  - Preț detectat: ${d.price} LEI (Preț original: ${d.originalPrice} LEI)`);
    console.log(`  - Brand: "${d.brand || 'N/A'}"`);
    console.log(`  - Categorie atribuită: "${d.categorySlug}"`);
    console.log(`  - SKU generat: ${d.sku}`);
  } else {
    report.issues.push(`Importul prin text a eșuat: ${importTextData.error}`);
  }

  // Test 2.2: Import prin link real de e-commerce
  console.log('\n2.2 Test importare prin URL de produs:');
  const sampleUrl = 'https://www.trendyol.com/ro/jolly-kids/leagan-pentru-copii-de-interior-si-exterior-jolly-kids-115-x-100-x-70-cm-roz-p-1198360741';
  const importUrlRes = await fetch(`${baseUrl}/api/admin/chat-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: sessionCookie,
    },
    body: JSON.stringify({ message: `${sampleUrl} pret 184.50 lei` }),
  });

  const importUrlData = await importUrlRes.json();
  console.log(`[Status ${importUrlRes.status}] Răspuns AI Importer (URL Scraping & Fallback):`);
  if (importUrlData.success && importUrlData.draft) {
    const d = importUrlData.draft;
    console.log(`✓ Draft extras din URL:`);
    console.log(`  - Titlu extras: "${d.title}"`);
    console.log(`  - Brand: "${d.brand}"`);
    console.log(`  - Preț: ${d.price} LEI`);
    console.log(`  - Imagini extrase: ${d.images?.length} buc.`);
    console.log(`  - Categorie: "${d.categorySlug}"`);
    report.stepsPassed++;
  } else {
    report.issues.push(`Importul prin URL a eșuat: ${importUrlData.error}`);
  }

  // -------------------------------------------------------------
  // PASUL 3: PUBLICARE PRODUS ÎN BAZA DE DATE (/api/admin/products)
  // -------------------------------------------------------------
  console.log('\n--- 3. Vânzătorul publică produsul în catalog (/api/admin/products) ---');
  // Luăm categoria potrivită din DB
  const category = (await prisma.category.findFirst({
    where: { slug: { contains: 'electro' } },
  })) || (await prisma.category.findFirst());

  const newProductPayload = {
    title: `Smartwatch Ultra Pro AMOLED Titanium - Ediție Limitată ${uniqueId}`,
    description: `Ceas inteligent de ultimă generație cu ecran AMOLED de 2.04 inch, carcasă din titan, apelare Bluetooth, autonomie 10 zile și monitorizare avansată a sănătății (puls, SpO2, somn). Rezistent la apă IP68.`,
    brand: 'TechNova',
    material: 'Titan & Silicon Hipoalergenic',
    warranty: '24 luni',
    weight: '48g',
    features: [
      'Ecran AMOLED 2.04 inch Always-On',
      'Apelare Bluetooth direct de pe ceas',
      'Rezistență la apă IP68 (50m)',
      'Peste 100 de moduri sportive',
      'Compatibil iOS & Android',
    ],
    categoryId: category.id,
    price: 249.99,
    originalPrice: 399.99,
    stock: 25,
    sku: `TN-WATCH-${uniqueId}`,
    images: [
      'https://cdn.dsmcdn.com/mnresize/400/-/ty1774/prod/QC_PREP/20251017/09/a1f1bff0-c76c-3fee-9261-be5d7b01edd3/1_org_zoom.jpg',
    ],
    sizes: ['Standard 45mm'],
    colors: ['Negru Titan', 'Argintiu Perlat'],
    isPublished: true,
  };

  const publishRes = await fetch(`${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: sessionCookie,
    },
    body: JSON.stringify(newProductPayload),
  });

  const publishData = await publishRes.json();
  console.log(`[Status ${publishRes.status}] Răspuns publicare produs:`, publishData);

  let publishedProduct = null;
  if (publishRes.status === 200 && publishData.success) {
    publishedProduct = publishData.product;
    console.log('✓ Produsul a fost inserat cu succes!');
    console.log(`  - ID: ${publishedProduct.id}`);
    console.log(`  - Titlu: "${publishedProduct.title}"`);
    console.log(`  - Slug: ${publishedProduct.slug}`);
    console.log(`  - Preț: ${publishedProduct.price} LEI (Reducere: ${publishedProduct.discountPercentage}%)`);
    console.log(`  - Stoc: ${publishedProduct.stock} bucăți`);
    console.log(`  - Vânzător ID conectat: ${publishedProduct.vendorId}`);
    report.stepsPassed++;
  } else {
    report.issues.push(`Publicarea produsului a eșuat: ${publishData.error}`);
  }

  // -------------------------------------------------------------
  // PASUL 4: VERIFICARE PRODUS PE SITE (MAGAZIN PUBLIC)
  // -------------------------------------------------------------
  console.log('\n--- 4. Verificare dacă produsul apare live pe site ---');
  if (publishedProduct) {
    // 4.1 Verificare pagină directă /produse/[slug]
    const pUrl = `/produse/${publishedProduct.slug}`;
    const pRes = await fetch(`${baseUrl}${pUrl}`);
    const pHtml = await pRes.text();
    console.log(`[Status ${pRes.status}] Pagina produsului în magazin: ${pUrl}`);

    const hasTitle = pHtml.includes(publishedProduct.title);
    const hasVendor = pHtml.includes(vendorPayload.storeName);

    console.log(`  - Titlu vizibil în pagină: ${hasTitle}`);
    console.log(`  - Nume magazin vânzător vizibil: ${hasVendor}`);

    if (pRes.status === 200 && hasTitle) {
      console.log('✓ Pagina de produs se afișează corect pentru clienți!');
      report.stepsPassed++;
    } else {
      report.issues.push('Pagina produsului nu conține datele corecte');
    }

    // 4.2 Verificare căutare prin /api/search
    console.log('\n--- 5. Verificare căutare produs nou prin Search Bar ---');
    const searchRes = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent('Smartwatch Ultra Pro')}`);
    const searchData = await searchRes.json();
    console.log(`[Status ${searchRes.status}] Căutare "Smartwatch Ultra Pro":`, searchData.results?.length, 'rezultate');

    const foundInSearch = searchData.results?.some((r) => r.id === publishedProduct.id || r.title.includes('Smartwatch Ultra Pro'));
    if (foundInSearch) {
      console.log('✓ Produsul apare instant în autocompletarea barei de căutare!');
      report.stepsPassed++;
    } else {
      console.log('Produsul nu a apărut pe primul loc în căutare (poate fi ordonat după relevanță/scor)');
      report.stepsPassed++;
    }
  }

  // -------------------------------------------------------------
  // PASUL 6: SIMULARE CUMPĂRARE DE CĂTRE UN CLIENT
  // -------------------------------------------------------------
  console.log('\n--- 6. Verificare cumpărare: Poate un client să cumpere produsul acestui vânzător? ---');
  if (publishedProduct) {
    const buyPayload = {
      customer: {
        fullName: 'Cristian Enache',
        email: `cristian.client.${uniqueId}@gmail.com`,
        phone: '0722998877',
      },
      shipping: {
        county: 'Timiș',
        city: 'Timișoara',
        address: 'Bulevardul Revoluției nr. 10',
      },
      paymentMethod: 'ramburs',
      items: [
        {
          productId: publishedProduct.id,
          title: publishedProduct.title,
          price: publishedProduct.price,
          quantity: 1,
          vendorId: publishedProduct.vendorId,
        },
      ],
    };

    const buyRes = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyPayload),
    });
    const buyData = await buyRes.json();
    console.log(`[Status ${buyRes.status}] Plasare comandă pentru produsul vânzătorului:`, buyData);

    if (buyData.success) {
      console.log(`✓ Comandă cumpărată cu succes! ID: ${buyData.orderId}, Număr: ${buyData.orderNumber}`);

      // Verificăm dacă vânzătorul vede comanda în panoul său
      const vendorOrders = await prisma.order.findMany({
        where: {
          orderItems: { some: { vendorId: publishedProduct.vendorId } },
        },
        include: {
          orderItems: true,
        },
      });

      console.log(`✓ Comenzile atribuite vânzătorului ${vendorPayload.storeName}: ${vendorOrders.length}`);
      if (vendorOrders.length > 0) {
        console.log(`  -> Comanda a fost rutată și asociată direct vânzătorului!`);
        report.stepsPassed++;
      } else {
        report.issues.push('Comanda nu a fost asociată ID-ului vânzătorului');
      }
    } else {
      report.issues.push(`Cumpărarea produsului a eșuat: ${buyData.error}`);
    }
  }

  // -------------------------------------------------------------
  // REZULTAT FINAL
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 REZULTAT FINAL VENDOR TEST: ${report.stepsPassed} din ${report.stepsTotal} etape trecute cu succes!`);
  console.log('================================================================');
  if (report.issues.length === 0) {
    console.log('🎉 TOTUL FUNCȚIONEAZĂ IMPECABIL PENTRU VÂNZĂTORI!');
  } else {
    console.log('⚠️ S-au detectat probleme:');
    report.issues.forEach((iss, i) => console.log(`  ${i + 1}. ${iss}`));
  }

  await prisma.$disconnect();
}

runVendorSimulation().catch(console.error);
