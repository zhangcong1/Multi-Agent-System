'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, Bot, Play, Clock, CheckCircle, XCircle, FolderKanban } from 'lucide-react';

interface Stats {
  totalDevelopers: number;
  totalAIWorkers: number;
  runningCount: number;
  waitingApprovalCount: number;
  doneCount: number;
  failedCount: number;
  totalWorkItems: number;
}

interface StatsOverviewProps {
  stats: Stats | null;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay?: number;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
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
    
    const timeout = setTimeout(() => {
      const duration = 1000;
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
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay, isVisible]);

  return <span ref={ref}>{displayValue}</span>;
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: StatCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 背景装饰 */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-2xl transition-all group-hover:opacity-10`} />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">
            <AnimatedNumber value={value} delay={delay} />
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${color.replace('bg-', 'bg-').replace('/20', '/10')} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-').replace('/20', '')}`} />
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, total, label, color, size = 80 }: {
  value: number;
  total: number;
  label: string;
  color: string;
  size?: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
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
            className={`fill-none ${color} transition-all duration-1000`}
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
          <span className="text-lg font-bold text-foreground">{percentage}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}/{total}</p>
    </div>
  );
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) return null;

  return (
    <section className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full spark-gradient" />
        <h2 className="text-lg font-semibold text-foreground">统计概览</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：数字卡片 */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="真实员工"
            value={stats.totalDevelopers}
            color="bg-blue-500/20"
            delay={0}
          />
          <StatCard
            icon={Bot}
            label="AI 数字人"
            value={stats.totalAIWorkers}
            color="bg-purple-500/20"
            delay={100}
          />
          <StatCard
            icon={FolderKanban}
            label="需求总数"
            value={stats.totalWorkItems}
            color="bg-cyan-500/20"
            delay={200}
          />
          <StatCard
            icon={Play}
            label="进行中"
            value={stats.runningCount}
            color="bg-primary/20"
            delay={300}
          />
        </div>

        {/* 右侧：环形进度图 */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <p className="text-sm text-muted-foreground mb-4">需求状态分布</p>
          <div className="flex justify-around items-center">
            <CircularProgress
              value={stats.doneCount}
              total={stats.totalWorkItems}
              label="已完成"
              color="stroke-emerald-500"
            />
            <CircularProgress
              value={stats.runningCount}
              total={stats.totalWorkItems}
              label="进行中"
              color="stroke-primary"
            />
            <CircularProgress
              value={stats.waitingApprovalCount}
              total={stats.totalWorkItems}
              label="待确认"
              color="stroke-amber-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
