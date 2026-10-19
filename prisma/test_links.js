const baseUrl = 'http://localhost:3000';

async function checkRoute(path) {
  try {
    const res = await fetch(`${baseUrl}${path}`);
    return { path, status: res.status, ok: res.status === 200 };
  } catch (err) {
    return { path, status: 'ERROR', error: err.message, ok: false };
  }
}

async function runLinkCheck() {
  console.log('--- Verificare Link-uri TopinStock ---');

  // Core navigation routes
  const mainRoutes = [
    '/',
    '/produse',
    '/cos',
    '/checkout',
    '/favorite',
    '/cont',
    '/cont/autentificare',
    '/vanzator',
    '/vanzator/login',
  ];

  // Footer links
  const footerRoutes = [
    '/despre',
    '/ajutor',
    '/ajutor/cum-cumpar',
    '/ajutor/livrare',
    '/ajutor/returnuri',
    '/ajutor/plata',
    '/termeni',
    '/confidentialitate',
    '/cookies',
  ];

  // Category filter routes
  const categoryRoutes = [
    '/produse?category=bucatarie-menaj',
    '/produse?category=electrocasnice',
    '/produse?category=copii-jucarii',
    '/produse?category=electronice-gadgeturi',
    '/produse?category=casa-gradina',
    '/produse?category=sanatate-frumusete',
    '/produse?category=moda-accesorii',
    '/produse?category=auto-bricolaj',
  ];

  console.log('\n1. Verificare rute principale:');
  for (const route of mainRoutes) {
    const result = await checkRoute(route);
    console.log(`[${result.status}] ${result.path}`);
  }

  console.log('\n2. Verificare rute categorii:');
  for (const route of categoryRoutes) {
    const result = await checkRoute(route);
    console.log(`[${result.status}] ${result.path}`);
  }

  console.log('\n3. Verificare link-uri footer:');
  for (const route of footerRoutes) {
    const result = await checkRoute(route);
    console.log(`[${result.status}] ${result.path}`);
  }

  // Check product page
  console.log('\n4. Verificare produs din DB:');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({ take: 3 });
  for (const p of products) {
    const res = await checkRoute(`/produse/${p.slug}`);
    console.log(`[${res.status}] /produse/${p.slug} (${p.title.slice(0, 40)}...)`);
  }

  await prisma.$disconnect();
}

runLinkCheck().catch(console.error);
