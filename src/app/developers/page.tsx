'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Users,
  UserPlus,
  Target,
  Clock,
  Zap,
  ChevronRight,
  Briefcase,
  Palette,
  Code,
  TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Developer {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  avatar_url: string | null;
  taskCount: number;
  progress: number;
  lastActivityTime: string;
}

// 角色分类配置
const roleCategories = {
  product: {
    label: '产品',
    icon: Briefcase,
    gradient: 'from-violet-500 to-purple-500',
    tagBg: 'bg-violet-500/10',
    tagBorder: 'border-violet-400/50',
    tagText: 'text-violet-600',
    positions: ['产品经理'],
  },
  design: {
    label: '设计',
    icon: Palette,
    gradient: 'from-pink-500 to-rose-500',
    tagBg: 'bg-pink-500/10',
    tagBorder: 'border-pink-400/50',
    tagText: 'text-pink-600',
    positions: ['UI设计师'],
  },
  develop: {
    label: '开发',
    icon: Code,
    gradient: 'from-blue-500 to-cyan-500',
    tagBg: 'bg-blue-500/10',
    tagBorder: 'border-blue-400/50',
    tagText: 'text-blue-600',
    positions: ['全栈工程师', '后端工程师', '前端工程师'],
  },
  test: {
    label: '测试',
    icon: TestTube,
    gradient: 'from-emerald-500 to-teal-500',
    tagBg: 'bg-emerald-500/10',
    tagBorder: 'border-emerald-400/50',
    tagText: 'text-emerald-600',
    positions: ['测试工程师', 'QA工程师'],
  },
};

// 根据职位获取角色分类
function getRoleCategory(position: string) {
  for (const [key, config] of Object.entries(roleCategories)) {
    if (config.positions.includes(position)) {
      return { key, ...config };
    }
  }
  return { key: 'develop', ...roleCategories.develop };
}

// 开发者卡片
function DeveloperCard({ developer, index }: { developer: Developer; index: number }) {
  const router = useRouter();
  const roleConfig = getRoleCategory(developer.position);

  return (
    <div 
      className="glass-card rounded-lg overflow-hidden card-hover cursor-pointer stagger-item group"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => router.push(`/developers/${developer.id}`)}
    >
      {/* 顶部装饰条 */}
      <div className={cn('h-1 bg-gradient-to-r', roleConfig.gradient)} />
      
      <div className="p-4">
        {/* 头部：头像 + 基本信息 */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-md',
              'bg-gradient-to-br',
              roleConfig.gradient
            )}>
              {developer.name.slice(0, 2)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {developer.name}
              </h3>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border',
                roleConfig.tagBg, roleConfig.tagBorder, roleConfig.tagText
              )}>
                {developer.position}
              </span>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-lg font-bold text-gradient">{developer.taskCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">当前任务</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-lg font-bold text-gradient">{developer.progress}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">本周目标</p>
          </div>
        </div>

        {/* 本周目标进度 */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">本周目标完成度</span>
            <span className="font-medium">{developer.progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn('h-full rounded-full bg-gradient-to-r relative', roleConfig.gradient)}
              style={{ width: `${developer.progress}%` }}
            >
              <div className="absolute inset-0 progress-shimmer" />
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>最后活跃：{developer.lastActivityTime}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}

