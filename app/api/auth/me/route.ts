import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  // Get full updated user profile from Prisma
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || 'Client',
        phone: dbUser.phone,
        address: dbUser.address,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
        vendorId: session.vendorId || null,
        storeName: session.storeName || null,
      },
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  }
}
