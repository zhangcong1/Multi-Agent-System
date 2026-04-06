import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const TZ = 'Asia/Shanghai';

function ymdInTimeZone(d: Date, timeZone: string): string {
  return d.toLocaleDateString('sv-SE', { timeZone });
}

function timestampToYmd(ts: string | null | undefined, timeZone: string): string | null {
  if (!ts) return null;
  return ymdInTimeZone(new Date(ts), timeZone);
}

function stepTouchesDate(
  step: {
    started_at?: string | null;
    completed_at?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
  },
  day: string,
  tz: string
): boolean {
  for (const k of ['started_at', 'completed_at', 'updated_at', 'created_at'] as const) {
    const v = step[k];
    if (v && timestampToYmd(v, tz) === day) return true;
  }
  return false;
}

type StepRow = {
  id: number;
  pipeline_run_id: number;
  worker_id: number;
  step_name: string;
  step_order: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = parseInt(id, 10);

    if (isNaN(workerId)) {
      return NextResponse.json({ success: false, error: '无效的工作者ID' }, { status: 400 });
    }

    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const todayYmd = ymdInTimeZone(new Date(), TZ);
    const selectedDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayYmd;
    const isToday = selectedDate === todayYmd;

    const client = getSupabaseClient();

    const { data: worker, error: workerError } = await client
      .from('workers')
      .select('id, employee_id, name, position, avatar_url, type')
      .eq('id', workerId)
      .single();

    if (workerError || !worker) {
      return NextResponse.json({ success: false, error: '未找到该工作者' }, { status: 404 });
    }

    const { data: ownedItems, error: ownedErr } = await client
      .from('work_items')
      .select('id, title, description, status, created_at, updated_at, owner_id')
      .eq('owner_id', workerId)
      .order('updated_at', { ascending: false });

    if (ownedErr) {
      throw new Error(`查询负责的需求失败: ${ownedErr.message}`);
    }

    const { data: myStepRows, error: stepErr } = await client
      .from('step_runs')
      .select('pipeline_run_id')
      .eq('worker_id', workerId);

    if (stepErr) {
      throw new Error(`查询参与步骤失败: ${stepErr.message}`);
    }

    const pipelineIdsFromSteps = [...new Set((myStepRows || []).map((r) => r.pipeline_run_id))];
    let participantWorkItemIds: number[] = [];

    if (pipelineIdsFromSteps.length > 0) {
      const { data: pipes, error: pipeErr } = await client
        .from('pipeline_runs')
        .select('work_item_id')
        .in('id', pipelineIdsFromSteps);

      if (pipeErr) {
        throw new Error(`查询流水线失败: ${pipeErr.message}`);
      }
      participantWorkItemIds = [...new Set((pipes || []).map((p) => p.work_item_id))];
    }

    const ownedIds = (ownedItems || []).map((w) => w.id);
    const allIds = [...new Set([...ownedIds, ...participantWorkItemIds])];

    if (allIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          worker,
          meta: { selectedDate, isToday, timeZone: TZ },
          workItems: [],
        },
      });
    }

    const { data: workItems, error: wiErr } = await client
      .from('work_items')
      .select('id, title, description, status, created_at, updated_at, owner_id')
      .in('id', allIds)
      .order('updated_at', { ascending: false });

    if (wiErr) {
      throw new Error(`查询需求失败: ${wiErr.message}`);
    }

    const { data: pipelineRuns, error: prErr } = await client
      .from('pipeline_runs')
      .select(
        'id, work_item_id, total_steps, completed_steps, status, created_at, started_at, completed_at'
      )
      .in('work_item_id', allIds)
      .order('created_at', { ascending: false });

    if (prErr) {
      throw new Error(`查询流水线失败: ${prErr.message}`);
    }

    const latestPipelineByWorkItem = new Map<number, (typeof pipelineRuns)[0]>();
    for (const p of pipelineRuns || []) {
      if (!latestPipelineByWorkItem.has(p.work_item_id)) {
        latestPipelineByWorkItem.set(p.work_item_id, p);
      }
    }

    const allPipelineIds = [...new Set((pipelineRuns || []).map((p) => p.id))];
    let stepsByPipeline = new Map<number, StepRow[]>();

    if (allPipelineIds.length > 0) {
      const { data: stepRuns, error: stErr } = await client
        .from('step_runs')
        .select(
          'id, pipeline_run_id, worker_id, step_name, step_order, status, started_at, completed_at, created_at, updated_at'
        )
        .in('pipeline_run_id', allPipelineIds);

      if (stErr) {
        throw new Error(`查询步骤失败: ${stErr.message}`);
      }

      stepsByPipeline = new Map();
      for (const s of stepRuns || []) {
        const row = s as StepRow;
        const list = stepsByPipeline.get(row.pipeline_run_id) || [];
        list.push(row);
        stepsByPipeline.set(row.pipeline_run_id, list);
      }
      for (const [pid, list] of stepsByPipeline) {
        list.sort((a, b) => a.step_order - b.step_order);
        stepsByPipeline.set(pid, list);
      }
    }

    const stepWorkerIds = new Set<number>();
    for (const list of stepsByPipeline.values()) {
      for (const s of list) {
        stepWorkerIds.add(s.worker_id);
      }
    }

    const workersMap = new Map<number, { id: number; name: string; position: string }>();
    if (stepWorkerIds.size > 0) {
      const { data: stepWorkers, error: wErr } = await client
        .from('workers')
        .select('id, name, position')
        .in('id', [...stepWorkerIds]);

      if (wErr) {
        throw new Error(`查询执行人失败: ${wErr.message}`);
      }
      for (const w of stepWorkers || []) {
        workersMap.set(w.id, w);
      }
    }

    const enriched = (workItems || []).map((item) => {
      const pipeline = latestPipelineByWorkItem.get(item.id) || null;
      const rawSteps = pipeline ? stepsByPipeline.get(pipeline.id) || [] : [];

      const steps = rawSteps.map((s) => ({
        id: s.id,
        step_name: s.step_name,
        step_order: s.step_order,
        status: s.status,
        worker_id: s.worker_id,
        assignee: workersMap.get(s.worker_id) || null,
        started_at: s.started_at,
        completed_at: s.completed_at,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));

      const total = steps.length;
      const finished = steps.filter(
        (s) => s.status === 'DONE' || s.status === 'SKIPPED'
      ).length;
      const progress_percent = total
        ? Math.round((finished / total) * 100)
        : pipeline && pipeline.total_steps
          ? Math.round(
              (pipeline.completed_steps / Math.max(pipeline.total_steps, 1)) * 100
            )
          : item.status === 'DONE'
            ? 100
            : 0;

      const activeStep =
        steps.find(
          (s) =>
            s.status === 'RUNNING' ||
            s.status === 'WAITING_APPROVAL' ||
            s.status === 'FAILED'
        ) ||
        steps.find((s) => s.status === 'PENDING') ||
        null;

      const current_step_name = activeStep?.step_name || null;

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        owner_id: item.owner_id,
        is_owner: item.owner_id === workerId,
        pipeline_run: pipeline
          ? {
              id: pipeline.id,
              status: pipeline.status,
              total_steps: pipeline.total_steps,
              completed_steps: pipeline.completed_steps,
              started_at: pipeline.started_at,
              completed_at: pipeline.completed_at,
            }
          : null,
        steps,
        current_step_name,
        progress_percent,
      };
    });

    let filtered = enriched;

    if (isToday) {
      filtered = enriched.filter((item) => {
        if (item.status === 'DONE' || item.status === 'FAILED') return false;
        const owner = item.is_owner;
        const participates = item.steps.some((s) => s.worker_id === workerId);
        return owner || participates;
      });
    } else {
      filtered = enriched.filter((item) => {
        const stepHit = item.steps.some(
          (s) =>
            s.worker_id === workerId &&
            stepTouchesDate(
              {
                started_at: s.started_at,
                completed_at: s.completed_at,
                updated_at: s.updated_at,
                created_at: s.created_at,
              },
              selectedDate,
              TZ
            )
        );
        const ownerUpdated =
          item.is_owner &&
          !!item.updated_at &&
          timestampToYmd(item.updated_at, TZ) === selectedDate;
        return stepHit || ownerUpdated;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        worker,
        meta: { selectedDate, isToday, timeZone: TZ },
        workItems: filtered,
      },
    });
  } catch (error) {
    console.error('获取工作者详情失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
