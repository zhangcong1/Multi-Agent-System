'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Zap,
  FileText,
  Play,
  Pause,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Timer,
  Wrench
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
}

// 研发阶段定义
const STAGE_ORDER = [
  '需求分析',
  '方案设计',
  '后端开发',
  '前端开发',
  '接口联调',
  '自动化测试',
  '修复验证',
  '验收交付'
];

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  '需求分析': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  '方案设计': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  '后端开发': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  '前端开发': { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
  '接口联调': { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30' },
  '自动化测试': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  '修复验证': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  '验收交付': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
};

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

function StageProgress({ stages, currentStage }: { stages: StageInfo[]; currentStage: string | null }) {
  return (
    <div className="space-y-3">
      {STAGE_ORDER.map((stageName) => {
        const stage = stages.find(s => s.name === stageName);
        const isCompleted = stage?.status === 'completed';
        const isRunning = stage?.status === 'running';
        const colors = stageColors[stageName] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };

        return (
          <div key={stageName} className="flex items-center gap-3">
            {/* 连接线 */}
            <div className="relative flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all text-sm font-medium',
                isCompleted ? 'bg-emerald-500 text-white' :
                isRunning ? `${colors.bg} ${colors.border} border-2 ${colors.text}` :
                'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : STAGE_ORDER.indexOf(stageName) + 1}
              </div>
              {stageName !== STAGE_ORDER[STAGE_ORDER.length - 1] && (
                <div className={cn(
                  'w-0.5 h-6',
                  isCompleted ? 'bg-emerald-500' : 'bg-muted'
                )} />
              )}
            </div>

            {/* 阶段名称 */}
            <span className={cn(
              'text-sm font-medium',
              isCompleted ? 'text-emerald-500' :
              isRunning ? colors.text :
              'text-muted-foreground'
            )}>
              {stageName}
            </span>

            {/* 状态指示器 */}
            {isRunning && (
              <Badge className={cn(colors.bg, colors.text, 'border-0 ml-auto')}>
                执行中
              </Badge>
            )}
          </div>
        );
      })}
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
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
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

  return (
    <KanbanLayout>
      <div className="p-6 space-y-6">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        {/* 需求信息卡片 */}
        <div className="kanban-panel overflow-hidden">
          <div className={cn('h-1.5', status.barColor)} />
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">{workItem.title}</h1>
                  <Badge className={cn(status.bg, status.text, 'border-0')}>
                    {status.label}
                  </Badge>
                </div>
                {workItem.description && (
                  <p className="text-muted-foreground mt-2">{workItem.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  {workItem.owner && (
                    <div 
                      className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => router.push(`/workers/${workItem.owner!.id}`)}
                    >
                      <User className="w-4 h-4" />
                      <span>负责人: {workItem.owner.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>创建: {new Date(workItem.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* 整体进度 */}
              <div className="text-right">
                <p className="text-3xl font-bold number-highlight">{workItem.stage_progress}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {workItem.completed_stages}/{workItem.total_stages} 阶段
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：阶段进度 */}
          <div className="kanban-panel p-5">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              阶段进度
            </h3>
            <StageProgress stages={stages} currentStage={workItem.current_stage} />
          </div>

          {/* 右侧：执行日志 */}
          <div className="lg:col-span-2 kanban-panel p-5">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              执行日志
              <span className="text-xs text-muted-foreground font-normal">({logs.length})</span>
            </h3>

            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm">暂无执行日志</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-border/50 overflow-hidden"
                  >
                    {/* 日志头部 */}
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleLog(log.id)}
                    >
                      {logStatusIcons[log.status] || logStatusIcons.pending}
                      <span className="text-sm font-medium text-foreground flex-1">
                        {log.step_name}
                      </span>
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
                    
                    {/* 展开的输出 */}
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
        </div>

        {/* 协作成员 */}
        {workers.length > 0 && (
          <div className="kanban-panel p-5">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              协作成员
              <span className="text-xs text-muted-foreground font-normal">({workers.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {workers.map((w) => (
                <div
                  key={w.worker.id}
                  onClick={() => router.push(`/workers/${w.worker.id}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs">
                    {w.worker.name.slice(0, 1)}
                  </div>
                  <span className="text-sm text-foreground">{w.worker.name}</span>
                  {w.is_owner && (
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">负责人</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </KanbanLayout>
  );
}
