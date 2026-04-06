'use client';

import { useState } from 'react';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  Search, 
  Plus, 
  Puzzle, 
  Code, 
  FileText, 
  Image, 
  Database, 
  Globe, 
  Terminal,
  GitBranch,
  Layers,
  Zap,
  ExternalLink,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 技能分类
const skillCategories = [
  { id: 'all', label: '全部', count: 24 },
  { id: 'dev', label: '开发', count: 8 },
  { id: 'doc', label: '文档', count: 5 },
  { id: 'design', label: '设计', count: 4 },
  { id: 'data', label: '数据', count: 4 },
  { id: 'web', label: '网络', count: 3 },
];

// 技能数据
const skills = [
  {
    id: 1,
    name: 'frontend-design',
    description: '前端页面设计与开发，支持多种框架和样式系统',
    category: 'dev',
    icon: Code,
    status: 'active',
    workers: ['AI前端开发', '张明'],
    usage: 156,
    tags: ['React', 'Vue', 'Tailwind'],
  },
  {
    id: 2,
    name: 'code-generation',
    description: '智能代码生成，支持多种编程语言和框架',
    category: 'dev',
    icon: Terminal,
    status: 'active',
    workers: ['AI后端开发', '王强'],
    usage: 234,
    tags: ['Python', 'TypeScript', 'Go'],
  },
  {
    id: 3,
    name: 'document-writer',
    description: '文档撰写与格式化，支持Markdown、PDF等格式',
    category: 'doc',
    icon: FileText,
    status: 'active',
    workers: ['AI需求分析员'],
    usage: 89,
    tags: ['Markdown', 'PDF', 'Word'],
  },
  {
    id: 4,
    name: 'image-gen',
    description: '图像生成与编辑，支持多种风格和格式',
    category: 'design',
    icon: Image,
    status: 'active',
    workers: ['AI前端开发'],
    usage: 67,
    tags: ['DALL-E', 'Stable Diffusion'],
  },
  {
    id: 5,
    name: 'database-query',
    description: '数据库查询与管理，支持SQL和NoSQL',
    category: 'data',
    icon: Database,
    status: 'active',
    workers: ['AI后端开发'],
    usage: 145,
    tags: ['PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    id: 6,
    name: 'web-scraper',
    description: '网页抓取与解析，支持动态渲染',
    category: 'web',
    icon: Globe,
    status: 'active',
    workers: ['AI需求分析员'],
    usage: 78,
    tags: ['Puppeteer', 'Playwright'],
  },
  {
    id: 7,
    name: 'git-ops',
    description: 'Git操作与版本管理，支持多种工作流',
    category: 'dev',
    icon: GitBranch,
    status: 'active',
    workers: ['AI后端开发'],
    usage: 112,
    tags: ['Git', 'GitHub', 'GitLab'],
  },
  {
    id: 8,
    name: 'api-design',
    description: 'API设计与文档生成，支持OpenAPI规范',
    category: 'dev',
    icon: Layers,
    status: 'active',
    workers: ['AI后端开发', '王强'],
    usage: 98,
    tags: ['REST', 'GraphQL', 'OpenAPI'],
  },
];

function SkillCard({ skill, index }: { skill: typeof skills[0]; index: number }) {
  const Icon = skill.icon;

  return (
    <div 
      className="kanban-panel p-5 kanban-card group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{skill.name}</h3>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Check className="w-3 h-3 mr-1" />
              已安装
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{skill.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {skill.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span>使用次数: </span>
          <span className="number-highlight">{skill.usage}</span>
        </div>
        <div className="flex items-center gap-2">
          {skill.workers.slice(0, 2).map(name => (
            <span key={name} className="text-xs text-primary">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSkills = skills.filter(skill => {
    if (activeCategory !== 'all' && skill.category !== activeCategory) return false;
    if (searchQuery) {
      return skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <KanbanLayout>
      <div className="p-6 space-y-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">技能库</h1>
            <p className="text-muted-foreground text-sm mt-1">管理和配置工作者的技能包</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            添加技能
          </button>
        </div>

        {/* 搜索和分类 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索技能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* 分类标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            {skillCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:border-primary/50 text-foreground'
                )}
              >
                {cat.label}
                <span className="ml-1.5 text-xs opacity-70">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 技能网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} index={index} />
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-16">
            <Puzzle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">没有找到匹配的技能</p>
          </div>
        )}
      </div>
    </KanbanLayout>
  );
}
