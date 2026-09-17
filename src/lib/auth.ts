import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { Profile, SessionUser } from '@/types';

const SESSION_COOKIE_NAME = 'mw_collector_session';
const AGE_COOKIE_NAME = 'mw_age_confirmed';
const SECRET_KEY = process.env.APP_SECRET || 'manila-wine-collector-secret-2026';

// Generates signed session token: base64(payload).signature
export function signSessionToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken<T = unknown>(token: string): T | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
    if (sig !== expectedSig) return null;
    const jsonStr = Buffer.from(data, 'base64url').toString('utf-8');
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

// In-memory OTP storage for passwordless email verification
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOTP(email: string): string {
  const norm = email.trim().toLowerCase();
  // 6 digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(norm, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return code;
}

export function verifyOTP(email: string, code: string): boolean {
  const norm = email.trim().toLowerCase();
  const entry = otpStore.get(norm);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(norm);
    return false;
  }
  if (entry.code === code.trim()) {
    otpStore.delete(norm);
    return true;
  }
  return false;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const norm = email.trim().toLowerCase();
  const hardcodedAdmins = ['admin@manila-wine.com', 'benoit5656@gmail.com'];
  const envAdmins = (process.env.ADMIN_DEFAULT_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return hardcodedAdmins.includes(norm) || envAdmins.includes(norm);
}

// Helper to get current session user from cookies (Server Components / Route Handlers)
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken<{ userId: string; email: string }>(token);
  if (!payload || !payload.userId) return null;

  const db = getDb();
  const profile = db.getProfile(payload.userId);
  if (!profile) return null;

  const role = isAdminEmail(profile.email) ? 'admin' : profile.role;

  return {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name,
    role,
    age_confirmed: Boolean(profile.age_confirmed_at),
  };
}

export async function isUserAgeConfirmed(): Promise<boolean> {
  const cookieStore = cookies();
  return cookieStore.get(AGE_COOKIE_NAME)?.value === 'true';
}
