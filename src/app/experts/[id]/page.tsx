'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  ArrowLeft,
  Bot,
  Wrench,
  Plug,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  Copy,
  FileText,
  Terminal,
  Code,
  Globe,
  Database,
  MessageSquare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 模拟数据（与列表页一致）
const agentsData = [
  {
    id: '1',
    name: 'Agent-2',
    avatar: '🤖',
    role: '全栈开发工程师',
    description: '专注于代码开发、代码审查和技术方案设计。能够独立完成需求分析、方案设计、编码实现、单元测试等全流程开发工作。',
    capabilities: ['代码生成与重构', 'Bug定位与修复', '代码审查优化', '技术方案设计', '单元测试编写', 'API接口开发'],
    skills: [
      { name: '代码生成', description: '根据需求自动生成高质量代码，支持多种编程语言', level: 95 },
      { name: '代码审查', description: '检测代码问题并提供优化建议，提升代码质量', level: 90 },
      { name: '单元测试', description: '自动生成单元测试用例，确保代码覆盖率', level: 85 },
      { name: '重构优化', description: '识别代码坏味道并进行重构优化', level: 88 },
    ],
    mcpTools: [
      { name: 'filesystem', type: '文件系统', description: '读写文件系统，管理代码文件' },
      { name: 'github', type: '代码仓库', description: 'Git操作，代码提交和PR管理' },
      { name: 'postgres', type: '数据库', description: '数据库查询和操作' },
    ],
    tools: ['VS Code', 'Git', 'Docker', 'Jest', 'ESLint', 'Prettier'],
    category: 'dev',
    status: 'online',
    tasksCompleted: 1247,
    successRate: 98.5,
    avgResponseTime: '1.2s',
    prompt: `你是一位经验丰富的全栈开发工程师，具备以下能力：

## 技术栈
- **后端**: Python, Node.js, Go, Java
- **前端**: React, Vue, Next.js, TypeScript
- **数据库**: PostgreSQL, MySQL, MongoDB, Redis
- **工具**: Docker, Kubernetes, Git, CI/CD

## 工作原则
1. **理解需求**: 在编码前，先理解业务需求和技术约束
2. **方案设计**: 进行技术方案设计，考虑可扩展性和可维护性
3. **代码质量**: 编写清晰、可维护、符合规范的代码
4. **测试覆盖**: 编写单元测试确保代码质量
5. **代码审查**: 进行自我审查，优化代码结构

## 输出规范
- 代码需要包含必要的注释
- 关键函数需要编写单元测试
- 复杂逻辑需要有设计说明`,
    recentTasks: [
      { id: 1, title: '用户登录功能开发', status: 'completed', time: '2小时前' },
      { id: 2, title: 'API接口优化', status: 'completed', time: '5小时前' },
      { id: 3, title: '代码审查-权限模块', status: 'running', time: '进行中' },
    ],
  },
  {
    id: '2',
    name: 'Agent-3',
    avatar: '🎯',
    role: '需求分析师',
    description: '负责需求分析、方案评审和文档编写。能够将模糊的业务需求转化为清晰的技术需求文档。',
    capabilities: ['需求分析与拆解', '技术方案评审', '文档编写', '流程设计', '原型设计', '用户故事编写'],
    skills: [
      { name: '需求分析', description: '将业务需求转化为技术需求', level: 92 },
      { name: '文档生成', description: '自动生成需求文档和设计文档', level: 88 },
      { name: '流程图绘制', description: '自动绘制业务流程图', level: 85 },
    ],
    mcpTools: [
      { name: 'notion', type: '文档协作', description: '创建和编辑Notion文档' },
      { name: 'figma', type: '设计工具', description: '读取和创建设计稿' },
    ],
    tools: ['Notion', 'Figma', 'ProcessOn', 'Confluence'],
    category: 'analysis',
    status: 'busy',
    tasksCompleted: 856,
    successRate: 97.8,
    avgResponseTime: '2.5s',
    prompt: `你是一位专业的需求分析师，擅长将业务需求转化为可执行的技术方案。

## 核心能力
1. **需求收集**: 从用户、产品经理等角色收集需求
2. **需求分析**: 分析需求的可行性、优先级和依赖关系
3. **文档编写**: 编写需求文档、用户故事、验收标准
4. **方案设计**: 设计技术方案，评估风险和资源

## 工作流程
1. 理解业务背景和目标
2. 收集和分析需求
3. 编写需求文档
4. 设计技术方案
5. 组织评审和确认`,
    recentTasks: [
      { id: 1, title: '订单系统需求分析', status: 'completed', time: '1天前' },
      { id: 2, title: '数据导出功能方案评审', status: 'running', time: '进行中' },
    ],
  },
  {
    id: '3',
    name: 'Agent-5',
    avatar: '🎨',
    role: 'UI/UX设计师',
    description: '专注于界面设计和用户体验优化。能够根据需求快速生成设计方案和交互原型。',
    capabilities: ['界面设计', '交互原型', '设计规范', '用户体验优化', '图标设计', '动效设计'],
    skills: [
      { name: '界面设计', description: '生成符合设计规范的UI界面', level: 90 },
      { name: '原型设计', description: '快速生成可交互原型', level: 88 },
      { name: '设计系统', description: '构建和维护设计系统', level: 85 },
    ],
    mcpTools: [
      { name: 'figma', type: '设计工具', description: '创建和编辑设计稿' },
    ],
    tools: ['Figma', 'Sketch', 'Principle', '设计规范库'],
    category: 'content',
    status: 'online',
    tasksCompleted: 423,
    successRate: 96.2,
    avgResponseTime: '3.0s',
    prompt: `你是一位资深的UI/UX设计师，注重用户体验和视觉美感。

## 设计原则
- **用户为中心**: 设计符合用户习惯和预期
- **简洁清晰**: 避免冗余，信息层次清晰
- **一致性**: 保持视觉和交互的一致性
- **可访问性**: 考虑各类用户的使用需求

## 设计流程
1. 理解用户需求和场景
2. 信息架构设计
3. 交互流程设计
4. 视觉设计
5. 原型验证`,
    recentTasks: [
      { id: 1, title: '首页改版设计', status: 'completed', time: '3小时前' },
      { id: 2, title: '移动端适配', status: 'running', time: '进行中' },
    ],
  },
];

