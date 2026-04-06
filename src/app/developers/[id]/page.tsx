'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { APP_DISPLAY_NAME } from '@/lib/app-brand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar as CalendarIcon,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  GitBranch,
  ListTodo,
  Loader2,
  Pause,
  Play,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Assignee = { id: number; name: string; position: string } | null;

type StepPayload = {
  id: number;
  step_name: string;
  step_order: number;
  status: string;
  worker_id: number;
  assignee: Assignee;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type WorkItemPayload = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  owner_id: number;
  is_owner: boolean;
  pipeline_run: {
    id: number;
    status: string;
    total_steps: number;
    completed_steps: number;
    started_at: string | null;
    completed_at: string | null;
  } | null;
  steps: StepPayload[];
  current_step_name: string | null;
  progress_percent: number;
};

type WorkerPayload = {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  avatar_url: string | null;
  type: string;
};

function todayYmdLocal(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function workItemStatusLabel(status: string): string {
  const map: Record<string, string> = {
    RUNNING: '进行中',
    WAITING_APPROVAL: '待确认',
    DONE: '已完成',
    FAILED: '失败',
  };
  return map[status] || status;
}

function stepStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: '待开始',
    RUNNING: '进行中',
    WAITING_APPROVAL: '待确认',
    DONE: '已完成',
    FAILED: '失败',
    SKIPPED: '已跳过',
  };
  return map[status] || status;
}

/** 与主题一致：仅用 primary / muted / 必要语义色 */
function workItemStatusVariant(
  status: string
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'FAILED') return 'destructive';
  if (status === 'WAITING_APPROVAL') return 'secondary';
  return 'outline';
}

/** 顶条色带，与需求详情页一致 */
const statusStripClass: Record<string, string> = {
  RUNNING: 'bg-primary',
  WAITING_APPROVAL: 'bg-amber-500',
  DONE: 'bg-emerald-500',
  FAILED: 'bg-destructive',
};

function phaseSubProgress(step: StepPayload): number {
  if (step.status === 'DONE' || step.status === 'SKIPPED') return 100;
  if (step.status === 'RUNNING') return 72;
  if (step.status === 'WAITING_APPROVAL') return 45;
  return 0;
}

function stepActivityText(step: StepPayload): string {
  switch (step.status) {
    case 'RUNNING':
      return '环节执行中，请关注产出与流水线日志。';
    case 'WAITING_APPROVAL':
      return '待确认本环节交付物或评审结论。';
    case 'PENDING':
      return '尚未开始，等待上游环节完成。';
    case 'FAILED':
      return '环节执行失败，请在完整详情中查看错误信息。';
    default:
      return '—';
  }
}

