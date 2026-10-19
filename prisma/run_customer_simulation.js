const baseUrl = 'http://localhost:3000';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runCustomerSimulation() {
  console.log('==================================================');
  console.log('🛒 SIMULARE COMPLETĂ FLUX CLIENT PE TOPINSTOCK 🛒');
  console.log('==================================================\n');

  const issuesFound = [];

  // STEP 1: HOMEPAGE
  console.log('--- 1. Vizitare Pagina Principală (Homepage) ---');
  try {
    const homeRes = await fetch(`${baseUrl}/`);
    const homeHtml = await homeRes.text();
    console.log(`Status HTTP: ${homeRes.status}`);
    if (homeRes.status !== 200) {
      issuesFound.push(`Homepage a returnat status ${homeRes.status}`);
    } else {
      console.log('✓ Homepage se încarcă cu succes (200 OK)');
      if (homeHtml.includes('TopinStock')) {
        console.log('✓ Titlul/Brandul TopinStock este prezent în HTML');
      }
    }
  } catch (err) {
    issuesFound.push(`Eroare la accesarea homepage: ${err.message}`);
  }

  // STEP 2: SEARCH
  console.log('\n--- 2. Căutare Produs în Live Search Bar ---');
  const searchQueries = ['oale', 'calorifer', 'electrocasnice', 'produsInexistentXYZ'];
  for (const q of searchQueries) {
    try {
      const sRes = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}&limit=5`);
      const sData = await sRes.json();
      console.log(`Căutare "${q}": status ${sRes.status}, rezultate găsite: ${sData.results?.length || 0}`);
      if (sData.results?.length > 0) {
        console.log(`  -> Primul rezultat: "${sData.results[0].title}" (${sData.results[0].price} LEI)`);
      }
    } catch (err) {
      issuesFound.push(`Eroare API Search pentru "${q}": ${err.message}`);
    }
  }

  // STEP 3: CATALOG & FILTRE
  console.log('\n--- 3. Răsfoire Catalog & Filtre Produse (/produse) ---');
  const filterUrls = [
    '/produse',
    '/produse?category=bucatarie-menaj',
    '/produse?category=electrocasnice&sort=price_asc',
    '/produse?minPrice=50&maxPrice=300',
  ];
  for (const fUrl of filterUrls) {
    try {
      const fRes = await fetch(`${baseUrl}${fUrl}`);
      console.log(`Ruta ${fUrl}: [${fRes.status}]`);
      if (fRes.status !== 200) {
        issuesFound.push(`Filtru ${fUrl} a returnat status ${fRes.status}`);
      }
    } catch (err) {
      issuesFound.push(`Eroare la accesarea ${fUrl}: ${err.message}`);
    }
  }

  // STEP 4: DETALII PRODUS (Pagină individuală)
  console.log('\n--- 4. Pagină Detalii Produs (/produse/[slug]) ---');
  const sampleProduct = await prisma.product.findFirst({
    where: { stock: { gt: 0 } },
    include: { vendor: true },
  });

  if (!sampleProduct) {
    console.error('Niciun produs cu stoc disponibil în baza de date!');
    issuesFound.push('Niciun produs disponibil în baza de date');
    return;
  }

  console.log(`Produs test selectat: "${sampleProduct.title}"`);
  console.log(`Slug: ${sampleProduct.slug}, Preț: ${sampleProduct.price} LEI, Stoc: ${sampleProduct.stock}`);
  console.log(`Vânzător: ${sampleProduct.vendor?.storeName || 'N/A'}`);

  const pDetailRes = await fetch(`${baseUrl}/produse/${sampleProduct.slug}`);
  console.log(`Status pagină produs: ${pDetailRes.status}`);
  if (pDetailRes.status !== 200) {
    issuesFound.push(`Pagina produsului /produse/${sampleProduct.slug} a returnat ${pDetailRes.status}`);
  } else {
    console.log('✓ Pagina de produs se randează corect');
  }

  // STEP 5: TEST VALIDARE CHECKOUT (Date invalide sau goale)
  console.log('\n--- 5. Testare Validare Formular Checkout (/api/checkout) ---');
  const emptyCheckoutPayload = {
    customer: { fullName: '', email: 'email-invalid', phone: '123' },
    shipping: { county: '', city: '', address: '' },
    paymentMethod: 'ramburs',
    items: [],
  };
  const valRes = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emptyCheckoutPayload),
  });
  const valData = await valRes.json();
  console.log(`Test trimitere date invalide: status [${valRes.status}] -> Mesaj: "${valData.error}"`);
  if (valRes.status !== 400) {
    issuesFound.push('Validarea de checkout nu a respins formularul invalid cu status 400!');
  } else {
    console.log('✓ Formularul gol/invalid a fost respins corect cu status 400.');
  }

  // STEP 6: PLASARE COMANDĂ CA CLIENT NOU (GUEST / AUTO-CREATE)
  console.log('\n--- 6. Plasare Comandă Reușită (Metodă Ramburs) ---');
  const customerEmail = `client.test.${Date.now()}@topinstock-shopper.ro`;
  const validOrderPayload = {
    customer: {
      fullName: 'Ioana Popescu',
      email: customerEmail,
      phone: '0733987654',
    },
    shipping: {
      county: 'Cluj',
      city: 'Cluj-Napoca',
      address: 'Strada Memorandumului nr. 22, Apartament 8',
      notes: 'Lăsați coletul la recepție dacă nu răspund',
    },
    paymentMethod: 'ramburs',
    items: [
      {
        productId: sampleProduct.id,
        title: sampleProduct.title,
        price: sampleProduct.price,
        quantity: 2,
        vendorId: sampleProduct.vendorId,
        image: sampleProduct.images?.[0] || '',
      },
    ],
  };

  const expectedSubtotal = sampleProduct.price * 2;
  const expectedDelivery = 19;
  const expectedTotal = Math.round((expectedSubtotal + expectedDelivery) * 100) / 100;
  console.log(`Subtotal așteptat: ${expectedSubtotal.toFixed(2)} LEI + Livrare ${expectedDelivery} LEI = Total: ${expectedTotal.toFixed(2)} LEI`);

  const orderRes = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrderPayload),
  });
  const orderData = await orderRes.json();
  console.log('Răspuns API Checkout:', orderRes.status, orderData);

  if (!orderData.success) {
    issuesFound.push(`Eșec la plasarea comenzii: ${orderData.error}`);
  } else {
    console.log(`✓ Comandă plasată cu succes! ID Comandă: ${orderData.orderId}, Număr: ${orderData.orderNumber}`);
    if (Math.abs(orderData.totalAmount - expectedTotal) > 0.01) {
      issuesFound.push(`Diferență de calcul: așteptat ${expectedTotal}, primit ${orderData.totalAmount}`);
    } else {
      console.log('✓ Calculul financiar al comenzii este 100% exact (prețuri, cantitate, taxă curierat).');
    }

    // STEP 7: VERIFICARE PAGINĂ CONFIRMARE (/comanda-plasata/[id])
    console.log('\n--- 7. Verificare Pagină Confirmare Comandă (/comanda-plasata/[id]) ---');
    const confirmRes = await fetch(`${baseUrl}/comanda-plasata/${orderData.orderId}`);
    console.log(`Status pagină confirmare: [${confirmRes.status}]`);
    if (confirmRes.status !== 200) {
      issuesFound.push(`Pagina de confirmare /comanda-plasata/${orderData.orderId} a returnat status ${confirmRes.status}`);
    } else {
      console.log('✓ Pagina de mulțumire / confirmare se încarcă (200 OK)');
    }

    // STEP 8: VERIFICARE ÎN BAZA DE DATE PRISMA
    console.log('\n--- 8. Verificare Salvare Comandă în Baza de Date SQLite ---');
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderData.orderId },
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });

    if (!dbOrder) {
      issuesFound.push(`Comanda cu ID-ul ${orderData.orderId} nu a fost găsită în baza de date!`);
    } else {
      console.log('✓ Comandă salvată în DB:');
      console.log(`  - ID: ${dbOrder.id}`);
      console.log(`  - Status: ${dbOrder.status}`);
      console.log(`  - Sumă Totală: ${dbOrder.totalAmount} LEI`);
      console.log(`  - Metodă Plată: ${dbOrder.paymentMethod}`);
      console.log(`  - Cumpărător asociat: ${dbOrder.user?.name} (${dbOrder.user?.email})`);
      console.log(`  - Număr articole în comandă: ${dbOrder.orderItems?.length}`);
      console.log(`  - Articol: ${dbOrder.orderItems?.[0]?.product?.title} x ${dbOrder.orderItems?.[0]?.quantity}`);
    }
  }

  // STEP 9: TESTARE CONT CLIENT & ISTORIC COMENZI
  console.log('\n--- 9. Testare Autentificare Client & Vizualizare Istoric Comenzii ---');
  // Înregistrare client cu parolă
  const clientRegPayload = {
    name: 'Andrei Vasile',
    email: `andrei.vasile.${Date.now()}@gmail.com`,
    phone: '0722334455',
    password: 'ParolaTest123!',
    address: 'București, Str. Florilor 5',
  };

  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientRegPayload),
  });
  const regData = await regRes.json();
  const sessionCookie = regRes.headers.get('set-cookie');
  console.log(`Înregistrare cont client: [${regRes.status}]`, regData.success ? 'Succes' : regData.message);

  if (sessionCookie) {
    // Plasare comandă ca utilizator logat
    const authOrderPayload = {
      customer: {
        fullName: clientRegPayload.name,
        email: clientRegPayload.email,
        phone: clientRegPayload.phone,
      },
      shipping: {
        county: 'București',
        city: 'Sector 2',
        address: clientRegPayload.address,
      },
      paymentMethod: 'card',
      items: [
        {
          productId: sampleProduct.id,
          title: sampleProduct.title,
          price: sampleProduct.price,
          quantity: 1,
          vendorId: sampleProduct.vendorId,
        },
      ],
    };

    const authOrderRes = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify(authOrderPayload),
    });
    const authOrderData = await authOrderRes.json();
    console.log(`Plasare comandă ca utilizator autentificat: [${authOrderRes.status}] - ID: ${authOrderData.orderId}`);

    // Preluare comenzi din cont
    const userOrdersRes = await fetch(`${baseUrl}/api/user/orders`, {
      headers: { cookie: sessionCookie },
    });
    const userOrdersData = await userOrdersRes.json();
    console.log(`Istoric comenzi client (/api/user/orders): [${userOrdersRes.status}] - Comenzi găsite: ${userOrdersData.orders?.length}`);
    if (userOrdersData.orders?.length > 0) {
      console.log(`✓ Comanda apare imediat în contul de client cu status: ${userOrdersData.orders[0].status}`);
    } else {
      issuesFound.push('Comanda utilizatorului nu a apărut în istoricul de comenzi!');
    }
  }

  // STEP 10: ANALIZĂ REZULTATE FINALE
  console.log('\n==================================================');
  console.log('📊 REZUMAT TESTARE CUSTOMER JOURNEY:');
  console.log('==================================================');
  if (issuesFound.length === 0) {
    console.log('🎉 TOATE ETAPELE DE CUMPĂRARE AU FUNCȚIONAT IMPECABIL!');
  } else {
    console.log(`⚠️ Au fost detectate ${issuesFound.length} probleme:`);
    issuesFound.forEach((iss, idx) => console.log(`  ${idx + 1}. ${iss}`));
  }

  await prisma.$disconnect();
}

runCustomerSimulation().catch(console.error);
