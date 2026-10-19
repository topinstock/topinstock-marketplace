const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TOPINSTOCK_VENDOR_ID = 'cmuul4drh0002qmgwo3xxew3l';
const OTHER_VENDOR_IDS = [
  'cmvaeeit40002ksv9fhhil20z', // TeoMarket România
  'cmvch4e4700021095glkg748q'  // Micul Fermier
];
const OTHER_VENDOR_EMAILS = [
  'contact@teomarket.com',
  'contact@micul-fermier.ro'
];

function cleanTitle(title) {
  if (!title) return title;
  let t = title;
  t = t.replace(/\bflippy\b/gi, 'TOPinStock');
  t = t.replace(/\bteomarket\b/gi, 'TOPinStock');
  t = t.replace(/\bTopinStock\b/g, 'TOPinStock');
  return t;
}

function cleanSlug(slug) {
  if (!slug) return slug;
  return slug.replace(/flippy/gi, 'topinstock');
}

function cleanAttributes(attrStr) {
  if (!attrStr) return attrStr;
  try {
    const obj = JSON.parse(attrStr);
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        let val = obj[key];
        val = val.replace(/\bflippy\b/gi, 'TOPinStock');
        val = val.replace(/TeoMarket Rom[aâ]nia/gi, 'TOPinStock');
        val = val.replace(/\bTeoMarket\b/gi, 'TOPinStock');
        val = val.replace(/\bTopinStock\b/g, 'TOPinStock');
        obj[key] = val;
      }
    }
    return JSON.stringify(obj);
  } catch (e) {
    let val = attrStr;
    val = val.replace(/\bflippy\b/gi, 'TOPinStock');
    val = val.replace(/TeoMarket Rom[aâ]nia/gi, 'TOPinStock');
    val = val.replace(/\bTeoMarket\b/gi, 'TOPinStock');
    val = val.replace(/\bTopinStock\b/g, 'TOPinStock');
    return val;
  }
}

