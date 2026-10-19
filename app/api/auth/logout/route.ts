import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'Deconectare reușită.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Eroare la deconectare.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'Deconectare reușită.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Eroare la deconectare.' }, { status: 500 });
  }
}
