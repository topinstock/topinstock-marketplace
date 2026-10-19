import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { slugify } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      cui,
      storeName,
      category,
      email,
      phone,
    } = body;

    if (!companyName?.trim() || !cui?.trim() || !storeName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Toate câmpurile obligatorii marcate cu * trebuie completate.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    let existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { vendor: true },
    });

    if (existingUser?.vendor) {
      return NextResponse.json(
        { success: false, error: 'Există deja o cerere sau un magazin înregistrat cu această adresă de email.' },
        { status: 409 }
      );
    }

    const defaultPassword = await bcrypt.hash('partener123', 10);
    let baseSlug = slugify(storeName);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.vendor.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    let userId = existingUser?.id;

    if (!userId) {
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash: defaultPassword,
          name: companyName.trim(),
          phone: phone?.trim(),
          role: 'VENDOR',
        },
      });
      userId = newUser.id;
    }

    // Create vendor application in PENDING status for Admin review
    const newVendor = await prisma.vendor.create({
      data: {
        userId,
        storeName: storeName.trim(),
        slug,
        description: `Magazin partener specializat în ${category || 'produse generale'}.`,
        legalName: companyName.trim(),
        cui: cui.trim().toUpperCase(),
        phone: phone?.trim() || null,
        status: 'PENDING',
        isVerified: false,
        commissionRate: 0.0,
        rating: 5.0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cererea de parteneriat a fost înregistrată cu succes!',
      vendorId: newVendor.id,
    });
  } catch (error) {
    console.error('Vendor apply error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la trimiterea cererii de parteneriat.' },
      { status: 500 }
    );
  }
}
