const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbs = [
  'prisma/topinstock.db',
  'prisma/topinstock.db.backup',
  'prisma/topinstock.db.backup_pricing_standardization'
];

for (const dbRel of dbs) {
  const dbPath = path.join(process.cwd(), dbRel);
  if (!fs.existsSync(dbPath)) continue;

  console.log(`\n=== Checking ${dbRel} ===`);
  try {
    const db = new Database(dbPath, { readonly: true });
    const countAll = db.prepare("SELECT count(*) as c FROM Product").get();
    console.log(`Total products: ${countAll.c}`);

    const joma = db.prepare("SELECT id, sku, title, price, images, attributes FROM Product WHERE title LIKE '%joma%' OR description LIKE '%joma%' OR attributes LIKE '%joma%'").all();
    console.log(`Found ${joma.length} Joma products in ${dbRel}`);
    joma.slice(0, 20).forEach(p => console.log(p.sku, '|', p.title));
    db.close();
  } catch (e) {
    console.error(`Error with ${dbRel}:`, e.message);
  }
}

