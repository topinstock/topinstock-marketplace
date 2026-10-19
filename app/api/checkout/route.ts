import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from '@/lib/email';
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  validatePromoCode,
  calculateOrderFinancials,
  FLAT_DELIVERY_FEE,
  MINIMUM_ORDER_AMOUNT,
} from '@/lib/security';

// ============================================
//   POST /api/checkout — Secure Order Processing API
//   - Strict Server-Side Price & Stock Verification (no client price tampering)
//   - Atomic conditional stock decrement inside ACID Prisma transaction (Anti-Race-Condition)
//   - Promo code validation with expiry and minimum purchase rules
//   - Accurate financial calculations with Romanian 19% TVA breakdown
//   - Complete input sanitization against XSS & injection attacks
// ============================================

export const dynamic = 'force-dynamic';

interface CheckoutItemPayload {
  productId: string;
  title?: string;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CheckoutPayload {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shipping: {
    county: string;
    city: string;
    address: string;
    notes?: string;
  };
  paymentMethod: 'ramburs' | 'card';
  items: CheckoutItemPayload[];
  promoCode?: string;
}

export async function POST(request: Request) {
  try {
    const body: CheckoutPayload = await request.json();
    const { customer, shipping, paymentMethod, items, promoCode } = body;

    // ── 1. Strict Input Sanitization & Validation (XSS & Injection Protection) ──
    const cleanFullName = sanitizeText(customer?.fullName, 100);
    const cleanEmail = sanitizeEmail(customer?.email);
    const cleanPhone = sanitizePhone(customer?.phone);
    const cleanCounty = sanitizeText(shipping?.county, 50);
    const cleanCity = sanitizeText(shipping?.city, 60);
    const cleanAddress = sanitizeText(shipping?.address, 250);
    const cleanNotes = sanitizeText(shipping?.notes, 300);

    if (!cleanFullName || cleanFullName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Vă rugăm să introduceți numele și prenumele complet.' },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'Vă rugăm să introduceți o adresă de email validă.' },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Vă rugăm să introduceți un număr de telefon valid (minim 8 cifre).' },
        { status: 400 }
      );
    }

    if (!cleanCounty || !cleanCity || !cleanAddress) {
      return NextResponse.json(
        { success: false, error: 'Județul, orașul și adresa de livrare sunt obligatorii.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Coșul de cumpărături este gol.' },
        { status: 400 }
      );
    }

