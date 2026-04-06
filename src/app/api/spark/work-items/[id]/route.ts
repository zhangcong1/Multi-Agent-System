import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const STAGE_ORDER = [
  '需求分析',
  '方案设计',
  '后端开发',
  '前端开发',
  '接口联调',
  '自动化测试',
  '修复验证',
  '验收交付',
];

interface StepData {
  id: number;
  step_name: string;
  step_order: number;
  status: string;
  output_url: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
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

function mapLogStatus(status: string): string {
  const m: Record<string, string> = {
    DONE: 'completed',
    RUNNING: 'running',
    PENDING: 'pending',
    FAILED: 'failed',
    SKIPPED: 'skipped',
    WAITING_APPROVAL: 'pending',
  };
  return m[status] ?? 'pending';
}

function stepsBelongToStage(stepName: string, stageName: string): boolean {
  const n = stepName || '';
  return n.includes(stageName) || n === stageName;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workItemId = parseInt(id, 10);
    if (isNaN(workItemId)) {
      return NextResponse.json({ success: false, error: '无效的需求ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { data: workItem, error: workItemError } = await client
      .from('work_items')
      .select('id, title, description, status, created_at, updated_at, owner_id')
      .eq('id', workItemId)
      .maybeSingle();

    if (workItemError) throw new Error(`查询需求失败: ${workItemError.message}`);
    if (!workItem) {
      return NextResponse.json({ success: false, error: '需求不存在' }, { status: 404 });
    }

    const { data: owner, error: ownerError } = await client
      .from('workers')
      .select('id, employee_id, name, position')
      .eq('id', workItem.owner_id)
      .maybeSingle();

    if (ownerError) throw new Error(`查询负责人失败: ${ownerError.message}`);

    const { data: pipelineRuns, error: pipelineError } = await client
      .from('pipeline_runs')
      .select('id, status, total_steps, completed_steps, started_at, completed_at, created_at')
      .eq('work_item_id', workItemId)
      .order('created_at', { ascending: false });

    if (pipelineError) throw new Error(`查询流水线失败: ${pipelineError.message}`);

    const pipelineIds = (pipelineRuns || []).map((pr) => pr.id);
    const { data: steps, error: stepsError } = await client
      .from('step_runs')
      .select(
        `
        id,
        step_name,
        step_order,
        status,
        output_url,
        error_message,
        started_at,
        completed_at,
        pipeline_run_id,
        worker_id
      `
      )
      .in('pipeline_run_id', pipelineIds)
      .order('step_order', { ascending: true });

    if (stepsError) throw new Error(`查询步骤失败: ${stepsError.message}`);

    const workerIds = [...new Set((steps || []).map((s: StepData) => s.worker_id))];
    const { data: workersRows, error: workersError } = await client
      .from('workers')
      .select('id, employee_id, name, position, type')
      .in('id', workerIds);

    if (workersError) throw new Error(`查询员工失败: ${workersError.message}`);

    const workersMap = new Map<number, WorkerData>();
    (workersRows || []).forEach((w) => workersMap.set(w.id, w as WorkerData));

    const primaryPipeline = pipelineRuns?.[0];
    const pipelineSteps = (steps || []).filter(
      (s: StepData) => s.pipeline_run_id === primaryPipeline?.id
    ) as StepData[];

    const stages = STAGE_ORDER.map((stageName, order) => {
      const stageSteps = pipelineSteps.filter((s) => stepsBelongToStage(s.step_name, stageName));

      if (stageSteps.length === 0) {
        return {
          name: stageName,
          status: 'pending' as const,
          order,
          assignee: null as { id: number; name: string; position: string } | null,
        };
      }

      const hasRunning = stageSteps.some((s) => s.status === 'RUNNING');
      const allDone = stageSteps.every((s) => s.status === 'DONE' || s.status === 'SKIPPED');

      let status: 'completed' | 'running' | 'pending';
      if (allDone) status = 'completed';
      else if (hasRunning) status = 'running';
      else status = 'pending';

      const running = stageSteps.find((s) => s.status === 'RUNNING');
      const pick = running || stageSteps[0];
      const w = workersMap.get(pick.worker_id);

      return {
        name: stageName,
        status,
        order,
        assignee: w
          ? { id: w.id, name: w.name, position: w.position }
          : null,
      };
    });

    const currentStage =
      stages.find((s) => s.status === 'running')?.name ??
      stages.find((s) => s.status === 'pending')?.name ??
      null;

    const completedStages = stages.filter((s) => s.status === 'completed').length;
    const runningIdx = stages.findIndex((s) => s.status === 'running');
    const stageProgress =
      runningIdx >= 0
        ? Math.round(
            (completedStages / stages.length) * 100 + 100 / stages.length / 2
          )
        : Math.round((completedStages / stages.length) * 100);

    const workItemOut = {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description,
      status: workItem.status,
      current_stage: currentStage,
      stage_progress: stageProgress,
      total_stages: stages.length,
      completed_stages: completedStages,
      created_at: workItem.created_at,
      updated_at: workItem.updated_at,
      owner: owner
        ? { id: owner.id, name: owner.name, position: owner.position }
        : null,
    };

    const logs = pipelineSteps.map((s) => {
      const w = workersMap.get(s.worker_id);
      const output =
        [s.output_url, s.error_message].filter(Boolean).join('\n') || null;
      return {
        id: s.id,
        step_name: s.step_name,
        status: mapLogStatus(s.status),
        output,
        started_at: s.started_at,
        finished_at: s.completed_at,
        worker: w
          ? { id: w.id, name: w.name, position: w.position }
          : null,
      };
    });

    type WorkerBrief = { id: number; name: string; position: string };
    const workerSet = new Map<number, { worker: WorkerBrief; is_owner: boolean }>();
    if (owner) {
      workerSet.set(owner.id, {
        worker: { id: owner.id, name: owner.name, position: owner.position },
        is_owner: true,
      });
    }
    pipelineSteps.forEach((s) => {
      const w = workersMap.get(s.worker_id);
      if (w && !workerSet.has(w.id)) {
        workerSet.set(w.id, {
          worker: { id: w.id, name: w.name, position: w.position },
          is_owner: false,
        });
      }
    });

    const workers = Array.from(workerSet.values());

    const focusStageName =
      stages.find((s) => s.status === 'running')?.name ??
      stages.find((s) => s.status === 'pending')?.name ??
      null;

    let currentStageSubProgress = 0;
    let currentStageActivity = '等待开始';
    let currentStageAssignee: { id: number; name: string; position: string } | null = null;

    if (focusStageName) {
      const stageSteps = pipelineSteps.filter((s) =>
        stepsBelongToStage(s.step_name, focusStageName)
      );
      const done = stageSteps.filter(
        (s) => s.status === 'DONE' || s.status === 'SKIPPED'
      ).length;
      currentStageSubProgress = stageSteps.length
        ? Math.round((done / stageSteps.length) * 100)
        : 0;
      const run = stageSteps.find((s) => s.status === 'RUNNING');
      if (run) {
        currentStageActivity = run.step_name;
        const w = workersMap.get(run.worker_id);
        currentStageAssignee = w
          ? { id: w.id, name: w.name, position: w.position }
          : null;
      } else if (stageSteps.length) {
        currentStageActivity = '排队中';
        currentStageAssignee = stageSteps[0]
          ? (() => {
              const w = workersMap.get(stageSteps[0].worker_id);
              return w
                ? { id: w.id, name: w.name, position: w.position }
                : null;
            })()
          : null;
      } else {
        currentStageActivity =
          stages.find((s) => s.name === focusStageName)?.status === 'pending'
            ? '待启动'
            : '筹备中';
        currentStageAssignee =
          stages.find((s) => s.name === focusStageName)?.assignee ?? null;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        workItem: workItemOut,
        stages,
        logs,
        workers,
        currentStageDetail: {
          subProgress: currentStageSubProgress,
          activity: currentStageActivity,
          assignee: currentStageAssignee,
        },
      },
    });
  } catch (error) {
    console.error('获取需求详情(spark)失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
