import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST: 上报步骤状态（由主Agent调用）
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const {
      pipeline_run_id,
      worker_id,
      step_name,
      step_order,
      status,
      input_url,
      output_url,
      error_message,
    } = body;

    // 验证必要字段
    if (!pipeline_run_id || !worker_id || !step_name) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段: pipeline_run_id, worker_id, step_name' },
        { status: 400 }
      );
    }

    // 检查步骤是否已存在
    const { data: existingStep, error: checkError } = await client
      .from('step_runs')
      .select('id')
      .eq('pipeline_run_id', pipeline_run_id)
      .eq('step_order', step_order)
      .maybeSingle();

    if (checkError) {
      throw new Error(`检查步骤失败: ${checkError.message}`);
    }

    let stepRun;

    if (existingStep) {
      // 更新现有步骤
      const updateData: Record<string, unknown> = {
        status: status || 'RUNNING',
        updated_at: new Date().toISOString(),
      };
      
      if (input_url !== undefined) updateData.input_url = input_url;
      if (output_url !== undefined) updateData.output_url = output_url;
      if (error_message !== undefined) updateData.error_message = error_message;
      
      if (status === 'RUNNING') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'DONE' || status === 'FAILED') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error: updateError } = await client
        .from('step_runs')
        .update(updateData)
        .eq('id', existingStep.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`更新步骤失败: ${updateError.message}`);
      }
      stepRun = data;
    } else {
      // 创建新步骤
      const { data, error: insertError } = await client
        .from('step_runs')
        .insert({
          pipeline_run_id,
          worker_id,
          step_name,
          step_order: step_order || 0,
          status: status || 'RUNNING',
          input_url,
          output_url,
          error_message,
          started_at: status === 'RUNNING' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`创建步骤失败: ${insertError.message}`);
      }
      stepRun = data;
    }

    // 更新流水线的进度
    await updatePipelineProgress(client, pipeline_run_id);

    return NextResponse.json({
      success: true,
      data: stepRun,
    });
  } catch (error) {
    console.error('上报步骤失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 更新流水线进度
async function updatePipelineProgress(
  client: ReturnType<typeof getSupabaseClient>,
  pipelineRunId: number
) {
  // 获取该流水线的所有步骤
  const { data: steps, error: stepsError } = await client
    .from('step_runs')
    .select('status')
    .eq('pipeline_run_id', pipelineRunId);

  if (stepsError) {
    console.error('获取步骤失败:', stepsError);
    return;
  }

  const totalSteps = steps?.length || 0;
  const completedSteps = steps?.filter((s) => s.status === 'DONE').length || 0;
  const waitingSteps = steps?.filter((s) => s.status === 'WAITING_APPROVAL').length || 0;
  const failedSteps = steps?.filter((s) => s.status === 'FAILED').length || 0;

  // 确定流水线状态
  let pipelineStatus = 'RUNNING';
  if (failedSteps > 0) {
    pipelineStatus = 'FAILED';
  } else if (waitingSteps > 0) {
    pipelineStatus = 'WAITING_APPROVAL';
  } else if (totalSteps > 0 && completedSteps === totalSteps) {
    pipelineStatus = 'DONE';
  }

  // 更新流水线
  const updateData: Record<string, unknown> = {
    total_steps: totalSteps,
    completed_steps: completedSteps,
    status: pipelineStatus,
    updated_at: new Date().toISOString(),
  };

  if (pipelineStatus === 'DONE') {
    updateData.completed_at = new Date().toISOString();
  }

  await client
    .from('pipeline_runs')
    .update(updateData)
    .eq('id', pipelineRunId);

  // 如果流水线完成，更新工作项状态
  if (pipelineStatus === 'DONE' || pipelineStatus === 'FAILED') {
    const { data: pipelineRun } = await client
      .from('pipeline_runs')
      .select('work_item_id')
      .eq('id', pipelineRunId)
      .maybeSingle();

    if (pipelineRun?.work_item_id) {
      await client
        .from('work_items')
        .update({
          status: pipelineStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pipelineRun.work_item_id);
    }
  }
}