// MCP 工具图标
const mcpIcons: Record<string, typeof Database> = {
  'filesystem': FileText,
  'github': Code,
  'postgres': Database,
  'notion': FileText,
  'figma': Sparkles,
  'web-search': Globe,
  'calendar': Clock,
};

// 详情页组件
export default function ExpertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const agentId = params.id as string;
  const agent = agentsData.find(a => a.id === agentId) || agentsData[0];

  // 复制提示词
  const handleCopy = () => {
    navigator.clipboard.writeText(agent.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <KanbanLayout>
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
        {/* 顶部区域 */}
        <div className="bg-card border-b border-border shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-5">
            {/* 返回按钮 */}
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回列表</span>
            </button>

            {/* 智能体信息 */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* 头像 */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-3xl">
                    {agent.avatar}
                  </div>
                  <span className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background',
                    agent.status === 'online' ? 'bg-emerald-500' :
                    agent.status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
                  )} />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
                    <span className={cn(
                      'text-sm px-2 py-0.5 rounded-full',
                      agent.status === 'online' ? 'bg-emerald-500/10 text-emerald-600' :
                      agent.status === 'busy' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-gray-500/10 text-gray-600'
                    )}>
                      {agent.status === 'online' ? '在线' : agent.status === 'busy' ? '忙碌' : '离线'}
                    </span>
                  </div>
                  <p className="text-primary font-medium">{agent.role}</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">{agent.description}</p>
                </div>
              </div>

              {/* 统计 */}
              <div className="flex gap-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-xl font-bold text-primary">{agent.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">完成任务</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{agent.successRate}%</p>
                  <p className="text-xs text-muted-foreground">成功率</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-xl font-bold text-amber-600">{agent.avgResponseTime}</p>
                  <p className="text-xs text-muted-foreground">响应时间</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* 能力概览 */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">核心能力</h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <span 
                  key={cap}
                  className="px-3 py-1.5 rounded-lg text-sm bg-primary/10 text-primary"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Skills 技能 */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-foreground">Skills 技能</h3>
                <span className="text-sm text-muted-foreground">({agent.skills.length})</span>
              </div>

              <div className="space-y-3">
                {agent.skills.map((skill, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.level}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MCP 工具 */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Plug className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-foreground">MCP 工具</h3>
                <span className="text-sm text-muted-foreground">({agent.mcpTools.length})</span>
              </div>

              {agent.mcpTools.length > 0 ? (
                <div className="space-y-2">
                  {agent.mcpTools.map((tool, idx) => {
                    const Icon = mcpIcons[tool.name] || Wrench;
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-muted/30 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{tool.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {tool.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无 MCP 工具
                </div>
              )}
            </div>
          </div>

          {/* 其他工具 */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">其他工具</h3>
              <span className="text-sm text-muted-foreground">({agent.tools.length})</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span 
                  key={tool}
                  className="px-3 py-1.5 rounded-lg text-sm bg-muted/50 text-muted-foreground border border-border"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* 提示词 */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button 
              className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
              onClick={() => setShowPrompt(!showPrompt)}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">提示词 (Prompt)</h3>
              </div>
              {showPrompt ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
            </button>

            {showPrompt && (
              <div className="border-t border-border">
                <div className="p-5 bg-muted/20">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-background p-4 rounded-lg border border-border overflow-auto max-h-96">
                    {agent.prompt}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 最近任务 */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">最近任务</h3>
            
            <div className="space-y-2">
              {agent.recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-primary animate-pulse" />
                    )}
                    <span className="text-foreground">{task.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{task.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </KanbanLayout>
  );
}
