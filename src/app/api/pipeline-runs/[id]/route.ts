import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const pipelineRunId = parseInt(id, 10);

    if (isNaN(pipelineRunId)) {
      return NextResponse.json(
        { success: false, error: '无效的流水线ID' },
        { status: 400 }
      );
    }

    // 获取流水线详情
    const { data: pipelineRun, error: pipelineError } = await client
      .from('pipeline_runs')
      .select(`
        *,
        work_item:work_items(
          id,
          title,
          description,
          status,
          owner:workers!work_items_owner_id_fkey(id, employee_id, name, position)
        )
      `)
      .eq('id', pipelineRunId)
      .maybeSingle();

    if (pipelineError) {
      throw new Error(`查询流水线失败: ${pipelineError.message}`);
    }

    if (!pipelineRun) {
      return NextResponse.json(
        { success: false, error: '流水线不存在' },
        { status: 404 }
      );
    }

    // 获取所有步骤
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
        worker:workers!step_runs_worker_id_fkey(id, employee_id, name, position, type)
      `)
      .eq('pipeline_run_id', pipelineRunId)
      .order('step_order', { ascending: true });

    if (stepsError) {
      throw new Error(`查询步骤失败: ${stepsError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        pipelineRun: {
          ...pipelineRun,
          steps: steps || [],
        },
      },
    });
  } catch (error) {
    console.error('获取流水线详情失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