    // ── 2. Server-Side Price & Stock Verification (Never Trust Client Prices) ──
    const productIds = items
      .map((i) => (typeof i.productId === 'string' ? i.productId.trim() : ''))
      .filter(Boolean);

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        isPublished: true,
        vendorId: true,
      },
    });

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    interface VerifiedItem {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      vendorId: string;
      size?: string;
      color?: string;
      image?: string;
    }

    const verifiedItems: VerifiedItem[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const dbProd = dbProductMap.get(item.productId);
      const cleanQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));

      if (!dbProd || !dbProd.isPublished) {
        return NextResponse.json(
          {
            success: false,
            error: `Produsul "${item.title || item.productId}" nu mai este disponibil în stoc sau a fost retras din catalog.`,
          },
          { status: 400 }
        );
      }

      if (dbProd.stock < cleanQty) {
        return NextResponse.json(
          {
            success: false,
            error:
              dbProd.stock <= 0
                ? `Produsul "${dbProd.title}" este epuizat din stoc.`
                : `Stoc insuficient pentru "${dbProd.title}". Sunt disponibile doar ${dbProd.stock} bucăți (ați solicitat ${cleanQty}).`,
          },
          { status: 400 }
        );
      }

      // Use strictly database price!
      const realPrice = Number(dbProd.price) || 0;
      serverSubtotal += realPrice * cleanQty;

      verifiedItems.push({
        productId: dbProd.id,
        title: dbProd.title,
        price: realPrice,
        quantity: cleanQty,
        vendorId: dbProd.vendorId,
        size: item.size ? sanitizeText(item.size, 20) : undefined,
        color: item.color ? sanitizeText(item.color, 20) : undefined,
        image: item.image,
      });
    }

    // ── 2.1 Enforce Minimum Order Amount (50 LEI) ──
    const marketplaceSettings = await prisma.marketplaceSettings.findUnique({
      where: { id: 'default' },
      select: { orderMinimumAmount: true },
    });
    const effectiveMinOrder =
      marketplaceSettings?.orderMinimumAmount && marketplaceSettings.orderMinimumAmount > 0
        ? marketplaceSettings.orderMinimumAmount
        : MINIMUM_ORDER_AMOUNT;

    if (serverSubtotal < effectiveMinOrder) {
      const diff = Math.round((effectiveMinOrder - serverSubtotal) * 100) / 100;
      return NextResponse.json(
        {
          success: false,
          error: `Comanda minimă pe TOPinStock este de ${effectiveMinOrder} LEI. Valoarea produselor din coș este de ${serverSubtotal.toFixed(2)} LEI. Vă rugăm să mai adăugați produse în valoare de minim ${diff.toFixed(2)} LEI pentru a putea trimite comanda.`,
        },
        { status: 400 }
      );
    }

    // ── 3. Server-Side Promo Code & Financial Calculations ──
    const cleanPromo = promoCode ? sanitizeText(promoCode, 30).toUpperCase() : '';
    let promoResult = { isValid: false, discountAmount: 0, freeShipping: false, message: '' };

    if (cleanPromo) {
      promoResult = validatePromoCode(cleanPromo, serverSubtotal);
      if (!promoResult.isValid) {
        return NextResponse.json(
          { success: false, error: promoResult.message || 'Cod promoțional invalid sau expirat.' },
          { status: 400 }
        );
      }
    }

    const financials = calculateOrderFinancials(
      serverSubtotal,
      promoResult.discountAmount,
      promoResult.freeShipping
    );

    // ── 4. Link or Create User Account ──
    const session = await getSession();
    let user = session?.userId
      ? await prisma.user.findUnique({ where: { id: session.userId } })
      : await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanFullName,
          phone: cleanPhone,
          address: `${cleanCity}, ${cleanAddress}`,
          role: 'CUSTOMER',
        },
      });
    }

    // Default vendor fallback if needed
    let defaultVendor = await prisma.vendor.findFirst();
    if (!defaultVendor) {
      defaultVendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName: 'Magazin Oficial',
          slug: 'magazin-oficial',
          isVerified: true,
        },
      });
    }

    // ── 5. Prepare Shipping & Financial Metadata ──
    const shippingAddressPayload = {
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      county: cleanCounty,
      city: cleanCity,
      address: cleanAddress,
      notes: cleanNotes,
      deliveryFee: financials.deliveryFee,
      subtotal: financials.subtotal,
      discountAmount: financials.discountAmount,
      promoCode: cleanPromo || null,
      taxBase: financials.taxBase,
      vatAmount: financials.vatAmount,
      totalAmount: financials.totalAmount,
      itemsCount: verifiedItems.reduce((sum, i) => sum + i.quantity, 0),
    };

    // ── 6. ACID Transaction with Atomic Anti-Race-Condition Stock Decrement ──
    const order = await prisma.$transaction(async (tx) => {
      // Step A: Decrement stock atomically with condition: stock >= requested quantity
      for (const item of verifiedItems) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            isPublished: true,
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          // Race condition occurred! Another user just purchased the last item!
          const liveProduct = await tx.product.findUnique({
            where: { id: item.productId },
            select: { title: true, stock: true },
          });

          const currentStock = liveProduct?.stock ?? 0;
          if (currentStock <= 0) {
            throw new Error(`Produsul "${item.title}" s-a epuizat din stoc în timp ce finalizați comanda.`);
          } else {
            throw new Error(
              `Stoc insuficient pentru "${item.title}". Mai sunt doar ${currentStock} buc. în stoc (ați solicitat ${item.quantity}).`
            );
          }
        }
      }

      // Step B: Create OrderItem records with VERIFIED database prices
      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = verifiedItems.map((item) => ({
        product: { connect: { id: item.productId } },
        vendor: { connect: { id: item.vendorId || defaultVendor.id } },
        price: item.price, // Verified database price
        quantity: item.quantity,
        status: 'PENDING',
      }));

      // Step C: Create Order Record
      return tx.order.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          totalAmount: financials.totalAmount,
          shippingAddress: JSON.stringify(shippingAddressPayload),
          paymentMethod: paymentMethod === 'card' ? 'CARD_ONLINE' : 'RAMBURS_CURIER',
          orderItems: { create: orderItemsData },
        },
      });
    });

    const orderNumber = `TS-${order.id.slice(-6).toUpperCase()}`;

    // ── 7. Async Confirmation Email & Admin Alert ──
    sendOrderConfirmationEmail({
      orderId: order.id,
      orderNumber,
      customer: {
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
      },
      shipping: {
        county: cleanCounty,
        city: cleanCity,
        address: cleanAddress,
        notes: cleanNotes,
      },
      paymentMethod,
      items: verifiedItems.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        image: i.image,
      })),
      totalAmount: financials.totalAmount,
      deliveryFee: financials.deliveryFee,
    }).catch((err) => console.error('Eroare trimitere email confirmare:', err));

    sendAdminOrderAlert({
      orderId: order.id,
      orderNumber,
      customer: {
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
      },
      shipping: {
        county: cleanCounty,
        city: cleanCity,
        address: cleanAddress,
        notes: cleanNotes,
      },
      paymentMethod,
      items: verifiedItems.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        image: i.image,
      })),
      totalAmount: financials.totalAmount,
    }).catch((err) => console.error('Eroare trimitere alerta admin:', err));

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      totalAmount: financials.totalAmount,
      subtotal: financials.subtotal,
      deliveryFee: financials.deliveryFee,
      discountAmount: financials.discountAmount,
      vatAmount: financials.vatAmount,
      taxBase: financials.taxBase,
      status: order.status,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'A apărut o problemă la procesarea comenzii. Vă rugăm să încercați din nou.',
      },
      { status: 400 }
    );
  }
}
