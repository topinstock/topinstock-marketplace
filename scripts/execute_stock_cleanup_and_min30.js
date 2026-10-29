const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('   SINCRONIZARE STOCURI: ELIMINARE PRODUSE FĂRĂ STOC & STOC MINIM 30');
  console.log('================================================================\n');

  const startTime = Date.now();

  // ── PASUL 1: FETCH LIVE KITCHENTOOLS & IDENTIFICARE OUT OF STOCK ──
  console.log('1. Preluare stocuri live KitchenTools (Shopify API)...');
  let ktLiveProducts = [];
  let page = 1;
  while (true) {
    try {
      const res = await fetch(`https://kitchentools.ro/products.json?limit=250&page=${page}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.products || data.products.length === 0) break;
      ktLiveProducts.push(...data.products);
      page++;
      if (page > 10) break;
    } catch (e) {
      console.error(`Eroare fetch KitchenTools pagina ${page}:`, e.message);
      break;
    }
  }
  console.log(`   -> Preluat ${ktLiveProducts.length} produse din KitchenTools.`);

  const ktOosHandles = new Map();
  for (const p of ktLiveProducts) {
    const isAvail = p.variants?.some(v => v.available === true);
    if (!isAvail) {
      if (p.handle) ktOosHandles.set(p.handle.toLowerCase().trim(), p.title);
      if (p.title) ktOosHandles.set(p.title.toLowerCase().trim(), p.title);
    }
  }
  console.log(`   -> Produse FĂRĂ stoc pe KitchenTools: ${ktOosHandles.size / 2}`);

  // Identificare produse din DB care corespund celor fără stoc din KitchenTools
  const nonTeoDb = await prisma.product.findMany({
    where: { NOT: { sku: { startsWith: 'TIS-TEO-' } } },
    select: { id: true, slug: true, title: true, sku: true, stock: true }
  });

  const oosProductIdsToDelete = [];
  const oosProductDetails = [];
  for (const p of nonTeoDb) {
    const s = p.slug.toLowerCase().trim();
    const t = p.title.toLowerCase().trim();
    if (ktOosHandles.has(s) || ktOosHandles.has(t)) {
      oosProductIdsToDelete.push(p.id);
      oosProductDetails.push({ sku: p.sku, title: p.title, stock: p.stock });
    }
  }
  console.log(`   -> Găsite ${oosProductIdsToDelete.length} produse în TOPinStock care sunt fără stoc la KitchenTools:`);
  oosProductDetails.slice(0, 5).forEach((p, idx) => {
    console.log(`      ${idx + 1}. [${p.sku}] ${p.title.slice(0, 55)}...`);
  });

  // ── PASUL 2: ELIMINARE PRODUSE FĂRĂ STOC DIN BAZA DE DATE ──
  console.log('\n2. Eliminare produse fără stoc din Supabase PostgreSQL...');
  if (oosProductIdsToDelete.length > 0) {
    const deleteRes = await prisma.product.deleteMany({
      where: { id: { in: oosProductIdsToDelete } }
    });
    console.log(`   ✓ Șterse cu succes ${deleteRes.count} produse fără stoc din baza de date.`);
  } else {
    console.log('   Nu există produse fără stoc de șters.');
  }

  // ── PASUL 3: ASIGURARE STOC MINIM 30 PENTRU TOATE PRODUSELE DIN CATALOG ──
  console.log('\n3. Actualizare stoc minim la 30 pentru toate produsele active...');
  const countUnder30Before = await prisma.product.count({
    where: { stock: { lt: 30 } }
  });
  console.log(`   -> Produse cu stoc < 30 înainte de actualizare: ${countUnder30Before}`);

  const updateRes = await prisma.product.updateMany({
    where: { stock: { lt: 30 } },
    data: { stock: 30 }
  });
  console.log(`   ✓ Actualizate ${updateRes.count} produse la stocul minim de 30 bucăți.`);

  const countUnder30After = await prisma.product.count({
    where: { stock: { lt: 30 } }
  });
  const totalRemaining = await prisma.product.count();
  const countGte30 = await prisma.product.count({
    where: { stock: { gte: 30 } }
  });

  console.log(`   ✓ Verificare DB:`);
  console.log(`      Total produse în catalog: ${totalRemaining}`);
  console.log(`      Produse cu stoc >= 30: ${countGte30} (100%)`);
  console.log(`      Produse cu stoc < 30: ${countUnder30After}`);

  // ── PASUL 4: REGENERARE SITEMAP JSON ȘI FALLBACK JSON ──
  console.log('\n4. Regenerare all_products_sitemap.json...');
  const allDbProducts = await prisma.product.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      sku: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  });

  const sitemapItems = allDbProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku || '',
    u: p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : '2026-10-29',
  }));

  const sitemapPath = path.join(__dirname, '..', 'lib', 'data', 'all_products_sitemap.json');
  fs.writeFileSync(sitemapPath, JSON.stringify(sitemapItems), 'utf-8');
  console.log(`   ✓ Salvat ${sitemapItems.length} produse în all_products_sitemap.json.`);

  // Actualizare products_catalog_fallback.json
  console.log('\n5. Actualizare products_catalog_fallback.json...');
  const fallbackPath = path.join(__dirname, '..', 'lib', 'data', 'products_catalog_fallback.json');
  if (fs.existsSync(fallbackPath)) {
    const deletedIdSet = new Set(oosProductIdsToDelete);
    let fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    const beforeCount = fallbackData.length;

    // Filter out deleted products and ensure stock >= 30
    fallbackData = fallbackData
      .filter((p) => !deletedIdSet.has(p.id))
      .map((p) => ({
        ...p,
        stock: Math.max(30, Number(p.stock) || 30)
      }));

    fs.writeFileSync(fallbackPath, JSON.stringify(fallbackData), 'utf8');
    console.log(`   ✓ Actualizat fallback: ${beforeCount} -> ${fallbackData.length} produse (stoc minim 30 garantat).`);
  }

  console.log('\n================================================================');
  console.log(`OPERATIUNE FINALIZATĂ CU SUCCES ÎN ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  console.log('================================================================');
}

main()
  .catch(err => {
    console.error('Eroare execuție:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

