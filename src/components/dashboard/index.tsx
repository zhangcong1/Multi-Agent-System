'use client';

import { useEffect, useState } from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import WorkerList from './WorkerList';

interface Stats {
  totalDevelopers: number;
  runningCount: number;
  waitingApprovalCount: number;
  doneCount: number;
  failedCount: number;
}

interface Worker {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  avatar_url: string | null;
  taskCount: number;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, workersRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/workers'),
        ]);

        const statsData = await statsRes.json();
        const workersData = await workersRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }
        if (workersData.success) {
          setWorkers(workersData.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // 每30秒自动刷新数据
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        <StatsCards stats={stats} />
        <WorkerList workers={workers} />
      </main>
    </div>
  );
}
