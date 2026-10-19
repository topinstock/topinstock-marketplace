import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  validatePromoCode,
  calculateOrderFinancials,
  sanitizeText,
} from '@/lib/security';

// ============================================
//   POST /api/cart/validate — Server-Side Cart & Stock Validator
//   - Verifies live database prices (prevents client-side price tampering)
//   - Verifies real-time stock availability
//   - Validates promo codes against expiry & minimum order thresholds
//   - Calculates exact Subtotal, TVA (19%), Delivery fee, and Grand Total
// ============================================

export const dynamic = 'force-dynamic';

interface CartValidatePayload {
  items: Array<{
    productId: string;
    quantity: number;
    title?: string;
  }>;
  promoCode?: string;
}

export async function POST(request: Request) {
  try {
    const body: CartValidatePayload = await request.json();
    const { items = [], promoCode } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        hasOutOfStock: false,
        outOfStockItems: [],
        financials: calculateOrderFinancials(0),
        promo: { isValid: false, discountAmount: 0, message: '' },
      });
    }

    // 1. Fetch live product data from database
    const productIds = items
      .map((i) => (typeof i.productId === 'string' ? i.productId.trim() : ''))
      .filter(Boolean);

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        isPublished: true,
        images: true,
      },
    });

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    let serverSubtotal = 0;
    const validatedItems = [];
    const outOfStockItems = [];

    for (const item of items) {
      const cleanQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
      const dbProd = dbProductMap.get(item.productId);

      if (!dbProd || !dbProd.isPublished) {
        outOfStockItems.push({
          productId: item.productId,
          title: item.title || 'Produs indisponibil',
          reason: 'Produsul nu mai există în catalog sau este retras din vânzare.',
          requestedQuantity: cleanQty,
          availableStock: 0,
        });
        continue;
      }

      const verifiedPrice = Number(dbProd.price) || 0;
      const isAvailable = dbProd.stock >= cleanQty;

      if (!isAvailable) {
        outOfStockItems.push({
          productId: dbProd.id,
          title: dbProd.title,
          reason:
            dbProd.stock <= 0
              ? 'Produsul este epuizat din stoc.'
              : `Stoc insuficient: sunt disponibile doar ${dbProd.stock} bucăți (ați solicitat ${cleanQty}).`,
          requestedQuantity: cleanQty,
          availableStock: dbProd.stock,
        });
      }

      const itemTotal = verifiedPrice * cleanQty;
      serverSubtotal += itemTotal;

      validatedItems.push({
        productId: dbProd.id,
        title: dbProd.title,
        price: verifiedPrice,
        quantity: cleanQty,
        stock: dbProd.stock,
        inStock: dbProd.stock >= cleanQty,
        itemSubtotal: Math.round(itemTotal * 100) / 100,
      });
    }

    // 2. Validate Promo Code
    const cleanPromo = promoCode ? sanitizeText(promoCode, 30).toUpperCase() : '';
    const promoResult = cleanPromo
      ? validatePromoCode(cleanPromo, serverSubtotal)
      : { isValid: false, discountAmount: 0, freeShipping: false, message: '' };

    // 3. Strict financial & TVA breakdown
    const financials = calculateOrderFinancials(
      serverSubtotal,
      promoResult.discountAmount,
      promoResult.freeShipping
    );

    return NextResponse.json({
      success: true,
      items: validatedItems,
      hasOutOfStock: outOfStockItems.length > 0,
      outOfStockItems,
      financials,
      promo: {
        isValid: promoResult.isValid,
        code: promoResult.code || null,
        discountAmount: promoResult.discountAmount,
        freeShipping: promoResult.freeShipping,
        message: promoResult.message,
      },
    });
  } catch (error: any) {
    console.error('Cart validation error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la validarea coșului.' },
      { status: 500 }
    );
  }
}
