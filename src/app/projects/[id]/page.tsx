'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Play,
  Pause,
  X,
  AlertTriangle,
  Calendar,
  ChevronRight,
  User,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  currentStage: string;
  currentStageProgress: number;
  createdAt: string;
  updatedAt: string;
  owner: { id: number; name: string } | null;
}

// 开发阶段定义
const STAGES = [
  { id: 1, name: '需求分析', agent: 'Agent-2' },
  { id: 2, name: '方案评审', agent: 'Agent-3' },
  { id: 3, name: '代码开发', agent: 'Agent-2' },
  { id: 4, name: '代码检查', agent: 'Agent-2' },
  { id: 5, name: '前后台调试', agent: 'Agent-2' },
  { id: 6, name: '测试验证', agent: 'Agent-2' },
  { id: 7, name: '问题修复', agent: 'Agent-2' },
];

// 管道节点组件
function PipelineNode({ 
  stage, 
  status, 
  progress, 
  isLast,
  index
}: { 
  stage: typeof STAGES[0];
  status: 'completed' | 'running' | 'pending';
  progress?: number;
  isLast: boolean;
  index: number;
}) {
  return (
    <div className="pipeline-node stagger-item" style={{ animationDelay: `${index * 100}ms` }}>
      {/* 节点圆形 */}
      <div className={cn(
        'pipeline-node-circle',
        status
      )}>
        {status === 'completed' && <CheckCircle className="w-5 h-5" />}
        {status === 'running' && <Play className="w-5 h-5" />}
        {status === 'pending' && <Circle className="w-5 h-5" />}
      </div>
      
      {/* 节点信息 */}
      <div className="mt-3 text-center">
        <p className={cn(
          'text-xs font-medium',
          status === 'completed' ? 'text-green-600' :
          status === 'running' ? 'text-primary' : 'text-muted-foreground'
        )}>
          {stage.agent}
        </p>
        <p className={cn(
          'text-sm mt-1',
          status === 'completed' ? 'text-foreground' :
          status === 'running' ? 'text-foreground font-medium' : 'text-muted-foreground'
        )}>
          {stage.name}
        </p>
        {status === 'running' && progress !== undefined && (
          <p className="text-xs text-primary font-medium mt-1">{progress}%</p>
        )}
      </div>
    </div>
  );
}

// 进度管道组件
function ProgressPipeline({ 
  currentStageIndex, 
  currentStageProgress 
}: { 
  currentStageIndex: number;
  currentStageProgress: number;
}) {
  return (
    <div className="glass-card rounded-xl p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">开发进度管道</h3>
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            {Math.round((currentStageIndex / STAGES.length) * 100 + (currentStageProgress / STAGES.length))}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          当前阶段: <span className="text-primary font-medium">{STAGES[currentStageIndex]?.name}</span>
        </p>
      </div>

      {/* 管道节点 */}
      <div className="flex items-start justify-between">
        {STAGES.map((stage, index) => {
          let status: 'completed' | 'running' | 'pending' = 'pending';
          let progress: number | undefined;
          
          if (index < currentStageIndex) {
            status = 'completed';
          } else if (index === currentStageIndex) {
            status = 'running';
            progress = currentStageProgress;
          }
          
          return (
            <div key={stage.id} className="flex items-center flex-1">
              <PipelineNode 
                stage={stage} 
                status={status} 
                progress={progress}
                isLast={index === STAGES.length - 1}
                index={index}
              />
              {/* 连接线 */}
              {index < STAGES.length - 1 && (
                <div className={cn(
                  'h-0.5 flex-1 mx-2 mt-[-20px]',
                  index < currentStageIndex ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  index === currentStageIndex ? 'bg-gradient-to-r from-green-400 to-primary' :
                  'bg-muted'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* 底部进度条 */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>开始</span>
          <span>{STAGES.length} 个阶段</span>
          <span>完成</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-green-500 via-primary to-primary/50 relative"
            style={{ width: `${(currentStageIndex / STAGES.length) * 100 + (currentStageProgress / STAGES.length)}%` }}
          >
            <div className="absolute inset-0 progress-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 当前阶段详情组件
function CurrentStageCard({ 
  stageName, 
  progress, 
  agentName,
  status 
}: { 
  stageName: string;
  progress: number;
  agentName: string;
  status: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{stageName}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary status-pulse" />
              <span className="text-sm text-primary">进行中</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{status}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{agentName}</span>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-medium">
            {agentName.slice(-1)}
          </div>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">阶段进度</span>
          <span className="font-medium text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 progress-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  // 模拟数据
  const project: ProjectDetail = {
    id: parseInt(projectId || '1'),
    title: '用户登录功能开发',
    description: '实现用户登录功能开发，包括前端界面和后端API开发',
    status: 'WAITING_APPROVAL',
    progress: 19,
    currentStage: '方案评审',
    currentStageProgress: 74,
    createdAt: '2026/3/25 21:58:18',
    updatedAt: '2026/4/1 00:22:21',
    owner: { id: 1, name: '张明' },
  };

  const currentStageIndex = STAGES.findIndex(s => s.name === project.currentStage);
  const currentStage = STAGES[currentStageIndex];

  return (
    <KanbanLayout>
      <div className="p-8 space-y-6">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>需求列表</span>
        </button>

        {/* 需求信息卡片 */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
              <span className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium',
                project.status === 'WAITING_APPROVAL' ? 'bg-amber-50 text-amber-600' :
                project.status === 'RUNNING' ? 'bg-blue-50 text-blue-600' :
                project.status === 'DONE' ? 'bg-green-50 text-green-600' :
                'bg-red-50 text-red-600'
              )}>
                {project.status === 'WAITING_APPROVAL' ? '等待确认' :
                 project.status === 'RUNNING' ? '进行中' :
                 project.status === 'DONE' ? '已完成' : '已失败'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <Pause className="w-4 h-4 inline mr-1.5" />
                暂停
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                <X className="w-4 h-4 inline mr-1.5" />
                取消
              </button>
            </div>
          </div>
          
          {/* 需求描述 */}
          <p className="text-muted-foreground">{project.description}</p>
          
          {/* 提示栏 */}
          {project.status === 'WAITING_APPROVAL' && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm">请确认技术方案选择</span>
            </div>
          )}
          
          {/* 当前阶段 */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">当前阶段:</span>
            <button className="text-primary font-medium hover:underline">
              {project.currentStage}
            </button>
          </div>
        </div>

        {/* 开发进度管道 */}
        <ProgressPipeline 
          currentStageIndex={currentStageIndex}
          currentStageProgress={project.currentStageProgress}
        />

        {/* 当前阶段详情 */}
        <CurrentStageCard 
          stageName={currentStage?.name || ''}
          progress={project.currentStageProgress}
          agentName={currentStage?.agent || 'Agent'}
          status="编写代码中"
        />

        {/* 底部时间信息 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>创建时间: {project.createdAt}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>更新时间: {project.updatedAt}</span>
          </div>
        </div>
      </div>
    </KanbanLayout>
  );
}
