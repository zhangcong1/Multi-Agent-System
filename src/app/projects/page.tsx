'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  Search,
  FolderKanban,
  Filter,
  Calendar,
  User,
  Bot,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  ArrowUpRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  currentStage: string;
  developer: { id: number; name: string } | null;
  experts: { id: number; name: string; position: string }[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  RUNNING: { label: '进行中', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Play },
  WAITING_APPROVAL: { label: '待确认', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  DONE: { label: '已完成', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle },
  FAILED: { label: '已失败', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
};

// 进度条组件
function ProgressBar({ progress, color = 'from-violet-500 to-purple-500' }: { progress: number; color?: string }) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={cn('h-full rounded-full bg-gradient-to-r relative', color)}
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 progress-shimmer" />
      </div>
    </div>
  );
}

// 项目卡片
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const router = useRouter();
  const status = statusConfig[project.status] || statusConfig.RUNNING;
  const StatusIcon = status.icon;

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div 
      className="glass-card rounded-2xl overflow-hidden card-hover cursor-pointer stagger-item group"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handleClick}
    >
      {/* 顶部状态条 */}
      <div className={cn('h-1.5 bg-gradient-to-r', 
        project.status === 'RUNNING' ? 'from-blue-500 to-cyan-500' :
        project.status === 'WAITING_APPROVAL' ? 'from-amber-500 to-orange-500' :
        project.status === 'DONE' ? 'from-emerald-500 to-teal-500' :
        'from-red-500 to-rose-500'
      )} />
      
      <div className="p-5">
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {project.title}
              </h3>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
            )}
          </div>
          <Badge className={cn(status.bg, status.color, 'border-0 shrink-0')}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* 当前进度 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{project.currentStage}</span>
            <span className="font-medium text-gradient">{project.progress}%</span>
          </div>
          <ProgressBar progress={project.progress} />
        </div>

        {/* 协作团队 */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            {/* 开发者 */}
            <div className="flex items-center gap-2">
              {project.developer && (
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-background shadow-sm">
                    {project.developer.name.slice(0, 1)}
                  </div>
                  <span className="text-xs text-muted-foreground">{project.developer.name}</span>
                </div>
              )}
              
              {/* AI专家 */}
              <div className="flex items-center">
                {project.experts.slice(0, 3).map((expert, i) => (
                  <div 
                    key={expert.id}
                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-background -ml-1.5 shadow-sm"
                    title={expert.name}
                  >
                    {expert.name.slice(0, 1)}
                  </div>
                ))}
                {project.experts.length > 3 && (
                  <span className="text-xs text-muted-foreground ml-1">+{project.experts.length - 3}</span>
                )}
              </div>
            </div>

            {/* 时间 */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* 查看详情按钮 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bot className="w-3.5 h-3.5" />
            <span>{project.experts.length} 位 AI 专家协作</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary group-hover:gap-2 transition-all">
            <span>查看详情</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/spark/work-items');
        const json = await res.json();
        if (json.success) {
          // 添加模拟专家数据
          const projectsWithExperts = json.data.map((p: Project) => ({
            ...p,
            experts: p.experts?.length ? p.experts : [
              { id: 1, name: '小智', position: 'AI产品助手' },
              { id: 2, name: '阿强', position: '全栈工程师' },
            ],
            currentStage: p.currentStage || '需求分析',
            progress: p.progress || Math.floor(Math.random() * 80) + 10,
          }));
          setProjects(projectsWithExperts);
        }
      } catch (err) {
        console.error('获取项目失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // 筛选
  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== 'all' && project.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(query) ||
        (project.description?.toLowerCase().includes(query)) ||
        (project.developer?.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // 分页
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredProjects.length / pageSize);

  // 统计数据
  const stats = {
    total: projects.length,
    running: projects.filter(p => p.status === 'RUNNING').length,
    waiting: projects.filter(p => p.status === 'WAITING_APPROVAL').length,
    done: projects.filter(p => p.status === 'DONE').length,
  };

  if (loading) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-xl shadow-purple-500/25">
              <FolderKanban className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  return (
    <KanbanLayout>
      <div className="p-8 space-y-6">
        {/* 标题栏 */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-primary" />
            项目需求
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理和追踪所有项目需求进度
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '全部项目', value: stats.total, color: 'from-violet-500 to-purple-500' },
            { label: '进行中', value: stats.running, color: 'from-blue-500 to-cyan-500' },
            { label: '待确认', value: stats.waiting, color: 'from-amber-500 to-orange-500' },
            { label: '已完成', value: stats.done, color: 'from-emerald-500 to-teal-500' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4 stagger-item" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3',
                'bg-gradient-to-br',
                stat.color
              )}>
                {i === 0 && <FolderKanban className="w-5 h-5" />}
                {i === 1 && <Play className="w-5 h-5" />}
                {i === 2 && <Clock className="w-5 h-5" />}
                {i === 3 && <CheckCircle className="w-5 h-5" />}
              </div>
              <p className="text-2xl font-bold text-gradient">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* 状态筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {[
              { value: 'all', label: '全部' },
              { value: 'RUNNING', label: '进行中' },
              { value: 'WAITING_APPROVAL', label: '待确认' },
              { value: 'DONE', label: '已完成' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => { setStatusFilter(filter.value); setCurrentPage(1); }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:border-primary/50 text-foreground'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 项目卡片网格 */}
        {paginatedProjects.length === 0 ? (
          <div className="text-center py-16">
            <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">没有找到匹配的项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl text-sm bg-card border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                      'w-9 h-9 rounded-xl text-sm transition-all',
                      currentPage === page
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
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
              className="px-4 py-2 rounded-xl text-sm bg-card border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </KanbanLayout>
  );
}
