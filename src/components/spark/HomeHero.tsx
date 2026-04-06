'use client';

import Link from 'next/link';
import { Activity, ArrowRight, Clock, FolderKanban, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_DISPLAY_NAME } from '@/lib/app-brand';

export interface HomeHeroStats {
  runningCount: number;
  waitingApprovalCount: number;
  totalWorkItems: number;
}

interface HomeHeroProps {
  stats: HomeHeroStats | null;
  syncedAt?: Date | null;
  className?: string;
}

export default function HomeHero({ stats, syncedAt, className }: HomeHeroProps) {
  const running = stats?.runningCount ?? 0;
  const waiting = stats?.waitingApprovalCount ?? 0;
  const total = stats?.totalWorkItems ?? 0;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-lg shadow-primary/5',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-90" />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl motion-safe:animate-hero-orb"
        style={{ background: 'oklch(0.45 0.2 280 / 0.25)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl motion-safe:animate-hero-orb-alt"
        style={{ background: 'oklch(0.5 0.15 260 / 0.2)' }}
      />

      <div className="relative z-10 flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4 motion-safe:animate-hero-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5 motion-safe:animate-hero-icon-pulse" />
            研发协作可视化的「脉搏」
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {APP_DISPLAY_NAME} · 工作概览
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              实时掌握需求流转、人机协作与待办焦点——从这里进入今日最该处理的工作。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-1 font-mono tabular-nums ring-1 ring-border/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              数据已同步
              {syncedAt ? (
                <span className="text-muted-foreground/80">
                  ·{' '}
                  {syncedAt.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 sm:max-w-md lg:w-auto lg:min-w-[320px] motion-safe:animate-hero-enter-right">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/projects"
              className="group flex flex-col rounded-xl border border-border/50 bg-background/40 p-4 ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:ring-primary/15"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">进行中</span>
                <Activity className="h-4 w-4 text-primary opacity-80 transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground motion-safe:animate-hero-count-pop">
                {running}
              </p>
              <span className="mt-1 flex items-center gap-1 text-xs text-primary/90">
                查看项目 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/projects"
              className="group flex flex-col rounded-xl border border-border/50 bg-background/40 p-4 ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-amber-500/35 hover:ring-amber-500/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">待确认</span>
                <Clock className="h-4 w-4 text-amber-500 opacity-90 transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground motion-safe:animate-hero-count-pop">
                {waiting}
              </p>
              <span className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400/90">
                优先处理 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderKanban className="h-4 w-4 shrink-0 text-primary/80" />
              <span>需求总数</span>
            </div>
            <span className="text-lg font-semibold tabular-nums text-foreground">{total}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
