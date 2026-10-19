const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectSections() {
  console.log('--- SCANNING PRODUCTS FOR 4 SEASONAL HOMEPAGE SECTIONS ---\n');

  const baseWhere = {
    isPublished: true,
    stock: { gt: 0 },
    price: { gt: 0 },
    NOT: {
      category: {
        slug: { contains: 'engross' }
      }
    }
  };

  // Section 1: Magia Sărbătorilor: Instalații & Decoruri de Crăciun
  // Target Keywords: instalatie, instalatii, led, craciun, brad, ghirlanda, perdea lumini, turture, decoratiuni iarna, banda led, proiector
  const sec1Keywords = ['instalatie', 'instalație', 'instalatii', 'instalații', 'craciun', 'crăciun', 'brad', 'ghirlanda', 'ghirlandă', 'perdea', 'turture', 'turturi', 'decoratiuni', 'decorațiuni', 'banda led', 'bandă led', 'proiector'];
  
  const sec1Or = [];
  for (const kw of sec1Keywords) {
    sec1Or.push({ title: { contains: kw } });
  }
  sec1Or.push({ category: { slug: { in: ['brazi-de-craciun', 'turturi-franjuri', 'instalatii-si-figurine-craciun', 'instalatii-craciun', 'decoratiuni-craciun'] } } });

  const sec1Products = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: sec1Or
    },
    take: 20,
    orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }, { stock: 'desc' }],
    select: { id: true, title: true, price: true, stock: true, sku: true, category: { select: { name: true, slug: true } } }
  });
  console.log(`Section 1 (Crăciun & Instalații): Found ${sec1Products.length} matches (sample 8):`);
  sec1Products.slice(0, 8).forEach(p => console.log(`  [${p.category?.name}] ${p.title} (${p.price} LEI, stoc: ${p.stock})`));

  // Section 2: Pregătiri de Sărbători: Bucătărie, Cârnați & Cozonaci
  // Target Keywords: masina de tocat, tocat carne, carnati, umplut carnati, framantat, mixer cu bol, robot de bucatarie, cozonac, tava copt, oala, set oale, cratita, ceaun, kukta, oala sub presiune
  const sec2Keywords = ['masina de tocat', 'mașină de tocat', 'tocat carne', 'carnati', 'cârnați', 'umplut', 'framantat', 'frământat', 'mixer', 'robot de bucatarie', 'robot de bucătărie', 'cozonac', 'tava', 'tavă', 'oala', 'oală', 'oale', 'cratita', 'cratiță', 'cratite', 'cratițe', 'ceaun', 'kukta', 'presiune'];

  const sec2Or = [];
  for (const kw of sec2Keywords) {
    sec2Or.push({ title: { contains: kw } });
  }
  sec2Or.push({ category: { slug: { in: ['oale', 'oale-sub-presiune', 'cratite', 'tavi-si-forme-copt', 'masini-de-tocat-carne', 'mixer-si-set-de-mixere'] } } });

  const sec2Products = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: sec2Or
    },
    take: 20,
    orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }, { stock: 'desc' }],
    select: { id: true, title: true, price: true, stock: true, sku: true, category: { select: { name: true, slug: true } } }
  });
  console.log(`\nSection 2 (Bucătărie & Cârnați): Found ${sec2Products.length} matches (sample 8):`);
  sec2Products.slice(0, 8).forEach(p => console.log(`  [${p.category?.name}] ${p.title} (${p.price} LEI, stoc: ${p.stock})`));

  // Section 3: Fabrica de Cadouri: Jucării pentru Moș Nicolae & Crăciun
  // Target Keywords: jucarie, jucarii, masinuta, papusa, set constructie, lego, interactiva, plus, joc, copii, trotineta, robotel
  const sec3Keywords = ['jucarie', 'jucărie', 'jucarii', 'jucării', 'masinuta', 'mașinuță', 'papusa', 'păpușă', 'constructie', 'construcție', 'lego', 'interactiva', 'interactivă', 'plus', 'pluș', 'joc', 'copii', 'trotineta', 'trotinetă', 'robotel', 'robățel'];

  const sec3Or = [];
  for (const kw of sec3Keywords) {
    sec3Or.push({ title: { contains: kw } });
  }
  sec3Or.push({ category: { slug: { in: ['jucarii-si-jocuri', 'jucarii', 'jocuri-de-societate-si-familie', 'figurine-animale', 'masinute-si-vehicule-copii', 'trotinete-copii', 'biciclete-pentru-copii'] } } });

  const sec3Products = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: sec3Or
    },
    take: 20,
    orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }, { stock: 'desc' }],
    select: { id: true, title: true, price: true, stock: true, sku: true, category: { select: { name: true, slug: true } } }
  });
  console.log(`\nSection 3 (Jucării & Cadouri): Found ${sec3Products.length} matches (sample 8):`);
  sec3Products.slice(0, 8).forEach(p => console.log(`  [${p.category?.name}] ${p.title} (${p.price} LEI, stoc: ${p.stock})`));

  // Section 4: Electrocasnice & Confort de Iarnă
  // Target Keywords: aeroterma, calorifer, incalzitor, espressor, cafetiera, fierbator, prajitor, airfryer, friteuza, aspirator
  const sec4Keywords = ['aeroterma', 'aerotermă', 'calorifer', 'incalzitor', 'încălzitor', 'espressor', 'cafetiera', 'cafetieră', 'fierbator', 'fierbător', 'prajitor', 'prăjitor', 'airfryer', 'friteuza', 'friteuză', 'aspirator'];

  const sec4Or = [];
  for (const kw of sec4Keywords) {
    sec4Or.push({ title: { contains: kw } });
  }
  sec4Or.push({ category: { slug: { in: ['calorifere-tip-panou', 'electrocasnice', 'aspirator-vertical', 'aspiratoare', 'fierbator-de-apa-si-ceainic', 'prajitor-de-paine', 'rasnite-de-cafea-si-condimente'] } } });

  const sec4Products = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: sec4Or
    },
    take: 20,
    orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }, { stock: 'desc' }],
    select: { id: true, title: true, price: true, stock: true, sku: true, category: { select: { name: true, slug: true } } }
  });
  console.log(`\nSection 4 (Electrocasnice & Confort de Iarnă): Found ${sec4Products.length} matches (sample 8):`);
  sec4Products.slice(0, 8).forEach(p => console.log(`  [${p.category?.name}] ${p.title} (${p.price} LEI, stoc: ${p.stock})`));

  await prisma.$disconnect();
}

inspectSections().catch(console.error);
