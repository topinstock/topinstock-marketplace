const fs = require('fs');
const path = 'lib/data/products.ts';

let content = fs.readFileSync(path, 'utf8');

// Remove originalPrice property lines
content = content.replace(/\n\s*"originalPrice":\s*[^,\n]+,?/g, '');
// Remove "badge": "sale" lines
content = content.replace(/\n\s*"badge":\s*"sale",?/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully cleaned lib/data/products.ts');
