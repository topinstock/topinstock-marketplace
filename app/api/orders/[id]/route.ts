import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID-ul comenzii este obligatoriu.' },
        { status: 400 }
      );
    }

    // Attempt to locate order by id or by order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { id: { endsWith: id.replace(/^ts-/i, '').toLowerCase() } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                price: true,
              },
            },
            vendor: {
              select: {
                id: true,
                storeName: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Comanda nu a fost găsită.' },
        { status: 404 }
      );
    }

    // Parse shipping address payload
    const shipping = safeJsonParse<any>(order.shippingAddress, {});

    // Format items
    const items = order.orderItems.map((oi) => {
      let image = '/images/product_laptop.jpg';
      if (oi.product?.images) {
        if (Array.isArray(oi.product.images)) {
          image = oi.product.images[0] || image;
        } else if (typeof oi.product.images === 'string') {
          const parsed = safeJsonParse<string[]>(oi.product.images, []);
          image = parsed[0] || image;
        }
      }

      return {
        id: oi.id,
        productId: oi.productId,
        title: oi.product?.title || 'Produs comandat',
        price: Number(oi.price) || 0,
        quantity: oi.quantity,
        vendorName: oi.vendor?.storeName || 'Magazin Oficial',
        image,
        slug: oi.product?.slug || '',
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = Number(shipping.deliveryFee) || 19;
    const orderNumber = `TS-${order.id.slice(-6).toUpperCase()}`;

    const formattedOrder = {
      id: order.id,
      orderId: order.id,
      orderNumber,
      status: order.status,
      date: order.createdAt.toISOString(),
      customer: {
        fullName: shipping.fullName || order.user?.name || 'Client TOPinStock',
        email: shipping.email || order.user?.email || '',
        phone: shipping.phone || order.user?.phone || '',
        county: shipping.county || 'România',
        city: shipping.city || '',
        address: shipping.address || order.user?.address || '',
        notes: shipping.notes || '',
      },
      paymentMethod: order.paymentMethod === 'CARD_ONLINE' ? 'card' : 'ramburs',
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      grandTotal: Number(order.totalAmount) || Math.round((subtotal + deliveryFee) * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error: any) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la preluarea comenzii.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status invalid.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Comanda nu a fost găsită.' },
        { status: 404 }
      );
    }

    // If VENDOR, verify they own at least one item in the order
    if (session.role === 'VENDOR') {
      const ownsItem = order.orderItems.some(
        (it) => it.vendorId === session.vendorId
      );
      if (!ownsItem) {
        return NextResponse.json(
          { success: false, error: 'Nu ai acces la această comandă.' },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Statusul comenzii a fost actualizat la ${status}.`,
      order: updated,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la actualizarea comenzii.' },
      { status: 500 }
    );
  }
}

