const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
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

const CATEGORY_MAPPINGS = [
  {
    slug: 'oale',
    keywords: ['oala', 'oale', 'cratita', 'cratite', 'sub presiune', 'set oale', 'inox']
  },
  {
    slug: 'tigai',
    keywords: ['tigaie', 'tigai', 'wok', 'grill', 'clatite']
  },
  {
    slug: 'tocatoare',
    keywords: ['tocator', 'tocatoare', 'bambus']
  },
  {
    slug: 'ceainic',
    keywords: ['ceainic', 'ceainice', 'infuzor', 'ibric', 'ibrice']
  },
  {
    slug: 'seturi-de-tacamuri',
    keywords: ['tacamuri', 'lingura', 'furculita', 'cutite', 'lingurita']
  },
  {
    slug: 'seturi-vesela',
    keywords: ['farfurii', 'farfurie', 'serviciu masa', 'opal', 'portelan', 'vesela']
  },
  {
    slug: 'boluri',
    keywords: ['bol', 'boluri', 'castron', 'castroane', 'salatiera']
  },
  {
    slug: 'caserole-pentru-mancare',
    keywords: ['caserola', 'caserole', 'recipient depozitare', 'cutie alimentara', 'cutie paine', 'borcan']
  },
  {
    slug: 'materiale-pentru-gatit-si-servire',
    keywords: ['platou', 'platouri', 'tava', 'tavi', 'forme prajituri', 'marmita', 'oliviera', 'condimente']
  },
  {
    slug: 'ustensile-de-gatit',
    keywords: ['polonic', 'tel', 'spumiera', 'razatoare', 'storcator manual', 'strecuratoare', 'ustensile']
  },
  {
    slug: 'electrocasnice',
    keywords: [
      'blender', 'mixer', 'calorifer', 'ventilator', 'fier de calcat', 'masina tocat', 
      'rasnita', 'prajitor', 'fierbator', 'cafetiera', 'storcator', 'multicooker', 
      'gratar electric', 'aspirator', 'cantar', 'cuptor', 'sandwich', 'radiator', 
      'incalzitor', 'espressor', 'robot bucatarie'
    ]
  },
  {
    slug: 'copii-jucarii',
    keywords: [
      'copii', 'jucarii', 'jucarie', 'masinute', 'masinuta', 'bicicleta', 'tricicleta', 
      'trotineta', 'premergator', 'carucior copii', 'balansoar', 'leagan', 'bebe', 'bebelusi'
    ]
  },
  {
    slug: 'casa-decoratiuni',
    keywords: [
      'mop', 'galeata', 'cos gunoi', 'cos rufe', 'curatenie', 'birou', 'scaun', 'masa', 
      'masuta', 'cuier', 'taburet', 'dulap', 'brad', 'brazi', 'craciun', 'covor', 'baie'
    ]
  },
  {
    slug: 'sport-outdoor',
    keywords: [
      'umbrela', 'hamac', 'geanta frigorifica', 'camping', 'gratar', 'outdoor', 'sport', 'drumetii'
    ]
  },
  {
    slug: 'frumusete-ingrijire',
    keywords: [
      'uscator par', 'perie par', 'ondulator', 'placa par', 'masina tuns', 'ingrijire personala'
    ]
  },
  {
    slug: 'bucatarie-menaj',
    keywords: [
      'bucatarie', 'menaj', 'cana', 'pahar', 'halba', 'termos', 'frapiera', 'shaker'
    ]
  }
];

function generateRichDescription(title, brand, price, urlSlug) {
  const normTitle = title.replace(/\s+/g, ' ').trim();
  const brandName = brand || 'Victronic';

  return `<h3>${normTitle}</h3>
<p><strong>${normTitle}</strong> este distribuit oficial pe <strong>TopinStock</strong>, oferind standarde înalte de calitate, durabilitate și confort în utilizare. Brandul <strong>${brandName}</strong> este recunoscut pentru fiabilitatea produselor sale destinate casei și familiei.</p>

<h4>Caracteristici principale:</h4>
<ul>
  <li><strong>Brand de încredere:</strong> Produs 100% original ${brandName}, conform normelor europene de siguranță și calitate.</li>
  <li><strong>Design funcțional:</strong> Proiectat ergonomic pentru manevrare facilă, durabilitate în timp și performanță optimă.</li>
  <li><strong>Materiale durabile:</strong> Conceput din componente atent selecționate, rezistente la uzură și ușor de întreținut.</li>
  <li><strong>Garanție de conformitate:</strong> Beneficiază de 24 de luni garanție și asistență dedicată din partea echipei TopinStock.</li>
  <li><strong>Livrare rapidă:</strong> Expediere directă din depozitul central TopinStock, livrare în 24-48 de ore oriunde în țară.</li>
</ul>

<p>Alege calitatea și siguranța produselor originale disponibile în magazinul oficial TopinStock România!</p>`;
}

