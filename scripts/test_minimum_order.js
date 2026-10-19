const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMinimumOrder() {
  console.log('=== TEST 1: FIND CHEAP PRODUCT (< 50 LEI) AND EXPENSIVE PRODUCT (>= 50 LEI) ===');
  
  const cheapProduct = await prisma.product.findFirst({
    where: { price: { lt: 40, gt: 5 }, stock: { gt: 5 }, isPublished: true },
    select: { id: true, title: true, price: true, vendorId: true }
  });

  const normalProduct = await prisma.product.findFirst({
    where: { price: { gte: 50 }, stock: { gt: 5 }, isPublished: true },
    select: { id: true, title: true, price: true, vendorId: true }
  });

  console.log('Cheap product (< 50 LEI):', {
    id: cheapProduct?.id,
    title: cheapProduct?.title,
    price: cheapProduct?.price
  });

  console.log('Normal product (>= 50 LEI):', {
    id: normalProduct?.id,
    title: normalProduct?.title,
    price: normalProduct?.price
  });

  if (!cheapProduct || !normalProduct) {
    throw new Error('Could not find test products');
  }

  console.log('\n=== TEST 2: CHECKOUT WITH CHEAP PRODUCT ONLY (< 50 LEI) ===');
  const resCheap = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Test Client Minim',
        email: 'client@topinstock.ro',
        phone: '0722123456'
      },
      shipping: {
        county: 'București',
        city: 'Sector 1',
        address: 'Strada Test nr. 12'
      },
      paymentMethod: 'ramburs',
      items: [
        {
          productId: cheapProduct.id,
          title: cheapProduct.title,
          quantity: 1
        }
      ]
    })
  });

  const dataCheap = await resCheap.json();
  console.log('Status HTTP (expected 400):', resCheap.status);
  console.log('Success (expected false):', dataCheap.success);
  console.log('Error message returned:', dataCheap.error);

  const isBlockedProperly = resCheap.status === 400 && dataCheap.error && dataCheap.error.includes('Comanda minimă pe TOPinStock este de 50 LEI');
  console.log('>> IS UNDER-50-LEI ORDER BLOCKED CORRECTLY?', isBlockedProperly ? 'YES (PASS)' : 'NO (FAIL)');

  console.log('\n=== TEST 3: CHECKOUT WITH PRODUCT >= 50 LEI ===');
  const resNormal = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        fullName: 'Test Client Valid',
        email: 'client@topinstock.ro',
        phone: '0722123456'
      },
      shipping: {
        county: 'București',
        city: 'Sector 1',
        address: 'Strada Test nr. 12'
      },
      paymentMethod: 'ramburs',
      items: [
        {
          productId: normalProduct.id,
          title: normalProduct.title,
          quantity: 1
        }
      ]
    })
  });

  const dataNormal = await resNormal.json();
  console.log('Status HTTP (expected 200 or 201):', resNormal.status);
  console.log('Success (expected true):', dataNormal.success);
  if (dataNormal.success) {
    console.log('Order created successfully! Order ID:', dataNormal.orderId, 'Total:', dataNormal.totalAmount, 'LEI');
  } else {
    console.log('Failed unexpectedly:', dataNormal.error);
  }

  const isAllowedProperly = resNormal.status === 200 && dataNormal.success === true;
  console.log('>> IS OVER-50-LEI ORDER ACCEPTED CORRECTLY?', isAllowedProperly ? 'YES (PASS)' : 'NO (FAIL)');
}

testMinimumOrder().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
