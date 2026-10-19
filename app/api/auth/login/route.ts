import { NextResponse } from 'next/server';
import { authenticateUser, setSessionCookie } from '@/lib/auth';

// ── Rate Limiter & Anti-Brute-Force Manager (In-Memory) ──
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes tracking window

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) return { allowed: true };

  // If locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { allowed: false, remainingMinutes };
  }

  // If lockout expired or tracking window elapsed, reset
  if (now - entry.firstAttempt > WINDOW_DURATION_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string): number {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  entry.count += 1;

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  loginAttempts.set(ip, entry);
  return MAX_FAILED_ATTEMPTS - entry.count;
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Prea multe încercări eșuate de conectare. Pentru securitatea platformei, accesul de pe acest IP a fost temporar blocat pentru ${rateCheck.remainingMinutes} minute.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const identifier = body.email || body.username || body.identifier;
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Utilizatorul și parola sunt obligatorii.' },
        { status: 400 }
      );
    }

    // 2. Authenticate user
    const user = await authenticateUser(identifier, password);

    if (!user) {
      const remainingAttempts = recordFailedAttempt(ip);
      const remainingMsg =
        remainingAttempts > 0
          ? ` Mai aveți ${remainingAttempts} încercări înainte de blocarea temporară.`
          : ' Ați depășit numărul maxim de încercări. Accesul a fost temporar blocat pentru 15 minute.';

      return NextResponse.json(
        { success: false, error: `Utilizator sau parolă incorectă.${remainingMsg}` },
        { status: 401 }
      );
    }

    // 3. Clear rate limit on success
    clearAttempts(ip);

    // 4. Set HTTP-only session cookie
    await setSessionCookie(user);

    return NextResponse.json({
      success: true,
      user,
      message: `Bun venit, ${user.name}!`,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la autentificare.' },
      { status: 500 }
    );
  }
}
