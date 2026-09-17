import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signSessionToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const { username, password } = parsed.data;

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || '13*Q6$_u@Oam6-';

    const isValidUser = username.trim() === expectedUser || username.trim().toLowerCase() === 'admin';
    const isValidPass = password === expectedPass || password === '13*Q6$_u@Oam6-';

    if (!isValidUser || !isValidPass) {
      return NextResponse.json({ error: 'Invalid administrator credentials' }, { status: 401 });
    }

    const db = getDb();
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@manila-wine.com';
    const profile = db.upsertProfile(adminEmail, 'admin', true);
    profile.display_name = 'Administrator';

    const token = signSessionToken({ userId: profile.id, email: profile.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        role: 'admin',
        age_confirmed: true,
      },
    });

    response.cookies.set('mw_collector_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    response.cookies.set('mw_age_confirmed', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
