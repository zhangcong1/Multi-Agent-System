/**
 * 域账号登录会话：HMAC-SHA256 签名（Route Handler）。
 * 配置：AUTH_SECRET（≥16）、DOMAIN_LOGIN_PASSWORD、可选 DOMAIN_ACCOUNT_SUFFIX。
 * 当前不做全站路由拦截，仅用于 /login 与会话展示。
 */

export const AUTH_COOKIE_NAME = 'spark_auth_session';

export type SessionUser = {
  /** User Principal Name，如 zhangsan@corp.local */
  upn: string;
  /** 展示名（邮箱 @ 前一段） */
  displayName: string;
  exp: number;
};

const TOKEN_PREFIX = 'v1';

function toBase64Url(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function signSession(user: Omit<SessionUser, 'exp'>, secret: string, maxAgeSec: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload: SessionUser = { ...user, exp };
  const body = new TextEncoder().encode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, body));
  return `${TOKEN_PREFIX}.${toBase64Url(body)}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) return null;
    const body = fromBase64Url(parts[1]);
    const sig = fromBase64Url(parts[2]);
    const key = await hmacKey(secret);
    const data = new Uint8Array(body.length);
    data.set(body);
    const sigBuf = new Uint8Array(sig.length);
    sigBuf.set(sig);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuf.buffer.slice(sigBuf.byteOffset, sigBuf.byteOffset + sigBuf.byteLength),
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(data)) as SessionUser;
    if (payload.exp * 1000 < Date.now()) return null;
    if (!payload.upn || !payload.displayName) return null;
    return payload;
  } catch {
    return null;
  }
}

/** 规范化域账号：无 @ 时追加后缀 */
export function normalizeUpn(input: string, suffix: string): string {
  const t = input.trim();
  if (!t) return '';
  if (t.includes('@')) return t.toLowerCase();
  const s = suffix.startsWith('@') ? suffix : `@${suffix}`;
  return `${t.toLowerCase()}${s.toLowerCase()}`;
}

export function isAuthEnabled(): boolean {
  return Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16);
}
