'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  ChevronRight, 
  Briefcase,
  Zap,
  Puzzle,
  Plug,
  FileText,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const positionColors: Record<string, { gradient: string; bg: string; border: string }> = {
  '全栈工程师': { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  '后端工程师': { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  '前端工程师': { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'UI设计师': { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  '产品经理': { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'AI需求分析员': { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'AI后端开发': { gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  'AI前端开发': { gradient: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  'AI自动化测试': { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

function WorkerCard({ worker, index }: { worker: Worker; index: number }) {
  const router = useRouter();
  const colorStyle = positionColors[worker.position] || { gradient: 'from-primary to-primary/70', bg: 'bg-primary/10', border: 'border-primary/20' };
  
  return (
    <div
      className="kanban-panel overflow-hidden kanban-card cursor-pointer group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/workers/${worker.id}`)}
    >
      {/* 顶部装饰条 */}
      <div className={cn('h-1 bg-gradient-to-r', colorStyle.gradient)} />
      
      <div className="p-5">
        {/* 头像和基本信息 */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-14 h-14 border-2 border-background shadow-md">
              <AvatarFallback className={cn('bg-gradient-to-br text-white text-lg font-medium', colorStyle.gradient)}>
                {worker.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* 状态指示器 */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card bg-emerald-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {worker.name}
            </h3>
            <Badge variant="outline" className={cn('mt-1', colorStyle.bg, colorStyle.border)}>
              <Briefcase className="w-3 h-3 mr-1" />
              {worker.position}
            </Badge>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        {/* 统计数据 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-bold number-highlight">{worker.taskCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">进行中任务</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-bold number-highlight">{worker.progress}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">当前进度</p>
          </div>
        </div>

        {/* 进度条 */}
        {worker.totalSteps > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">步骤进度</span>
              <span className="text-foreground">{worker.completedSteps}/{worker.totalSteps}</span>
            </div>
            <Progress value={worker.progress} className="h-1.5" />
          </div>
        )}

        {/* 底部 */}
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>工号: {worker.employee_id}</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const res = await fetch('/api/spark/workers');
        const json = await res.json();
        if (json.success) {
          setWorkers(json.data);
        }
      } catch (err) {
        console.error('获取工作者失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkers();
  }, []);

  // 筛选
  const filteredWorkers = workers.filter((worker) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        worker.name.toLowerCase().includes(query) ||
        worker.position.toLowerCase().includes(query) ||
        worker.employee_id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 分页
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredWorkers.length / pageSize);

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

  return (
    <KanbanLayout>
      <div className="p-6 space-y-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">工作者</h1>
            <p className="text-muted-foreground text-sm mt-1">
              共 {filteredWorkers.length} 位工作者
            </p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索工作者..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* 卡片网格 */}
        {paginatedWorkers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">没有找到匹配的工作者</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedWorkers.map((worker, index) => (
              <WorkerCard key={worker.id} worker={worker} index={index} />
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm bg-card border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm transition-colors',
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary/50'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm bg-card border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </KanbanLayout>
  );
}
