'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, User, Bot, Zap } from 'lucide-react';

interface Worker {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  type: 'HUMAN' | 'AI';
  avatar_url: string | null;
  taskCount: number;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

interface WorkerGridProps {
  workers: Worker[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const positionColors: Record<string, string> = {
  '全栈工程师': 'from-blue-500 to-cyan-500',
  '后端工程师': 'from-green-500 to-emerald-500',
  '前端工程师': 'from-purple-500 to-pink-500',
  'UI设计师': 'from-pink-500 to-rose-500',
  '产品经理': 'from-orange-500 to-amber-500',
  'AI需求分析员': 'from-violet-500 to-purple-500',
  'AI后端开发': 'from-teal-500 to-cyan-500',
  'AI前端开发': 'from-indigo-500 to-blue-500',
  'AI自动化测试': 'from-emerald-500 to-green-500',
};

function getInitials(name: string): string {
  return name.slice(0, 2);
}

function WorkerCard({ worker, index }: { worker: Worker; index: number }) {
  const router = useRouter();
  const isAI = worker.type === 'AI';
  const gradientClass = positionColors[worker.position] || 'from-primary to-primary';
  
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 cursor-pointer spark-card"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/work-items?owner_id=${worker.id}`)}
    >
      {/* 顶部装饰条 */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`} />
      
      {/* 悬停装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* 挂环装饰 */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-border bg-card group-hover:border-primary/50 transition-colors" />
      
      <div className="p-5 pt-6">
        {/* 头像区域 */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-border group-hover:border-primary/50 transition-colors">
              <AvatarImage src={worker.avatar_url || undefined} />
              <AvatarFallback className={`bg-gradient-to-br ${gradientClass} text-white text-lg font-medium`}>
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            {/* 类型标识 */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center ${isAI ? 'bg-violet-500' : 'bg-primary'}`}>
              {isAI ? <Bot className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
            </div>
          </div>
        </div>

        {/* 名称和职位 */}
        <div className="text-center mb-4">
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {worker.name}
          </h3>
          <Badge variant="outline" className={`text-xs bg-gradient-to-r ${gradientClass} bg-opacity-10 border-0 text-white`}>
            {worker.position}
          </Badge>
        </div>

        {/* 任务信息 */}
        <div className="space-y-3">
          {/* 任务数 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">当前任务</span>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{worker.taskCount}</span>
            </div>
          </div>

          {/* 进度条 */}
          {worker.totalSteps > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">最新进度</span>
                <span className="text-foreground">{worker.progress}%</span>
              </div>
              <Progress value={worker.progress} className="h-1.5" />
            </div>
          )}
        </div>

        {/* 底部分割线和箭头 */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">工号: {worker.employee_id}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

export default function WorkerGrid({ workers, currentPage, totalPages, onPageChange }: WorkerGridProps) {
  if (workers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">没有找到匹配的工作者</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {workers.map((worker, index) => (
          <WorkerCard key={worker.id} worker={worker} index={index} />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-card border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:border-primary/50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-card border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
