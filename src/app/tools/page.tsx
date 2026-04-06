'use client';

import { useState } from 'react';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  Search,
  Wrench,
  Puzzle,
  Plug,
  Zap,
  Database,
  GitBranch,
  Cloud,
  FileCode,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 技能数据
const skills = [
  { id: 1, name: '代码生成', category: '代码开发', icon: FileCode, color: 'from-blue-500 to-cyan-500', usage: 1234, description: '自动生成高质量代码' },
  { id: 2, name: '需求分析', category: '产品', icon: Puzzle, color: 'from-violet-500 to-purple-500', usage: 892, description: '智能分析用户需求' },
  { id: 3, name: '数据可视化', category: '数据分析', icon: Database, color: 'from-emerald-500 to-teal-500', usage: 567, description: '生成图表和报表' },
  { id: 4, name: '自动化测试', category: '测试', icon: Shield, color: 'from-amber-500 to-orange-500', usage: 445, description: '自动生成测试用例' },
  { id: 5, name: 'UI设计', category: '设计', icon: Wrench, color: 'from-pink-500 to-rose-500', usage: 334, description: '生成界面设计方案' },
  { id: 6, name: '文档生成', category: '文档', icon: FileCode, color: 'from-cyan-500 to-sky-500', usage: 678, description: '自动生成技术文档' },
];

// MCP服务数据
const mcpServices = [
  { id: 1, name: '文件系统', status: 'connected', icon: Database, color: 'from-blue-500 to-cyan-500', type: 'filesystem', tools: 8 },
  { id: 2, name: 'Git 服务', status: 'connected', icon: GitBranch, color: 'from-emerald-500 to-teal-500', type: 'version-control', tools: 12 },
  { id: 3, name: '云存储', status: 'connected', icon: Cloud, color: 'from-violet-500 to-purple-500', type: 'storage', tools: 6 },
  { id: 4, name: '数据库服务', status: 'connected', icon: Database, color: 'from-amber-500 to-orange-500', type: 'database', tools: 15 },
  { id: 5, name: 'API 网关', status: 'connected', icon: Globe, color: 'from-pink-500 to-rose-500', type: 'api', tools: 10 },
  { id: 6, name: '安全服务', status: 'connected', icon: Shield, color: 'from-red-500 to-rose-500', type: 'security', tools: 5 },
];

// 技能卡片
function SkillCard({ skill, index }: { skill: typeof skills[0]; index: number }) {
  const Icon = skill.icon;
  
  return (
    <div 
      className="glass-card rounded-xl p-4 card-hover stagger-item group cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg',
          'bg-gradient-to-br',
          skill.color
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          {skill.usage}
        </div>
      </div>
      <h3 className="font-medium text-foreground mt-3 group-hover:text-primary transition-colors">{skill.name}</h3>
      <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{skill.category}</span>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </div>
  );
}

// MCP服务卡片
function McpCard({ service, index }: { service: typeof mcpServices[0]; index: number }) {
  const Icon = service.icon;
  
  return (
    <div 
      className="glass-card rounded-xl p-4 card-hover stagger-item group cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg',
          'bg-gradient-to-br',
          service.color
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
          service.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        )}>
          {service.status === 'connected' ? (
            <>
              <CheckCircle className="w-3 h-3" />
              已连接
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              断开
            </>
          )}
        </div>
      </div>
      <h3 className="font-medium text-foreground mt-3 group-hover:text-primary transition-colors">{service.name}</h3>
      <p className="text-xs text-muted-foreground mt-1">{service.type}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{service.tools} 个工具</span>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'skills' | 'mcp'>('skills');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = skills.filter(s => 
    searchQuery ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );
  
  const filteredMcp = mcpServices.filter(s => 
    searchQuery ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <KanbanLayout>
      <div className="p-8 space-y-6">
        {/* 标题栏 */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="w-7 h-7 text-primary" />
            工具服务
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理技能包和 MCP 协议服务
          </p>
        </div>

        {/* 标签切换 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('skills')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-card border border-border hover:border-primary/50 text-foreground'
            )}
          >
            <Puzzle className="w-4 h-4" />
            技能包
            <span className="text-xs opacity-70">({skills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
              activeTab === 'mcp'
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-card border border-border hover:border-primary/50 text-foreground'
            )}
          >
            <Plug className="w-4 h-4" />
            MCP 协议
            <span className="text-xs opacity-70">({mcpServices.length})</span>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === 'skills' ? '搜索技能...' : '搜索服务...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* 内容区域 */}
        {activeTab === 'skills' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSkills.map((skill, index) => (
              <SkillCard key={skill.id} skill={skill} index={index} />
            ))}
          </div>
        ) : (
          <>
            {/* 统计 */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '已连接', value: mcpServices.filter(s => s.status === 'connected').length, color: 'from-emerald-500 to-teal-500' },
                { label: '总工具数', value: mcpServices.reduce((sum, s) => sum + s.tools, 0), color: 'from-blue-500 to-cyan-500' },
                { label: '服务类型', value: [...new Set(mcpServices.map(s => s.type))].length, color: 'from-violet-500 to-purple-500' },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-4 stagger-item" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3',
                    'bg-gradient-to-br',
                    stat.color
                  )}>
                    {i === 0 && <CheckCircle className="w-5 h-5" />}
                    {i === 1 && <Wrench className="w-5 h-5" />}
                    {i === 2 && <Database className="w-5 h-5" />}
                  </div>
                  <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMcp.map((service, index) => (
                <McpCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </KanbanLayout>
  );
}
