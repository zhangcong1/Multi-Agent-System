'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  ArrowLeft,
  CheckCircle,
  Circle,
  Play,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bot,
  Trophy,
  Code,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 角色配置
const roleConfig: Record<string, { gradient: string; bgGradient: string; glowColor: string }> = {
  '产品经理': { 
    gradient: 'from-violet-500 to-purple-500', 
    bgGradient: 'from-violet-500/20 to-purple-500/20',
    glowColor: 'rgba(139, 92, 246, 0.4)'
  },
  'UI设计师': { 
    gradient: 'from-pink-500 to-rose-500', 
    bgGradient: 'from-pink-500/20 to-rose-500/20',
    glowColor: 'rgba(236, 72, 153, 0.4)'
  },
  '全栈工程师': { 
    gradient: 'from-blue-500 to-cyan-500', 
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    glowColor: 'rgba(59, 130, 246, 0.4)'
  },
  '后端工程师': { 
    gradient: 'from-green-500 to-emerald-500', 
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    glowColor: 'rgba(34, 197, 94, 0.4)'
  },
  '前端工程师': { 
    gradient: 'from-orange-500 to-amber-500', 
    bgGradient: 'from-orange-500/20 to-amber-500/20',
    glowColor: 'rgba(249, 115, 22, 0.4)'
  },
  '测试工程师': { 
    gradient: 'from-teal-500 to-cyan-500', 
    bgGradient: 'from-teal-500/20 to-cyan-500/20',
    glowColor: 'rgba(20, 184, 166, 0.4)'
  },
};

// Agent配置
const agentConfig: Record<string, { color: string; avatar: string }> = {
  'Agent-2': { color: 'from-blue-500 to-indigo-500', avatar: '🤖' },
  'Agent-3': { color: 'from-purple-500 to-pink-500', avatar: '🧠' },
  'Agent-4': { color: 'from-emerald-500 to-teal-500', avatar: '⚡' },
};

// 模拟开发者数据
const mockDeveloper = {
  id: 1,
  name: '张明',
  position: '全栈工程师',
  online: true,
  techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  achievements: [
    { icon: '✅', label: '完成3个需求', highlight: true },
    { icon: '⚡', label: '连续5天完成任务' },
    { icon: '🎯', label: '目标达成率96%' },
  ],
  weeklyStats: {
    workHours: 38.5,
    targetHours: 40,
    dailyHours: [
      { day: '周一', hours: 8.5 },
      { day: '周二', hours: 7.0 },
      { day: '周三', hours: 9.0, isToday: true },
      { day: '周四', hours: 7.5 },
      { day: '周五', hours: 6.5 },
    ],
    topAgent: { name: 'Agent-2', count: 15 },
  },
};

