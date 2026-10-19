import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acces interzis. Rolul de administrator este necesar.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
        orderItems: {
          select: {
            price: true,
            quantity: true,
            status: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vânzătorul nu a fost găsit.' },
        { status: 404 }
      );
    }

    const totalSales = vendor.orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        userId: vendor.userId,
        storeName: vendor.storeName,
        slug: vendor.slug,
        description: vendor.description,
        rating: vendor.rating,
        isVerified: vendor.isVerified,
        commissionRate: vendor.commissionRate,
        legalName: vendor.legalName || 'Nespecificat',
        cui: vendor.cui || 'Nespecificat',
        regCom: vendor.regCom || 'Nespecificat',
        iban: vendor.iban || 'Nespecificat',
        bank: vendor.bank || 'Nespecificat',
        legalAddress: vendor.legalAddress || 'Nespecificat',
        contactPerson: vendor.contactPerson || vendor.user?.name || 'Nespecificat',
        phone: vendor.phone || vendor.user?.phone || 'Nespecificat',
        email: vendor.user?.email || 'Nespecificat',
        status: vendor.status || (vendor.isVerified ? 'ACTIVE' : 'PENDING'),
        productsCount: vendor._count.products,
        totalSales,
        createdAt: vendor.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la obținerea detaliilor vânzătorului.' },
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
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acces interzis. Rolul de administrator este necesar.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: 'Vânzătorul specificat nu există.' },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};

    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
      if (body.status === 'ACTIVE') {
        dataToUpdate.isVerified = true;
      } else if (body.status === 'SUSPENDED') {
        dataToUpdate.isVerified = false;
      }
    }

    if (body.isVerified !== undefined) {
      dataToUpdate.isVerified = Boolean(body.isVerified);
    }

    if (body.commissionRate !== undefined) {
      const parsedComm = parseFloat(body.commissionRate);
      if (!isNaN(parsedComm)) {
        dataToUpdate.commissionRate = parsedComm;
      }
    }

    if (body.storeName !== undefined) dataToUpdate.storeName = body.storeName.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description?.trim() || null;
    if (body.legalName !== undefined) dataToUpdate.legalName = body.legalName?.trim() || null;
    if (body.cui !== undefined) dataToUpdate.cui = body.cui?.trim()?.toUpperCase() || null;
    if (body.regCom !== undefined) dataToUpdate.regCom = body.regCom?.trim() || null;
    if (body.iban !== undefined) dataToUpdate.iban = body.iban?.trim()?.toUpperCase() || null;
    if (body.bank !== undefined) dataToUpdate.bank = body.bank?.trim() || null;
    if (body.legalAddress !== undefined) dataToUpdate.legalAddress = body.legalAddress?.trim() || null;
    if (body.contactPerson !== undefined) dataToUpdate.contactPerson = body.contactPerson?.trim() || null;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone?.trim() || null;

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Datele vânzătorului au fost actualizate cu succes.',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la salvarea modificărilor vânzătorului.' },
      { status: 500 }
    );
  }
}
