'use client';

import { useEffect, useState } from 'react';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  Users, 
  Bot, 
  FolderKanban, 
  TrendingUp,
  Clock,
  CheckCircle,
  Play,
  ArrowUpRight,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalProjects: number;
  runningProjects: number;
  completedProjects: number;
  waitingProjects: number;
  totalDevelopers: number;
  activeDevelopers: number;
  totalExperts: number;
  activeExperts: number;
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          fetch('/api/spark/stats'),
          fetch('/api/spark/work-items?limit=6')
        ]);
        
        const statsJson = await statsRes.json();
        const projectsJson = await projectsRes.json();
        
        if (statsJson.success) setStats(statsJson.data);
        if (projectsJson.success) {
          const projectsWithExperts = projectsJson.data.map((p: Project) => ({
            ...p,
            experts: p.experts || [
              { name: '王工', position: '后端工程师' },
              { name: '李工', position: '前端工程师' }
            ]
          }));
          setProjects(projectsWithExperts);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
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

  return (
    <KanbanLayout>
      <div className="p-8 space-y-8">
        {/* 标题区域 */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">工作概览</h1>
          <p className="text-muted-foreground text-sm mt-1">
            团队协作 · 项目进度 · 工作动态
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            icon={FolderKanban}
            label="项目总数"
            value={stats?.totalProjects || 0}
            subValue={`${stats?.runningProjects || 0} 个进行中`}
            color="bg-primary"
            trend={12}
            index={0}
          />
          <StatCard 
            icon={CheckCircle}
            label="已完成"
            value={stats?.completedProjects || 0}
            subValue="本周期"
            color="bg-green-600"
            trend={8}
            index={1}
          />
          <StatCard 
            icon={Users}
            label="开发者"
            value={stats?.totalDevelopers || 0}
            subValue={`${stats?.activeDevelopers || 0} 位在线`}
            color="bg-blue-600"
            index={2}
          />
          <StatCard 
            icon={Bot}
            label="专家团队"
            value={stats?.totalExperts || 0}
            subValue={`${stats?.activeExperts || 0} 位可调度`}
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
                  <ProgressRing progress={stats?.totalProjects ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0} size={120} strokeWidth={10} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {stats?.totalProjects ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">完成率</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-blue-600">{stats?.runningProjects || 0}</p>
                  <p className="text-xs text-muted-foreground">进行中</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-amber-600">{stats?.waitingProjects || 0}</p>
                  <p className="text-xs text-muted-foreground">待确认</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold text-green-600">{stats?.completedProjects || 0}</p>
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
