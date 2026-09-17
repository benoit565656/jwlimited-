import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('mw_collector_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
