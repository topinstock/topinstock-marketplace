const baseUrl = 'http://localhost:3000';

async function testAdminRoutes() {
  console.log('Testing Admin Login and all Admin Dashboard Routes...');

  // 1. Login as Admin
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@topinstock.ro', password: 'admin123' }),
  });

  const loginData = await loginRes.json();
  const sessionCookie = loginRes.headers.get('set-cookie');
  console.log(`[Status ${loginRes.status}] Login Admin:`, loginData.success ? 'Succes' : loginData.error);
  console.log(`Session Cookie:`, !!sessionCookie);

  if (!sessionCookie) {
    console.error('No cookie received!');
    return;
  }

  const adminRoutes = [
    '/admin',
    '/admin/importer',
    '/admin/produse/nou',
    '/admin/comenzi',
    '/admin/vanzatori',
    '/admin/firma',
    '/admin/finante',
  ];

  for (const r of adminRoutes) {
    const res = await fetch(`${baseUrl}${r}`, {
      headers: { cookie: sessionCookie },
    });
    console.log(`[Status ${res.status}] ${r}`);
  }
}

testAdminRoutes().catch(console.error);
