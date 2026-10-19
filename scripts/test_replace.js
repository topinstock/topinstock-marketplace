const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const prod = await p.product.findFirst({
    where: { description: { contains: 'TeoMarket' } }
  });
  
  let desc = prod.description;
  const srcs = [];
  desc = desc.replace(/src=(["'])(.*?)\1/gi, (match, quote, url) => {
    srcs.push(url);
    return `src=${quote}__SRC_PLACEHOLDER_${srcs.length - 1}__${quote}`;
  });
  
  console.log('Extracted', srcs.length, 'images.');
  console.log('Contains images-teomarket in desc with placeholders?', desc.includes('images-teomarket'));
  
  // Specific phrases first for nice natural language:
  desc = desc.replace(/este distribuit oficial pe (?:<strong>)?TopinStock(?:<\/strong>)? prin partenerul autorizat (?:<strong>)?TeoMarket Rom[aâ]nia(?:<\/strong>)?/gi, 'este distribuit oficial direct de către <strong>TOPinStock</strong>');
  desc = desc.replace(/prin partenerul autorizat (?:<strong>)?TeoMarket Rom[aâ]nia(?:<\/strong>)?/gi, 'direct de către <strong>TOPinStock</strong>');
  desc = desc.replace(/depozitul central TeoMarket Rom[aâ]nia/gi, 'depozitul central TOPinStock');
  desc = desc.replace(/partenerul autorizat TeoMarket/gi, 'TOPinStock');
  desc = desc.replace(/TeoMarket Rom[aâ]nia/gi, 'TOPinStock');
  desc = desc.replace(/TeoMarket/gi, 'TOPinStock');
  desc = desc.replace(/\bFlippy\b/gi, 'TOPinStock');
  desc = desc.replace(/\bTopinStock\b/g, 'TOPinStock');
  
  // Restore images
  desc = desc.replace(/__SRC_PLACEHOLDER_(\d+)__/g, (m, idx) => srcs[Number(idx)]);
  
  console.log('Restored correctly?', desc.includes(srcs[0]));
  console.log('Sample intro snippet:\n', desc.slice(0, 400));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
