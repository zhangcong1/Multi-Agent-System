import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface StepData {
  id: number;
  step_name: string;
  step_order: number;
  status: string;
  input_url: string | null;
  output_url: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  pipeline_run_id: number;
  worker_id: number;
}

interface WorkerData {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  type: string;
}

interface StepWithWorker extends StepData {
  worker: WorkerData | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const workItemId = parseInt(id, 10);

    if (isNaN(workItemId)) {
      return NextResponse.json(
        { success: false, error: '无效的需求ID' },
        { status: 400 }
      );
    }

    // 获取需求详情
    const { data: workItem, error: workItemError } = await client
      .from('work_items')
      .select('id, title, description, status, created_at, updated_at, owner_id')
      .eq('id', workItemId)
      .maybeSingle();

    if (workItemError) {
      throw new Error(`查询需求失败: ${workItemError.message}`);
    }

    if (!workItem) {
      return NextResponse.json(
        { success: false, error: '需求不存在' },
        { status: 404 }
      );
    }

    // 获取 owner 信息
    const { data: owner, error: ownerError } = await client
      .from('workers')
      .select('id, employee_id, name, position')
      .eq('id', workItem.owner_id)
      .maybeSingle();

    if (ownerError) {
      throw new Error(`查询负责人失败: ${ownerError.message}`);
    }

    // 获取关联的流水线
    const { data: pipelineRuns, error: pipelineError } = await client
      .from('pipeline_runs')
      .select('id, status, total_steps, completed_steps, started_at, completed_at, created_at')
      .eq('work_item_id', workItemId)
      .order('created_at', { ascending: false });

    if (pipelineError) {
      throw new Error(`查询流水线失败: ${pipelineError.message}`);
    }

    // 获取所有步骤
    const pipelineIds = (pipelineRuns || []).map((pr) => pr.id);
    const { data: steps, error: stepsError } = await client
      .from('step_runs')
      .select(`
        id,
        step_name,
        step_order,
        status,
        input_url,
        output_url,
        error_message,
        started_at,
        completed_at,
        created_at,
        pipeline_run_id,
        worker_id
      `)
      .in('pipeline_run_id', pipelineIds)
      .order('step_order', { ascending: true });

    if (stepsError) {
      throw new Error(`查询步骤失败: ${stepsError.message}`);
    }

    // 获取步骤中涉及的 worker 信息
    const workerIds = [...new Set((steps || []).map((s: StepData) => s.worker_id))];
    const { data: workers, error: workersError } = await client
      .from('workers')
      .select('id, employee_id, name, position, type')
      .in('id', workerIds);

    if (workersError) {
      throw new Error(`查询员工失败: ${workersError.message}`);
    }

    const workersMap = new Map<number, WorkerData>();
    (workers || []).forEach((w) => workersMap.set(w.id, w as WorkerData));

    // 组装步骤数据
    const stepsMap = new Map<number, StepWithWorker[]>();
    (steps || []).forEach((step) => {
      const s = step as StepData;
      const pipelineId = s.pipeline_run_id;
      if (!stepsMap.has(pipelineId)) {
        stepsMap.set(pipelineId, []);
      }
      const stepWithWorker: StepWithWorker = {
        ...s,
        worker: workersMap.get(s.worker_id) || null,
      };
      stepsMap.get(pipelineId)!.push(stepWithWorker);
    });

    // 组装流水线数据
    const processedPipelineRuns = (pipelineRuns || []).map((pipeline) => ({
      ...pipeline,
      steps: (stepsMap.get(pipeline.id) || []).sort(
        (a, b) => a.step_order - b.step_order
      ),
    }));

    return NextResponse.json({
      success: true,
      data: {
        workItem: {
          ...workItem,
          owner,
        },
        pipelineRuns: processedPipelineRuns,
      },
    });
  } catch (error) {
    console.error('获取需求详情失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
