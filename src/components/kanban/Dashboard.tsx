'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FolderKanban, 
  Play, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Zap,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  Terminal,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 统计数据类型
interface Stats {
  totalWorkers: number;
  activeWorkers: number;
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  queuedTasks: number;
}

// 工作者类型
interface Worker {
  id: number;
  name: string;
  position: string;
  status: string;
  taskCount: number;
  progress: number;
  currentTask?: string;
}

// 任务类型
interface Task {
  id: number;
  title: string;
  status: string;
  stage: string;
  owner: { name: string };
  progress: number;
  createdAt: string;
}

// 日志类型
interface LogEntry {
  id: number;
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  worker?: string;
}

// 动画数字组件
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 800;
          const steps = 20;
          const stepValue = value / steps;
          let current = 0;
          
          const interval = setInterval(() => {
            current += stepValue;
            if (current >= value) {
              setDisplayValue(value);
              clearInterval(interval);
            } else {
              setDisplayValue(Math.floor(current));
            }
          }, duration / steps);

          return () => clearInterval(interval);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref} className={className}>{displayValue}</span>;
}

// 状态指示器
function StatusIndicator({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const colorMap: Record<string, string> = {
    running: 'bg-blue-500',
    waiting: 'bg-amber-500',
    done: 'bg-emerald-500',
    failed: 'bg-red-500',
    idle: 'bg-gray-400',
  };

  const isPulsing = status === 'running';

  return (
    <span className="relative flex">
      <span className={cn(
        'rounded-full',
        sizeMap[size],
        colorMap[status] || colorMap.idle,
        isPulsing && 'animate-status-dot'
      )} />
      {isPulsing && (
        <span className={cn(
          'absolute rounded-full animate-ripple',
          sizeMap[size],
          colorMap[status] || colorMap.idle
        )} />
      )}
    </span>
  );
}

// 统计卡片
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color = 'primary' 
}: { 
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: number;
  color?: string;
}) {
  const colorStyles: Record<string, { bg: string; iconBg: string }> = {
    primary: { bg: 'bg-primary/10', iconBg: 'bg-primary' },
    blue: { bg: 'bg-blue-500/10', iconBg: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-500/10', iconBg: 'bg-amber-500' },
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <div className="kanban-panel p-4 kanban-card">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', style.iconBg)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            'text-xs font-medium flex items-center gap-0.5',
            trend >= 0 ? 'text-emerald-500' : 'text-red-500'
          )}>
            <TrendingUp className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold number-highlight">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// 工作者卡片
function WorkerCard({ worker, index }: { worker: Worker; index: number }) {
  const router = useRouter();

  return (
    <div
      className="kanban-panel p-4 kanban-card cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/workers/${worker.id}`)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-sm">
            {worker.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{worker.name}</span>
            <StatusIndicator status={worker.status} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{worker.position}</p>
        </div>
      </div>
      
      {worker.progress > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">当前任务</span>
            <span className="number-highlight">{worker.progress}%</span>
          </div>
          <Progress value={worker.progress} className="h-1.5" />
        </div>
      )}

      {worker.currentTask && (
        <p className="text-xs text-muted-foreground mt-2 truncate">{worker.currentTask}</p>
      )}
    </div>
  );
}

// 任务卡片
function TaskCard({ task, index }: { task: Task; index: number }) {
  const router = useRouter();
  
  const statusColors: Record<string, string> = {
    RUNNING: 'bg-blue-500',
    WAITING_APPROVAL: 'bg-amber-500',
    DONE: 'bg-emerald-500',
    FAILED: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    RUNNING: '进行中',
    WAITING_APPROVAL: '待确认',
    DONE: '已完成',
    FAILED: '已失败',
  };

  return (
    <div
      className="kanban-panel overflow-hidden kanban-card cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/work-items/${task.id}`)}
    >
      <div className={cn('h-1', statusColors[task.status] || 'bg-gray-400')} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2">{task.title}</h4>
          <Badge variant="outline" className="text-xs shrink-0">
            {statusLabels[task.status] || task.status}
          </Badge>
        </div>
        
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{task.owner.name}</span>
          <span>·</span>
          <span>{task.stage}</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">进度</span>
            <span className="number-highlight">{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-1" />
        </div>
      </div>
    </div>
  );
}

// 日志条目
function LogItem({ log, index }: { log: LogEntry; index: number }) {
  const levelColors: Record<string, string> = {
    info: 'text-blue-500',
    warn: 'text-amber-500',
    error: 'text-red-500',
    success: 'text-emerald-500',
  };

  const levelLabels: Record<string, string> = {
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    success: 'DONE',
  };

  return (
    <div 
      className="log-entry flex items-start gap-3 py-2 px-3 hover:bg-muted/30 rounded text-sm"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <span className="text-xs text-muted-foreground shrink-0 font-mono">{log.time}</span>
      <span className={cn('text-xs font-medium shrink-0 font-mono', levelColors[log.level])}>
        [{levelLabels[log.level]}]
      </span>
      {log.worker && (
        <span className="text-xs text-primary shrink-0">[{log.worker}]</span>
      )}
      <span className="text-foreground flex-1">{log.message}</span>
    </div>
  );
}

// 系统状态面板
function SystemPanel() {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memUsage, setMemUsage] = useState(62);

  // 模拟动态数据
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(20, prev + (Math.random() - 0.5) * 10)));
      setMemUsage(prev => Math.min(100, Math.max(30, prev + (Math.random() - 0.5) * 5)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="kanban-panel p-4">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        系统状态
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              CPU 使用率
            </span>
            <span className="number-highlight">{Math.round(cpuUsage)}%</span>
          </div>
          <Progress value={cpuUsage} className="h-1.5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              内存使用
            </span>
            <span className="number-highlight">{Math.round(memUsage)}%</span>
          </div>
          <Progress value={memUsage} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">网络</span>
            </div>
            <p className="text-sm font-medium mt-1">正常</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">服务</span>
            </div>
            <p className="text-sm font-medium mt-1">运行中</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalWorkers: 0,
    activeWorkers: 0,
    totalTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    queuedTasks: 0,
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, workersRes, tasksRes] = await Promise.all([
          fetch('/api/spark/stats'),
          fetch('/api/spark/workers'),
          fetch('/api/spark/work-items'),
        ]);

        const [statsJson, workersJson, tasksJson] = await Promise.all([
          statsRes.json(),
          workersRes.json(),
          tasksRes.json(),
        ]);

        if (statsJson.success) {
          const d = statsJson.data;
          setStats({
            totalWorkers: (d.totalDevelopers || 0) + (d.totalAIWorkers || 0),
            activeWorkers: d.runningCount || 0,
            totalTasks: d.totalWorkItems || 0,
            runningTasks: d.runningCount || 0,
            completedTasks: d.doneCount || 0,
            queuedTasks: d.waitingApprovalCount || 0,
          });
        }

        if (workersJson.success) {
          setWorkers(workersJson.data.slice(0, 6).map((w: { id: number; name: string; position: string; taskCount: number; progress: number }) => ({
            id: w.id,
            name: w.name,
            position: w.position,
            status: w.taskCount > 0 ? 'running' : 'idle',
            taskCount: w.taskCount,
            progress: w.progress,
            currentTask: w.taskCount > 0 ? `${w.taskCount} 个任务执行中` : undefined,
          })));
        }

        if (tasksJson.success) {
          setTasks(tasksJson.data.slice(0, 4).map((t: { id: number; title: string; status: string; owner: { name: string }; created_at: string }) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            stage: '执行中',
            owner: t.owner || { name: '未分配' },
            progress: Math.floor(Math.random() * 60 + 20),
            createdAt: t.created_at,
          })));
        }

        // 模拟日志
        setLogs([
          { id: 1, time: '14:32:05', level: 'info', message: '用户认证系统升级 - 开始执行需求分析', worker: 'AI需求分析员' },
          { id: 2, time: '14:32:03', level: 'success', message: 'API性能优化 - 方案设计阶段完成', worker: '张明' },
          { id: 3, time: '14:31:58', level: 'info', message: '启动自动化测试流程', worker: 'AI自动化测试' },
          { id: 4, time: '14:31:45', level: 'warn', message: '接口响应时间较长，建议优化', worker: 'AI后端开发' },
          { id: 5, time: '14:31:30', level: 'success', message: '前端页面开发完成，进入联调阶段', worker: '李芳' },
          { id: 6, time: '14:31:15', level: 'info', message: '新增需求：数据可视化看板', worker: '系统' },
        ]);
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  return (
    <KanbanLayout>
      <div className="p-6 space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">控制中心</h1>
            <p className="text-muted-foreground text-sm mt-1">实时监控研发协作状态</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>

        {/* 统计卡片行 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            icon={Users}
            label="工作者"
            value={stats.totalWorkers}
            color="primary"
          />
          <StatCard
            icon={Activity}
            label="活跃中"
            value={stats.activeWorkers}
            color="blue"
          />
          <StatCard
            icon={FolderKanban}
            label="总任务"
            value={stats.totalTasks}
            color="primary"
          />
          <StatCard
            icon={Play}
            label="进行中"
            value={stats.runningTasks}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="已完成"
            value={stats.completedTasks}
            color="emerald"
          />
          <StatCard
            icon={Clock}
            label="队列中"
            value={stats.queuedTasks}
            color="amber"
          />
        </div>

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：活跃工作者 + 任务列表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 活跃工作者 */}
            <div className="kanban-panel">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  活跃工作者
                </h3>
                <Link 
                  href="/workers" 
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  查看全部 <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {workers.map((worker, index) => (
                  <WorkerCard key={worker.id} worker={worker} index={index} />
                ))}
              </div>
            </div>

            {/* 任务执行 */}
            <div className="kanban-panel">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  任务执行
                </h3>
                <Link 
                  href="/work-items" 
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  查看全部 <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：系统状态 + 日志 */}
          <div className="space-y-6">
            {/* 系统状态 */}
            <SystemPanel />

            {/* 执行日志 */}
            <div className="kanban-panel">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  执行日志
                </h3>
                <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  刷新
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {logs.map((log, index) => (
                  <LogItem key={log.id} log={log} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </KanbanLayout>
  );
}
