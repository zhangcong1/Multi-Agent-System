'use client';

import { useState } from 'react';
import { KanbanLayout } from '@/components/kanban/Sidebar';
import { 
  Search, 
  Plus, 
  Plug, 
  Server,
  Database,
  Cloud,
  FileCode,
  Settings,
  ExternalLink,
  Check,
  Circle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// MCP 状态类型
type MCPStatus = 'connected' | 'disconnected' | 'error';

// MCP 服务器数据
const mcpServers = [
  {
    id: 1,
    name: 'filesystem-server',
    description: '文件系统访问服务，支持读写本地和远程文件',
    type: 'storage',
    status: 'connected' as MCPStatus,
    version: '1.2.0',
    endpoint: 'mcp://filesystem.local:8080',
    workers: ['AI需求分析员', 'AI前端开发'],
    tools: ['read_file', 'write_file', 'list_dir', 'delete_file'],
    lastPing: '2秒前',
  },
  {
    id: 2,
    name: 'database-server',
    description: '数据库连接服务，支持 PostgreSQL、MySQL、MongoDB',
    type: 'database',
    status: 'connected' as MCPStatus,
    version: '2.0.1',
    endpoint: 'mcp://db.cluster.local:5432',
    workers: ['AI后端开发'],
    tools: ['query', 'insert', 'update', 'delete', 'schema'],
    lastPing: '5秒前',
  },
  {
    id: 3,
    name: 'git-server',
    description: 'Git 仓库操作服务，支持克隆、提交、分支管理',
    type: 'vcs',
    status: 'connected' as MCPStatus,
    version: '1.0.5',
    endpoint: 'mcp://git.local:9418',
    workers: ['AI后端开发', 'AI前端开发'],
    tools: ['clone', 'commit', 'push', 'pull', 'branch', 'merge'],
    lastPing: '1秒前',
  },
  {
    id: 4,
    name: 'web-browser',
    description: '浏览器自动化服务，支持页面抓取和交互',
    type: 'browser',
    status: 'connected' as MCPStatus,
    version: '3.1.0',
    endpoint: 'mcp://browser.local:3000',
    workers: ['AI需求分析员'],
    tools: ['navigate', 'click', 'type', 'screenshot', 'extract'],
    lastPing: '3秒前',
  },
  {
    id: 5,
    name: 'api-gateway',
    description: 'API 网关服务，支持 REST 和 GraphQL 调用',
    type: 'api',
    status: 'error' as MCPStatus,
    version: '1.5.2',
    endpoint: 'mcp://api.local:8080',
    workers: ['AI后端开发'],
    tools: ['request', 'auth', 'transform'],
    lastPing: '连接失败',
  },
  {
    id: 6,
    name: 'cloud-storage',
    description: '云存储服务，支持 S3、OSS、GCS 等对象存储',
    type: 'cloud',
    status: 'disconnected' as MCPStatus,
    version: '2.2.0',
    endpoint: 'mcp://cloud.storage:443',
    workers: ['AI前端开发'],
    tools: ['upload', 'download', 'list', 'delete'],
    lastPing: '未连接',
  },
];

const typeIcons: Record<string, React.ElementType> = {
  storage: Database,
  database: Database,
  vcs: FileCode,
  browser: Cloud,
  api: Server,
  cloud: Cloud,
};

const statusConfig: Record<MCPStatus, { label: string; color: string; icon: React.ElementType }> = {
  connected: { label: '已连接', color: 'emerald', icon: Check },
  disconnected: { label: '未连接', color: 'gray', icon: Circle },
  error: { label: '连接错误', color: 'red', icon: AlertCircle },
};

function MCPCard({ server, index }: { server: typeof mcpServers[0]; index: number }) {
  const Icon = typeIcons[server.type] || Server;
  const status = statusConfig[server.status];

  return (
    <div 
      className="kanban-panel p-5 kanban-card group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            server.status === 'connected' ? 'bg-emerald-500/10' : 'bg-muted'
          )}>
            <Icon className={cn(
              'w-6 h-6',
              server.status === 'connected' ? 'text-emerald-500' : 'text-muted-foreground'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{server.name}</h3>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  status.color === 'emerald' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                  status.color === 'gray' && 'bg-gray-500/10 text-gray-600 border-gray-500/20',
                  status.color === 'red' && 'bg-red-500/10 text-red-600 border-red-500/20'
                )}
              >
                <status.icon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{server.description}</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* 工具列表 */}
      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">可用工具 ({server.tools.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {server.tools.slice(0, 5).map(tool => (
            <span key={tool} className="mcp-tag">
              {tool}
            </span>
          ))}
          {server.tools.length > 5 && (
            <span className="text-xs text-muted-foreground">+{server.tools.length - 5}</span>
          )}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          <span>v{server.version}</span>
          <span className="mx-2">·</span>
          <span className={server.status === 'error' ? 'text-red-500' : ''}>{server.lastPing}</span>
        </div>
        <div className="flex items-center gap-2">
          {server.workers.map(name => (
            <span key={name} className="text-primary">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MCPPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServers = mcpServers.filter(server => {
    if (searchQuery) {
      return server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             server.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const connectedCount = mcpServers.filter(s => s.status === 'connected').length;
  const totalCount = mcpServers.length;

  return (
    <KanbanLayout>
      <div className="p-6 space-y-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MCP 协议</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Model Context Protocol - 管理外部工具和服务连接
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            添加服务
          </button>
        </div>

        {/* 状态概览 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="kanban-panel p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold number-highlight">{connectedCount}</p>
                <p className="text-xs text-muted-foreground">已连接</p>
              </div>
            </div>
          </div>
          <div className="kanban-panel p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <Circle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold number-highlight">
                  {mcpServers.filter(s => s.status === 'disconnected').length}
                </p>
                <p className="text-xs text-muted-foreground">未连接</p>
              </div>
            </div>
          </div>
          <div className="kanban-panel p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold number-highlight">
                  {mcpServers.filter(s => s.status === 'error').length}
                </p>
                <p className="text-xs text-muted-foreground">连接错误</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索 MCP 服务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* MCP 服务网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServers.map((server, index) => (
            <MCPCard key={server.id} server={server} index={index} />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-16">
            <Plug className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">没有找到匹配的 MCP 服务</p>
          </div>
        )}
      </div>
    </KanbanLayout>
  );
}
