const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function stripDiacritics(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanHtmlDescription(desc) {
  if (!desc) return '';
  return desc.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

function generateTeoMarketRichDescription(title, brand, price, rawDesc, categoryName) {
  const normTitle = title.replace(/\s+/g, ' ').trim();
  const brandName = brand || 'TeoMarket';
  const catText = categoryName ? `din gama <strong>${categoryName}</strong>` : '';

  let technicalSection = '';
  if (rawDesc && rawDesc.length > 15) {
    technicalSection = `
<h4>Specificații și descriere tehnică:</h4>
<div class="product-raw-details my-3 text-slate-700">
  ${rawDesc}
</div>`;
  }

  return `<h3>${normTitle}</h3>
<p><strong>${normTitle}</strong> ${catText} este distribuit oficial pe <strong>TopinStock</strong> prin partenerul autorizat <strong>TeoMarket România</strong>. Produsul respectă cele mai exigente standarde europene de calitate, siguranță și durabilitate, oferind o experiență excelentă de utilizare pentru casă și familie.</p>

${technicalSection}

<h4>Beneficii și avantaje la achiziția prin TopinStock:</h4>
<ul>
  <li><strong>Distribuție oficială verificată:</strong> Produs 100% original furnizat direct prin depozitul central TeoMarket România.</li>
  <li><strong>Livrare rapidă și sigură:</strong> Expediere în 2-3 zile direct la adresă prin curier rapid (DPD, Fan Courier) cu deschiderea coletului la livrare.</li>
  <li><strong>Garanție de conformitate:</strong> Beneficiază de 24 luni garanție și asistență promptă dedicată clienților TopinStock.</li>
  <li><strong>Retur simplu și garantat:</strong> Drept de retur garantat în 30 de zile cu rambursare rapidă a banilor.</li>
  <li><strong>Ambalare protectivă:</strong> Fiecare colet este inspectat și ambalat în condiții optime pentru transport sigur fără deteriorări.</li>
</ul>

<p>Comandă acum <strong>${normTitle}</strong> de pe <strong>TopinStock</strong> și bucură-te de prețuri avantajoase și servicii de încredere!</p>`;
}

async function uploadTeoMarket() {
  console.log('===========================================================');
  console.log('       IMPORT & SEO ENGINE: PRODUSE TEOMARKET.COM          ');
  console.log('===========================================================');

  // 1. Create or Find Vendor: TeoMarket România
  const defaultPassword = await bcrypt.hash('teomarket2026', 10);
  const teoUser = await prisma.user.upsert({
    where: { email: 'contact@teomarket.com' },
    update: {
      name: 'TeoMarket România (Oficial)',
      role: 'VENDOR'
    },
    create: {
      email: 'contact@teomarket.com',
      passwordHash: defaultPassword,
      name: 'TeoMarket România (Oficial)',
      role: 'VENDOR',
      phone: '0770425221',
      address: 'Strada Moara Domneasca nr. 8, Hala V9, Afumati, Ilfov'
    }
  });

  const teoVendor = await prisma.vendor.upsert({
    where: { slug: 'teomarket' },
    update: {
      storeName: 'TeoMarket România',
      description: 'Distribuitor oficial TeoMarket România - gamă variată de produse pentru casă, copii, jucării, decorațiuni de sezon, articole party și accesorii GSM.',
      rating: 4.88,
      isVerified: true,
      commissionRate: 0.10,
      legalName: 'DING COMMUNICATION SRL',
      cui: 'RO27078460',
      regCom: 'J2010000700161',
      legalAddress: 'Str. Grefierului Nr. 2, Dobridor, Dolj',
      contactPerson: 'Dep. Comercial TeoMarket',
      phone: '0770425221',
      status: 'ACTIVE'
    },
    create: {
      userId: teoUser.id,
      storeName: 'TeoMarket România',
      slug: 'teomarket',
      description: 'Distribuitor oficial TeoMarket România - gamă variată de produse pentru casă, copii, jucării, decorațiuni de sezon, articole party și accesorii GSM.',
      rating: 4.88,
      isVerified: true,
      commissionRate: 0.10,
      legalName: 'DING COMMUNICATION SRL',
      cui: 'RO27078460',
      regCom: 'J2010000700161',
      legalAddress: 'Str. Grefierului Nr. 2, Dobridor, Dolj',
      contactPerson: 'Dep. Comercial TeoMarket',
      phone: '0770425221',
      status: 'ACTIVE'
    }
  });
  console.log(`✓ Vendor TeoMarket verificat: ${teoVendor.storeName} (ID: ${teoVendor.id})`);

  // 2. Load and Upsert Category Tree
  console.log('\n2. Sincronizare arbore complet de categorii TeoMarket...');
  const catTreePath = path.join(__dirname, 'teomarket_category_tree.json');
  let topCategories = [];
  if (fs.existsSync(catTreePath)) {
    topCategories = JSON.parse(fs.readFileSync(catTreePath, 'utf8'));
  }

  const categoryMapBySlug = new Map();
  // Load existing categories first
  const existingCats = await prisma.category.findMany();
  for (const c of existingCats) {
    categoryMapBySlug.set(c.slug.toLowerCase(), c);
  }

  // Upsert top-level categories
  let catOrder = 20;
  for (const topCat of topCategories) {
    catOrder++;
    const cleanSlug = slugify(topCat.slug);
    let dbTop = categoryMapBySlug.get(cleanSlug);
    if (!dbTop) {
      dbTop = await prisma.category.upsert({
        where: { slug: cleanSlug },
        update: { name: topCat.name, image: topCat.image || null },
        create: {
          name: topCat.name,
          slug: cleanSlug,
          image: topCat.image || null,
          order: catOrder
        }
      });
      categoryMapBySlug.set(cleanSlug, dbTop);
    }

    // Subcategories
    const subs = topCat.subCategories || [];
    let subOrder = 0;
    for (const sub of subs) {
      subOrder++;
      const subSlug = slugify(sub.slug);
      let dbSub = categoryMapBySlug.get(subSlug);
      if (!dbSub) {
        dbSub = await prisma.category.upsert({
          where: { slug: subSlug },
          update: { name: sub.name, parentId: dbTop.id, image: sub.image || null },
          create: {
            name: sub.name,
            slug: subSlug,
            parentId: dbTop.id,
            image: sub.image || null,
            order: subOrder
          }
        });
        categoryMapBySlug.set(subSlug, dbSub);
      }

      // Sub-subcategories (if any)
      const subSubs = sub.subSubCategories || [];
      let subSubOrder = 0;
      for (const ssub of subSubs) {
        subSubOrder++;
        const ssubSlug = slugify(ssub.slug);
        let dbSsub = categoryMapBySlug.get(ssubSlug);
        if (!dbSsub) {
          dbSsub = await prisma.category.upsert({
            where: { slug: ssubSlug },
            update: { name: ssub.name, parentId: dbSub.id },
            create: {
              name: ssub.name,
              slug: ssubSlug,
              parentId: dbSub.id,
              order: subSubOrder
            }
          });
          categoryMapBySlug.set(ssubSlug, dbSsub);
        }
      }
    }
  }

  // Fallback default category
  const defaultCategory = categoryMapBySlug.get('casa-si-bricolaj') || 
                          categoryMapBySlug.get('casa-decoratiuni') || 
                          categoryMapBySlug.get('bucatarie-menaj') || 
                          Array.from(categoryMapBySlug.values())[0];
  console.log(`✓ Total categorii indexate în baza de date: ${categoryMapBySlug.size}`);

  // 3. Load Scraped Products
  console.log('\n3. Încărcare produse descărcate...');
  const productsFile = path.join(__dirname, 'teomarket_all_products_raw.json');
  if (!fs.existsSync(productsFile)) {
    throw new Error(`Nu s-a găsit fișierul ${productsFile}!`);
  }

  const rawProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  console.log(`✓ Produse raw găsite: ${rawProducts.length}`);

  // Track existing slugs in DB to guarantee uniqueness
  const existingProds = await prisma.product.findMany({ select: { slug: true } });
  const usedSlugs = new Set(existingProds.map(p => p.slug));

  let insertedCount = 0;
  let skippedCount = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < rawProducts.length; i += BATCH_SIZE) {
    const batch = rawProducts.slice(i, i + BATCH_SIZE);
    const dbRecords = [];

    for (let j = 0; j < batch.length; j++) {
      const p = batch[j];
      const globalIdx = i + j;

      if (!p.name && !p.title) continue;

      const title = (p.name || p.title).toString().trim();
      if (!title) continue;

      // Slug generation and collision handling
      const baseSlug = (p.slug ? slugify(p.slug) : slugify(title)).substring(0, 75);
      let finalSlug = baseSlug || `produs-teomarket-${p.id}`;
      let counter = 1;
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      usedSlugs.add(finalSlug);

      // Price calculation
      let price = parseFloat(p.price_ron) || parseFloat(p.price_raw) || 19.99;
      if (price <= 0) price = 19.99;
      price = Math.round(price * 100) / 100;

      let originalPrice = null;
      if (p.original_price_display) {
        originalPrice = parseFloat(p.original_price_display);
      }
      if (!originalPrice || originalPrice <= price) {
        originalPrice = Math.round(price * 1.25 * 100) / 100;
      }
      const discountPercentage = Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100));

      // Category matching
      let category = null;
      if (p.leafCategorySlug) {
        category = categoryMapBySlug.get(slugify(p.leafCategorySlug));
      }
      if (!category && p.categoryPath && p.categoryPath.length > 0) {
        for (let k = p.categoryPath.length - 1; k >= 0; k--) {
          const matched = categoryMapBySlug.get(slugify(p.categoryPath[k].slug));
          if (matched) {
            category = matched;
            break;
          }
        }
      }
      if (!category) {
        category = defaultCategory;
      }

      // SKU
      const sku = `TIS-TEO-${p.id || p.sku || (300000 + globalIdx)}`;

      // Brand
      let brand = p.brand_name || p.brand || null;
      if (!brand) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('motomo')) brand = 'Motomo';
        else if (titleLower.includes('flippy')) brand = 'Flippy';
        else if (titleLower.includes('nillkin')) brand = 'Nillkin';
        else if (titleLower.includes('apple') || titleLower.includes('iphone')) brand = 'Apple';
        else if (titleLower.includes('samsung')) brand = 'Samsung';
        else if (titleLower.includes('huawei')) brand = 'Huawei';
        else if (titleLower.includes('frozen')) brand = 'Disney Frozen';
        else if (titleLower.includes('grunberg') || titleLower.includes('grünberg')) brand = 'Grünberg';
        else if (titleLower.includes('victronic')) brand = 'Victronic';
        else brand = 'TeoMarket';
      }

      // Images
      let images = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        images = p.images.map(img => typeof img === 'string' ? img : (img.url || img.image)).filter(Boolean);
      }
      if (images.length === 0 && p.image) {
        images.push(p.image);
      }
      if (images.length === 0 && p.main_image_url) {
        images.push(p.main_image_url);
      }
      if (images.length === 0) {
        images.push('https://teomarket.com/build/assets/logo.png');
      }

      // Rich SEO Description
      const cleanRawDesc = cleanHtmlDescription(p.description);
      const richDescription = generateTeoMarketRichDescription(title, brand, price, cleanRawDesc, category?.name);

      // Attributes
      const attributes = {
        'Brand': brand,
        'Stare produs': 'Nou',
        'Garanție': '24 luni',
        'Distribuitor': 'TeoMarket România',
        'Origine': 'Magazin Oficial Partener'
      };
      if (p.ean) attributes['Cod EAN'] = p.ean;
      if (p.sku) attributes['Cod Producător'] = p.sku;
      if (p.weight) attributes['Greutate'] = `${p.weight} kg`;

      // Social Proof: Rating & Reviews
      const rating = Math.round((4.6 + (globalIdx % 5) * 0.08) * 10) / 10;
      const reviewsCount = 5 + (globalIdx % 32);
      const stock = p.stock_quantity !== undefined && p.stock_quantity !== null && p.stock_quantity > 0
        ? p.stock_quantity
        : (20 + (globalIdx % 35));

      dbRecords.push({
        vendorId: teoVendor.id,
        categoryId: category.id,
        title,
        slug: finalSlug,
        description: richDescription,
        price,
        originalPrice,
        discountPercentage,
        stock,
        sku,
        images: JSON.stringify(images),
        sizes: JSON.stringify(['Universal']),
        colors: JSON.stringify(['Diverse']),
        attributes: JSON.stringify(attributes),
        rating,
        reviewsCount,
        isPublished: true,
      });
    }

    try {
      await prisma.$transaction(
        dbRecords.map(data => prisma.product.create({ data }))
      );
      insertedCount += dbRecords.length;
      if (insertedCount % 500 === 0 || i + BATCH_SIZE >= rawProducts.length) {
        console.log(`  ✓ Urcate ${insertedCount} / ${rawProducts.length} produse TeoMarket pe TopinStock...`);
      }
    } catch (batchErr) {
      console.warn(`  Avertisment lot: ${batchErr.message}. Trecem la inserare individuală...`);
      for (const rec of dbRecords) {
        try {
          await prisma.product.create({ data: rec });
          insertedCount++;
        } catch (singleErr) {
          skippedCount++;
        }
      }
    }
  }

  const totalInDb = await prisma.product.count();
  const teoProdsInDb = await prisma.product.count({ where: { vendorId: teoVendor.id } });

  console.log('\n===========================================================');
  console.log('              REZULTAT FINAL IMPORT TEOMARKET              ');
  console.log('===========================================================');
  console.log(`✓ Produse noi inserate TeoMarket: ${insertedCount}`);
  console.log(`✓ Produse ignorate/duplicat: ${skippedCount}`);
  console.log(`✓ Total produse TeoMarket active: ${teoProdsInDb}`);
  console.log(`✓ Total general produse pe TopinStock: ${totalInDb}`);
  console.log('===========================================================');
}

uploadTeoMarket()
  .catch(err => {
    console.error('Eroare fatală la upload:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
