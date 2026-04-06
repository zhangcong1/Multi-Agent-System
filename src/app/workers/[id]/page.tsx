'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Briefcase, 
  Calendar, 
  ChevronRight,
  CheckCircle,
  Circle,
  Loader2,
  Clock,
  Zap,
  FolderKanban,
  Puzzle,
  Plug,
  FileText,
  Shield,
  Cpu,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkerDetail {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  avatar_url: string | null;
}

interface WorkItemWithStages {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  current_stage: string | null;
  stage_progress: number;
  total_stages: number;
  completed_stages: number;
  stages: StageInfo[];
}

interface StageInfo {
  name: string;
  status: 'completed' | 'running' | 'pending';
  order: number;
}

// 研发阶段定义
const STAGE_ORDER = [
  '需求分析',
  '方案设计',
  '后端开发',
  '前端开发',
  '接口联调',
  '自动化测试',
  '修复验证',
  '验收交付'
];

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  '需求分析': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  '方案设计': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  '后端开发': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  '前端开发': { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
  '接口联调': { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30' },
  '自动化测试': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  '修复验证': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  '验收交付': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
};

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

// 能力配置数据（模拟）
const workerCapabilities: Record<string, { skills: string[]; mcp: string[]; permission: string; model: string }> = {
  'AI需求分析员': {
    skills: ['document-writer', 'web-scraper', 'data-analysis'],
    mcp: ['filesystem-server', 'web-browser'],
    permission: 'Plan',
    model: 'DeepSeek-V3',
  },
  'AI后端开发': {
    skills: ['code-generation', 'api-design', 'database-query'],
    mcp: ['filesystem-server', 'database-server', 'git-server', 'api-gateway'],
    permission: 'Craft',
    model: 'Claude-3.5-Sonnet',
  },
  'AI前端开发': {
    skills: ['frontend-design', 'code-generation', 'image-gen'],
    mcp: ['filesystem-server', 'git-server', 'cloud-storage'],
    permission: 'Craft',
    model: 'GPT-4o',
  },
  'AI自动化测试': {
    skills: ['test-generation', 'code-analysis'],
    mcp: ['filesystem-server', 'git-server', 'database-server'],
    permission: 'Plan',
    model: 'DeepSeek-V3',
  },
};

const systemPrompts: Record<string, string> = {
  'AI需求分析员': `你是一位专业的需求分析师，擅长：
1. 理解和分析用户需求
2. 编写详细的需求文档
3. 评估技术可行性
4. 与开发团队沟通协作

你需要：
- 准确理解用户意图
- 输出结构化的需求文档
- 标注优先级和风险点`,

  'AI后端开发': `你是一位资深后端工程师，擅长：
1. 设计和实现 RESTful API
2. 数据库设计与优化
3. 系统架构设计
4. 性能调优

你需要：
- 编写高质量、可维护的代码
- 遵循最佳实践和设计模式
- 编写单元测试`,

  'AI前端开发': `你是一位前端开发专家，擅长：
1. React/Vue 组件开发
2. 响应式设计
3. 性能优化
4. 用户体验设计

你需要：
- 编写现代化前端代码
- 确保跨浏览器兼容性
- 实现精美的 UI 效果`,
};

function StageTimeline({ stages, currentStage }: { stages: StageInfo[]; currentStage: string | null }) {
  return (
    <div className="space-y-2">
      {STAGE_ORDER.map((stageName, index) => {
        const stage = stages.find(s => s.name === stageName);
        const isCompleted = stage?.status === 'completed';
        const isRunning = stage?.status === 'running';
        const colors = stageColors[stageName] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };

        return (
          <div key={stageName} className="flex items-center gap-3">
            {/* 状态图标 */}
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all text-xs',
              isCompleted ? 'bg-emerald-500 text-white' :
              isRunning ? `${colors.bg} ${colors.border} border-2` :
              'bg-muted text-muted-foreground'
            )}>
              {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> :
               isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               <Circle className="w-3 h-3" />}
            </div>

            {/* 阶段名称 */}
            <span className={cn(
              'text-sm',
              isCompleted ? 'text-emerald-500' :
              isRunning ? colors.text :
              'text-muted-foreground'
            )}>
              {stageName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WorkItemCard({ item, index }: { item: WorkItemWithStages; index: number }) {
  const router = useRouter();
  const colorStyle = stageColors[item.current_stage || ''] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };

  return (
    <div
      className="kanban-panel overflow-hidden kanban-card cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/work-items/${item.id}`)}
    >
      <div className={cn('h-1',
        item.status === 'RUNNING' ? 'bg-blue-500' :
        item.status === 'WAITING_APPROVAL' ? 'bg-amber-500' :
        item.status === 'DONE' ? 'bg-emerald-500' : 'bg-red-500'
      )} />
      
      <div className="p-4">
        <h4 className="font-medium text-foreground line-clamp-1">{item.title}</h4>
        
        <div className="mt-3 space-y-3">
          {/* 当前阶段 */}
          {item.current_stage && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">当前阶段</span>
              <Badge className={cn(colorStyle.bg, colorStyle.text, 'border-0')}>
                {item.current_stage}
              </Badge>
            </div>
          )}
          
          {/* 进度 */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">进度</span>
              <span className="number-highlight">{item.stage_progress}%</span>
            </div>
            <Progress value={item.stage_progress} className="h-1" />
          </div>
          
          {/* 阶段时间线 */}
          <StageTimeline stages={item.stages} currentStage={item.current_stage} />
        </div>
      </div>
    </div>
  );
}

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;
  const [copied, setCopied] = useState(false);
  
  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [workItems, setWorkItems] = useState<WorkItemWithStages[]>([]);
  const [loading, setLoading] = useState(true);

  const capabilities = worker ? workerCapabilities[worker.position] : null;
  const systemPrompt = worker ? systemPrompts[worker.position] : null;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/spark/workers/${workerId}`);
        const json = await res.json();
        if (json.success) {
          setWorker(json.data.worker);
          setWorkItems(json.data.workItems);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [workerId]);

  const copyPrompt = () => {
    if (systemPrompt) {
      navigator.clipboard.writeText(systemPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  if (!worker) {
    return (
      <KanbanLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">未找到该工作者</p>
          </div>
        </div>
      </KanbanLayout>
    );
  }

  const colorStyle = positionColors[worker.position] || { gradient: 'from-primary to-primary/70', bg: 'bg-primary/10', border: 'border-primary/20' };

  return (
    <KanbanLayout>
      <div className="p-6 space-y-6">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        {/* 工作者信息卡片 */}
        <div className="kanban-panel overflow-hidden">
          <div className={cn('h-1.5 bg-gradient-to-r', colorStyle.gradient)} />
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* 头像 */}
              <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
                <AvatarFallback className={cn('bg-gradient-to-br text-white text-2xl font-medium', colorStyle.gradient)}>
                  {worker.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              {/* 基本信息 */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{worker.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={cn(colorStyle.bg, colorStyle.border)}>
                    <Briefcase className="w-3 h-3 mr-1" />
                    {worker.position}
                  </Badge>
                  <span className="text-sm text-muted-foreground">工号: {worker.employee_id}</span>
                </div>

                {/* 能力标签 */}
                {capabilities && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      {capabilities.permission}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Cpu className="w-3 h-3" />
                      {capabilities.model}
                    </Badge>
                  </div>
                )}
              </div>

              {/* 统计 */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold number-highlight">{workItems.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">负责需求</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold number-highlight">
                    {workItems.filter(i => i.status === 'RUNNING').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">进行中</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 能力配置区域 */}
        {capabilities && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Skills */}
            <div className="kanban-panel p-5">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-primary" />
                技能包
              </h3>
              <div className="space-y-2">
                {capabilities.skills.map(skill => (
                  <div key={skill} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Zap className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MCP */}
            <div className="kanban-panel p-5">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Plug className="w-4 h-4 text-emerald-500" />
                MCP 协议
              </h3>
              <div className="space-y-2">
                {capabilities.mcp.map(mcp => (
                  <div key={mcp} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Plug className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-foreground">{mcp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 权限 */}
            <div className="kanban-panel p-5">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                权限级别
              </h3>
              <div className="p-4 rounded-lg bg-muted/30">
                <Badge className={cn(
                  capabilities.permission === 'Craft' ? 'bg-red-500/10 text-red-600' :
                  capabilities.permission === 'Plan' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-blue-500/10 text-blue-600'
                )}>
                  {capabilities.permission}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {capabilities.permission === 'Craft' ? '最高权限：可读写文件、执行命令' :
                   capabilities.permission === 'Plan' ? '规划权限：只读文件，可规划任务' :
                   '询问权限：保守模式，仅回答问题'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 系统提示词 */}
        {systemPrompt && (
          <div className="kanban-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                系统提示词
              </h3>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-lg">
              {systemPrompt}
            </pre>
          </div>
        )}

        {/* 需求列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            负责的需求
            <span className="text-sm text-muted-foreground font-normal">({workItems.length})</span>
          </h3>

          {workItems.length === 0 ? (
            <div className="text-center py-12 kanban-panel">
              <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">暂无负责的需求</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workItems.map((item, index) => (
                <WorkItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </KanbanLayout>
  );
}
