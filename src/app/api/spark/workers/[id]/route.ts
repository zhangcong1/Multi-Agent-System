import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 研发阶段定义
const STAGE_ORDER = [
  '需求分析',
  '方案设计',
  '后端开发',
  '前端开发',
  '接口联调',
  '自动化测试',
  '修复验证',
  '验收交付'
];

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

    const client = getSupabaseClient();

    // 获取工作者信息
    const { data: worker, error: workerError } = await client
      .from('workers')
      .select('id, employee_id, name, position, avatar_url')
      .eq('id', workerId)
      .single();

    if (workerError || !worker) {
      return NextResponse.json({ success: false, error: '未找到该工作者' }, { status: 404 });
    }

    // 获取该工作者负责的所有需求
    const { data: workItems, error: workItemsError } = await client
      .from('work_items')
      .select('id, title, description, status, created_at')
      .eq('owner_id', workerId)
      .order('created_at', { ascending: false });

    if (workItemsError) {
      throw new Error(`查询需求失败: ${workItemsError.message}`);
    }

    if (!workItems || workItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          worker,
          workItems: []
        }
      });
    }

    // 获取所有相关的流水线
    const workItemIds = workItems.map(item => item.id);
    const { data: pipelineRuns, error: pipelineError } = await client
      .from('pipeline_runs')
      .select('id, work_item_id, total_steps, completed_steps, status')
      .in('work_item_id', workItemIds);

    if (pipelineError) {
      throw new Error(`查询流水线失败: ${pipelineError.message}`);
    }

    // 获取所有步骤运行记录
    const pipelineIds = (pipelineRuns || []).map(p => p.id);
    const { data: stepRuns, error: stepsError } = await client
      .from('step_runs')
      .select('id, pipeline_run_id, step_name, status, created_at, updated_at, started_at, completed_at, worker_id')
      .in('pipeline_run_id', pipelineIds);

    if (stepsError) {
      throw new Error(`查询步骤失败: ${stepsError.message}`);
    }

    // 创建流水线映射
    const pipelineMap = new Map<number, typeof pipelineRuns[0]>();
    (pipelineRuns || []).forEach(p => {
      if (p.work_item_id && !pipelineMap.has(p.work_item_id)) {
        pipelineMap.set(p.work_item_id, p);
      }
    });

    // 创建步骤映射
    const stepsMap = new Map<number, typeof stepRuns>();
    (stepRuns || []).forEach(s => {
      if (!stepsMap.has(s.pipeline_run_id)) {
        stepsMap.set(s.pipeline_run_id, []);
      }
      stepsMap.get(s.pipeline_run_id)!.push(s);
    });

    // 组装需求数据
    const workItemsWithStages = workItems.map(item => {
      const pipeline = pipelineMap.get(item.id);
      const steps = pipeline ? (stepsMap.get(pipeline.id) || []) : [];
      
      // 分析阶段进度 - 使用 step_name 推断阶段
      const stages = STAGE_ORDER.map((stageName, order) => {
        const stageSteps = steps.filter(s => {
          const stepName = s.step_name || '';
          return stepName.includes(stageName) || stepName === stageName;
        });
        
        if (stageSteps.length === 0) {
          return { name: stageName, status: 'pending' as const, order };
        }
        
        const hasRunning = stageSteps.some(s => s.status === 'RUNNING');
        const hasCompleted = stageSteps.every(s => s.status === 'DONE');
        
        if (hasCompleted) {
          return { name: stageName, status: 'completed' as const, order };
        } else if (hasRunning) {
          return { name: stageName, status: 'running' as const, order };
        }
        return { name: stageName, status: 'pending' as const, order };
      });

      // 找到当前阶段
      const currentStage = stages.find(s => s.status === 'running')?.name || 
                          stages.find(s => s.status === 'pending')?.name || null;

      // 计算进度
      const completedStages = stages.filter(s => s.status === 'completed').length;
      const runningStageIndex = stages.findIndex(s => s.status === 'running');
      const stageProgress = runningStageIndex >= 0 
        ? Math.round((completedStages / stages.length) * 100 + (100 / stages.length / 2))
        : Math.round((completedStages / stages.length) * 100);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        current_stage: currentStage,
        stage_progress: stageProgress,
        total_stages: stages.length,
        completed_stages: completedStages,
        stages
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        worker,
        workItems: workItemsWithStages
      }
    });
  } catch (error) {
    console.error('获取工作者详情失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
