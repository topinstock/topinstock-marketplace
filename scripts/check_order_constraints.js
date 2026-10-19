const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  const orderCount = await prisma.order.count();
  const orderItemCount = await prisma.orderItem.count();
  const oosCount = await prisma.product.count({ where: { stock: { lte: 0 } } });

  // Check if any orderItem references an out of stock product
  const oosInOrders = await prisma.orderItem.count({
    where: {
      product: {
        stock: { lte: 0 }
      }
    }
  });

  console.log({
    totalOrders: orderCount,
    totalOrderItems: orderItemCount,
    outOfStockProducts: oosCount,
    oosProductsInOrders: oosInOrders
  });

  await prisma.$disconnect();
}

checkOrders().catch(console.error);
