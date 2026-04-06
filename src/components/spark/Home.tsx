'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import StatsOverview from './StatsOverview';
import FilterBar from './FilterBar';
import WorkerGrid from './WorkerGrid';
import WorkItemGrid from './WorkItemGrid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Stats {
  totalDevelopers: number;
  totalAIWorkers: number;
  runningCount: number;
  waitingApprovalCount: number;
  doneCount: number;
  failedCount: number;
  totalWorkItems: number;
}

interface Worker {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  type: 'HUMAN' | 'AI';
  avatar_url: string | null;
  taskCount: number;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  owner: {
    id: number;
    name: string;
    position: string;
  } | null;
}

export default function SparkHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 筛选状态
  const [activeTab, setActiveTab] = useState<'workers' | 'items'>('workers');
  const [typeFilter, setTypeFilter] = useState<'all' | 'HUMAN' | 'AI'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/spark/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('获取统计失败:', err);
    }
  }, []);

  // 获取工作者列表
  const fetchWorkers = useCallback(async () => {
    try {
      const res = await fetch('/api/spark/workers');
      const json = await res.json();
      if (json.success) {
        setWorkers(json.data);
      }
    } catch (err) {
      console.error('获取工作者失败:', err);
    }
  }, []);

  // 获取需求列表
  const fetchWorkItems = useCallback(async () => {
    try {
      const res = await fetch('/api/spark/work-items');
      const json = await res.json();
      if (json.success) {
        setWorkItems(json.data);
      }
    } catch (err) {
      console.error('获取需求失败:', err);
    }
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchWorkers(), fetchWorkItems()]);
      setLoading(false);
    }
    fetchAll();
    // 每30秒刷新
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchWorkers, fetchWorkItems]);

  // 筛选工作者
  const filteredWorkers = workers.filter((worker) => {
    if (typeFilter !== 'all' && worker.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        worker.name.toLowerCase().includes(query) ||
        worker.position.toLowerCase().includes(query) ||
        worker.employee_id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 筛选需求
  const filteredWorkItems = workItems.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query)) ||
        (item.owner?.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // 分页
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedItems = filteredWorkItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalWorkerPages = Math.ceil(filteredWorkers.length / pageSize);
  const totalItemPages = Math.ceil(filteredWorkItems.length / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full spark-gradient animate-spark-glow flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* 统计概览 */}
        <StatsOverview stats={stats} />

        {/* 主内容区 */}
        <section className="space-y-6">
          {/* 标签切换 */}
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'workers' | 'items'); setCurrentPage(1); }}>
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="workers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  工作者 ({workers.length})
                </TabsTrigger>
                <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  需求 ({workItems.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 筛选栏 */}
          <FilterBar
            type={typeFilter}
            onTypeChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}
            status={statusFilter}
            onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            activeTab={activeTab}
          />

          {/* 内容网格 */}
          {activeTab === 'workers' ? (
            <WorkerGrid
              workers={paginatedWorkers}
              currentPage={currentPage}
              totalPages={totalWorkerPages}
              onPageChange={setCurrentPage}
            />
          ) : (
            <WorkItemGrid
              items={paginatedItems}
              currentPage={currentPage}
              totalPages={totalItemPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </main>
    </div>
  );
}
