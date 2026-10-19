import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// ============================================
//   Authentication & Session Management
//   Cookie-based signed tokens with HMAC-SHA256
// ============================================

const SESSION_COOKIE_NAME = 'topinstock_session';
const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'topinstock-marketplace-secure-jwt-key-2026';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  vendorId?: string | null;
  storeName?: string | null;
  exp: number; // UNIX epoch timestamp (ms)
}

// ── Password Hashing Helpers ──────────────────

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// ── Token Signing & Verification ──────────────

export function signSessionToken(payload: Omit<AuthSession, 'exp'>): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const fullSession: AuthSession = { ...payload, exp };
  
  const payloadBase64 = Buffer.from(JSON.stringify(fullSession)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): AuthSession | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadBase64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const jsonString = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const session: AuthSession = JSON.parse(jsonString);

    if (session.exp && session.exp < Date.now()) {
      return null; // Expired
    }

    return session;
  } catch (err) {
    return null;
  }
}

// ── Server-Side Session Getters & Setters ─────

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: Omit<AuthSession, 'exp'>): Promise<string> {
  const token = signSessionToken(session);
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore error if cookies cannot be modified
  }
}

// ── Authentication Query Helper ───────────────

export async function authenticateUser(identifier: string, plainTextPassword: string) {
  const clean = identifier.toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: clean },
        { email: clean.replace(/@.*$/, '') },
        { email: `${clean}@topinstock.ro` },
      ],
    },
    include: { vendor: true },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(plainTextPassword, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name || 'Utilizator',
    role: (user.role as 'CUSTOMER' | 'VENDOR' | 'ADMIN') || 'CUSTOMER',
    vendorId: user.vendor?.id || null,
    storeName: user.vendor?.storeName || null,
  };
}
