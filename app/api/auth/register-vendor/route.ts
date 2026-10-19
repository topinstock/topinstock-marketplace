import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie, getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    // Only authenticated Super-Admin can register new vendors
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Înregistrarea publică a vânzătorilor este restricționată. Doar administratorul TOPinStock poate crea noi magazine.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storeName, email, password, name, phone, description } = body;

    if (!storeName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Numele magazinului este obligatoriu.' },
        { status: 400 }
      );
    }

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Adresa de email este invalidă.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Parola trebuie să aibă minim 6 caractere.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un cont cu această adresă de email există deja.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    let baseSlug = slugify(storeName);
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.vendor.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Create User + Vendor in single transaction
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name?.trim() || storeName.trim(),
        role: 'VENDOR',
        vendor: {
          create: {
            storeName: storeName.trim(),
            slug,
            description: description?.trim() || `Magazin partener ${storeName.trim()}`,
            isVerified: true, // Auto-verified for seamless testing
            rating: 5.0,
            commissionRate: 0.12,
          },
        },
      },
      include: { vendor: true },
    });

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name || storeName,
      role: 'VENDOR' as const,
      vendorId: user.vendor?.id || null,
      storeName: user.vendor?.storeName || storeName,
    };

    await setSessionCookie(sessionData);

    return NextResponse.json({
      success: true,
      user: sessionData,
      message: 'Contul de vânzător a fost creat cu succes!',
    });
  } catch (error) {
    console.error('Register vendor error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la crearea contului de vânzător.' },
      { status: 500 }
    );
  }
}
