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

function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = val.replace(/Lei/gi, '').trim();
  if (str.includes('.') && str.includes(',')) {
    // e.g. 1.248,75 -> 1248.75
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // e.g. 127,07 -> 127.07
    str = str.replace(',', '.');
  } else if (str.includes('.')) {
    // If exactly 3 digits after the dot, e.g. 2.499 -> 2499
    const parts = str.split('.');
    if (parts[1] && parts[1].length === 3) {
      str = parts.join('');
    }
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

const PARENT_CATEGORIES = [
  {
    name: 'Bucătărie & Menaj',
    slug: 'bucatarie-menaj',
    order: 1,
    description: 'Veselă premium, oale, tigăi, cuțite profesionale și ustensile de gătit pentru o bucătărie modernă.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/bd1dc20d-0ee1-40eb-8dd6-afae4b969559.png',
    matchKeywords: [
      'oale', 'tigai', 'vesela', 'cutit', 'cratit', 'tacamuri', 'farfuri', 'boluri', 
      'caserole', 'borcan', 'ceainic', 'carafe', 'termos', 'cesti', 'sticla', 'scurgator', 
      'tocatoare', 'ustensile de gatit', 'materiale pentru gatit', 'deschizatoare', 'tirbusoane', 
      'shaker', 'gheata', 'bucatarii industriale', 'gatit si servire', 'placa'
    ]
  },
  {
    name: 'Electrocasnice',
    slug: 'electrocasnice',
    order: 2,
    description: 'Electrocasnice mici de bucătărie, preparare alimente, încălzire locuință și îngrijire țesături.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/bd1dc20d-0ee1-40eb-8dd6-afae4b969559.png',
    matchKeywords: [
      'blender', 'mixer', 'calorifer', 'ventilator', 'fier de calcat', 'aparat de calcat', 'mese de calcat',
      'tocat carne', 'maruntitoare', 'rasnita', 'rasnite', 'prajitor', 'fierbator', 'aparat de cafea', 'aparate de cafea',
      'storcator', 'multicooker', 'gatit cu aburi', 'gratar electric', 'aspirator', 'cantar', 'balante'
    ]
  },
  {
    name: 'Jucării, Copii & Bebe',
    slug: 'copii-jucarii',
    order: 3,
    description: 'Biciclete, triciclete, trotinete, mașinuțe, jucării educative și articole de puericultură.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/579e7b6c-7284-442a-9283-0488a3c29125.jpg',
    matchKeywords: [
      'copii', 'jucari', 'jucarie', 'masinute', 'biciclet', 'trotinet', 'premergatoare', 'carucior', 
      'leagane', 'balansoar', 'bebelusi', 'hranire bebelusi', 'scaun de hranire', 'figurine animale', 
      'baloane', 'pedale', 'motociclet', 'vehicul'
    ]
  },
  {
    name: 'Casă & Decorațiuni',
    slug: 'casa-decoratiuni',
    order: 4,
    description: 'Textile de pat, curățenie, mobilier de birou, brazi de Crăciun și decorațiuni pentru casă.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/bd1dc20d-0ee1-40eb-8dd6-afae4b969559.png',
    matchKeywords: [
      'pilota', 'pat dublu', 'mop', 'cos de gunoi', 'cuiere', 'baie', 'organizator', 'birou', 
      'birouri', 'scaune de birou', 'comode', 'masute', 'brazi', 'craciun', 'candelabr', 'oglinzi', 
      'iluminat', 'roti de mobilier', 'umbrele si copertine', 'tricotat', 'fermoar', 'caini'
    ]
  },
  {
    name: 'Rucsacuri, Genți & Valize',
    slug: 'genti-accesorii',
    order: 5,
    description: 'Rucsacuri urbane și sport, genți de mână, genți de voiaj și portofele elegante.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/579e7b6c-7284-442a-9283-0488a3c29125.jpg',
    matchKeywords: [
      'rucsac', 'rucsacuri', 'genti', 'geanta', 'portofel', 'voiaj', 'valize'
    ]
  },
  {
    name: 'Modă & Încălțăminte',
    slug: 'moda-incaltaminte',
    order: 6,
    description: 'Îmbrăcăminte casual și sport, geci de iarnă, jachete, sneakers și încălțăminte outdoor.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/579e7b6c-7284-442a-9283-0488a3c29125.jpg',
    matchKeywords: [
      'jachete', 'geci', 'veste', 'blazere', 'paltoane', 'camasi', 'sosete', 'sepci', 'halate', 
      'botosi', 'furouri', 'sneakers', 'pantofi', 'incaltaminte'
    ]
  },
  {
    name: 'Frumusețe & Îngrijire',
    slug: 'frumusete-ingrijire',
    order: 7,
    description: 'Produse de îngrijire a părului, șampoane naturale și aparate de coafat profesionale.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/bd1dc20d-0ee1-40eb-8dd6-afae4b969559.png',
    matchKeywords: [
      'sampon', 'vopsele', 'seruri', 'uleiuri pentru par', 'uscator de par', 'ingrijire personala'
    ]
  },
  {
    name: 'Sport, Grădină & Camping',
    slug: 'sport-outdoor',
    order: 8,
    description: 'Grătare de grădină, accesorii pentru picnic, lăzi frigorifice și articole outdoor.',
    image: 'https://cdn.dsmcdn.com/indexing-category-images/prod/bd1dc20d-0ee1-40eb-8dd6-afae4b969559.png',
    matchKeywords: [
      'gratar', 'gratare', 'lazi frigorifice', 'frigidere portabile', 'articole sportive'
    ]
  }
];

function assignParentCategory(catName) {
  const norm = stripDiacritics(catName);
  for (const parent of PARENT_CATEGORIES) {
    for (const kw of parent.matchKeywords) {
      if (norm.includes(kw)) {
        return parent;
      }
    }
  }
  return PARENT_CATEGORIES[0];
}

function generateDescription(p, childCatName, parentCatName) {
  const brand = p.brand ? `Brand: ${p.brand}` : 'Producător Verificat';
  return `### ${p.name}

${p.name} reprezintă o alegere excelentă din categoria **${childCatName}** (${parentCatName}), conceput pentru a oferi durabilitate, funcționalitate superioară și un design elegant în utilizarea de zi cu zi.

#### Caracteristici principale:
- **Calitate Superioară**: Fabricat din materiale premium atent selecționate pentru o rezistență îndelungată.
- **${brand}**: Produs 100% original, distribuit oficial pe TopinStock România.
- **Eficiență & Confort**: Conceput pentru utilizare facilă, întreținere simplă și randament optim.
- **Garanție & Siguranță**: 24 de luni garanție comercială și drept de retur gratuit în termen de 30 de zile.
- **Livrare Rapidă**: Expediere directă din depozitul local, în 24-48h pe întreg teritoriul României.

Comandă acum pe TopinStock și bucură-te de un raport excepțional calitate-preț!`;
}

async function main() {
  console.log('--- Începere import produse reale Trendyol (TOPinStock mid=1151915) ---');

  const jsonPath = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\94f7b8de-546a-4a47-b765-0618eeea7d19\\scratch\\all_trendyol_products.json';
  if (!fs.existsSync(jsonPath)) {
    throw new Error('Fișierul all_trendyol_products.json nu a fost găsit!');
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const products = rawData.products;
  console.log(`Produse încărcate: ${products.length}`);

  // 1. Asigurare utilizator Admin & Vendor TopinStock
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@topinstock.ro' },
    update: { name: 'Adrian TopinStock (Admin)', role: 'ADMIN' },
    create: {
      email: 'admin@topinstock.ro',
      passwordHash: defaultPasswordHash,
      name: 'Adrian TopinStock (Admin)',
      role: 'ADMIN',
    },
  });

  const mainVendor = await prisma.vendor.upsert({
    where: { userId: adminUser.id },
    update: {
      storeName: 'TopinStock Oficial',
      slug: 'topinstock-oficial',
      description: 'Magazinul oficial TopinStock România — produse originale, livrare rapidă din depozit local.',
      isVerified: true,
      rating: 4.98,
      commissionRate: 0.10,
    },
    create: {
      userId: adminUser.id,
      storeName: 'TopinStock Oficial',
      slug: 'topinstock-oficial',
      description: 'Magazinul oficial TopinStock România — produse originale, livrare rapidă din depozit local.',
      isVerified: true,
      rating: 4.98,
      commissionRate: 0.10,
    },
  });

  console.log(`Vendor configurat: ${mainVendor.storeName} (${mainVendor.id})`);

  // 2. Creare / Actualizare Categorii Principale (Parents)
  const parentDbMap = new Map();
  for (const parent of PARENT_CATEGORIES) {
    const parentDb = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description,
        order: parent.order,
        image: parent.image,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        order: parent.order,
        image: parent.image,
      },
    });
    parentDbMap.set(parent.slug, parentDb);
  }
  console.log(`Categorii principale create: ${parentDbMap.size}`);

  // 3. Colectare și creare Subcategorii (Children)
  const childCategoryMap = new Map(); // childName -> Category Record
  const childCategoryCounts = new Map();

  for (const p of products) {
    const childName = (p.category?.name || 'Diverse').trim();
    childCategoryCounts.set(childName, (childCategoryCounts.get(childName) || 0) + 1);
  }

  let childOrder = 0;
  for (const [childName, count] of childCategoryCounts.entries()) {
    childOrder++;
    const parentDef = assignParentCategory(childName);
    const parentDb = parentDbMap.get(parentDef.slug);
    const childSlug = slugify(childName) || `cat-${childOrder}`;

    // Make sure child slug is unique if it matches a parent
    const safeChildSlug = childSlug === parentDef.slug ? `${childSlug}-sub` : childSlug;

    const childDb = await prisma.category.upsert({
      where: { slug: safeChildSlug },
      update: {
        name: childName,
        parentId: parentDb.id,
        order: childOrder,
      },
      create: {
        name: childName,
        slug: safeChildSlug,
        parentId: parentDb.id,
        order: childOrder,
      },
    });

    childCategoryMap.set(childName, childDb);
  }
  console.log(`Subcategorii create: ${childCategoryMap.size}`);

  // 4. Ștergere produse demo anterioare și inserare produse reale
  console.log('Curățare comenzi vechi și produse existente pentru un import curat...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Inserare 395 produse reale Trendyol...');
  let insertedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const childName = (p.category?.name || 'Diverse').trim();
    const childCat = childCategoryMap.get(childName);
    const parentDef = assignParentCategory(childName);

    // Prețuri
    let currentPrice = parsePrice(p.singlePrice?.salePrice);
    if (!currentPrice || currentPrice <= 0) {
      currentPrice = parsePrice(p.price?.discountedPrice) || parsePrice(p.price?.current) || 99;
    }

    let origPrice = parsePrice(p.singlePrice?.strikethroughPrice);
    if (!origPrice || origPrice <= 0) {
      origPrice = parsePrice(p.price?.originalPrice) || parsePrice(p.price?.current);
    }

    if (origPrice <= currentPrice) {
      // Dacă nu există preț tăiat mai mare, punem un preț de referință cu 15-30% mai mare pentru promoție
      origPrice = Math.round((currentPrice * 1.25) * 100) / 100;
    }

    const discountPercentage = Math.round(((origPrice - currentPrice) / origPrice) * 100);

    // Imagini de înaltă rezoluție (Folosim CDN-ul direct Trendyol)
    let images = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    // Facem fallback dacă cumva nu are imagini
    if (images.length === 0) {
      images = ['https://cdn.dsmcdn.com/sfweb-search/images/trendyol-product-card-placeholder_1759241898120.svg'];
    }

    // Slug unic
    const baseSlug = slugify(p.name).substring(0, 70);
    const uniqueSlug = `${baseSlug}-${p.id}`;

    // Mărimi & Culori
    let sizes = ['Universal'];
    if (p.variantValue && p.variantValue !== 'Mărime unică') {
      sizes = [p.variantValue];
    } else if (parentDef.slug === 'moda-incaltaminte') {
      if (childName.toLowerCase().includes('sneakers') || childName.toLowerCase().includes('pantofi')) {
        sizes = ['40', '41', '42', '43', '44', '45'];
      } else {
        sizes = ['S', 'M', 'L', 'XL', 'XXL'];
      }
    }

    // Rating & Recenzii
    const rating = p.ratingScore?.averageRating
      ? Math.round(p.ratingScore.averageRating * 10) / 10
      : (4.6 + (i % 5) * 0.1);
    const reviewsCount = p.ratingScore?.totalCount
      ? p.ratingScore.totalCount
      : (12 + (i * 7) % 65);

    const description = generateDescription(p, childName, parentDef.name);

    await prisma.product.create({
      data: {
        vendorId: mainVendor.id,
        categoryId: childCat.id,
        title: p.name,
        slug: uniqueSlug,
        description: description,
        price: currentPrice,
        originalPrice: origPrice,
        discountPercentage: discountPercentage,
        stock: 25 + ((p.id * 3) % 75), // stoc realist între 25 și 100
        sku: p.itemNumber ? `TIS-${p.itemNumber}` : `TIS-${p.id}`,
        images: JSON.stringify(images),
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify([p.brand || 'Original']),
        rating: rating,
        reviewsCount: reviewsCount,
        isPublished: true,
      },
    });

    insertedCount++;
    if (insertedCount % 50 === 0 || insertedCount === products.length) {
      console.log(`Progres: ${insertedCount} / ${products.length} produse inserate...`);
    }
  }

  console.log('\nSeed finalizat cu succes! Fără clienți sau comenzi fictive.');

  console.log(`\n✅ SUCCES DEPLIN! Toate cele ${insertedCount} de produse reale Trendyol au fost importate cu succes în baza de date!`);
}

main()
  .catch((e) => {
    console.error('Eroare import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
