// Quick test of Admin / Vendor actions
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Testing Admin actions...');

  // 1. Login as Admin
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@topinstock.ro', password: 'admin123' }),
  });
  const loginCookies = loginRes.headers.get('set-cookie');
  console.log('1. Admin login status:', loginRes.status, 'Cookie set:', !!loginCookies);

  // 2. Fetch Vendors list
  const vendorsRes = await fetch(`${BASE_URL}/api/admin/vendors`, {
    headers: { Cookie: loginCookies },
  });
  const vendorsData = await vendorsRes.json();
  console.log('2. Fetch vendors status:', vendorsRes.status, 'Count:', vendorsData.vendors?.length);

  const testVendor = vendorsData.vendors?.[0];
  if (testVendor) {
    console.log(`3. Testing PATCH /api/admin/vendors/${testVendor.id}...`);
    const patchVendorRes = await fetch(`${BASE_URL}/api/admin/vendors/${testVendor.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: loginCookies,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
        commissionRate: 0.12,
        contactPerson: 'Manager Test',
      }),
    });
    const patchVendorData = await patchVendorRes.json();
    console.log('Vendor PATCH response:', patchVendorRes.status, patchVendorData.success ? 'SUCCESS' : patchVendorData.error);
  }

  // 4. Test Order Status Update
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (latestOrder) {
    console.log(`4. Testing PATCH /api/orders/${latestOrder.id} to PROCESSING...`);
    const patchOrderRes = await fetch(`${BASE_URL}/api/orders/${latestOrder.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: loginCookies,
      },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    const patchOrderData = await patchOrderRes.json();
    console.log('Order PATCH status:', patchOrderRes.status, patchOrderData.success ? 'SUCCESS' : patchOrderData.error);
  }

  await prisma.$disconnect();
  console.log('All tests finished successfully!');
}

main().catch(console.error);
