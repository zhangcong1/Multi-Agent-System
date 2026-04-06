import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 并行查询所有统计数据
    const [workersResult, workItemsResult] = await Promise.all([
      // 统计真实员工数量 (type = HUMAN)
      client
        .from('workers')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'HUMAN'),
      
      // 统计各状态需求数量
      client
        .from('work_items')
        .select('status')
    ]);

    if (workersResult.error) {
      throw new Error(`查询员工失败: ${workersResult.error.message}`);
    }
    if (workItemsResult.error) {
      throw new Error(`查询需求失败: ${workItemsResult.error.message}`);
    }

    // 计算各状态需求数量
    const workItems = workItemsResult.data || [];
    const statusCounts = {
      RUNNING: 0,
      WAITING_APPROVAL: 0,
      DONE: 0,
      FAILED: 0,
    };
    
    workItems.forEach((item) => {
      const status = item.status as keyof typeof statusCounts;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalDevelopers: workersResult.count || 0,
        runningCount: statusCounts.RUNNING,
        waitingApprovalCount: statusCounts.WAITING_APPROVAL,
        doneCount: statusCounts.DONE,
        failedCount: statusCounts.FAILED,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
