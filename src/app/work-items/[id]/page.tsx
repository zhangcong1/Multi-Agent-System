'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Zap,
  Play,
  Pause,
  X,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Timer,
  Wrench,
  Check
} from 'lucide-react';

interface Worker {
  id: number;
  name: string;
  position: string;
}

interface WorkItemDetail {
  id: number;
  title: string;
  description: string | null;
  status: string;
  current_stage: string | null;
  stage_progress: number;
  total_stages: number;
  completed_stages: number;
  created_at: string;
  updated_at?: string;
  owner: Worker | null;
}

interface ExecutionLog {
  id: number;
  step_name: string;
  status: string;
  output: string | null;
  started_at: string | null;
  finished_at: string | null;
  worker: Worker | null;
}

interface WorkerAssignment {
  worker: Worker;
  is_owner: boolean;
}

interface StageInfo {
  name: string;
  status: 'completed' | 'running' | 'pending';
  order: number;
  assignee?: { id: number; name: string; position: string } | null;
}

interface CurrentStageDetail {
  subProgress: number;
  activity: string;
  assignee: Worker | null;
}

const STAGE_ORDER = [
  '需求分析',
  '方案设计',
  '后端开发',
  '前端开发',
  '接口联调',
  '自动化测试',
  '修复验证',
  '验收交付',
];

const statusConfig: Record<string, { label: string; bg: string; text: string; barColor: string }> = {
  RUNNING: { label: '进行中', bg: 'bg-blue-500/10', text: 'text-blue-500', barColor: 'bg-blue-500' },
  WAITING_APPROVAL: { label: '待确认', bg: 'bg-amber-500/10', text: 'text-amber-500', barColor: 'bg-amber-500' },
  DONE: { label: '已完成', bg: 'bg-emerald-500/10', text: 'text-emerald-500', barColor: 'bg-emerald-500' },
  FAILED: { label: '已失败', bg: 'bg-red-500/10', text: 'text-red-500', barColor: 'bg-red-500' },
};

const logStatusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  running: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
  pending: <Circle className="w-4 h-4 text-muted-foreground" />,
  failed: <X className="w-4 h-4 text-red-500" />,
  skipped: <AlertCircle className="w-4 h-4 text-amber-500" />,
};

