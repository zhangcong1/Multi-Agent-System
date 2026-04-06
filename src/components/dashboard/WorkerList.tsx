'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, User, Bot } from 'lucide-react';

interface Worker {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  avatar_url: string | null;
  taskCount: number;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

interface WorkerListProps {
  workers: Worker[];
}

// 职位颜色映射
const positionColors: Record<string, string> = {
  '全栈工程师': 'bg-blue-purple-500/10 text-blue-purple-600 border-blue-purple-500/20',
  '后端工程师': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  '前端工程师': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'UI设计师': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  '产品经理': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

// 默认颜色
const defaultColor = 'bg-muted text-muted-foreground border-border';

function getPositionColor(position: string): string {
  return positionColors[position] || defaultColor;
}

function getInitials(name: string): string {
  return name.slice(0, 2);
}

export default function WorkerList({ workers }: WorkerListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const router = useRouter();

  if (workers.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full gradient-blue-purple" />
          真实员工
        </h2>
        <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">暂无员工数据</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            请通过 API 添加员工信息
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full gradient-blue-purple" />
        真实员工
        <span className="text-sm font-normal text-muted-foreground">
          ({workers.length} 人)
        </span>
      </h2>
      
      <div className="grid gap-3">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
            onMouseEnter={() => setHoveredId(worker.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => router.push(`/work-items?owner_id=${worker.id}`)}
          >
            {/* Hover gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-blue-purple-500/5 to-transparent transition-opacity ${
                hoveredId === worker.id ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            <div className="relative flex items-center gap-4">
              {/* Avatar */}
              <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                <AvatarImage src={worker.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-purple-500 to-blue-purple-600 text-white font-medium">
                  {getInitials(worker.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {worker.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getPositionColor(worker.position)}`}
                  >
                    {worker.position}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    工号: {worker.employee_id}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 max-w-xs">
                    <Progress
                      value={worker.progress}
                      className="h-2"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[80px]">
                    {worker.progress}% ({worker.completedSteps}/{worker.totalSteps})
                  </span>
                </div>
              </div>

              {/* Task Count */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10">
                <span className="text-2xl font-bold text-primary">
                  {worker.taskCount}
                </span>
                <span className="text-xs text-muted-foreground">任务</span>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
