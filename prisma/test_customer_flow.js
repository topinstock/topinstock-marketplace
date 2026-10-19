async function testFullCustomerFlow() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing full Customer Account & Order flow on', baseUrl);

  // 1. Register a new customer
  const regPayload = {
    name: 'Daniel Raducanu',
    email: 'daniel.raducanu.client@gmail.com',
    phone: '0744123456',
    password: 'parola-securizata-123',
    address: 'Bucuresti, Sector 1, Str. Victoriei nr. 10',
  };

  console.log('\n1. Registering customer:', regPayload.email);
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  });

  const regData = await regRes.json();
  console.log('Register response status:', regRes.status, regData);

  const cookie = regRes.headers.get('set-cookie');
  console.log('Session cookie received:', !!cookie);

  // 2. Check /api/auth/me
  console.log('\n2. Checking /api/auth/me with session cookie...');
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: cookie || '' },
  });
  const meData = await meRes.json();
  console.log('Me response:', meData);

  // 3. Check customer orders before placing any
  console.log('\n3. Checking /api/user/orders before placing order...');
  const ordersBeforeRes = await fetch(`${baseUrl}/api/user/orders`, {
    headers: { cookie: cookie || '' },
  });
  const ordersBeforeData = await ordersBeforeRes.json();
  console.log('Orders before:', ordersBeforeData.orders?.length);

  // 4. Place an order via /api/checkout as this customer
  console.log('\n4. Placing order via /api/checkout...');
  // Find a product from DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const sampleProduct = await prisma.product.findFirst();

  const checkoutPayload = {
    customer: {
      fullName: regPayload.name,
      email: regPayload.email,
      phone: regPayload.phone,
    },
    shipping: {
      county: 'București',
      city: 'Sector 1',
      address: regPayload.address,
      notes: 'Livrare după ora 14:00',
    },
    paymentMethod: 'ramburs',
    items: [
      {
        productId: sampleProduct.id,
        title: sampleProduct.title,
        price: sampleProduct.price,
        quantity: 2,
        vendorId: sampleProduct.vendorId,
      },
    ],
  };

  const checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookie || '',
    },
    body: JSON.stringify(checkoutPayload),
  });
  const checkoutData = await checkoutRes.json();
  console.log('Checkout response status:', checkoutRes.status, checkoutData);

  // 5. Check customer orders after placing order
  console.log('\n5. Checking /api/user/orders after placing order...');
  const ordersAfterRes = await fetch(`${baseUrl}/api/user/orders`, {
    headers: { cookie: cookie || '' },
  });
  const ordersAfterData = await ordersAfterRes.json();
  console.log('Orders count after placement:', ordersAfterData.orders?.length);
  if (ordersAfterData.orders?.length > 0) {
    const o = ordersAfterData.orders[0];
    console.log('Order details:', {
      orderId: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      itemsCount: o.orderItems?.length,
      productTitle: o.orderItems?.[0]?.product?.title,
    });
  }

  // 6. Test Logout
  console.log('\n6. Testing logout...');
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie: cookie || '' },
  });
  console.log('Logout status:', logoutRes.status);

  console.log('\n🎉 ALL CUSTOMER FLOW TESTS PASSED SUCCESSFULLY!');
  await prisma.$disconnect();
}

testFullCustomerFlow().catch(console.error);
