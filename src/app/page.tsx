'use client';

import { useEffect, useState } from 'react';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import HomeHero from '@/components/spark/HomeHero';
import RecentActivityStrip, {
  type ActivityItem,
} from '@/components/spark/RecentActivityStrip';
import {
  Users,
  Bot,
  FolderKanban,
  TrendingUp,
  CheckCircle,
  Play,
  ArrowUpRight,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SparkStats {
  totalWorkItems: number;
  runningCount: number;
  doneCount: number;
  waitingApprovalCount: number;
  failedCount: number;
  totalDevelopers: number;
  totalAIWorkers: number;
}

interface Project {
  id: number;
  title: string;
  status: string;
  progress: number;
  currentStage: string;
  developer: { name: string } | null;
  experts: { name: string; position: string }[];
  updatedAt: string;
}

const statusStageLabel: Record<string, string> = {
  RUNNING: '执行中',
  WAITING_APPROVAL: '待确认',
  DONE: '已完成',
  FAILED: '已失败',
};

// 进度环组件
function ProgressRing({ 
  progress, 
  size = 80, 
  strokeWidth = 8
}: { 
  progress: number; 
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        stroke="oklch(0.90 0.005 240)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="oklch(0.45 0.15 240)"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="progress-ring-circle"
      />
    </svg>
  );
}

// 统计卡片
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend,
  color,
  index 
}: { 
  icon: React.ElementType;
  label: string;
  value: number | string;
  subValue?: string;
  trend?: number;
  color: string;
  index: number;
}) {
  return (
    <div 
      className="glass-card rounded-xl p-5 card-hover stagger-item"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center text-white',
          color
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            <TrendingUp className={cn('w-3.5 h-3.5', trend < 0 && 'rotate-180')} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gradient number-animate">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
}

// 项目卡片
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    RUNNING: { label: '进行中', color: 'text-blue-600', bg: 'bg-blue-50' },
    WAITING_APPROVAL: { label: '待确认', color: 'text-amber-600', bg: 'bg-amber-50' },
    DONE: { label: '已完成', color: 'text-green-600', bg: 'bg-green-50' },
    FAILED: { label: '已失败', color: 'text-red-600', bg: 'bg-red-50' },
  };

  const status = statusConfig[project.status] || statusConfig.RUNNING;

  return (
    <div 
      className="glass-card rounded-xl p-5 card-hover cursor-pointer stagger-item group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-medium shrink-0',
              status.bg, status.color
            )}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{project.currentStage}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* 进度条 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">进度</span>
          <span className="font-medium text-foreground">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary relative"
            style={{ width: `${project.progress}%` }}
          >
            <div className="absolute inset-0 progress-shimmer" />
          </div>
        </div>
      </div>

      {/* 协作人员 */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {project.developer && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-medium">
                {project.developer.name.slice(0, 1)}
              </div>
              <span className="text-xs text-muted-foreground">{project.developer.name}</span>
            </div>
          )}
          {project.experts.slice(0, 2).map((expert, i) => (
            <div key={i} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-foreground text-xs font-medium -ml-1.5 ring-2 ring-background">
              {expert.name.slice(0, 1)}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<SparkStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, projectsRes, activityRes] = await Promise.all([
          fetch('/api/spark/stats'),
          fetch('/api/spark/work-items?limit=6'),
          fetch('/api/spark/recent-activity'),
        ]);

        const statsJson = await statsRes.json();
        const projectsJson = await projectsRes.json();
        const activityJson = await activityRes.json();

        if (statsJson.success) setStats(statsJson.data);
        setLastSynced(new Date());

        if (activityJson.success) {
          setActivities(activityJson.data ?? []);
        }

        if (projectsJson.success) {
          const raw = projectsJson.data as Array<{
            id: number;
            title: string;
            status: string;
            created_at: string;
            owner: { name: string; position: string } | null;
          }>;

          const mapped: Project[] = raw.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            progress:
              p.status === 'DONE'
                ? 100
                : p.status === 'FAILED'
                  ? 0
                  : p.status === 'WAITING_APPROVAL'
                    ? 75
                    : 40,
            currentStage: statusStageLabel[p.status] ?? p.status,
            developer: p.owner ? { name: p.owner.name } : null,
            experts: p.owner
              ? [{ name: p.owner.name, position: p.owner.position }]
              : [],
            updatedAt: p.created_at,
          }));
          setProjects(mapped);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
        setActivityLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  const totalItems = stats?.totalWorkItems ?? 0;
  const doneCount = stats?.doneCount ?? 0;
  const completionPct =
    totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <KanbanLayout>
      <div className="space-y-8 p-8">
        <HomeHero
          stats={
            stats
              ? {
                  runningCount: stats.runningCount,
                  waitingApprovalCount: stats.waitingApprovalCount,
                  totalWorkItems: stats.totalWorkItems,
                }
              : null
          }
          syncedAt={lastSynced}
        />

        <RecentActivityStrip items={activities} loading={activityLoading} />

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label="需求总数"
            value={stats?.totalWorkItems || 0}
            subValue={`${stats?.runningCount || 0} 个进行中`}
            color="bg-primary"
            index={0}
          />
          <StatCard
            icon={CheckCircle}
            label="已完成"
            value={stats?.doneCount || 0}
            subValue={
              totalItems > 0 ? `全库约 ${completionPct}%` : '暂无需求'
            }
            color="bg-green-600"
            index={1}
          />
          <StatCard
            icon={Users}
            label="人工作者"
            value={stats?.totalDevelopers || 0}
            subValue="真实员工"
            color="bg-blue-600"
            index={2}
          />
          <StatCard
            icon={Bot}
            label="AI 数字人"
            value={stats?.totalAIWorkers || 0}
            subValue="可参与流水线步骤"
            color="bg-cyan-600"
            index={3}
          />
        </div>

        {/* 主体内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 项目进度 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                进行中的项目
              </h2>
              <a href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
                查看全部 <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>

          {/* 右侧面板 */}
          <div className="space-y-5">
            {/* 整体进度 */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-medium text-foreground mb-4">整体进度</h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <ProgressRing progress={completionPct} size={120} strokeWidth={10} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{completionPct}%</p>
                      <p className="text-xs text-muted-foreground">完成率</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-blue-600">{stats?.runningCount || 0}</p>
                  <p className="text-xs text-muted-foreground">进行中</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-amber-600">{stats?.waitingApprovalCount || 0}</p>
                  <p className="text-xs text-muted-foreground">待确认</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-green-600">{stats?.doneCount || 0}</p>
                  <p className="text-xs text-muted-foreground">已完成</p>
                </div>
              </div>
            </div>

            {/* 团队成员 */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">团队成员</h3>
                <a href="/developers" className="text-xs text-primary hover:underline">查看全部</a>
              </div>
              <div className="space-y-2">
                {[
                  { name: '张明', role: '全栈工程师', status: 'online' },
                  { name: '李华', role: '后端工程师', status: 'online' },
                  { name: '王芳', role: 'UI设计师', status: 'busy' },
                  { name: '刘强', role: '产品经理', status: 'online' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-medium">
                      {member.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      member.status === 'online' ? 'bg-green-500' : 'bg-amber-500'
                    )} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </KanbanLayout>
  );
}
