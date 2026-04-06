'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import { Users, FolderKanban, Play, CheckCircle, Clock, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { APP_DISPLAY_NAME } from '@/lib/app-brand';

interface Stats {
  totalWorkers: number;
  totalWorkItems: number;
  runningCount: number;
  waitingApprovalCount: number;
  doneCount: number;
  failedCount: number;
}

interface RecentWorkItem {
  id: number;
  title: string;
  status: string;
  owner_name: string;
  created_at: string;
}

interface ActiveWorker {
  id: number;
  name: string;
  position: string;
  currentTask: string;
  progress: number;
}

function AnimatedNumber({ value, duration = 1000, className = '' }: { value: number; duration?: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const steps = 30;
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
  }, [value, duration, isVisible]);

  return <span ref={ref} className={className}>{displayValue}</span>;
}

function CircularProgress({ 
  value, 
  total, 
  label, 
  color, 
  glowColor,
  size = 100 
}: {
  value: number;
  total: number;
  label: string;
  color: string;
  glowColor: string;
  size?: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="ring-progress" width={size} height={size}>
          <circle
            className="fill-none stroke-muted"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`fill-none transition-all duration-1000 ${color}`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${glowColor}`}>{percentage}%</span>
        </div>
        {/* 光晕效果 */}
        <div 
          className={`absolute inset-0 rounded-full ${glowColor} opacity-20 blur-xl`}
          style={{ width: size, height: size }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{value} / {total}</p>
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  gradient,
  delay = 0 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 card-glow-hover"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 顶部彩色条 */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />
      
      {/* 背景装饰光晕 */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${gradient} opacity-10 blur-3xl transition-all group-hover:opacity-20`} />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-4xl font-bold">
            <AnimatedNumber value={value} className={color} />
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  gradient 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  href: string; 
  gradient: string;
}) {
  const router = useRouter();
  
  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 cursor-pointer transition-all hover:shadow-lg card-glow-hover"
      onClick={() => router.push(href)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentWorkItem[]>([]);
  const [activeWorkers, setActiveWorkers] = useState<ActiveWorker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 获取统计数据
        const statsRes = await fetch('/api/spark/stats');
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          const data = statsJson.data;
          setStats({
            totalWorkers: (data.totalDevelopers || 0) + (data.totalAIWorkers || 0),
            totalWorkItems: data.totalWorkItems || 0,
            runningCount: data.runningCount || 0,
            waitingApprovalCount: data.waitingApprovalCount || 0,
            doneCount: data.doneCount || 0,
            failedCount: data.failedCount || 0,
          });
        }

        // 获取最近需求
        const itemsRes = await fetch('/api/spark/work-items?limit=5');
        const itemsJson = await itemsRes.json();
        if (itemsJson.success) {
          setRecentItems(itemsJson.data.slice(0, 5));
        }

        // 获取活跃工作者
        const workersRes = await fetch('/api/spark/workers');
        const workersJson = await workersRes.json();
        if (workersJson.success) {
          const active = workersJson.data
            .filter((w: { taskCount: number }) => w.taskCount > 0)
            .slice(0, 5)
            .map((w: { id: number; name: string; position: string; taskCount: number; progress: number }) => ({
              id: w.id,
              name: w.name,
              position: w.position,
              currentTask: `${w.taskCount} 个任务进行中`,
              progress: w.progress,
            }));
          setActiveWorkers(active);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // 每30秒刷新
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full spark-gradient animate-pulse flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    RUNNING: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    WAITING_APPROVAL: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    DONE: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    FAILED: { bg: 'bg-red-500/10', text: 'text-red-500' },
  };

  const statusLabels: Record<string, string> = {
    RUNNING: '进行中',
    WAITING_APPROVAL: '待确认',
    DONE: '已完成',
    FAILED: '已失败',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 欢迎区域 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="spark-text-gradient">{APP_DISPLAY_NAME}</span>
          </h1>
          <p className="text-muted-foreground">实时追踪研发流程，掌握每一步进展</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="工作者"
            value={stats?.totalWorkers || 0}
            color="number-highlight"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            delay={0}
          />
          <StatCard
            icon={FolderKanban}
            label="需求总数"
            value={stats?.totalWorkItems || 0}
            color="number-highlight"
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            delay={100}
          />
          <StatCard
            icon={Play}
            label="进行中"
            value={stats?.runningCount || 0}
            color="number-highlight"
            gradient="bg-gradient-to-br from-primary to-purple-500"
            delay={200}
          />
          <StatCard
            icon={CheckCircle}
            label="已完成"
            value={stats?.doneCount || 0}
            color="number-highlight"
            gradient="bg-gradient-to-br from-emerald-500 to-green-500"
            delay={300}
          />
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：状态分布图 */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border/50 bg-card p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">需求状态分布</h2>
              </div>
              <div className="flex flex-col items-center gap-8">
                <CircularProgress
                  value={stats?.doneCount || 0}
                  total={stats?.totalWorkItems || 1}
                  label="已完成"
                  color="stroke-emerald-500 chart-glow-emerald"
                  glowColor="text-emerald-500"
                  size={120}
                />
                <div className="grid grid-cols-2 gap-6 w-full">
                  <CircularProgress
                    value={stats?.runningCount || 0}
                    total={stats?.totalWorkItems || 1}
                    label="进行中"
                    color="stroke-primary chart-glow"
                    glowColor="text-primary"
                    size={90}
                  />
                  <CircularProgress
                    value={stats?.waitingApprovalCount || 0}
                    total={stats?.totalWorkItems || 1}
                    label="待确认"
                    color="stroke-amber-500 chart-glow-amber"
                    glowColor="text-amber-500"
                    size={90}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：最近需求和活跃工作者 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 最近需求 */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">最近需求</h2>
                </div>
                <span className="text-sm text-muted-foreground">{recentItems.length} 条记录</span>
              </div>
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.owner_name} · {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[item.status]?.bg} ${statusColors[item.status]?.text}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 活跃工作者 */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">活跃工作者</h2>
                </div>
                <span className="text-sm text-muted-foreground">{activeWorkers.length} 人在线</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeWorkers.map((worker) => (
                  <div 
                    key={worker.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full spark-gradient flex items-center justify-center text-white font-medium">
                      {worker.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">{worker.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium number-highlight">{worker.progress}%</p>
                      <p className="text-xs text-muted-foreground">{worker.currentTask}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 快速入口 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickLinkCard
            title="工作者列表"
            description="查看所有工作者的任务进度和状态"
            icon={Users}
            href="/workers"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <QuickLinkCard
            title="需求列表"
            description="浏览所有需求的详细信息和执行状态"
            icon={FolderKanban}
            href="/work-items"
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
          />
        </div>
      </main>
    </div>
  );
}