// 排行榜卡片
function RankingCard({ developers }: { developers: Developer[] }) {
  const sortedDevelopers = [...developers]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="font-medium text-foreground">目标达成排行</h3>
      </div>

      <div className="space-y-2">
        {sortedDevelopers.map((dev, index) => {
          const roleConfig = getRoleCategory(dev.position);
          
          return (
            <div 
              key={dev.id}
              className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {/* 排名 */}
              <div className={cn(
                'w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0',
                index === 0 ? 'bg-amber-500 text-white' :
                index === 1 ? 'bg-slate-300 text-slate-700' :
                index === 2 ? 'bg-amber-700/60 text-white' :
                'bg-muted text-muted-foreground'
              )}>
                {index + 1}
              </div>
              
              {/* 头像 */}
              <div className={cn(
                'w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white',
                'bg-gradient-to-br',
                roleConfig.gradient
              )}>
                {dev.name.slice(0, 1)}
              </div>
              
              {/* 名称 */}
              <p className="text-sm text-foreground truncate flex-1">{dev.name}</p>
              
              <span className="text-sm font-semibold text-gradient">{dev.progress}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 添加成员对话框
function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');

  const allPositions = [
    '产品经理',
    'UI设计师',
    '全栈工程师',
    '后端工程师',
    '前端工程师',
    '测试工程师',
  ];

  const handleSubmit = () => {
    console.log('添加成员:', { name, position });
    setOpen(false);
    setName('');
    setPosition('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4" />
          添加成员
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            添加团队成员
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" placeholder="请输入姓名" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">职位</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger><SelectValue placeholder="请选择职位" /></SelectTrigger>
              <SelectContent>
                {allPositions.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!name || !position}>确认添加</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState<string>('all');

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        const res = await fetch('/api/spark/workers');
        const json = await res.json();
        if (json.success) {
          const realDevelopers = json.data
            .filter((w: any) => !w.position.startsWith('AI'))
            .map((w: any) => ({
              ...w,
              lastActivityTime: '10分钟前',
            }));
          setDevelopers(realDevelopers);
        }
      } catch (err) {
        console.error('获取开发者失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDevelopers();
  }, []);

  // 筛选逻辑
  const filteredDevelopers = developers.filter((dev) => {
    const matchesSearch = !searchQuery || 
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeRole === 'all') return matchesSearch;
    
    const roleConfig = roleCategories[activeRole as keyof typeof roleCategories];
    const matchesRole = roleConfig?.positions.includes(dev.position);
    return matchesSearch && matchesRole;
  });

  // 统计数据
  const stats = {
    totalDevelopers: developers.length,
    activeProjects: developers.reduce((sum, d) => sum + d.taskCount, 0),
    waitingApproval: 3,
    completed: 12,
    avgProgress: developers.length > 0 
      ? Math.round(developers.reduce((sum, d) => sum + d.progress, 0) / developers.length)
      : 0,
  };

  // 角色分类统计
  const roleCounts = Object.entries(roleCategories).map(([key, config]) => ({
    key,
    label: config.label,
    icon: config.icon,
    count: developers.filter(d => config.positions.includes(d.position)).length,
  }));

  if (loading) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white animate-pulse" />
            </div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  return (
    <KanbanLayout>
      <div className="p-6">
        {/* 顶部标题和操作 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              开发者中心
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">团队成员工作状态概览</p>
          </div>
          <AddMemberDialog />
        </div>

        <div className="flex gap-5">
          {/* 左侧主内容区 */}
          <div className="flex-1 space-y-5">
            {/* 角色分类筛选 */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveRole('all')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  activeRole === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                全部
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded text-xs',
                  activeRole === 'all' ? 'bg-white/20' : 'bg-muted'
                )}>
                  {stats.totalDevelopers}
                </span>
              </button>
              
              {roleCounts.map(({ key, label, icon: Icon, count }) => {
                const config = roleCategories[key as keyof typeof roleCategories];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveRole(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                      activeRole === key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-xs',
                      activeRole === key ? 'bg-white/20' : 'bg-muted'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
              
              {/* 搜索框 */}
              <div className="relative ml-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索开发者..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* 开发者卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDevelopers.map((developer, index) => (
                <DeveloperCard key={developer.id} developer={developer} index={index} />
              ))}
            </div>

            {filteredDevelopers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">没有找到匹配的开发者</p>
              </div>
            )}
          </div>

          {/* 右侧辅助区 */}
          <div className="w-64 space-y-4 shrink-0">
            {/* 统计概览 */}
            <div className="glass-card rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">团队概览</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-md bg-muted/30">
                  <p className="text-lg font-bold text-gradient">{stats.activeProjects}</p>
                  <p className="text-xs text-muted-foreground">进行中任务</p>
                </div>
                <div className="p-2.5 rounded-md bg-muted/30">
                  <p className="text-lg font-bold text-gradient">{stats.waitingApproval}</p>
                  <p className="text-xs text-muted-foreground">待确认</p>
                </div>
                <div className="p-2.5 rounded-md bg-muted/30">
                  <p className="text-lg font-bold text-gradient">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">本周完成</p>
                </div>
                <div className="p-2.5 rounded-md bg-muted/30">
                  <p className="text-lg font-bold text-gradient">{stats.avgProgress}%</p>
                  <p className="text-xs text-muted-foreground">平均目标</p>
                </div>
              </div>
            </div>

            {/* 目标达成排行榜 */}
            <RankingCard developers={developers} />
          </div>
        </div>
      </div>
    </KanbanLayout>
  );
}
