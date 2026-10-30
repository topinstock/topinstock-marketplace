const fs = require('fs');
const path = require('path');
const https = require('https');

const jomaDir = path.join(process.cwd(), 'public', 'images', 'joma');
if (!fs.existsSync(jomaDir)) {
  fs.mkdirSync(jomaDir, { recursive: true });
}

const verified = JSON.parse(fs.readFileSync('scratch/verified_joma_models.json', 'utf8'));

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Failed with ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log(`Downloading Joma model images into ${jomaDir}...`);
  for (const model of verified) {
    for (const item of model.verifiedColors) {
      const fileName = `${model.code}_${item.colorCode}.jpg`;
      const dest = path.join(jomaDir, fileName);
      if (!fs.existsSync(dest)) {
        try {
          await downloadFile(item.url, dest);
          console.log(`Downloaded ${fileName}`);
        } catch (e) {
          console.error(`Failed ${fileName}:`, e.message);
        }
      } else {
        console.log(`Already exists: ${fileName}`);
      }
    }
  }
  console.log('All downloads completed!');
}

main().catch(console.error);
