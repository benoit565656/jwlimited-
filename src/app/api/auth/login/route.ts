import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://jwlimited.manila-wine.com';
}

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider');
  const baseUrl = getBaseUrl(req);

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({
        configured: false,
        error: 'Google Sign-In is not configured yet. Please enter your email below to receive an instant verification code, or configure GOOGLE_CLIENT_ID in your environment variables.',
      }, { status: 400 });
    }

    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'online');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    return NextResponse.json({
      configured: true,
      url: googleAuthUrl.toString(),
    });
  }

  if (provider === 'facebook') {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({
        configured: false,
        error: 'Facebook Sign-In is not configured yet. Please enter your email below to receive an instant verification code, or configure FACEBOOK_CLIENT_ID in your environment variables.',
      }, { status: 400 });
    }

    const redirectUri = `${baseUrl}/api/auth/callback/facebook`;
    const fbAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    fbAuthUrl.searchParams.set('client_id', clientId);
    fbAuthUrl.searchParams.set('redirect_uri', redirectUri);
    fbAuthUrl.searchParams.set('scope', 'email,public_profile');
    fbAuthUrl.searchParams.set('response_type', 'code');

    return NextResponse.json({
      configured: true,
      url: fbAuthUrl.toString(),
    });
  }

  return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
}
