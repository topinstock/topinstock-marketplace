const fs = require('fs');

async function testSpincomElement() {
  const url = 'https://spincomexim.ro/modul-de-control-wi-fi-pentru-intrerupator-2-4ghz-compatibil-smartphone-31-gratis';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  // Find where availability is rendered in OpenCart
  // Usually: <span class="stock in-stock">...</span> or "Disponibilitate:"
  const dispIdx = html.indexOf('Disponibilitate');
  if (dispIdx !== -1) {
    console.log(html.slice(dispIdx - 50, dispIdx + 200));
  } else {
    const stocIdx = html.indexOf('In stoc');
    console.log('Stoc match:', html.slice(stocIdx - 50, stocIdx + 200));
  }
}

testSpincomElement();
