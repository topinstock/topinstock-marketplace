const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const users = await prisma.user.findMany({ include: { vendor: true } });
  console.log('=== USERS ===');
  console.log(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, vendor: u.vendor?.storeName, vendorSlug: u.vendor?.slug })));

  const vendors = await prisma.vendor.findMany({ select: { id: true, storeName: true, slug: true, cui: true, status: true, userId: true, _count: { select: { products: true } } } });
  console.log('=== VENDORS ===');
  console.log(vendors);

  const ordersCount = await prisma.order.count();
  const orderItemsCount = await prisma.orderItem.count();
  console.log('=== ORDERS ===');
  console.log({ ordersCount, orderItemsCount });
}

inspect().finally(() => prisma.$disconnect());
