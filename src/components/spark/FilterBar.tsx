'use client';

import { Badge } from '@/components/ui/badge';

interface FilterBarProps {
  type: 'all' | 'HUMAN' | 'AI';
  onTypeChange: (value: 'all' | 'HUMAN' | 'AI') => void;
  status: string;
  onStatusChange: (value: string) => void;
  activeTab: 'workers' | 'items';
}

const typeOptions = [
  { value: 'all', label: '全部类型' },
  { value: 'HUMAN', label: '真实员工' },
  { value: 'AI', label: 'AI 数字人' },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'RUNNING', label: '进行中' },
  { value: 'WAITING_APPROVAL', label: '待确认' },
  { value: 'DONE', label: '已完成' },
  { value: 'FAILED', label: '已失败' },
];

export default function FilterBar({ type, onTypeChange, status, onStatusChange, activeTab }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 类型筛选 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">类型:</span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTypeChange(option.value as 'all' | 'HUMAN' | 'AI')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                type === option.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 状态筛选 - 仅需求页显示 */}
      {activeTab === 'items' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">状态:</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  status === option.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
