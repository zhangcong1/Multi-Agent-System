'use client';

import Link from 'next/link';
import { Bot, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  kind: 'step';
  workItemId: number;
  workItemTitle: string;
  workItemStatus: string;
  stepName: string;
  stepStatus: string;
  workerName: string | null;
  workerType: 'HUMAN' | 'AI' | null;
  occurredAt: string;
}

const stepStatusLabel: Record<string, string> = {
  PENDING: '待开始',
  RUNNING: '进行中',
  WAITING_APPROVAL: '待确认',
  DONE: '已完成',
  FAILED: '失败',
  SKIPPED: '已跳过',
};

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
  return new Date(iso).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface RecentActivityStripProps {
  items: ActivityItem[];
  loading?: boolean;
  className?: string;
}

export default function RecentActivityStrip({
  items,
  loading = false,
  className,
}: RecentActivityStripProps) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-gradient-to-r from-primary/60 to-primary/20 motion-safe:animate-activity-bar-shimmer" />
          <h2 className="text-sm font-semibold text-foreground">最近动态</h2>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            步骤与需求联动更新
          </span>
        </div>
        <Link
          href="/work-items"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:!underline"
        >
          全部需求 <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />

        <div
          className={cn(
            'flex gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:thin]',
            'snap-x snap-mandatory scroll-smooth',
            '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent'
          )}
        >
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[104px] w-[260px] shrink-0 snap-start rounded-xl border border-border/50 bg-card/50 motion-safe:animate-pulse"
                />
              ))}
            </>
          ) : items.length === 0 ? (
            <div className="flex min-h-[104px] w-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 px-4 text-center text-sm text-muted-foreground">
              暂无步骤动态，上报步骤后将在此汇聚展示
            </div>
          ) : (
            items.map((item, index) => (
              <Link
                key={item.id}
                href={`/work-items/${item.workItemId}`}
                className={cn(
                  'group relative flex w-[min(280px,calc(100vw-3rem))] shrink-0 snap-start flex-col justify-between rounded-xl border border-border/60 bg-card/90 p-4',
                  'shadow-sm transition-all duration-300',
                  'hover:-translate-y-1 hover:border-primary/35 hover:shadow-md hover:shadow-primary/10',
                  'motion-safe:animate-activity-card-enter motion-reduce:opacity-100 motion-reduce:translate-y-0'
                )}
                style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
              >
                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-1 text-xs font-medium text-primary">
                    {item.workItemTitle}
                  </p>
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                    {item.stepName}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1.5">
                    {item.workerType === 'AI' ? (
                      <Bot className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                    ) : (
                      <User className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                    )}
                    <span className="truncate">{item.workerName ?? '系统'}</span>
                    <span className="shrink-0 rounded-md bg-muted/80 px-1.5 py-px text-[10px] font-medium text-foreground/80">
                      {stepStatusLabel[item.stepStatus] ?? item.stepStatus}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums opacity-80">
                    {formatRelative(item.occurredAt)}
                  </span>
                </div>
                <span className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
