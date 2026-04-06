import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface WorkerData {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  type: string;
  avatar_url: string | null;
}

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 获取所有工作者（真实员工 + AI）
    const { data: workers, error: workersError } = await client
      .from('workers')
      .select('id, employee_id, name, position, type, avatar_url')
      .order('type', { ascending: true })
      .order('employee_id', { ascending: true });

    if (workersError) {
      throw new Error(`查询工作者失败: ${workersError.message}`);
    }

    if (!workers || workers.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 获取所有进行中和等待确认的步骤
    const { data: activeSteps, error: stepsError } = await client
      .from('step_runs')
      .select('worker_id, status')
      .in('status', ['RUNNING', 'WAITING_APPROVAL']);

    if (stepsError) {
      throw new Error(`查询步骤失败: ${stepsError.message}`);
    }

    // 获取所有需求（包含 owner_id）
    const { data: workItems, error: workItemsError } = await client
      .from('work_items')
      .select('id, owner_id, status');

    if (workItemsError) {
      throw new Error(`查询需求失败: ${workItemsError.message}`);
    }

    // 获取所有流水线
    const { data: pipelineRuns, error: pipelineError } = await client
      .from('pipeline_runs')
      .select('id, work_item_id, total_steps, completed_steps, status');

    if (pipelineError) {
      throw new Error(`查询流水线失败: ${pipelineError.message}`);
    }

    // 创建 work_item_id 到 pipeline 的映射
    const workItemPipelineMap = new Map<number, typeof pipelineRuns[0]>();
    (pipelineRuns || []).forEach((pr) => {
      if (pr.work_item_id && !workItemPipelineMap.has(pr.work_item_id)) {
        workItemPipelineMap.set(pr.work_item_id, pr);
      }
    });

    // 计算每个工作者的任务数和进度
    const workerStats = (workers as WorkerData[]).map((worker) => {
      // 计算任务数
      const taskCount = (activeSteps || []).filter(
        (step) => step.worker_id === worker.id
      ).length;

      // 获取该工作者负责的需求
      const workerWorkItemIds = (workItems || [])
        .filter((item) => item.owner_id === worker.id)
        .map((item) => item.id);

      // 获取流水线进度
      const workerPipelines = workerWorkItemIds
        .map((id) => workItemPipelineMap.get(id))
        .filter(Boolean) as typeof pipelineRuns;

      let progress = 0;
      let latestPipeline = null;
      
      if (workerPipelines.length > 0) {
        const activePipeline = workerPipelines.find(
          (pr) => pr.status === 'RUNNING' || pr.status === 'WAITING_APPROVAL'
        );
        latestPipeline = activePipeline || workerPipelines[workerPipelines.length - 1];
        
        if (latestPipeline && latestPipeline.total_steps > 0) {
          progress = Math.round(
            (latestPipeline.completed_steps / latestPipeline.total_steps) * 100
          );
        } else if (latestPipeline?.status === 'DONE') {
          progress = 100;
        }
      }

      return {
        id: worker.id,
        employee_id: worker.employee_id,
        name: worker.name,
        position: worker.position,
        type: worker.type as 'HUMAN' | 'AI',
        avatar_url: worker.avatar_url,
        taskCount,
        progress,
        totalSteps: latestPipeline?.total_steps || 0,
        completedSteps: latestPipeline?.completed_steps || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: workerStats,
    });
  } catch (error) {
    console.error('获取工作者列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
