'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Lock, User, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authDisabled, setAuthDisabled] = useState<boolean | null>(null);

  const suffix = process.env.NEXT_PUBLIC_DOMAIN_ACCOUNT_SUFFIX ?? '@corp.local';

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.enabled === false) {
          setAuthDisabled(true);
        } else {
          setAuthDisabled(false);
        }
      })
      .catch(() => setAuthDisabled(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || '登录失败');
        return;
      }
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect.startsWith('/') ? redirect : '/');
      router.refresh();
    } catch {
      setError('网络异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-mesh flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 group">
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500',
                'shadow-lg shadow-purple-500/25 group-hover:shadow-xl transition-shadow'
              )}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">域账号登录</h1>
          <p className="text-sm text-muted-foreground">
            使用企业统一身份（UPN）访问智汇协作平台
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5 p-6 md:p-8 space-y-6">
          {authDisabled === true && (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
              <p>当前未启用域登录（未配置 AUTH_SECRET）。可直接进入工作台。</p>
              <Link href="/" className="inline-block mt-2 text-primary font-medium hover:underline">
                进入概览
              </Link>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/90">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p>
              请输入域账号（可仅填前缀，将自动补全后缀{' '}
              <span className="font-mono text-xs text-primary">{suffix}</span>
              ）与域密码。
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account" className="text-foreground">
                域账号 / UPN
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="account"
                  name="account"
                  type="text"
                  autoComplete="username"
                  placeholder="zhangsan"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-background/80"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-background/80"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-medium shadow-md shadow-primary/20"
              disabled={loading || authDisabled === true}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  验证中…
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          由企业 IT 管理账号与权限。若无法登录，请联系管理员。
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
