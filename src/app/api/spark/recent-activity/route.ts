import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

function pickTime(row: {
  updated_at: string | null;
  completed_at: string | null;
  created_at: string | null;
}): number {
  const s = row.updated_at || row.completed_at || row.created_at;
  if (!s) return 0;
  return new Date(s).getTime();
}

export async function GET() {
  try {
    const client = getSupabaseClient();

    const { data: steps, error: stepsError } = await client
      .from('step_runs')
      .select(
        'id, step_name, status, created_at, updated_at, completed_at, pipeline_run_id, worker_id'
      )
      .order('created_at', { ascending: false })
      .limit(60);

    if (stepsError) {
      throw new Error(`查询步骤失败: ${stepsError.message}`);
    }

    if (!steps?.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const pipelineIds = [...new Set(steps.map((s) => s.pipeline_run_id))];
    const { data: pipelines, error: pipeError } = await client
      .from('pipeline_runs')
      .select('id, work_item_id')
      .in('id', pipelineIds);

    if (pipeError) {
      throw new Error(`查询流水线失败: ${pipeError.message}`);
    }

    const workItemIds = [...new Set((pipelines || []).map((p) => p.work_item_id))];
    const { data: workItems, error: wiError } = await client
      .from('work_items')
      .select('id, title, status')
      .in('id', workItemIds);

    if (wiError) {
      throw new Error(`查询需求失败: ${wiError.message}`);
    }

    const workerIds = [...new Set(steps.map((s) => s.worker_id))];
    const { data: workers, error: wError } = await client
      .from('workers')
      .select('id, name, type')
      .in('id', workerIds);

    if (wError) {
      throw new Error(`查询工作者失败: ${wError.message}`);
    }

    const pipeMap = new Map((pipelines || []).map((p) => [p.id, p.work_item_id]));
    const wiMap = new Map((workItems || []).map((w) => [w.id, w]));
    const workerMap = new Map((workers || []).map((w) => [w.id, w]));

    const activities = steps
      .map((s) => {
        const workItemId = pipeMap.get(s.pipeline_run_id);
        if (!workItemId) return null;
        const wi = wiMap.get(workItemId);
        if (!wi) return null;
        const w = workerMap.get(s.worker_id);

        return {
          id: `step-${s.id}`,
          kind: 'step' as const,
          workItemId: wi.id,
          workItemTitle: wi.title,
          workItemStatus: wi.status,
          stepName: s.step_name,
          stepStatus: s.status,
          workerName: w?.name ?? null,
          workerType: (w?.type as 'HUMAN' | 'AI' | undefined) ?? null,
          occurredAt: new Date(pickTime(s)).toISOString(),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 18);

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error('获取最近动态失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