// 周数据
const weeksData = [
  {
    weekLabel: '本周',
    weekRange: '1月15日 - 1月21日',
    requirements: [
      { 
        id: 1, 
        title: '用户登录功能', 
        description: '实现用户登录、注册、找回密码等核心功能',
        startTime: '01-15 09:00',
        deadline: '01-17 18:00',
        currentStageIndex: 2,
        currentStageProgress: 60,
        stages: [
          { name: '需求分析', completed: true, agent: 'Agent-2' },
          { name: '方案评审', completed: true, agent: 'Agent-3' },
          { name: '代码开发', completed: false, running: true, progress: 60, agent: 'Agent-2' },
          { name: '代码检查', completed: false, agent: 'Agent-2' },
          { name: '测试验证', completed: false, agent: 'Agent-4' },
        ],
        agent: 'Agent-2',
      },
      { 
        id: 2, 
        title: '数据导出功能', 
        description: '支持Excel、CSV、PDF多格式数据导出',
        startTime: '01-16 10:00',
        deadline: '01-18 18:00',
        currentStageIndex: 1,
        currentStageProgress: 74,
        stages: [
          { name: '需求分析', completed: true, agent: 'Agent-2' },
          { name: '方案评审', completed: false, running: true, progress: 74, agent: 'Agent-3' },
          { name: '代码开发', completed: false, agent: 'Agent-2' },
          { name: '测试验证', completed: false, agent: 'Agent-4' },
        ],
        agent: 'Agent-3',
      },
      { 
        id: 3, 
        title: '报表优化', 
        description: '优化现有报表性能，提升加载速度',
        startTime: '01-14 09:00',
        deadline: '01-17 12:00',
        currentStageIndex: 3,
        currentStageProgress: 80,
        stages: [
          { name: '需求分析', completed: true, agent: 'Agent-2' },
          { name: '方案评审', completed: true, agent: 'Agent-3' },
          { name: '代码开发', completed: true, agent: 'Agent-2' },
          { name: '测试验证', completed: false, running: true, progress: 80, agent: 'Agent-4' },
        ],
        agent: 'Agent-2',
      },
    ],
    completedRequirements: [
      { id: 4, title: '权限管理系统', duration: '3天', agent: 'Agent-2, Agent-3' },
      { id: 5, title: '消息推送功能', duration: '5天', agent: 'Agent-2' },
    ],
  },
  {
    weekLabel: '上周',
    weekRange: '1月8日 - 1月14日',
    requirements: [],
    completedRequirements: [
      { id: 6, title: '用户管理模块', duration: '3天', agent: 'Agent-2' },
      { id: 7, title: 'API接口优化', duration: '2天', agent: 'Agent-3' },
      { id: 8, title: '数据库迁移', duration: '1天', agent: 'Agent-2' },
    ],
  },
  {
    weekLabel: '第1周',
    weekRange: '1月1日 - 1月7日',
    requirements: [],
    completedRequirements: [
      { id: 9, title: '项目初始化', duration: '2天', agent: 'Agent-2' },
    ],
  },
];

