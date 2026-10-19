const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const CATALOG_CARD_SELECT = {
  id: true,
  vendorId: true,
  categoryId: true,
  title: true,
  slug: true,
  price: true,
  originalPrice: true,
  discountPercentage: true,
  stock: true,
  sku: true,
  images: true,
  sizes: true,
  colors: true,
  attributes: true,
  rating: true,
  reviewsCount: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  vendor: {
    select: { id: true, storeName: true, slug: true, isVerified: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
};

function formatDbProduct(raw) {
  const price = Number(raw.price) || 0;
  const originalPrice = raw.originalPrice != null ? Number(raw.originalPrice) : null;
  let discountPercentage = raw.discountPercentage;
  if (discountPercentage == null && originalPrice && originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  let images = [];
  try {
    images = typeof raw.images === 'string' ? JSON.parse(raw.images) : (raw.images || []);
  } catch (e) {
    images = ['/images/product_laptop.jpg'];
  }

  let sizes = [];
  try {
    sizes = typeof raw.sizes === 'string' ? JSON.parse(raw.sizes) : (raw.sizes || []);
  } catch (e) {
    sizes = [];
  }

  let colors = [];
  try {
    colors = typeof raw.colors === 'string' ? JSON.parse(raw.colors) : (raw.colors || []);
  } catch (e) {
    colors = [];
  }

  let attributes = null;
  try {
    attributes = typeof raw.attributes === 'string' ? JSON.parse(raw.attributes) : raw.attributes;
  } catch (e) {
    attributes = null;
  }

  return {
    ...raw,
    description: raw.description || '',
    price,
    originalPrice,
    discountPercentage,
    images: images && images.length > 0 ? images : ['/images/product_laptop.jpg'],
    sizes,
    colors,
    attributes,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt || Date.now()),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt : new Date(raw.updatedAt || Date.now()),
  };
}

async function extract() {
  const baseWhere = {
    isPublished: true,
    stock: { gt: 0 },
    price: { gt: 0 },
    NOT: {
      category: {
        slug: { contains: 'engross' },
      },
    },
  };

  const rawSec1 = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: [
        {
          category: {
            slug: {
              in: [
                'brazi-de-craciun',
                'decoratiuni-de-craciun',
                'turturi-franjuri',
                'instalatii-si-figurine-craciun',
                'instalatii-de-craciun',
                'instalatii-cu-baterii',
                'instalatii-220v',
                'beteala-craciun',
                'proiectoare-craciun',
              ],
            },
          },
        },
        { title: { contains: 'Brad' } },
        { title: { contains: 'Instalație' } },
        { title: { contains: 'Instalatie' } },
        { title: { contains: 'lumini' } },
      ],
    },
    take: 8,
    orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }],
    select: CATALOG_CARD_SELECT,
  });

  const rawSec2 = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: [
        {
          category: {
            slug: {
              in: [
                'oale',
                'oale-sub-presiune',
                'cratite',
                'tavi-si-forme-copt',
                'masini-de-tocat-carne',
                'mixer-si-set-de-mixere',
                'tigai',
                'roboti-de-bucatarie',
              ],
            },
          },
        },
        { title: { contains: 'tocat carne' } },
        { title: { contains: 'oala' } },
        { title: { contains: 'cratita' } },
        { title: { contains: 'tigaie' } },
      ],
    },
    take: 8,
    orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }],
    select: CATALOG_CARD_SELECT,
  });

  const rawSec3 = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: [
        {
          category: {
            slug: {
              in: [
                'jucarii-si-jocuri',
                'jucarii-bebelusi',
                'papusi-si-accesorii',
                'masinute-si-vehicule',
                'jocuri-creative',
                'jocuri-de-societate-si-puzzle-uri',
                'seturi-de-constructie',
                'jucarii-interactive-si-robotica',
              ],
            },
          },
        },
        { title: { contains: 'jucarie' } },
        { title: { contains: 'masinuta' } },
        { title: { contains: 'copii' } },
      ],
    },
    take: 8,
    orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }],
    select: CATALOG_CARD_SELECT,
  });

  const rawSec4 = await prisma.product.findMany({
    where: {
      ...baseWhere,
      OR: [
        {
          category: {
            slug: {
              in: [
                'calorifere-tip-panou',
                'aeroterme',
                'radiatoare',
                'incalzitoare',
                'expresoare-si-cafetiere',
                'fierbatoare-si-termose',
              ],
            },
          },
        },
        { title: { contains: 'incalzitor' } },
        { title: { contains: 'calorifer' } },
        { title: { contains: 'aeroterma' } },
        { title: { contains: 'cafetiera' } },
      ],
    },
    take: 8,
    orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }],
    select: CATALOG_CARD_SELECT,
  });

  const sec1 = rawSec1.map(formatDbProduct);
  const sec2 = rawSec2.map(formatDbProduct);
  const sec3 = rawSec3.map(formatDbProduct);
  const sec4 = rawSec4.map(formatDbProduct);

  console.log({
    sec1: sec1.length,
    sec2: sec2.length,
    sec3: sec3.length,
    sec4: sec4.length,
  });

  const outPath = path.join(__dirname, '..', 'lib', 'data', 'seasonal_fallback.json');
  fs.writeFileSync(outPath, JSON.stringify({ sec1, sec2, sec3, sec4 }, null, 2));
  console.log('Saved fallback to:', outPath);
  await prisma.$disconnect();
}

extract().catch(console.error);
