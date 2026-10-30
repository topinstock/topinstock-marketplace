const fs = require('fs');
const path = require('path');

const standingTrees = JSON.parse(fs.readFileSync('scratch/standing_trees.json', 'utf8'));
const braziDir = path.join(__dirname, '..', 'public', 'images', 'brazi');

// Available clean images in braziDir
const files = fs.readdirSync(braziDir);
console.log('Available clean images in public/images/brazi:', files);

// Check coverage
console.log(`\nCoverage check for ${standingTrees.length} standing tree products:`);
for (const item of standingTrees) {
  const targetFile = `${item.sku}.jpg`;
  const exists = files.includes(targetFile);
  console.log(`- ${item.sku}: ${item.title.slice(0, 45)} -> exists in brazi/: ${exists}`);
}