// 管道进度组件 - 横向管道样式
function PipelineProgress({ stages, currentStageIndex, currentStageProgress }: { 
  stages: { name: string; completed: boolean; running?: boolean; progress?: number; agent: string }[];
  currentStageIndex: number;
  currentStageProgress: number;
}) {
  // 计算整体进度
  const totalProgress = Math.round(
    (currentStageIndex / stages.length) * 100 + 
    (currentStageProgress / stages.length)
  );

  return (
    <div className="mt-4 w-full">
      {/* 阶段管道 - 使用 flex 实现等宽分布 */}
      <div className="flex items-start justify-between w-full pb-4">
        {stages.map((stage, idx) => {
          const isCompleted = stage.completed;
          const isRunning = stage.running;
          const isLast = idx === stages.length - 1;
          
          return (
            <div key={idx} className="flex flex-col items-center relative flex-1 min-w-0">
              {/* 连接线（在节点左侧，除了第一个） */}
              {idx > 0 && (
                <div 
                  className="absolute top-6 right-1/2 w-1/2 h-0.5 -z-10"
                  style={{ 
                    background: stages[idx - 1].completed 
                      ? '#22c55e' 
                      : '#e5e7eb'
                  }}
                />
              )}
              
              {/* 连接线（在节点右侧，除了最后一个） */}
              {!isLast && (
                <div 
                  className="absolute top-6 left-1/2 w-1/2 h-0.5 -z-10"
                  style={{ 
                    background: isCompleted 
                      ? '#22c55e' 
                      : '#e5e7eb'
                  }}
                />
              )}
              
              {/* 头像 */}
              <div 
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10',
                  isCompleted && 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]',
                  isRunning && 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]',
                  !isCompleted && !isRunning && 'bg-muted border-2 border-border'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isRunning ? (
                  <span className="text-sm font-bold">{stage.progress}%</span>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              {/* Agent标签 */}
              <div className={cn(
                'mt-2 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap',
                isCompleted && 'bg-emerald-500/15 text-emerald-600',
                isRunning && 'bg-primary/15 text-primary',
                !isCompleted && !isRunning && 'bg-muted/50 text-muted-foreground'
              )}>
                {stage.agent}
              </div>
              
              {/* 阶段名称 */}
              <p className={cn(
                'mt-1 text-xs font-medium text-center px-1',
                isCompleted && 'text-emerald-600',
                isRunning && 'text-primary',
                !isCompleted && !isRunning && 'text-muted-foreground'
              )}>
                {stage.name}
              </p>
              {isRunning && (
                <p className="text-[10px] text-primary/70">进行中</p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 整体进度条 */}
      <div className="mt-4 px-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">开始</span>
          <span className="text-xs font-medium text-primary">{totalProgress}%</span>
          <span className="text-xs text-muted-foreground">完成</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 relative overflow-hidden transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 需求卡片组件
function RequirementCard({ requirement, isExpanded, onToggle }: { 
  requirement: typeof weeksData[0]['requirements'][0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const totalProgress = Math.round(
    (requirement.currentStageIndex / requirement.stages.length) * 100 + 
    (requirement.currentStageProgress / requirement.stages.length)
  );

  return (
    <div 
      className={cn(
        'group bg-card rounded-xl border transition-all duration-300 cursor-pointer',
        'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5',
        isExpanded 
          ? 'border-primary/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
          : 'border-border hover:border-primary/30'
      )}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* 左侧：状态 + 标题 */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* 状态图标 */}
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
              'bg-primary/10 border border-primary/20'
            )}>
              <Play className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-foreground">{requirement.title}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {requirement.stages[requirement.currentStageIndex]?.name}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{totalProgress}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{requirement.description}</p>
              
              {/* 时间和协作 */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{requirement.startTime} → {requirement.deadline}</span>
                </div>
                <div className="flex items-center gap-1 text-violet-500">
                  <Bot className="w-3 h-3" />
                  <span>{requirement.agent}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧：进度条 + 箭头 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-20">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 relative overflow-hidden"
                  style={{ width: `${totalProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-90 text-primary'
            )} />
          </div>
        </div>

        {/* 展开内容 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <PipelineProgress 
              stages={requirement.stages} 
              currentStageIndex={requirement.currentStageIndex}
              currentStageProgress={requirement.currentStageProgress}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 已完成需求项
function CompletedItem({ item }: { item: typeof weeksData[0]['completedRequirements'][0] }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <span className="text-sm text-foreground">{item.title}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>耗时 {item.duration}</span>
        <div className="flex items-center gap-1 text-violet-500">
          <Bot className="w-3 h-3" />
          <span>{item.agent}</span>
        </div>
      </div>
    </div>
  );
}

export default function DeveloperDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const developer = mockDeveloper;
  const roleCfg = roleConfig[developer.position] || roleConfig['全栈工程师'];
  const currentWeek = weeksData[currentWeekIndex];
  
  const workHoursPercent = Math.round((developer.weeklyStats.workHours / developer.weeklyStats.targetHours) * 100);
  const activeCount = currentWeek.requirements.length;
  const completedCount = currentWeek.completedRequirements.length;

  return (
    <KanbanLayout>
      <div className="min-h-screen">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* 返回按钮 */}
              <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all">
                  <ArrowLeft className="w-4 h-4 group-hover:text-primary" />
                </div>
                <span className="text-sm font-medium">返回列表</span>
              </button>

              {/* 周切换器 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted/30 rounded-xl p-1">
                  <button
                    onClick={() => setCurrentWeekIndex(Math.min(currentWeekIndex + 1, weeksData.length - 1))}
                    disabled={currentWeekIndex >= weeksData.length - 1}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                      currentWeekIndex >= weeksData.length - 1
                        ? 'text-muted-foreground/30 cursor-not-allowed'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background'
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-2 px-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{currentWeek.weekLabel}</span>
                    <span className="text-sm text-muted-foreground">{currentWeek.weekRange}</span>
                  </div>
                  
                  <button
                    onClick={() => setCurrentWeekIndex(Math.max(currentWeekIndex - 1, 0))}
                    disabled={currentWeekIndex <= 0}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                      currentWeekIndex <= 0
                        ? 'text-muted-foreground/30 cursor-not-allowed'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background'
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 快速跳转标签 */}
                <div className="flex items-center gap-1">
                  {weeksData.map((week, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentWeekIndex(idx)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        idx === currentWeekIndex
                          ? 'bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {week.weekLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 信息概览区 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* 开发者档案卡片 */}
            <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden">
              {/* 背景装饰 */}
              <div className={cn(
                'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30',
                'bg-gradient-to-br',
                roleCfg.gradient
              )} />
              
              <div className="relative">
                <div className="flex items-start gap-4">
                  {/* 头像 */}
                  <div 
                    className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg',
                      'bg-gradient-to-br',
                      roleCfg.gradient
                    )}
                    style={{ boxShadow: `0 8px 32px ${roleCfg.glowColor}` }}
                  >
                    {developer.name.slice(0, 2)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-foreground">{developer.name}</h2>
                      <div className={cn(
                        'flex items-center gap-1.5 text-xs font-medium',
                        developer.online ? 'text-emerald-500' : 'text-muted-foreground'
                      )}>
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          developer.online && 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                        )} />
                        {developer.online ? '在线' : '离线'}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{developer.position}</p>
                    
                    {/* 技术栈 */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {developer.techStack.map((tech) => (
                        <span 
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 本周成就 */}
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">本周成就</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {developer.achievements.map((achievement, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
                          achievement.highlight 
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <span>{achievement.icon}</span>
                        <span className="font-medium">{achievement.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 本周概览卡片 */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">本周概览</h3>
              </div>

              {/* 工时统计 */}
              <div className="mb-5">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-3xl font-bold text-foreground" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
                      {developer.weeklyStats.workHours}
                    </span>
                    <span className="text-lg text-muted-foreground"> / {developer.weeklyStats.targetHours}h</span>
                  </div>
                  <span className="text-sm font-medium text-primary">{workHoursPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 relative overflow-hidden"
                    style={{ width: `${workHoursPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>

              {/* 每日工时 */}
              <div className="mb-5">
                <p className="text-xs text-muted-foreground mb-2">每日工时</p>
                <div className="flex items-end justify-between gap-2">
                  {developer.weeklyStats.dailyHours.map((day) => {
                    const heightPercent = (day.hours / 10) * 100;
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full h-20 bg-muted/30 rounded-lg overflow-hidden flex flex-col justify-end">
                          <div 
                            className={cn(
                              'w-full rounded-t transition-all duration-500',
                              day.isToday 
                                ? 'bg-gradient-to-t from-primary to-cyan-400 shadow-[0_-4px_12px_rgba(59,130,246,0.4)]' 
                                : 'bg-gradient-to-t from-primary/60 to-cyan-400/60'
                            )}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className={cn(
                          'text-[10px] font-medium',
                          day.isToday ? 'text-primary' : 'text-muted-foreground'
                        )}>
                          {day.day}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{day.hours}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 常协作Agent */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{developer.weeklyStats.topAgent.name}</p>
                    <p className="text-xs text-muted-foreground">常协作 Agent</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-violet-500">{developer.weeklyStats.topAgent.count}次</span>
              </div>
            </div>
          </div>

          {/* 需求列表区 */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">需求列表</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                进行中 {activeCount}
              </span>
            </div>
            
            <div className="p-4 space-y-3">
              {currentWeek.requirements.length > 0 ? (
                currentWeek.requirements.map((req) => (
                  <RequirementCard
                    key={req.id}
                    requirement={req}
                    isExpanded={expandedId === req.id}
                    onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>本周暂无进行中的需求</p>
                </div>
              )}
            </div>
          </div>

          {/* 已完成需求区 */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-foreground">已完成</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                共 {completedCount} 个
              </span>
            </div>
            
            <div className="p-2">
              {currentWeek.completedRequirements.length > 0 ? (
                currentWeek.completedRequirements.map((item) => (
                  <CompletedItem key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>本周暂无已完成的需求</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </KanbanLayout>
  );
}
