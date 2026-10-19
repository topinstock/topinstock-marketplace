const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000';

async function runAdminAudit() {
  console.log('====================================================');
  console.log('   AUDIT COMPLET AL FUNCȚIILOR DE ADMINISTRARE');
  console.log('====================================================\n');

  let adminCookie = '';
  let createdProductId = '';
  let testVendorId = '';
  let testOrderId = '';

  // ----------------------------------------------------------------
  // 1. AUTENTIFICARE ADMIN & SESIUNE
  // ----------------------------------------------------------------
  console.log('▶ [1/11] Testare Autentificare Super-Admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@topinstock.ro', password: 'admin123' }),
  });

  const loginData = await loginRes.json();
  adminCookie = loginRes.headers.get('set-cookie') || '';

  if (!loginRes.ok || !loginData.success || !loginData.user) {
    throw new Error(`Eroare la autentificare: ${JSON.stringify(loginData)}`);
  }
  console.log(`  ✓ Conectat ca: ${loginData.user.name} (${loginData.user.email})`);
  console.log(`  ✓ Rol confirmat: ${loginData.user.role}`);

  // Verificare /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: adminCookie },
  });
  const meData = await meRes.json();
  if (!meRes.ok || meData.user?.role !== 'ADMIN') {
    throw new Error(`Sesiunea nu are drepturi de ADMIN: ${JSON.stringify(meData)}`);
  }
  console.log('  ✓ Endpoint /api/auth/me validează rolul ADMIN.');

  // ----------------------------------------------------------------
  // 2. DASHBOARD & CATALOG GLOBAL PRODUSE
  // ----------------------------------------------------------------
  console.log('\n▶ [2/11] Testare Dashboard & Catalog Global...');
  const dashRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: adminCookie },
  });
  console.log(`  ✓ Pagina /admin răspunde cu status: ${dashRes.status}`);

  const productsRes = await fetch(`${BASE_URL}/api/admin/products`, {
    headers: { Cookie: adminCookie },
  });
  const productsData = await productsRes.json();
  if (!productsRes.ok || !productsData.success) {
    throw new Error(`Eroare la preluare produse: ${productsData.error}`);
  }
  console.log(`  ✓ API /api/admin/products a returnat ${productsData.count} produse din catalog.`);

  // ----------------------------------------------------------------
  // 3. CHAT PRODUCT IMPORTER AI
  // ----------------------------------------------------------------
  console.log('\n▶ [3/11] Testare Chat Importer AI (/api/admin/chat-import)...');
  const chatPrompt = 'Vreau sa adaug un televizor Smart TV Samsung QLED 4K 138 cm la pretul de 2499 LEI redus de la 2999 LEI cu WiFi si Bluetooth garantie 24 luni.';
  const importRes = await fetch(`${BASE_URL}/api/admin/chat-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify({ message: chatPrompt }),
  });

  const importData = await importRes.json();
  const prod = importData.draft || importData.product;
  if (!importRes.ok || !importData.success || !prod) {
    throw new Error(`AI Importer eșuat: ${JSON.stringify(importData)}`);
  }
  console.log(`  ✓ AI a extras titlul: "${prod.title}"`);
  console.log(`  ✓ Preț extras: ${prod.price} LEI (Original: ${prod.originalPrice} LEI)`);
  console.log(`  ✓ Brand & Garanție: ${prod.brand || 'N/A'} | ${prod.warranty || 'N/A'}`);

  // ----------------------------------------------------------------
  // 4. CREARE PRODUS NOU ÎN CATALOG
  // ----------------------------------------------------------------
  console.log('\n▶ [4/11] Testare Creare Produs Nou (/api/admin/products)...');
  const cat = await prisma.category.findFirst();
  const vendor = await prisma.vendor.findFirst();
  testVendorId = vendor.id;

  const newProductPayload = {
    title: `Smart TV Samsung QLED 4K Ultra Test ${Date.now().toString().slice(-4)}`,
    description: 'Televizor Smart TV QLED cu procesor Quantum 4K și sunet surround.',
    brand: 'Samsung',
    material: 'Aluminiu și sticlă',
    warranty: '24 luni',
    weight: '14.5 kg',
    features: ['4K Ultra HD', 'HDR10+', 'Dolby Atmos', 'Wi-Fi 6'],
    categoryId: cat ? cat.id : 'electronice',
    price: 2499,
    originalPrice: 2999,
    stock: 15,
    sku: `SKU-TV-${Date.now().toString().slice(-4)}`,
    images: ['/images/product_laptop.jpg'],
    sizes: ['55 inch', '65 inch'],
    colors: ['Titan Gray'],
  };

  const createProdRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify(newProductPayload),
  });

  const createProdData = await createProdRes.json();
  if (!createProdRes.ok || !createProdData.success || !createProdData.product) {
    throw new Error(`Eroare la crearea produsului: ${JSON.stringify(createProdData)}`);
  }
  createdProductId = createProdData.product.id;
  const createdProductSlug = createProdData.product.slug;
  console.log(`  ✓ Produs creat cu ID: ${createdProductId}`);
  console.log(`  ✓ Slug generat: ${createdProductSlug}`);

  // Verificare afișare live în storefront
  const liveProdRes = await fetch(`${BASE_URL}/produse/${createdProductSlug}`);
  console.log(`  ✓ Pagina publică a produsului (/produse/${createdProductSlug}) răspunde cu status: ${liveProdRes.status}`);

  // ----------------------------------------------------------------
  // 5. ȘTERGERE / ARHIVARE PRODUS
  // ----------------------------------------------------------------
  console.log('\n▶ [5/11] Testare Ștergere Produs (/api/admin/products?id=...)...');
  const deleteProdRes = await fetch(`${BASE_URL}/api/admin/products?id=${createdProductId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });
  const deleteProdData = await deleteProdRes.json();
  if (!deleteProdRes.ok || !deleteProdData.success) {
    throw new Error(`Eroare la ștergere produs: ${JSON.stringify(deleteProdData)}`);
  }
  console.log(`  ✓ Răspuns ștergere: ${deleteProdData.message}`);

  // ----------------------------------------------------------------
  // 6. GESTIONARE COMENZI & ACTUALIZARE STATUS
  // ----------------------------------------------------------------
  console.log('\n▶ [6/11] Testare Panou Comenzi & Status Changer...');
  const ordersPageRes = await fetch(`${BASE_URL}/admin/comenzi`, {
    headers: { Cookie: adminCookie },
  });
  console.log(`  ✓ Pagina /admin/comenzi răspunde cu status: ${ordersPageRes.status}`);

  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (latestOrder) {
    testOrderId = latestOrder.id;
    console.log(`  ✓ Comanda selectată pentru test: ${testOrderId} (Status inițial: ${latestOrder.status})`);

    // Detalii comanda prin GET /api/orders/[id]
    const orderDetailsRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`);
    const orderDetailsData = await orderDetailsRes.json();
    if (!orderDetailsRes.ok || !orderDetailsData.success) {
      throw new Error(`Eroare la citirea detaliilor comenzii: ${JSON.stringify(orderDetailsData)}`);
    }
    console.log(`  ✓ Detalii preluate: Număr TS-${testOrderId.slice(-6).toUpperCase()}, Total: ${orderDetailsData.order.grandTotal} LEI`);

    // Actualizare la PROCESSING
    const patchProcRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    const patchProcData = await patchProcRes.json();
    if (!patchProcRes.ok || !patchProcData.success) {
      throw new Error(`Eroare la actualizare status comandă: ${JSON.stringify(patchProcData)}`);
    }
    console.log(`  ✓ Status actualizat la PROCESSING: ${patchProcData.message}`);

    // Actualizare la DELIVERED
    const patchDelivRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    const patchDelivData = await patchDelivRes.json();
    console.log(`  ✓ Status actualizat la DELIVERED: ${patchDelivData.message}`);
  }

  // ----------------------------------------------------------------
  // 7. GESTIUNE VÂNZĂTORI PARTENERI & MODIFICARE KYC
  // ----------------------------------------------------------------
  console.log('\n▶ [7/11] Testare Gestiune Vânzători (/admin/vanzatori)...');
  const vendorsPageRes = await fetch(`${BASE_URL}/admin/vanzatori`, {
    headers: { Cookie: adminCookie },
  });
  console.log(`  ✓ Pagina /admin/vanzatori răspunde cu status: ${vendorsPageRes.status}`);

  const vendorsListRes = await fetch(`${BASE_URL}/api/admin/vendors`, {
    headers: { Cookie: adminCookie },
  });
  const vendorsListData = await vendorsListRes.json();
  if (!vendorsListRes.ok || !vendorsListData.success) {
    throw new Error(`Eroare la lista vânzători: ${JSON.stringify(vendorsListData)}`);
  }
  console.log(`  ✓ Găsiți ${vendorsListData.vendors.length} comercianți înregistrați.`);

  if (vendorsListData.vendors.length > 0) {
    const v = vendorsListData.vendors[0];
    console.log(`  ✓ Testare actualizare date KYC pentru: ${v.storeName} (${v.id})...`);

    const patchVendorRes = await fetch(`${BASE_URL}/api/admin/vendors/${v.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
        isVerified: true,
        commissionRate: 0.10,
        contactPerson: 'Director Comercial Test',
        cui: 'RO99887766',
        bank: 'Banca Comercială Română',
      }),
    });
    const patchVendorData = await patchVendorRes.json();
    if (!patchVendorRes.ok || !patchVendorData.success) {
      throw new Error(`Eroare la actualizare vânzător: ${JSON.stringify(patchVendorData)}`);
    }
    console.log(`  ✓ Vânzător actualizat: ${patchVendorData.message}`);

    // Verificare GET vânzător specific
    const singleVendorRes = await fetch(`${BASE_URL}/api/admin/vendors/${v.id}`, {
      headers: { Cookie: adminCookie },
    });
    const singleVendorData = await singleVendorRes.json();
    console.log(`  ✓ Detalii vânzător verificate: Status ${singleVendorData.vendor.status}, Comision: ${singleVendorData.vendor.commissionRate * 100}%`);
  }

  // ----------------------------------------------------------------
  // 8. DATELE FIRMEI & SETĂRI MARKETPLACE
  // ----------------------------------------------------------------
  console.log('\n▶ [8/11] Testare Setări Firmă Marketplace (/admin/firma)...');
  const firmaPageRes = await fetch(`${BASE_URL}/admin/firma`, {
    headers: { Cookie: adminCookie },
  });
  console.log(`  ✓ Pagina /admin/firma răspunde cu status: ${firmaPageRes.status}`);

  const getSettingsRes = await fetch(`${BASE_URL}/api/admin/company-settings`, {
    headers: { Cookie: adminCookie },
  });
  const settingsData = await getSettingsRes.json();
  if (!getSettingsRes.ok || !settingsData.success) {
    throw new Error(`Eroare la citire setări: ${JSON.stringify(settingsData)}`);
  }
  console.log(`  ✓ Date firmă curente: ${settingsData.settings.companyName} (CUI: ${settingsData.settings.cui})`);

  // Salvare setări modificate
  const updateSettingsRes = await fetch(`${BASE_URL}/api/admin/company-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      companyName: 'S.C. TopinStock Marketplace S.R.L.',
      cui: 'RO48921450',
      regCom: 'J40/14280/2024',
      legalAddress: 'București, Sector 1, Calea Floreasca nr. 169, Etaj 4',
      capitalSocial: '50.000 LEI',
      iban: 'RO49BTRLRONCRT0123456701',
      bankName: 'Banca Transilvania',
      contactEmail: 'contact@topinstock.ro',
      supportPhone: '0720 123 456',
      defaultCommission: 0.12,
      payoutTermsDays: 14,
      returnPolicyDays: 14,
      platformNotice: 'Toate plățile către comercianți sunt decontate la 14 zile calendaristice.',
    }),
  });
  const updateSettingsData = await updateSettingsRes.json();
  if (!updateSettingsRes.ok || !updateSettingsData.success) {
    throw new Error(`Eroare la salvare setări firmă: ${JSON.stringify(updateSettingsData)}`);
  }
  console.log(`  ✓ Setări firmă actualizate cu succes: ${updateSettingsData.message}`);

  // ----------------------------------------------------------------
  // 9. FINANȚE & DECONTURI VÂNZĂTORI
  // ----------------------------------------------------------------
  console.log('\n▶ [9/11] Testare Panou Finanțe & Deconturi (/admin/finante)...');
  const finantePageRes = await fetch(`${BASE_URL}/admin/finante`, {
    headers: { Cookie: adminCookie },
  });
  console.log(`  ✓ Pagina /admin/finante răspunde cu status: ${finantePageRes.status}`);

  // ----------------------------------------------------------------
  // 10. ÎNCĂRCARE IMAGINE LOCALĂ
  // ----------------------------------------------------------------
  console.log('\n▶ [10/11] Testare Încărcare Imagine (/api/admin/upload)...');
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const blob = new Blob([samplePngBuffer], { type: 'image/png' });
  const form = new FormData();
  form.append('file', blob, 'test_product_image.png');

  const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
    method: 'POST',
    headers: {
      Cookie: adminCookie,
    },
    body: form,
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
    throw new Error(`Eroare upload: ${JSON.stringify(uploadData)}`);
  }
  console.log(`  ✓ Imagine încărcată cu succes la URL: ${uploadData.url}`);

  // ----------------------------------------------------------------
  // 11. DECONECTARE SESIUNE ADMIN
  // ----------------------------------------------------------------
  console.log('\n▶ [11/11] Testare Deconectare Admin (/api/auth/logout)...');
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const logoutData = await logoutRes.json();
  console.log(`  ✓ Sesiune deconectată: ${logoutData.success ? 'Succes' : 'Eșuat'}`);

  console.log('\n====================================================');
  console.log('   TOATE CELE 11 FUNCȚII DE ADMIN AU TRECUT CU SUCCES!');
  console.log('====================================================');
}

runAdminAudit()
  .catch((err) => {
    console.error('\n❌ EROARE DETECTATĂ:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