function UserProfilePanel({
  worker,
  collaborators,
  viewLabel,
}: {
  worker: WorkerPayload;
  collaborators: { id: number; name: string; position: string }[];
  viewLabel: string;
}) {
  return (
    <div
      className={cn(
        'stagger-item glass-card relative overflow-hidden rounded-2xl border border-border/70 p-5 sm:p-6',
        'shadow-[0_8px_30px_-12px_oklch(0.2_0.08_280_/_0.25)] ring-1 ring-primary/[0.12]'
      )}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/[0.12]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div
            className={cn(
              'flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl',
              'bg-gradient-to-br from-primary via-primary/90 to-violet-600 text-lg font-bold text-primary-foreground',
              'shadow-[0_12px_40px_-8px_oklch(0.55_0.22_280_/_0.55)]'
            )}
          >
            {worker.name.slice(0, 2)}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm"
            title="在岗"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
              成员档案
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {worker.name}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge
                variant="secondary"
                className="border border-primary/20 bg-primary/10 text-xs font-medium text-primary"
              >
                {worker.position}
              </Badge>
              {worker.type === 'AI' ? (
                <Badge variant="outline" className="text-xs font-normal">
                  AI 协作者
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-500/25 text-xs font-normal text-emerald-700 dark:text-emerald-400">
                  正式成员
                </Badge>
              )}
            </div>
          </div>
          <dl className="grid gap-2 text-left text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                工号
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                {worker.employee_id}
              </dd>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                数据视图
              </dt>
              <dd className="mt-0.5 text-xs text-foreground">{viewLabel}</dd>
            </div>
          </dl>
          {collaborators.length > 0 ? (
            <div className="border-t border-border/50 pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                协作伙伴
              </p>
              <div className="flex max-h-[5.5rem] flex-wrap gap-1.5 overflow-y-auto pr-1">
                {collaborators.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-md border border-border/60 bg-background/50 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="ml-1 text-muted-foreground">· {c.position}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OverviewStatChip({
  icon: Icon,
  label,
  value,
  sub,
  delayMs,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  delayMs: number;
}) {
  return (
    <div
      className="stagger-item rounded-xl border border-border/60 bg-card/50 p-3.5 transition-all duration-300 hover:border-primary/28 hover:bg-primary/[0.04] sm:p-4"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/12 p-2 text-primary shadow-inner ring-1 ring-primary/10">
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-gradient">
            {value}
          </p>
          {sub ? <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function OverviewPanel({
  workItemsLength,
  stats,
  avgProgress,
  ownerCount,
  headerDateShort,
  isToday,
}: {
  workItemsLength: number;
  stats: { running: number; waiting: number; mySteps: number };
  avgProgress: number;
  ownerCount: number;
  headerDateShort: string;
  isToday: boolean;
}) {
  return (
    <div
      className={cn(
        'stagger-item glass-card relative overflow-hidden rounded-2xl border border-border/70 p-5 sm:p-6',
        'ring-1 ring-primary/10'
      )}
      style={{ animationDelay: '80ms' }}
    >
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 translate-x-1/3 translate-y-1/3 rounded-full bg-violet-600/[0.06] blur-3xl dark:bg-violet-500/[0.1]"
        aria-hidden
      />
      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/85">
              <Sparkles className="h-3 w-3" aria-hidden />
              {APP_DISPLAY_NAME} · 概览
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground sm:text-xl">当日工作台统计</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {headerDateShort}
              {isToday ? ' · 今日视图' : ' · 历史视图'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/25 px-2.5 py-1 text-[10px] text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden />
            负责人需求 {ownerCount} 条
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <OverviewStatChip
            icon={ListTodo}
            label="当日需求"
            value={workItemsLength}
            sub="列表内全部条目"
            delayMs={100}
          />
          <OverviewStatChip
            icon={Play}
            label="进行中"
            value={stats.running}
            delayMs={140}
          />
          <OverviewStatChip
            icon={Clock}
            label="待确认"
            value={stats.waiting}
            delayMs={180}
          />
          <OverviewStatChip
            icon={Target}
            label="我的环节"
            value={stats.mySteps}
            sub="步骤总数"
            delayMs={220}
          />
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5 text-primary/70" aria-hidden />
              平均整链进度
            </span>
            <span className="font-mono font-semibold tabular-nums text-primary">{avgProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/80 dark:bg-muted/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 via-violet-500/90 to-cyan-500/80 transition-all duration-700"
              style={{ width: `${Math.min(100, avgProgress)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkItemListCard({
  item,
  selected,
  onSelect,
  index,
}: {
  item: WorkItemPayload;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'stagger-item group w-full rounded-xl border bg-card/80 p-4 text-left transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_oklch(0.45_0.15_280_/_0.35)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected
          ? 'border-primary/50 bg-primary/[0.06] shadow-md ring-1 ring-primary/25'
          : 'border-border/70 hover:border-primary/30'
      )}
      style={{ animationDelay: `${Math.min(index * 45, 400)}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {item.title}
        </h3>
        <Badge variant={workItemStatusVariant(item.status)} className="shrink-0 text-[10px] font-normal">
          {workItemStatusLabel(item.status)}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span>{item.is_owner ? '负责人' : '参与执行'}</span>
        <span className="text-border">|</span>
        <span className="tabular-nums">进度 {item.progress_percent}%</span>
        {item.updated_at ? (
          <>
            <span className="text-border">|</span>
            <span>
              更新 {format(new Date(item.updated_at), 'M/d HH:mm', { locale: zhCN })}
            </span>
          </>
        ) : null}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/90 to-cyan-500/70 transition-all group-hover:opacity-100"
          style={{ width: `${item.progress_percent}%` }}
        />
      </div>
      <p className="mt-2 line-clamp-1 text-[11px] text-muted-foreground">
        {item.current_step_name
          ? `当前：${item.current_step_name}`
          : item.steps.length === 0
            ? '暂无流水线步骤'
            : '—'}
      </p>
    </button>
  );
}

/**
 * 对齐参考稿与 /work-items/[id]：标题区、待确认提示、横向管道、当前阶段卡、页脚时间
 */
function RequirementReferencePanel({
  item,
  developerId,
}: {
  item: WorkItemPayload;
  developerId: number;
}) {
  const p = item.pipeline_run;
  const strip = statusStripClass[item.status] ?? 'bg-muted';

  const activeStep = useMemo(() => {
    if (item.steps.length === 0) return null;
    return (
      item.steps.find(
        (s) => s.status === 'RUNNING' || s.status === 'WAITING_APPROVAL'
      ) ??
      item.steps.find((s) => s.status === 'PENDING') ??
      item.steps[item.steps.length - 1]
    );
  }, [item.steps]);

  const detailShellClass = cn(
    'relative isolate overflow-hidden rounded-2xl',
    'border-2 border-border/90 bg-card shadow-xl',
    'dark:border-border dark:bg-[oklch(0.15_0.022_280_/_0.97)]',
    'dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55)]',
    'ring-1 ring-primary/15 dark:ring-primary/25'
  );

  if (item.steps.length === 0) {
    return (
      <div className={detailShellClass}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.06] to-transparent dark:from-primary/[0.08]"
          aria-hidden
        />
        <div className={cn('relative z-10 h-1.5', strip)} />
        <div className="relative z-10 space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-base font-bold text-foreground">{item.title}</h3>
            <Badge variant={workItemStatusVariant(item.status)} className="shrink-0">
              {workItemStatusLabel(item.status)}
            </Badge>
          </div>
          <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-8 text-center text-xs text-muted-foreground">
            该需求暂无流水线步骤，可在需求详情中查看完整信息。
            <div className="mt-3 flex justify-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/work-items/${item.id}`}>
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  打开需求详情
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={detailShellClass}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.06] to-transparent dark:from-primary/[0.08]"
        aria-hidden
      />
      <div className={cn('relative z-10 h-1.5', strip)} />
      <div className="relative z-10 space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                {item.title}
              </h3>
              <Badge variant={workItemStatusVariant(item.status)} className="font-normal">
                {workItemStatusLabel(item.status)}
              </Badge>
              {item.steps.some((s) => s.worker_id === developerId) ? (
                <Badge variant="outline" className="text-[10px] font-normal">
                  含我的环节
                </Badge>
              ) : null}
            </div>
            {item.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/80">需求描述：</span>
                {item.description}
              </p>
            ) : null}
            {item.status === 'WAITING_APPROVAL' && (
              <div className="flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>请确认当前阶段交付物或技术方案，确认后将进入下一阶段。</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">当前阶段</span>
              <Badge variant="outline" className="border-primary/35 bg-primary/5 text-xs font-normal text-primary">
                {item.current_step_name ?? activeStep?.step_name ?? '—'}
              </Badge>
              {p ? (
                <span className="text-[11px] text-muted-foreground">
                  已完成 {p.completed_steps}/{p.total_steps} 步
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 md:flex-col md:items-end">
            <Button variant="outline" size="sm" className="rounded-xl" disabled title="即将支持">
              <Pause className="mr-1.5 h-4 w-4" />
              暂停
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-destructive border-destructive/35"
              disabled
              title="即将支持"
            >
              <X className="mr-1.5 h-4 w-4" />
              取消
            </Button>
            <Button size="sm" variant="secondary" className="rounded-xl" asChild>
              <Link href={`/work-items/${item.id}`}>
                <ExternalLink className="mr-1.5 h-4 w-4" />
                完整详情
              </Link>
            </Button>
          </div>
        </div>

        {/* 开发进度管道 */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Play className="h-5 w-5 text-primary" />
              开发进度管道
            </h4>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary ring-2 ring-primary/25">
              {item.progress_percent}%
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex w-full min-w-[520px] items-center px-0.5">
              {item.steps.map((step, i) => {
                const isCompleted = step.status === 'DONE' || step.status === 'SKIPPED';
                const isRunning =
                  step.status === 'RUNNING' || step.status === 'WAITING_APPROVAL';
                const isFailed = step.status === 'FAILED';
                const showPct = isRunning;
                return (
                  <Fragment key={step.id}>
                    <div className="flex min-w-0 flex-1 flex-col items-center px-0.5">
                      <div
                        className={cn(
                          'pipeline-node-circle relative z-10 transition-transform duration-300',
                          isCompleted && 'pipeline-node-circle completed',
                          isRunning &&
                            'pipeline-node-circle running scale-[1.06] ring-4 ring-primary/35 ring-offset-2 ring-offset-background shadow-lg',
                          !isCompleted && !isRunning && !isFailed && 'pipeline-node-circle pending',
                          isFailed &&
                            'border-2 border-destructive bg-destructive/15 text-destructive'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" strokeWidth={3} />
                        ) : (
                          <span className="text-[11px] font-semibold">
                            {step.assignee?.name?.slice(0, 2) || '·'}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'mt-2 block max-w-full truncate px-0.5 text-center text-[11px] font-medium leading-tight',
                          isCompleted && 'text-emerald-600 dark:text-emerald-400',
                          isRunning && 'text-primary',
                          !isCompleted && !isRunning && 'text-muted-foreground',
                          isFailed && 'text-destructive'
                        )}
                        title={step.step_name}
                      >
                        {step.step_name}
                      </span>
                      {showPct ? (
                        <span className="text-[11px] font-semibold tabular-nums text-primary">
                          {phaseSubProgress(step)}%
                        </span>
                      ) : (
                        <span className="h-4" aria-hidden />
                      )}
                      <span className="mt-0.5 block max-w-full truncate text-center text-[10px] text-muted-foreground">
                        {step.assignee?.name ?? `#${step.worker_id}`}
                        {step.worker_id === developerId ? ' · 我' : ''}
                      </span>
                    </div>
                    {i < item.steps.length - 1 ? (
                      <div
                        className={cn(
                          'pipeline-connector h-[3px] min-w-[6px] shrink rounded-full',
                          item.steps[i]?.status === 'DONE' || item.steps[i]?.status === 'SKIPPED'
                            ? 'pipeline-connector completed'
                            : item.steps[i]?.status === 'RUNNING' ||
                                item.steps[i]?.status === 'WAITING_APPROVAL'
                              ? 'pipeline-connector running'
                              : 'bg-muted dark:bg-muted/60'
                        )}
                      />
                    ) : null}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="mt-4 px-0.5">
            <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
              <span>开始</span>
              <span>完成</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/80 dark:bg-muted/40">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-violet-500 via-primary to-cyan-500 transition-[width] duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, item.progress_percent))}%` }}
              >
                <div className="absolute inset-0 progress-shimmer opacity-60" />
              </div>
            </div>
          </div>
        </div>

        {/* 当前阶段详情卡 */}
        {activeStep ? (
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/15 p-4 shadow-sm dark:from-card dark:to-muted/10 sm:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">当前阶段</p>
                <h4 className="text-base font-semibold text-foreground sm:text-lg">
                  {activeStep.step_name}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeStep.status === 'RUNNING' || activeStep.status === 'WAITING_APPROVAL' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    {stepStatusLabel(activeStep.status)}
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {stepStatusLabel(activeStep.status)}
                  </Badge>
                )}
                {activeStep.assignee ? (
                  <Link
                    href={`/workers/${activeStep.assignee.id}`}
                    className="flex items-center gap-2 rounded-xl bg-muted/50 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-xs text-primary-foreground">
                      {activeStep.assignee.name.slice(0, 2)}
                    </span>
                    {activeStep.assignee.name}
                  </Link>
                ) : null}
              </div>
            </div>
            <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
              {stepActivityText(activeStep)}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>阶段进度</span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {phaseSubProgress(activeStep)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-indigo-500 via-primary to-violet-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, phaseSubProgress(activeStep)))}%`,
                  }}
                >
                  <div className="absolute inset-0 progress-shimmer opacity-70" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-border/50 pt-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            创建时间{' '}
            {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
          </span>
          {item.updated_at ? (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              更新时间{' '}
              {format(new Date(item.updated_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DeveloperDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const developerId = typeof idParam === 'string' ? parseInt(idParam, 10) : NaN;

  const [selectedDate, setSelectedDate] = useState(todayYmdLocal);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [worker, setWorker] = useState<WorkerPayload | null>(null);
  const [workItems, setWorkItems] = useState<WorkItemPayload[]>([]);
  const [meta, setMeta] = useState<{ selectedDate: string; isToday: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(developerId)) {
      setError('无效的开发者 ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/spark/workers/${developerId}?date=${encodeURIComponent(selectedDate)}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || '加载失败');
        setWorker(null);
        setWorkItems([]);
        setMeta(null);
        return;
      }
      setWorker(json.data.worker);
      setWorkItems(json.data.workItems || []);
      setMeta(json.data.meta);
    } catch {
      setError('网络错误');
      setWorker(null);
      setWorkItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [developerId, selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (workItems.length === 0) {
      setSelectedWorkItemId(null);
      return;
    }
    setSelectedWorkItemId((prev) =>
      prev != null && workItems.some((w) => w.id === prev) ? prev : workItems[0].id
    );
  }, [workItems]);

  const headerDateLabel = useMemo(() => {
    const d = meta?.selectedDate ?? selectedDate;
    try {
      return format(parseYmd(d), 'yyyy年M月d日 EEEE', { locale: zhCN });
    } catch {
      return d;
    }
  }, [meta?.selectedDate, selectedDate]);

  const sortedWorkItems = useMemo(
    () =>
      [...workItems].sort((a, b) => {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return tb - ta;
      }),
    [workItems]
  );

  const selectedItem = useMemo(
    () => sortedWorkItems.find((w) => w.id === selectedWorkItemId) ?? null,
    [sortedWorkItems, selectedWorkItemId]
  );

  const headerDateShort = useMemo(() => {
    const d = meta?.selectedDate ?? selectedDate;
    try {
      return format(parseYmd(d), 'yyyy/MM/dd', { locale: zhCN });
    } catch {
      return d;
    }
  }, [meta?.selectedDate, selectedDate]);

  const avgProgress = useMemo(() => {
    if (workItems.length === 0) return 0;
    return Math.round(
      workItems.reduce((s, w) => s + w.progress_percent, 0) / workItems.length
    );
  }, [workItems]);

  const stats = useMemo(() => {
    const running = workItems.filter((w) => w.status === 'RUNNING').length;
    const waiting = workItems.filter((w) => w.status === 'WAITING_APPROVAL').length;
    const mySteps = workItems.reduce(
      (n, w) => n + w.steps.filter((s) => s.worker_id === developerId).length,
      0
    );
    const ownerCount = workItems.filter((w) => w.is_owner).length;
    return { running, waiting, mySteps, ownerCount };
  }, [workItems, developerId]);

  const collaborators = useMemo(() => {
    const m = new Map<number, { name: string; position: string }>();
    for (const w of workItems) {
      for (const s of w.steps) {
        if (s.worker_id === developerId) continue;
        if (s.assignee) {
          m.set(s.assignee.id, {
            name: s.assignee.name,
            position: s.assignee.position,
          });
        }
      }
    }
    return [...m.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }, [workItems, developerId]);

  return (
    <KanbanLayout>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1760px] flex-col gap-1.5 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/developers')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="返回开发者列表"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
                    开发者工作台
                  </h1>
                  <p className="truncate text-[11px] text-muted-foreground">{headerDateLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                      {meta?.isToday ? '今天' : '日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      locale={zhCN}
                      selected={parseYmd(selectedDate)}
                      onSelect={(d) => {
                        if (d) {
                          setSelectedDate(format(d, 'yyyy-MM-dd'));
                          setCalendarOpen(false);
                        }
                      }}
                      defaultMonth={parseYmd(selectedDate)}
                    />
                  </PopoverContent>
                </Popover>
                {!meta?.isToday ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-primary"
                    onClick={() => setSelectedDate(todayYmdLocal())}
                  >
                    回到今天
                  </Button>
                ) : null}
              </div>
            </div>
            <p className="text-[10px] leading-snug text-muted-foreground">
              所选日期按上海时区关联步骤时间；「今天」仅展示进行中的负责或参与需求。
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-[1760px] space-y-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs">加载中…</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-card p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => load()}>
                重试
              </Button>
            </div>
          ) : worker ? (
            <div className="relative pb-8">
              <div
                className="pointer-events-none absolute inset-0 -z-10 min-h-[120%] bg-gradient-mesh opacity-80 dark:opacity-100"
                aria-hidden
              />
              <div className="relative space-y-8">
                <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
                  <div className="lg:col-span-5 xl:col-span-4">
                    <UserProfilePanel
                      worker={worker}
                      collaborators={collaborators}
                      viewLabel={headerDateLabel}
                    />
                  </div>
                  <div className="lg:col-span-7 xl:col-span-8">
                    <OverviewPanel
                      workItemsLength={workItems.length}
                      stats={stats}
                      avgProgress={avgProgress}
                      ownerCount={stats.ownerCount}
                      headerDateShort={headerDateShort}
                      isToday={meta?.isToday ?? true}
                    />
                  </div>
                </div>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/40 pb-3">
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                        需求列表
                      </h2>
                      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                        点击卡片查看该需求的进度管道与阶段详情。按更新时间排序，共{' '}
                        <span className="font-medium text-foreground">{sortedWorkItems.length}</span>{' '}
                        条。
                      </p>
                    </div>
                  </div>
                  {sortedWorkItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-20 text-center">
                      <p className="text-sm text-muted-foreground">
                        {meta?.isToday
                          ? '当前没有进行中的相关需求。'
                          : '该日没有与你关联的步骤或需求更新。'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {sortedWorkItems.map((item, i) => (
                        <WorkItemListCard
                          key={item.id}
                          item={item}
                          selected={item.id === selectedWorkItemId}
                          onSelect={() => setSelectedWorkItemId(item.id)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {selectedItem ? (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                      <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                        当前需求详情
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        与「需求详情」页进度区样式对齐
                      </span>
                    </div>
                    <RequirementReferencePanel
                      item={selectedItem}
                      developerId={developerId}
                    />
                  </section>
                ) : sortedWorkItems.length > 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    请从上方需求列表中选择一条以查看详情。
                  </p>
                ) : null}

                <Separator className="opacity-40" />
                <p className="text-center text-[10px] text-muted-foreground">
                  数据来自研发流水线（work_items / pipeline_runs / step_runs），与需求看板保持一致。
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </KanbanLayout>
  );
}
