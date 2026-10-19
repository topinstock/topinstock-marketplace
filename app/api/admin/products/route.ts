import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify, safeJsonParse } from '@/lib/utils';
import { formatDbProduct, CATALOG_CARD_SELECT } from '@/lib/products';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const vendorFilter = searchParams.get('vendorId');
    const q = searchParams.get('q')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Multi-Vendor scoping: Vendors only see their own products!
    if (session.role === 'VENDOR' && session.vendorId) {
      where.vendorId = session.vendorId;
    } else if (session.role === 'ADMIN' && vendorFilter) {
      where.vendorId = vendorFilter;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    const [dbProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: CATALOG_CARD_SELECT,
      }),
      prisma.product.count({ where }),
    ]);

    const products = dbProducts.map(formatDbProduct);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la preluarea produselor.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      brand,
      material,
      warranty,
      weight,
      features,
      sourceUrl,
      categoryId,
      price,
      originalPrice,
      stock = 10,
      sku,
      images = [],
      sizes = [],
      colors = [],
      isPublished = true,
      customVendorId, // Only allowed if ADMIN
    } = body;

    // 1. Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Titlul produsului este obligatoriu.' },
        { status: 400 }
      );
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'Prețul de vânzare trebuie să fie un număr pozitiv.' },
        { status: 400 }
      );
    }

    const numericOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    const numericStock = parseInt(stock, 10) || 0;

    let discountPercentage: number | null = null;
    if (numericOriginalPrice && numericOriginalPrice > numericPrice) {
      discountPercentage = Math.round(
        ((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100
      );
    }

    // 2. Resolve Vendor
    let targetVendorId = session.vendorId;

    if (session.role === 'ADMIN' && customVendorId) {
      targetVendorId = customVendorId;
    }

    if (!targetVendorId) {
      // Find or create default vendor for the admin user
      let vendor = await prisma.vendor.findFirst({
        where: { userId: session.userId },
      });

      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: {
            userId: session.userId,
            storeName: session.storeName || session.name || 'Magazin Oficial',
            slug: slugify(session.storeName || session.name || 'magazin-oficial'),
            isVerified: true,
          },
        });
      }
      targetVendorId = vendor.id;
    }

    // 3. Resolve Category
    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      const defaultCategory = await prisma.category.findFirst();
      if (defaultCategory) {
        targetCategoryId = defaultCategory.id;
      } else {
        const createdCat = await prisma.category.create({
          data: { name: 'General', slug: 'general' },
        });
        targetCategoryId = createdCat.id;
      }
    }

    // 4. Generate unique slug
    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // 5. Ensure at least one image
    const finalImages = Array.isArray(images) && images.length > 0
      ? images
      : ['/images/product_laptop.jpg'];

    const finalSku = sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    // 6. Insert product in SQLite DB
    const createdProduct = await prisma.product.create({
      data: {
        vendorId: targetVendorId,
        categoryId: targetCategoryId,
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || title.trim(),
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        discountPercentage,
        stock: numericStock,
        sku: finalSku,
        images: JSON.stringify(finalImages),
        sizes: JSON.stringify(Array.isArray(sizes) ? sizes : []),
        colors: JSON.stringify(Array.isArray(colors) ? colors : []),
        attributes: JSON.stringify({
          brand: brand?.trim() || null,
          material: material?.trim() || null,
          warranty: warranty?.trim() || null,
          weight: weight?.trim() || null,
          features: Array.isArray(features) ? features : [],
          sourceUrl: sourceUrl || null,
        }),
        rating: 5.0,
        reviewsCount: 0,
        isPublished: isPublished !== false,
      },
      include: {
        vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const formatted = formatDbProduct(createdProduct);

    return NextResponse.json({
      success: true,
      product: formatted,
      message: 'Produsul a fost adăugat cu succes în magazin!',
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la adăugarea produsului.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID-ul produsului este obligatoriu.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produsul nu a fost găsit.' },
        { status: 404 }
      );
    }

    // If VENDOR, make sure they own the product
    if (session.role === 'VENDOR' && product.vendorId !== session.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Nu ai permisiunea de a șterge acest produs.' },
        { status: 403 }
      );
    }

    // Check if product is referenced in existing customer orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderItemsCount > 0) {
      // Archive/Unpublish product so order history and accounting are preserved
      await prisma.product.update({
        where: { id: productId },
        data: {
          isPublished: false,
          stock: 0,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Produsul are comenzi asociate și a fost arhivat (dezactivat din catalog).',
      });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: 'Produsul a fost șters definitiv din magazin.',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la ștergerea produsului.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
      price,
      originalPrice,
      stock,
      title,
      description,
      sku,
      images,
      categoryId,
      vendorId,
      isPublished,
      brand,
      material,
      warranty,
      weight,
      features,
      sizes,
      colors,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID-ul produsului este obligatoriu.' },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produsul nu a fost găsit.' },
        { status: 404 }
      );
    }

    // Authorization check
    if (session.role === 'VENDOR' && existing.vendorId !== session.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Nu ai permisiunea de a edita acest produs.' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (title !== undefined && title.trim()) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (sku !== undefined) {
      updateData.sku = sku ? sku.trim() : null;
    }

    if (images !== undefined) {
      if (Array.isArray(images)) {
        updateData.images = JSON.stringify(images.filter((img) => typeof img === 'string' && img.trim()));
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          updateData.images = JSON.stringify(Array.isArray(parsed) ? parsed : [images]);
        } catch {
          updateData.images = JSON.stringify([images]);
        }
      }
    }

    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return NextResponse.json(
          { success: false, error: 'Prețul trebuie să fie un număr pozitiv.' },
          { status: 400 }
        );
      }
      updateData.price = Math.round(numPrice * 100) / 100;
    }

    if (originalPrice !== undefined) {
      if (originalPrice === null || originalPrice === '') {
        updateData.originalPrice = null;
        updateData.discountPercentage = null;
      } else {
        const numOrig = parseFloat(originalPrice);
        if (!isNaN(numOrig) && numOrig > 0) {
          updateData.originalPrice = Math.round(numOrig * 100) / 100;
          const currentPrice = updateData.price !== undefined ? updateData.price : existing.price;
          if (numOrig > currentPrice) {
            updateData.discountPercentage = Math.round(((numOrig - currentPrice) / numOrig) * 100);
          } else {
            updateData.discountPercentage = null;
          }
        }
      }
    } else if (updateData.price !== undefined && existing.originalPrice) {
      // Recalculate discount if only selling price changed
      if (existing.originalPrice > updateData.price) {
        updateData.discountPercentage = Math.round(
          ((existing.originalPrice - updateData.price) / existing.originalPrice) * 100
        );
      } else {
        updateData.discountPercentage = null;
      }
    }

    if (stock !== undefined) {
      const numStock = parseInt(stock, 10);
      if (!isNaN(numStock) && numStock >= 0) {
        updateData.stock = numStock;
      }
    }

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
    }

    if (categoryId !== undefined && categoryId) {
      updateData.categoryId = categoryId;
    }

    if (session.role === 'ADMIN' && vendorId) {
      updateData.vendorId = vendorId;
    }

    if (sizes !== undefined) {
      updateData.sizes = JSON.stringify(Array.isArray(sizes) ? sizes : []);
    }

    if (colors !== undefined) {
      updateData.colors = JSON.stringify(Array.isArray(colors) ? colors : []);
    }

    if (
      brand !== undefined ||
      material !== undefined ||
      warranty !== undefined ||
      weight !== undefined ||
      features !== undefined
    ) {
      const existingAttrs = safeJsonParse<any>(existing.attributes, {});
      const mergedAttrs = {
        ...existingAttrs,
        ...(brand !== undefined ? { brand: brand ? brand.trim() : null } : {}),
        ...(material !== undefined ? { material: material ? material.trim() : null } : {}),
        ...(warranty !== undefined ? { warranty: warranty ? warranty.trim() : null } : {}),
        ...(weight !== undefined ? { weight: weight ? weight.trim() : null } : {}),
        ...(features !== undefined ? { features: Array.isArray(features) ? features : [] } : {}),
      };
      updateData.attributes = JSON.stringify(mergedAttrs);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const formatted = formatDbProduct(updated);

    return NextResponse.json({
      success: true,
      product: formatted,
      message: 'Produsul a fost actualizat cu succes!',
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Eroare la actualizarea produsului.' },
      { status: 500 }
    );
  }
}
