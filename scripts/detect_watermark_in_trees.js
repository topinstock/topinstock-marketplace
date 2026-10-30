const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('scratch/trees_manifest.json', 'utf8'));

console.log(`Analyzing ${manifest.length} tree images...`);

// For each image, let's see its filename and whether 'flippy' is in the original URL
let urlHasFlippy = 0;
for (const item of manifest) {
  const hasFlippy = item.firstImg.toLowerCase().includes('flippy');
  if (hasFlippy) urlHasFlippy++;
}

console.log(`Images with 'flippy' in source URL: ${urlHasFlippy} / ${manifest.length}`);

