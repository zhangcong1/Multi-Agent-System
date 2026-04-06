'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Search, FolderKanban, Calendar, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Owner {
  id: number;
  name: string;
  position: string;
}

interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  owner: Owner | null;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; barColor: string }> = {
  RUNNING: { label: '进行中', bg: 'bg-blue-500/10', text: 'text-blue-500', barColor: 'bg-blue-500' },
  WAITING_APPROVAL: { label: '待确认', bg: 'bg-amber-500/10', text: 'text-amber-500', barColor: 'bg-amber-500' },
  DONE: { label: '已完成', bg: 'bg-emerald-500/10', text: 'text-emerald-500', barColor: 'bg-emerald-500' },
  FAILED: { label: '已失败', bg: 'bg-red-500/10', text: 'text-red-500', barColor: 'bg-red-500' },
};

function WorkItemCard({ item, index }: { item: WorkItem; index: number }) {
  const router = useRouter();
  const status = statusConfig[item.status] || statusConfig.RUNNING;

  return (
    <div
      className="kanban-panel overflow-hidden kanban-card cursor-pointer group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/work-items/${item.id}`)}
    >
      {/* 顶部状态条 */}
      <div className={cn('h-1', status.barColor)} />

      <div className="p-4">
        {/* 标题和状态 */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h4>
          <Badge className={cn(status.bg, status.text, 'border-0 shrink-0')}>
            {status.label}
          </Badge>
        </div>

        {/* 描述 */}
        {item.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
        )}

        {/* 底部信息 */}
        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.owner && (
              <div
                className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/workers/${item.owner!.id}`);
                }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs">
                  {item.owner.name.slice(0, 1)}
                </div>
                <span>{item.owner.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkItemsPageClient() {
  const searchParams = useSearchParams();
  const ownerId = searchParams.get('owner_id');

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/spark/work-items');
        const json = await res.json();
        if (json.success) {
          setWorkItems(json.data);
        }
      } catch (err) {
        console.error('加载失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 筛选
  const filteredItems = workItems.filter((item) => {
    if (ownerId && item.owner?.id !== parseInt(ownerId, 10)) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.owner?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 分页
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredItems.length / pageSize);

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
            <h1 className="text-2xl font-bold text-foreground">需求</h1>
            <p className="text-muted-foreground text-sm mt-1">共 {filteredItems.length} 个需求</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索需求..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* 状态筛选 */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: 'all', label: '全部' },
              { value: 'RUNNING', label: '进行中' },
              { value: 'WAITING_APPROVAL', label: '待确认' },
              { value: 'DONE', label: '已完成' },
              { value: 'FAILED', label: '已失败' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:border-primary/50 text-foreground',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 卡片网格 */}
        {paginatedItems.length === 0 ? (
          <div className="text-center py-16">
            <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">没有找到匹配的需求</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedItems.map((item, index) => (
              <WorkItemCard key={item.id} item={item} index={index} />
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
                        : 'bg-card border border-border hover:border-primary/50',
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
