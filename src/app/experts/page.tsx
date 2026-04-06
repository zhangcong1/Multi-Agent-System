'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  Search,
  Bot,
  Wrench,
  Plug,
  Code,
  FileText,
  Cpu,
  Zap,
  ChevronRight,
  Sparkles,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// AI Agent 分类
const categories = [
  { id: 'all', name: '全部', count: 8 },
  { id: 'dev', name: '开发工程', count: 3 },
  { id: 'analysis', name: '数据分析', count: 2 },
  { id: 'content', name: '内容创作', count: 2 },
  { id: 'assistant', name: '智能助手', count: 1 },
];

interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  capabilities: string[];
  skills: { name: string; description: string }[];
  mcpTools: { name: string; type: string }[];
  tools: string[];
  category: string;
  status: 'online' | 'busy' | 'offline';
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: string;
  prompt: string;
}

const agents: AIAgent[] = [
  {
    id: '1',
    name: 'Agent-2',
    avatar: '🤖',
    role: '全栈开发工程师',
    description: '专注于代码开发、代码审查和技术方案设计。能够独立完成需求分析、方案设计、编码实现、单元测试等全流程开发工作。',
    capabilities: ['代码生成与重构', 'Bug定位与修复', '代码审查优化', '技术方案设计'],
    skills: [
      { name: '代码生成', description: '根据需求自动生成高质量代码' },
      { name: '代码审查', description: '检测代码问题并提供优化建议' },
      { name: '单元测试', description: '自动生成单元测试用例' },
    ],
    mcpTools: [
      { name: 'filesystem', type: '文件系统' },
      { name: 'github', type: '代码仓库' },
      { name: 'postgres', type: '数据库' },
    ],
    tools: ['代码编辑器', 'Git', 'Docker', '测试框架'],
    category: 'dev',
    status: 'online',
    tasksCompleted: 1247,
    successRate: 98.5,
    avgResponseTime: '1.2s',
    prompt: `你是一位经验丰富的全栈开发工程师，具备以下能力：
1. 精通多种编程语言（Python, JavaScript, TypeScript, Go等）
2. 熟悉主流框架（React, Vue, Next.js, FastAPI等）
3. 具备系统架构设计能力
4. 注重代码质量和最佳实践

在工作时，你需要：
- 理解需求后先进行技术方案设计
- 编写清晰、可维护的代码
- 进行必要的代码审查和优化
- 编写单元测试确保代码质量`,
  },
  {
    id: '2',
    name: 'Agent-3',
    avatar: '🎯',
    role: '需求分析师',
    description: '负责需求分析、方案评审和文档编写。能够将模糊的业务需求转化为清晰的技术需求文档。',
    capabilities: ['需求分析与拆解', '技术方案评审', '文档编写', '流程设计'],
    skills: [
      { name: '需求分析', description: '将业务需求转化为技术需求' },
      { name: '文档生成', description: '自动生成需求文档和设计文档' },
      { name: '流程图绘制', description: '自动绘制业务流程图' },
    ],
    mcpTools: [
      { name: 'notion', type: '文档协作' },
      { name: 'figma', type: '设计工具' },
    ],
    tools: ['文档编辑器', '流程图工具', '原型工具'],
    category: 'analysis',
    status: 'busy',
    tasksCompleted: 856,
    successRate: 97.8,
    avgResponseTime: '2.5s',
    prompt: `你是一位专业的需求分析师，擅长：
1. 理解业务需求并转化为技术需求
2. 进行需求优先级排序
3. 编写详细的需求文档
4. 识别需求风险和依赖关系

工作原则：
- 确保需求的完整性和一致性
- 关注用户体验和业务价值
- 与开发团队密切沟通`,
  },
  {
    id: '3',
    name: 'Agent-5',
    avatar: '🎨',
    role: 'UI/UX设计师',
    description: '专注于界面设计和用户体验优化。能够根据需求快速生成设计方案和交互原型。',
    capabilities: ['界面设计', '交互原型', '设计规范', '用户体验优化'],
    skills: [
      { name: '界面设计', description: '生成符合设计规范的UI界面' },
      { name: '原型设计', description: '快速生成可交互原型' },
      { name: '设计系统', description: '构建和维护设计系统' },
    ],
    mcpTools: [
      { name: 'figma', type: '设计工具' },
    ],
    tools: ['Figma', 'Sketch', '设计规范库'],
    category: 'content',
    status: 'online',
    tasksCompleted: 423,
    successRate: 96.2,
    avgResponseTime: '3.0s',
    prompt: `你是一位资深的UI/UX设计师，具备：
1. 丰富的界面设计经验
2. 深刻的用户体验理解
3. 熟练使用设计工具
4. 良好的审美和设计品味

设计原则：
- 用户为中心
- 简洁清晰
- 一致性
- 可访问性`,
  },
  {
    id: '4',
    name: 'Agent-6',
    avatar: '📊',
    role: '数据分析专家',
    description: '负责数据采集、清洗、分析和可视化。能够从海量数据中挖掘业务洞察。',
    capabilities: ['数据采集清洗', '统计分析', '可视化报表', '业务洞察'],
    skills: [
      { name: 'SQL查询', description: '编写复杂SQL进行数据查询' },
      { name: '数据分析', description: '进行统计分析和数据挖掘' },
      { name: '可视化', description: '生成数据可视化图表' },
    ],
    mcpTools: [
      { name: 'postgres', type: '数据库' },
      { name: 'supabase', type: '数据服务' },
    ],
    tools: ['SQL', 'Python', 'Tableau', 'PowerBI'],
    category: 'analysis',
    status: 'online',
    tasksCompleted: 634,
    successRate: 99.1,
    avgResponseTime: '2.0s',
    prompt: `你是一位数据分析专家，精通：
1. SQL和数据查询
2. Python数据分析
3. 统计分析方法
4. 数据可视化

分析原则：
- 数据准确性
- 结论可验证
- 洞察可落地`,
  },
  {
    id: '5',
    name: 'Agent-7',
    avatar: '✍️',
    role: '内容创作专家',
    description: '专注于文案撰写、内容创作和文档编辑。能够生成各类高质量文本内容。',
    capabilities: ['文案撰写', '内容创作', '文档编辑', 'SEO优化'],
    skills: [
      { name: '文案生成', description: '生成营销文案和产品文案' },
      { name: '内容创作', description: '撰写文章、报告等内容' },
      { name: 'SEO优化', description: '优化内容提升搜索排名' },
    ],
    mcpTools: [],
    tools: ['文档编辑器', 'SEO工具', '语法检查'],
    category: 'content',
    status: 'online',
    tasksCompleted: 1567,
    successRate: 98.0,
    avgResponseTime: '1.5s',
    prompt: `你是一位专业的内容创作者，擅长：
1. 各类文案撰写
2. 内容策划和编辑
3. SEO优化
4. 品牌调性把控

创作原则：
- 内容准确
- 表达清晰
- 符合品牌调性`,
  },
  {
    id: '6',
    name: 'Agent-8',
    avatar: '🔧',
    role: 'DevOps工程师',
    description: '负责CI/CD流程、容器编排和基础设施管理。确保系统稳定高效运行。',
    capabilities: ['CI/CD流水线', '容器编排', '监控告警', '自动化运维'],
    skills: [
      { name: 'CI/CD', description: '构建和维护持续集成流水线' },
      { name: '容器化', description: 'Docker容器化和K8s编排' },
      { name: '监控', description: '系统监控和告警配置' },
    ],
    mcpTools: [
      { name: 'github', type: '代码仓库' },
      { name: 'docker', type: '容器服务' },
    ],
    tools: ['Docker', 'Kubernetes', 'Jenkins', 'Prometheus'],
    category: 'dev',
    status: 'busy',
    tasksCompleted: 412,
    successRate: 99.5,
    avgResponseTime: '1.8s',
    prompt: `你是一位DevOps工程师，精通：
1. CI/CD流程设计和优化
2. 容器化和容器编排
3. 监控和告警系统
4. 自动化运维

工作原则：
- 自动化优先
- 安全可靠
- 可观测性`,
  },
  {
    id: '7',
    name: 'Agent-9',
    avatar: '🧪',
    role: '测试工程师',
    description: '负责自动化测试、性能测试和质量保障。确保产品交付质量。',
    capabilities: ['自动化测试', '性能测试', '安全测试', '质量报告'],
    skills: [
      { name: '自动化测试', description: '编写和执行自动化测试用例' },
      { name: '性能测试', description: '进行性能压测和分析' },
      { name: 'Bug追踪', description: '问题定位和追踪' },
    ],
    mcpTools: [
      { name: 'github', type: '代码仓库' },
    ],
    tools: ['Selenium', 'JMeter', 'Postman', '测试框架'],
    category: 'dev',
    status: 'online',
    tasksCompleted: 823,
    successRate: 97.5,
    avgResponseTime: '2.2s',
    prompt: `你是一位测试工程师，擅长：
1. 自动化测试框架
2. 性能测试工具
3. Bug定位和分析
4. 质量保障流程

测试原则：
- 覆盖全面
- 回归充分
- 报告清晰`,
  },
  {
    id: '8',
    name: 'Agent-X',
    avatar: '🧠',
    role: '智能助手',
    description: '通用智能助手，能够处理日常事务、回答问题、协调资源。是团队的得力助手。',
    capabilities: ['问答咨询', '日程管理', '资源协调', '信息检索'],
    skills: [
      { name: '智能问答', description: '回答各类问题和咨询' },
      { name: '任务协调', description: '协调分配团队任务' },
      { name: '信息检索', description: '快速检索和整理信息' },
    ],
    mcpTools: [
      { name: 'web-search', type: '网络搜索' },
      { name: 'calendar', type: '日程管理' },
    ],
    tools: ['搜索引擎', '知识库', '协作工具'],
    category: 'assistant',
    status: 'online',
    tasksCompleted: 2341,
    successRate: 99.2,
    avgResponseTime: '0.8s',
    prompt: `你是一位智能助手，能够：
1. 回答各类问题
2. 协调团队资源
3. 管理日程任务
4. 检索整理信息

工作原则：
- 响应及时
- 准确可靠
- 友好专业`,
  },
];

