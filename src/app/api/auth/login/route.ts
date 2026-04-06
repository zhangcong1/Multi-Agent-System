import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  normalizeUpn,
  signSession,
} from '@/lib/auth/session';

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { success: false, error: '未配置 AUTH_SECRET（至少 16 位），域登录不可用。' },
      { status: 503 }
    );
  }

  const expectedPassword = process.env.DOMAIN_LOGIN_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.json(
      { success: false, error: '未配置 DOMAIN_LOGIN_PASSWORD。' },
      { status: 503 }
    );
  }

  let body: { account?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: '请求体无效' }, { status: 400 });
  }

  const account = typeof body.account === 'string' ? body.account : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!account || !password) {
    return NextResponse.json({ success: false, error: '请输入域账号与密码' }, { status: 400 });
  }

  const suffix = process.env.DOMAIN_ACCOUNT_SUFFIX ?? '@corp.local';
  const upn = normalizeUpn(account, suffix);
  if (!upn.includes('@') || upn.split('@')[0].length === 0) {
    return NextResponse.json({ success: false, error: '域账号格式不正确' }, { status: 400 });
  }

  const localPart = upn.split('@')[0];
  const displayName = localPart.length > 0 ? localPart : upn;

  if (password !== expectedPassword) {
    return NextResponse.json({ success: false, error: '域账号或密码错误' }, { status: 401 });
  }

  const token = await signSession({ upn, displayName }, secret, MAX_AGE_SEC);

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  });

  return NextResponse.json({
    success: true,
    data: { upn, displayName },
  });
}
