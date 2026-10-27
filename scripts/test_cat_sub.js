const { getCatalogProducts } = require('./lib/products');

async function test() {
  const res = await getCatalogProducts({ category: 'electrocasnice' });
  console.log(`electrocasnice: total products = ${res.total}`);
  if (res.products.length > 0) {
    console.log('Sample product:', res.products[0].title);
  }
}

test();

