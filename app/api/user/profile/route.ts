import { NextResponse } from 'next/server';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, address, currentPassword, newPassword } = body;

    const dataToUpdate: any = {};
    if (name && name.trim().length >= 2) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone?.trim() || null;
    if (address !== undefined) dataToUpdate.address = address?.trim() || null;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Introduceți parola curentă pentru a o putea schimba.' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!existingUser || !existingUser.passwordHash) {
        return NextResponse.json(
          { success: false, error: 'Utilizatorul nu a fost găsit.' },
          { status: 404 }
        );
      }

      const isValid = await verifyPassword(currentPassword, existingUser.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Parola curentă este incorectă.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Noua parolă trebuie să aibă minim 6 caractere.' },
          { status: 400 }
        );
      }

      dataToUpdate.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: 'Datele profilului au fost actualizate cu succes!',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la salvarea modificărilor.' },
      { status: 500 }
    );
  }
}
