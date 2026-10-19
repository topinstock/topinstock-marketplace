import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat. Vă rugăm să vă autentificați.' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la preluarea comenzilor.' },
      { status: 500 }
    );
  }
}
