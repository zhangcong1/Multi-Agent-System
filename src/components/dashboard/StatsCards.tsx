'use client';

import { Users, Play, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  totalDevelopers: number;
  runningCount: number;
  waitingApprovalCount: number;
  doneCount: number;
  failedCount: number;
}

interface StatsCardsProps {
  stats: Stats | null;
}

const cards = [
  {
    key: 'totalDevelopers',
    title: '总开发者',
    icon: Users,
    color: 'from-blue-purple-500 to-blue-purple-600',
    bgColor: 'bg-blue-purple-500/10',
    textColor: 'text-blue-purple-600',
  },
  {
    key: 'runningCount',
    title: '进行中',
    icon: Play,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
  },
  {
    key: 'waitingApprovalCount',
    title: '待确认',
    icon: Clock,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600',
  },
  {
    key: 'doneCount',
    title: '已完成',
    icon: CheckCircle,
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
  },
  {
    key: 'failedCount',
    title: '已失败',
    icon: XCircle,
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600',
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full gradient-blue-purple" />
        统计概览
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const value = stats ? stats[card.key as keyof Stats] || 0 : 0;
          const Icon = card.icon;
          
          return (
            <div
              key={card.key}
              className="relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:shadow-md hover:border-border group"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`}
              />
              
              {/* Content */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-md ${card.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