async function uploadAllProducts() {
  console.log('===========================================================');
  console.log('     UPLOAD PRODUSE VICTRONIC PE CONTUL TOPINSTOCK ADMIN    ');
  console.log('===========================================================');

  // 1. Get TopinStock Admin Vendor
  const adminVendor = await prisma.vendor.findFirst({
    where: { slug: 'topinstock-oficial' }
  });
  if (!adminVendor) {
    throw new Error('Nu a fost găsit vendorul "TopinStock Oficial"!');
  }
  console.log(`✓ Vendor Admin: ${adminVendor.storeName} (ID: ${adminVendor.id})`);

  // 2. Load Categories
  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map(c => [c.slug.toLowerCase(), c]));
  const defaultCat = catBySlug.get('bucatarie-menaj') || categories[0];

  function getCategoryForProduct(title, url) {
    const text = stripDiacritics((title + ' ' + url).toLowerCase());
    for (const mapping of CATEGORY_MAPPINGS) {
      for (const kw of mapping.keywords) {
        if (text.includes(kw)) {
          if (catBySlug.has(mapping.slug)) {
            return catBySlug.get(mapping.slug);
          }
        }
      }
    }
    return defaultCat;
  }

  // 3. Load Products to Upload
  const toUpload = JSON.parse(fs.readFileSync('scripts/final_unique_to_upload.json', 'utf8'));
  console.log(`✓ Produse unice pregătite pentru urcare: ${toUpload.length}`);

  // 4. Track existing slugs
  const existing = await prisma.product.findMany({ select: { slug: true } });
  const usedSlugs = new Set(existing.map(p => p.slug));

  let inserted = 0;
  let skipped = 0;
  const batchSize = 50;

  for (let i = 0; i < toUpload.length; i += batchSize) {
    const batch = toUpload.slice(i, i + batchSize);
    
    const dbRecords = [];
    for (let j = 0; j < batch.length; j++) {
      const p = batch[j];
      const globalIdx = i + j;

      // Title
      const title = p.title || p.url.split('/').pop().replace(/-/g, ' ');

      // Slug
      const urlSlug = p.url.split('/').pop().replace(/[^\w-]/g, '');
      let baseSlug = (urlSlug || slugify(title)).substring(0, 75);
      let finalSlug = baseSlug;
      let counter = 1;
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      usedSlugs.add(finalSlug);

      // Price & Discount
      let price = parseFloat(p.price) || 49.99;
      let basePrice = parseFloat(p.basePrice) || 0;
      if (!basePrice || basePrice <= price) {
        basePrice = Math.round(price * 1.25 * 100) / 100;
      }
      const discountPercentage = Math.max(0, Math.round(((basePrice - price) / basePrice) * 100));

      // Category
      const category = getCategoryForProduct(title, p.url);

      // SKU
      const sku = `TIS-VIC-${(200000 + globalIdx)}`;

      // Description
      const description = generateRichDescription(title, p.brand, price, urlSlug);

      // Images
      const images = p.image ? [p.image] : ['https://www.victronic.ro/images/senior-software-orange.png'];

      // Attributes
      const attributes = {
        'Brand': p.brand || 'Victronic',
        'Stare produs': 'Nou',
        'Garanție': '24 luni',
        'Origine': 'Magazin Oficial Victronic'
      };

      // Rating & Reviews
      const rating = Math.round((4.6 + (globalIdx % 5) * 0.08) * 10) / 10;
      const reviewsCount = 4 + (globalIdx % 28);
      const stock = 20 + (globalIdx % 35);

      dbRecords.push({
        vendorId: adminVendor.id,
        categoryId: category.id,
        title,
        slug: finalSlug,
        description,
        price,
        originalPrice: basePrice,
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
      // In SQLite, insert each product in batch or createMany
      await prisma.$transaction(
        dbRecords.map(data => prisma.product.create({ data }))
      );
      inserted += dbRecords.length;
      console.log(`✓ Urcate ${inserted} / ${toUpload.length} produse pe contul TopinStock...`);
    } catch (err) {
      console.error(`Eroare la inserare lot: ${err.message}`);
      // Fallback single insert to skip individual faulty items
      for (const rec of dbRecords) {
        try {
          await prisma.product.create({ data: rec });
          inserted++;
        } catch (e) {
          skipped++;
        }
      }
    }
  }

  console.log('\n===========================================================');
  console.log('                 REZULTAT FINAL IMPORT                     ');
  console.log('===========================================================');
  console.log(`✓ Produse noi urcate pe contul Admin: ${inserted}`);
  console.log(`✓ Produse ignorate/erori: ${skipped}`);
  const totalInDb = await prisma.product.count();
  console.log(`✓ Total produse active pe TopinStock: ${totalInDb}`);
  console.log('===========================================================');

  await prisma.$disconnect();
}

uploadAllProducts().catch(err => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
});