/** 横向开发进度管道：头像节点 + 连接线 + 底部整体进度条 + 当前阶段详情卡 */
function DevelopmentProgressPipeline({
  stages,
  overallPercent,
  currentStageLabel,
  workItemStatus,
  currentDetail,
}: {
  stages: StageInfo[];
  overallPercent: number;
  currentStageLabel: string | null;
  workItemStatus: string;
  currentDetail: CurrentStageDetail | null;
}) {
  const list = STAGE_ORDER.map((name) => stages.find((s) => s.name === name) ?? {
    name,
    status: 'pending' as const,
    order: STAGE_ORDER.indexOf(name),
    assignee: null,
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            开发进度管道
          </h3>
          <span className="text-sm text-muted-foreground">
            整体完成度{' '}
            <span className="text-lg font-bold text-gradient tabular-nums">{overallPercent}%</span>
          </span>
        </div>

        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          {/* 第一行：节点与连接线对齐 */}
          <div className="flex items-center min-w-[840px] w-full">
            {list.map((stage, i) => {
              const isCompleted = stage.status === 'completed';
              const isRunning = stage.status === 'running';

              return (
                <Fragment key={stage.name}>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={cn(
                        'pipeline-node-circle relative z-10 transition-transform duration-300',
                        isCompleted && 'pipeline-node-circle completed',
                        isRunning && 'pipeline-node-circle running scale-110 ring-4 ring-primary/35 ring-offset-2 ring-offset-card shadow-lg',
                        !isCompleted && !isRunning && 'pipeline-node-circle pending'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        <span className="text-[11px] font-semibold tracking-tight">
                          {stage.assignee?.name?.slice(0, 2) || '·'}
                        </span>
                      )}
                    </div>
                  </div>

                  {i < list.length - 1 && (
                    <div
                      className={cn(
                        'pipeline-connector h-[3px] rounded-full flex-1 min-w-[6px] shrink',
                        list[i]?.status === 'completed' && 'pipeline-connector completed',
                        list[i]?.status === 'running' && 'pipeline-connector running',
                        list[i]?.status === 'pending' && 'bg-muted dark:bg-muted/60'
                      )}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* 第二行：阶段名 + 协作者 */}
          <div className="flex min-w-[840px] w-full mt-3">
            {list.map((stage) => {
              const isCompleted = stage.status === 'completed';
              const isRunning = stage.status === 'running';
              const label = stage.assignee?.name
                ? stage.assignee.name.slice(0, 8)
                : '待分配';
              return (
                <div key={`${stage.name}-meta`} className="flex-1 min-w-0 px-0.5 text-center">
                  <span
                    className={cn(
                      'text-[11px] sm:text-xs font-medium block leading-tight',
                      isCompleted && 'text-emerald-600 dark:text-emerald-400',
                      isRunning && 'text-primary',
                      !isCompleted && !isRunning && 'text-muted-foreground'
                    )}
                  >
                    {stage.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/90 block truncate mt-0.5">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部整体进度条 Start — Finish */}
        <div className="mt-6 px-1">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">
            <span>Start</span>
            <span>Finish</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/80 dark:bg-muted/40 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-primary to-cyan-500 relative transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, overallPercent))}%` }}
            >
              <div className="absolute inset-0 progress-shimmer opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* 当前阶段详情卡 */}
      {currentStageLabel && currentDetail && (
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 dark:from-card dark:to-muted/10 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">当前阶段</p>
              <h4 className="text-lg font-semibold text-foreground">{currentStageLabel}</h4>
            </div>
            <div className="flex items-center gap-2">
              {workItemStatus === 'RUNNING' || currentDetail.subProgress > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  进行中
                </span>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  待启动
                </Badge>
              )}
              {currentDetail.assignee && (
                <Link
                  href={`/workers/${currentDetail.assignee.id}`}
                  className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-white text-xs">
                    {currentDetail.assignee.name.slice(0, 2)}
                  </span>
                  {currentDetail.assignee.name}
                </Link>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{currentDetail.activity}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>阶段进度</span>
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {currentDetail.subProgress}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-primary to-violet-500 relative transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, currentDetail.subProgress))}%` }}
              >
                <div className="absolute inset-0 progress-shimmer opacity-70" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workItemId = params.id as string;

  const [workItem, setWorkItem] = useState<WorkItemDetail | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [workers, setWorkers] = useState<WorkerAssignment[]>([]);
  const [stages, setStages] = useState<StageInfo[]>([]);
  const [currentStageDetail, setCurrentStageDetail] = useState<CurrentStageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/spark/work-items/${workItemId}`);
        const json = await res.json();
        if (json.success) {
          setWorkItem(json.data.workItem);
          setLogs(json.data.logs);
          setWorkers(json.data.workers);
          setStages(json.data.stages);
          setCurrentStageDetail(json.data.currentStageDetail ?? null);
        }
      } catch (err) {
        console.error('加载失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [workItemId]);

  const toggleLog = (id: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedLogs(newExpanded);
  };

  const calculateDuration = (started: string | null, finished: string | null) => {
    if (!started || !finished) return '-';
    const start = new Date(started).getTime();
    const end = new Date(finished).getTime();
    const seconds = Math.floor((end - start) / 1000);
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    return `${Math.floor(seconds / 3600)}时${Math.floor((seconds % 3600) / 60)}分`;
  };

  if (loading) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  if (!workItem) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">未找到该需求</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  const status = statusConfig[workItem.status] || statusConfig.RUNNING;
  const currentStageLabel =
    workItem.current_stage ??
    stages.find((s) => s.status === 'running' || s.status === 'pending')?.name ??
    null;

  return (
    <KanbanLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        {/* 主卡片：标题 + 管道 + 阶段详情 + 页脚时间 */}
        <div className="kanban-panel overflow-hidden rounded-2xl shadow-sm">
          <div className={cn('h-1.5', status.barColor)} />
          <div className="p-5 md:p-8 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                    {workItem.title}
                  </h1>
                  <Badge className={cn(status.bg, status.text, 'border-0')}>{status.label}</Badge>
                </div>
                {workItem.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{workItem.description}</p>
                )}
                {workItem.status === 'WAITING_APPROVAL' && (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800/50 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                    请确认当前阶段交付物或技术方案，确认后将进入下一阶段。
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    当前阶段：{currentStageLabel || '—'}
                  </Badge>
                  {workItem.owner && (
                    <button
                      type="button"
                      onClick={() => router.push(`/workers/${workItem.owner!.id}`)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <User className="w-3.5 h-3.5" />
                      负责人 {workItem.owner.name}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2 md:flex-col md:items-end">
                <Button variant="outline" size="sm" className="rounded-xl" disabled title="即将支持">
                  <Pause className="w-4 h-4 mr-1.5" />
                  暂停
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-destructive border-destructive/30" disabled title="即将支持">
                  <X className="w-4 h-4 mr-1.5" />
                  取消
                </Button>
              </div>
            </div>

            <DevelopmentProgressPipeline
              stages={stages}
              overallPercent={workItem.stage_progress}
              currentStageLabel={currentStageLabel}
              workItemStatus={workItem.status}
              currentDetail={currentStageDetail}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                创建时间 {new Date(workItem.created_at).toLocaleString()}
              </span>
              {workItem.updated_at && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  更新时间 {new Date(workItem.updated_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 kanban-panel p-5 rounded-2xl">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              执行日志
              <span className="text-xs text-muted-foreground font-normal">({logs.length})</span>
            </h3>

            {logs.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm">暂无执行日志</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-border/50 overflow-hidden bg-card/50">
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleLog(log.id)}
                    >
                      {logStatusIcons[log.status] || logStatusIcons.pending}
                      <span className="text-sm font-medium text-foreground flex-1">{log.step_name}</span>
                      {log.worker && (
                        <span
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/workers/${log.worker!.id}`);
                          }}
                        >
                          {log.worker.name}
                        </span>
                      )}
                      {log.finished_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {calculateDuration(log.started_at, log.finished_at)}
                        </span>
                      )}
                      {expandedLogs.has(log.id) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {expandedLogs.has(log.id) && log.output && (
                      <div className="px-3 pb-3">
                        <pre className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
                          {log.output}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {workers.length > 0 && (
            <div className="kanban-panel p-5 rounded-2xl h-fit">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                协作成员
                <span className="text-xs text-muted-foreground font-normal">({workers.length})</span>
              </h3>
              <div className="flex flex-col gap-2">
                {workers.map((w) => (
                  <div
                    key={w.worker.id}
                    onClick={() => router.push(`/workers/${w.worker.id}`)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-medium">
                      {w.worker.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{w.worker.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{w.worker.position}</p>
                    </div>
                    {w.is_owner && (
                      <Badge className="bg-primary/10 text-primary border-0 text-[10px] shrink-0">负责人</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </KanbanLayout>
  );
}
