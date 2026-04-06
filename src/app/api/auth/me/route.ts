import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, isAuthEnabled, verifySessionToken } from '@/lib/auth/session';

export async function GET() {
  if (!isAuthEnabled()) {
    return NextResponse.json({
      success: true,
      data: { enabled: false, user: null as { upn: string; displayName: string } | null },
    });
  }

  const secret = process.env.AUTH_SECRET!;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({
      success: true,
      data: { enabled: true, user: null },
    });
  }

  const user = await verifySessionToken(token, secret);
  if (!user) {
    return NextResponse.json({
      success: true,
      data: { enabled: true, user: null },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      enabled: true,
      user: { upn: user.upn, displayName: user.displayName },
    },
  });
}
