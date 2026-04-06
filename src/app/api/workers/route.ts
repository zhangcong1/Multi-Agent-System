import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 获取所有真实员工
    const { data: workers, error: workersError } = await client
      .from('workers')
      .select('*')
      .eq('type', 'HUMAN')
      .order('employee_id', { ascending: true });

    if (workersError) {
      throw new Error(`查询员工失败: ${workersError.message}`);
    }

    if (!workers || workers.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 获取所有进行中和等待确认的步骤
    const { data: activeSteps, error: stepsError } = await client
      .from('step_runs')
      .select('worker_id, status, pipeline_run_id')
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

    // 获取所有流水线信息（用于计算进度）
    const { data: pipelineRuns, error: pipelineError } = await client
      .from('pipeline_runs')
      .select('id, work_item_id, total_steps, completed_steps, status');

    if (pipelineError) {
      throw new Error(`查询流水线失败: ${pipelineError.message}`);
    }

    // 创建 work_item_id 到 owner_id 的映射
    const workItemOwnerMap = new Map<number, number>();
    (workItems || []).forEach((item) => {
      workItemOwnerMap.set(item.id, item.owner_id);
    });

    // 创建 work_item_id 到 pipeline 的映射
    const workItemPipelineMap = new Map<number, typeof pipelineRuns[0]>();
    (pipelineRuns || []).forEach((pr) => {
      if (pr.work_item_id) {
        // 只保留最新的流水线
        if (!workItemPipelineMap.has(pr.work_item_id)) {
          workItemPipelineMap.set(pr.work_item_id, pr);
        }
      }
    });

    // 计算每个员工的任务数和进度
    const workerStats = workers.map((worker) => {
      // 计算任务数：该员工关联的进行中或等待确认的步骤数
      const workerActiveSteps = (activeSteps || []).filter(
        (step) => step.worker_id === worker.id
      );
      const taskCount = workerActiveSteps.length;

      // 获取该员工负责的所有需求ID
      const workerWorkItemIds = (workItems || [])
        .filter((item) => item.owner_id === worker.id)
        .map((item) => item.id);

      // 获取这些需求对应的流水线
      const workerPipelines = workerWorkItemIds
        .map((id) => workItemPipelineMap.get(id))
        .filter(Boolean) as typeof pipelineRuns;

      let progress = 0;
      let latestPipeline = null;
      
      if (workerPipelines.length > 0) {
        // 找到最新的进行中的流水线
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
    console.error('获取员工列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
