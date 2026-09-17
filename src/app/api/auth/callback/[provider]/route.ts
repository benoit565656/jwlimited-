import { NextRequest, NextResponse } from 'next/server';
import { signSessionToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://jwlimited.manila-wine.com';
}

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const baseUrl = getBaseUrl(req);
  const code = req.nextUrl.searchParams.get('code');
  const oauthError = req.nextUrl.searchParams.get('error') || req.nextUrl.searchParams.get('error_description');

  if (oauthError) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(oauthError)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('No authorization code provided')}`);
  }

  let email: string | null = null;
  let displayName: string | null = null;

  try {
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${baseUrl}/api/auth/callback/google`;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Google credentials not configured on server')}`);
      }

      // Exchange code for token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google code');
      }

      // Fetch user info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userRes.json();
      if (!userData.email) {
        throw new Error('Google account has no verified email address');
      }

      const userEmail: string = userData.email;
      email = userEmail;
      displayName = userData.name || userData.given_name || userEmail.split('@')[0];
    } else if (provider === 'facebook') {
      const clientId = process.env.FACEBOOK_CLIENT_ID;
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
      const redirectUri = `${baseUrl}/api/auth/callback/facebook`;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Facebook credentials not configured on server')}`);
      }

      // Exchange code for token
      const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', clientId);
      tokenUrl.searchParams.set('client_secret', clientSecret);
      tokenUrl.searchParams.set('redirect_uri', redirectUri);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error?.message || 'Failed to exchange Facebook code');
      }

      // Fetch user info
      const userUrl = new URL('https://graph.facebook.com/me');
      userUrl.searchParams.set('fields', 'id,name,email');
      userUrl.searchParams.set('access_token', tokenData.access_token);

      const userRes = await fetch(userUrl.toString());
      const userData = await userRes.json();
      if (!userData.email) {
        throw new Error('Facebook account does not share an email address. Please use email sign-in.');
      }

      const userEmail: string = userData.email;
      email = userEmail;
      displayName = userData.name || userEmail.split('@')[0];
    } else {
      return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Unsupported OAuth provider')}`);
    }

    if (!email) {
      throw new Error('Failed to retrieve user email');
    }

    // Upsert user profile
    const db = getDb();
    const isAdmin = email.toLowerCase() === (process.env.ADMIN_DEFAULT_EMAIL || 'admin@manila-wine.com').toLowerCase();
    const role = isAdmin ? 'admin' : 'user';

    const profile = db.upsertProfile(email, role, true);
    if (displayName && !profile.display_name) {
      profile.display_name = displayName;
    }

    const token = signSessionToken({ userId: profile.id, email: profile.email });

    const response = NextResponse.redirect(`${baseUrl}/?auth=success`);

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
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(message)}`);
  }
}