function cleanDescription(desc) {
  if (!desc) return desc;
  
  // 1. Mask URLs (src and href attributes) so we never modify image paths or links
  const urls = [];
  let d = desc.replace(/(src|href)=(["'])(.*?)\2/gi, (match, attr, quote, url) => {
    urls.push(url);
    return `${attr}=${quote}__URL_SAFE_PLACEHOLDER_${urls.length - 1}__${quote}`;
  });

  // 2. Specific natural Romanian phrases
  d = d.replace(/este distribuit oficial pe (?:<strong>)?TopinStock(?:<\/strong>)? prin partenerul autorizat (?:<strong>)?TeoMarket Rom[aâ]nia(?:<\/strong>)?/gi, 'este distribuit oficial direct de către <strong>TOPinStock</strong>');
  d = d.replace(/prin partenerul autorizat (?:<strong>)?TeoMarket Rom[aâ]nia(?:<\/strong>)?/gi, 'direct de către <strong>TOPinStock</strong>');
  d = d.replace(/depozitul central TeoMarket Rom[aâ]nia/gi, 'depozitul central TOPinStock');
  d = d.replace(/depozitul central TeoMarket/gi, 'depozitul central TOPinStock');
  d = d.replace(/partenerul autorizat TeoMarket/gi, 'TOPinStock');
  d = d.replace(/TeoMarket Rom[aâ]nia/gi, 'TOPinStock');
  d = d.replace(/\bTeoMarket\b/gi, 'TOPinStock');
  d = d.replace(/\bFlippy\b/gi, 'TOPinStock');
  d = d.replace(/\bTopinStock\b/g, 'TOPinStock');

  // 3. Restore all original URLs exactly
  d = d.replace(/__URL_SAFE_PLACEHOLDER_(\d+)__/g, (m, idx) => urls[Number(idx)]);

  return d;
}

async function main() {
  console.log('========================================================');
  console.log('   MIGRATING ALL PRODUCTS TO EXCLUSIVE TOPinStock VENDOR');
  console.log('========================================================\n');

  // Step 1: Reassign all products to TOPinStock vendor
  console.log('1. Reassigning all products to vendor TOPinStock...');
  const reassignRes = await prisma.product.updateMany({
    where: { vendorId: { not: TOPINSTOCK_VENDOR_ID } },
    data: { vendorId: TOPINSTOCK_VENDOR_ID }
  });
  console.log(`   Reassigned ${reassignRes.count} products to TOPinStock.`);

  // Step 2: Delete other vendors and vendor user accounts
  console.log('\n2. Deleting other vendor accounts...');
  const delVendorsRes = await prisma.vendor.deleteMany({
    where: { id: { in: OTHER_VENDOR_IDS } }
  });
  console.log(`   Deleted ${delVendorsRes.count} other vendors.`);

  const delUsersRes = await prisma.user.deleteMany({
    where: { email: { in: OTHER_VENDOR_EMAILS } }
  });
  console.log(`   Deleted ${delUsersRes.count} vendor user accounts.`);

  // Step 3: Find products needing text replacement
  console.log('\n3. Scanning products that need Flippy / TeoMarket replacement...');
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      attributes: true,
      description: true
    }
  });
  console.log(`   Total products in database: ${allProducts.length}`);

  const toUpdate = [];
  for (const p of allProducts) {
    const newTitle = cleanTitle(p.title);
    const newSlug = cleanSlug(p.slug);
    const newAttributes = cleanAttributes(p.attributes);
    const newDescription = cleanDescription(p.description);

    const changed = 
      newTitle !== p.title ||
      newSlug !== p.slug ||
      newAttributes !== p.attributes ||
      newDescription !== p.description;

    if (changed) {
      toUpdate.push({
        id: p.id,
        title: newTitle,
        slug: newSlug,
        attributes: newAttributes,
        description: newDescription
      });
    }
  }

  console.log(`   Found ${toUpdate.length} products requiring text updates.`);

  // Step 4: Batch update products in transactions
  const BATCH_SIZE = 500;
  console.log(`\n4. Updating ${toUpdate.length} products in batches of ${BATCH_SIZE}...`);
  const startTime = Date.now();

  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = toUpdate.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map(item => prisma.product.update({
        where: { id: item.id },
        data: {
          title: item.title,
          slug: item.slug,
          attributes: item.attributes,
          description: item.description
        }
      }))
    );
    const progress = Math.min(i + BATCH_SIZE, toUpdate.length);
    const percent = ((progress / toUpdate.length) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   [${progress}/${toUpdate.length}] (${percent}%) - ${elapsedSec}s elapsed`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n   Finished updating ${toUpdate.length} products in ${totalTime}s!`);

  // Step 5: Verification
  console.log('\n========================================================');
  console.log('   POST-MIGRATION VERIFICATION');
  console.log('========================================================');

  const vendors = await prisma.vendor.findMany({
    include: { _count: { select: { products: true } } }
  });
  console.log('\nRemaining Vendors:');
  for (const v of vendors) {
    console.log(` - ${v.storeName} (${v.slug}) | Total products: ${v._count.products}`);
  }

  const flippyTitleCount = await prisma.product.count({
    where: { title: { contains: 'flippy' } }
  });
  const teoTitleCount = await prisma.product.count({
    where: { title: { contains: 'teomarket' } }
  });
  const flippyAttrCount = await prisma.product.count({
    where: { attributes: { contains: 'flippy' } }
  });
  const teoAttrCount = await prisma.product.count({
    where: { attributes: { contains: 'teomarket' } }
  });
  const flippySlugCount = await prisma.product.count({
    where: { slug: { contains: 'flippy' } }
  });

  console.log('\nRemaining mentions in products:');
  console.log(` - Titles containing 'flippy': ${flippyTitleCount}`);
  console.log(` - Titles containing 'teomarket': ${teoTitleCount}`);
  console.log(` - Attributes containing 'flippy': ${flippyAttrCount}`);
  console.log(` - Attributes containing 'teomarket': ${teoAttrCount}`);
  console.log(` - Slugs containing 'flippy': ${flippySlugCount}`);

  // Sample check product
  const sample = await prisma.product.findFirst({
    where: { id: toUpdate[0]?.id },
    select: { title: true, attributes: true, description: true }
  });
  console.log('\nSample updated product:');
  console.log('Title:', sample?.title);
  console.log('Attributes:', sample?.attributes);
  console.log('Description snippet (first 300 chars):', sample?.description.slice(0, 300));

  console.log('\nMigration completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
