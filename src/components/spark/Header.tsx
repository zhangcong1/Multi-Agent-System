'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Home, Users, FolderKanban, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const navItems = [
  { href: '/', label: '概览', icon: Home },
  { href: '/workers', label: '工作者', icon: Users },
  { href: '/work-items', label: '需求', icon: FolderKanban },
];

export default function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg spark-gradient flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-lg spark-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold spark-text-gradient">星火</span>
          </Link>

          {/* 导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 右侧 */}
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            {onSearch && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-48 lg:w-64 pl-9 h-9 bg-card border-border/50"
                />
              </div>
            )}
            
            {/* 主题切换 */}
            <ThemeToggle />
          </div>
        </div>

        {/* 移动端导航 */}
        <nav className="flex md:hidden items-center gap-1 pb-3 -mx-2 px-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
