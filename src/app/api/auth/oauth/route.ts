import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signSessionToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const OAuthSchema = z.object({
  provider: z.enum(['google', 'facebook']),
  email: z.string().email(),
  display_name: z.string().optional(),
  age_confirmed: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'OAuth authentication failed', details: parsed.error.format() }, { status: 400 });
    }

    if (!parsed.data.age_confirmed) {
      return NextResponse.json({ error: 'You must confirm that you are at least 18 years old' }, { status: 403 });
    }

    const { email, display_name } = parsed.data;
    const db = getDb();
    const isAdmin = email.toLowerCase() === (process.env.ADMIN_DEFAULT_EMAIL || 'admin@manila-wine.com').toLowerCase();
    const role = isAdmin ? 'admin' : 'user';

    const profile = db.upsertProfile(email, role, true);
    if (display_name && !profile.display_name) {
      profile.display_name = display_name;
    }

    const token = signSessionToken({ userId: profile.id, email: profile.email });

    const res = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        role: profile.role,
        age_confirmed: true,
      },
    });

    res.cookies.set('mw_collector_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    res.cookies.set('mw_age_confirmed', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OAuth sign in failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
