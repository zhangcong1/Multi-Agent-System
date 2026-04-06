'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, CheckCircle, XCircle, ChevronRight, User } from 'lucide-react';

interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  owner: {
    id: number;
    name: string;
    position: string;
  } | null;
}

interface WorkItemGridProps {
  items: WorkItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgClass: string }> = {
  RUNNING: { 
    label: '进行中', 
    icon: Play, 
    color: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  },
  WAITING_APPROVAL: { 
    label: '待确认', 
    icon: Clock, 
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
  },
  DONE: { 
    label: '已完成', 
    icon: CheckCircle, 
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  },
  FAILED: { 
    label: '已失败', 
    icon: XCircle, 
    color: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/20 text-red-400'
  },
};

function WorkItemCard({ item, index }: { item: WorkItem; index: number }) {
  const router = useRouter();
  const status = statusConfig[item.status] || statusConfig.RUNNING;
  const StatusIcon = status.icon;
  const isRunning = item.status === 'RUNNING';
  const isWaiting = item.status === 'WAITING_APPROVAL';

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 cursor-pointer spark-card"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/work-items/${item.id}`)}
    >
      {/* 状态指示条 */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isRunning ? 'bg-blue-500 animate-pulse' : 
        isWaiting ? 'bg-amber-500' : 
        item.status === 'DONE' ? 'bg-emerald-500' : 
        'bg-red-500'
      }`} />
      
      {/* 悬停装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* 顶部状态和负责人 */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className={status.bgClass}>
            <StatusIcon className={`w-3 h-3 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
            {status.label}
          </Badge>
          {item.owner && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{item.owner.name}</span>
            </div>
          )}
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* 描述 */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString('zh-CN')}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

export default function WorkItemGrid({ items, currentPage, totalPages, onPageChange }: WorkItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">没有找到匹配的需求</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <WorkItemCard key={item.id} item={item} index={index} />
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
