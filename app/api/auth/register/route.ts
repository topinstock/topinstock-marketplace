import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, address } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Introduceți o adresă de email validă.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Parola trebuie să aibă cel puțin 6 caractere.' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Introduceți numele dumneavoastră complet.' },
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
        { success: false, error: 'Există deja un cont înregistrat cu această adresă de email. Vă rugăm să vă autentificați.' },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        role: 'CUSTOMER',
      },
    });

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || 'Client',
      role: 'CUSTOMER' as const,
      vendorId: null,
      storeName: null,
    };

    // Set HTTP-only session cookie
    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
      message: `Contul a fost creat cu succes! Bun venit, ${user.name}!`,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o problemă la înregistrare. Vă rugăm să încercați din nou.' },
      { status: 500 }
    );
  }
}
