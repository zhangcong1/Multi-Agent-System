'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Bot, 
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/developers', label: '开发者', icon: Users },
  { href: '/experts', label: '专家团队', icon: Bot },
  { href: '/projects', label: '项目需求', icon: FolderKanban },
  { href: '/tools', label: '工具服务', icon: Wrench },
  { href: '/settings', label: '设置', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500',
            'shadow-lg shadow-purple-500/25',
            'group-hover:shadow-xl group-hover:shadow-purple-500/30',
            'transition-all duration-300'
          )}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in-up">
              <span className="font-semibold text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                智汇协作
              </span>
              <p className="text-xs text-muted-foreground -mt-0.5">团队协作平台</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'w-8 h-8 rounded-lg transition-all',
            'hover:bg-accent',
            collapsed && 'mx-auto'
          )}
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive 
                  ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent' 
                  : 'hover:bg-accent/50',
                collapsed && 'justify-center px-2'
              )}
            >
              {/* 图标 */}
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                isActive 
                  ? 'icon-gradient' 
                  : 'bg-muted/50 group-hover:bg-muted'
              )}>
                <IconComponent className={cn(
                  'w-4.5 h-4.5 transition-colors',
                  isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                )} />
              </div>
              
              {!collapsed && (
                <>
                  <span className={cn(
                    'font-medium text-sm transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* 激活指示器 */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary to-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 用户信息区域 */}
      <div className={cn(
        'p-4 border-t border-sidebar-border/50',
        collapsed && 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className="relative">
            <Avatar className="w-9 h-9 ring-2 ring-background shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-sm font-medium">
                张
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in-up">
              <p className="text-sm font-medium text-foreground truncate">张明</p>
              <p className="text-xs text-muted-foreground">全栈工程师</p>
            </div>
          )}
        </div>
        
        {/* 主题切换 */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full mt-3 justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-sm">深色模式</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-sm">浅色模式</span>
              </>
            )}
          </Button>
        )}
        
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 mt-2 mx-auto flex text-muted-foreground hover:text-foreground"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </aside>
  );
}

// 包装组件
export function KanbanLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={cn(
      'min-h-screen bg-background bg-gradient-mesh transition-all duration-300',
      collapsed ? 'pl-20' : 'pl-64'
    )}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
