import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, verifyOTP, signSessionToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { emailService } from '@/lib/email';

export const dynamic = 'force-dynamic';

const SendOtpSchema = z.object({
  email: z.string().email(),
  age_confirmed: z.boolean(),
});

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
  age_confirmed: z.boolean(),
});

// POST /api/auth/otp - action=send | verify
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'send';
    const body = await req.json();

    if (action === 'send') {
      const parsed = SendOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
      }

      if (!parsed.data.age_confirmed) {
        return NextResponse.json({ error: 'You must confirm that you are at least 18 years old' }, { status: 403 });
      }

      const otp = generateOTP(parsed.data.email);

      // In production, send via email provider. In dev, log to console & return code in dev response for seamless testing!
      await emailService.sendEmail({
        to: parsed.data.email,
        subject: `Your Manila Wine Verification Code: ${otp}`,
        html: `<p>Your 6-digit verification code is: <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
        text: `Your verification code is: ${otp}`,
      });

      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code was sent to ${parsed.data.email}`,
        // For development/testing convenience:
        debugCode: process.env.NODE_ENV !== 'production' ? otp : undefined,
      });
    }

    if (action === 'verify') {
      const parsed = VerifyOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Valid 6-digit code and email required' }, { status: 400 });
      }

      const isValid = verifyOTP(parsed.data.email, parsed.data.code);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid or expired code. Please request a new one.' }, { status: 400 });
      }

      const db = getDb();
      const isAdmin = parsed.data.email.toLowerCase() === (process.env.ADMIN_DEFAULT_EMAIL || 'admin@manila-wine.com').toLowerCase();
      const role = isAdmin ? 'admin' : 'user';
      const profile = db.upsertProfile(parsed.data.email, role, parsed.data.age_confirmed);

      const token = signSessionToken({ userId: profile.id, email: profile.email });

      const res = NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          age_confirmed: true,
        },
      });

      res.cookies.set('mw_collector_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      res.cookies.set('mw_age_confirmed', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });

      return res;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
