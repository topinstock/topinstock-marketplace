const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('scratch/trees_manifest.json', 'utf8'));

const standingTrees = manifest.filter(m => {
  const t = m.title.toLowerCase();
  return (t.includes('brad artificial') || t.includes('brad de craciun')) &&
         !t.includes('coronita') && !t.includes('ghirlanda') && !t.includes('fundite') && !t.includes('ornament');
});

console.log(`Standing artificial trees count: ${standingTrees.length}`);
for (let i = 0; i < standingTrees.length; i++) {
  const item = standingTrees[i];
  console.log(`[${i+1}] ${item.sku}: ${item.title}`);
  console.log(`     URL: ${item.firstImg}`);
}

fs.writeFileSync('scratch/standing_trees.json', JSON.stringify(standingTrees, null, 2));