// AI Agent 卡片组件
function AgentCard({ agent, index }: { agent: AIAgent; index: number }) {
  const router = useRouter();

  return (
    <div 
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/experts/${agent.id}`)}
    >
      {/* 头部 */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-2xl">
              {agent.avatar}
            </div>
            <span className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background',
              agent.status === 'online' ? 'bg-emerald-500' :
              agent.status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
            )} />
          </div>

          {/* 基本信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{agent.name}</h3>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                agent.status === 'online' ? 'bg-emerald-500/10 text-emerald-600' :
                agent.status === 'busy' ? 'bg-amber-500/10 text-amber-600' :
                'bg-gray-500/10 text-gray-600'
              )}>
                {agent.status === 'online' ? '在线' : agent.status === 'busy' ? '忙碌' : '离线'}
              </span>
            </div>
            <p className="text-sm text-primary font-medium">{agent.role}</p>
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{agent.description}</p>

        {/* 能力标签 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span 
              key={cap}
              className="px-2 py-0.5 rounded text-xs bg-muted/50 text-muted-foreground"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-0.5 rounded text-xs bg-muted/50 text-muted-foreground">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>

        {/* 工具能力 */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs">
            {/* Skills */}
            {agent.skills.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span>{agent.skills.length} Skills</span>
              </div>
            )}
            {/* MCP */}
            {agent.mcpTools.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Plug className="w-3.5 h-3.5 text-blue-500" />
                <span>{agent.mcpTools.length} MCP</span>
              </div>
            )}
            {/* Tools */}
            {agent.tools.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>{agent.tools.length} 工具</span>
              </div>
            )}
          </div>
        </div>

        {/* 底部统计 */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>{agent.tasksCompleted} 任务</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-medium">{agent.successRate}%</span>
            <span>成功率</span>
          </div>
          <div className="flex items-center gap-1">
            <span>响应</span>
            <span className="font-medium">{agent.avgResponseTime}</span>
          </div>
        </div>

        {/* 查看详情 */}
        <div className="mt-3 flex items-center justify-end text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
          查看详情 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

export default function ExpertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // 筛选
  const filteredAgents = agents.filter((agent) => {
    if (activeCategory !== 'all' && agent.category !== activeCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(query) ||
        agent.role.toLowerCase().includes(query) ||
        agent.capabilities.some(c => c.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // 统计
  const stats = {
    total: agents.length,
    online: agents.filter(a => a.status === 'online').length,
    busy: agents.filter(a => a.status === 'busy').length,
    totalSkills: agents.reduce((sum, a) => sum + a.skills.length, 0),
    totalMCP: agents.reduce((sum, a) => sum + a.mcpTools.length, 0),
  };

  return (
    <KanbanLayout>
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
        {/* 顶部区域 */}
        <div className="bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  AI 专家团队
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">智能体能力管理与监控</p>
              </div>
            </div>

            {/* 统计 */}
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{stats.total} 智能体</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">{stats.online} 在线</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium">{stats.busy} 忙碌</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">{stats.totalSkills} Skills</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg">
                <Plug className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{stats.totalMCP} MCP工具</span>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-7xl mx-auto px-6 py-5">
          {/* 搜索和筛选 */}
          <div className="flex items-center gap-4 mb-5">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索智能体..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    activeCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-card border border-border hover:border-primary/50 text-muted-foreground'
                  )}
                >
                  {cat.name}
                  <span className="ml-1 text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 智能体卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>

          {/* 空状态 */}
          {filteredAgents.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Bot className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">没有找到匹配的智能体</p>
            </div>
          )}
        </div>
      </div>
    </KanbanLayout>
  );
}
