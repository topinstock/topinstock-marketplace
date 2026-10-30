const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.json') && !f.includes('sitemap') && !f.includes('fallback'));

for (const file of files) {
  const filePath = path.join(__dirname, file);
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 200 * 1024 * 1024) continue; // skip >200MB
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = (content.match(/joma/gi) || []).length;
    if (matches > 0) {
      console.log(`Found ${matches} occurrences of 'joma' in ${file}`);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}
